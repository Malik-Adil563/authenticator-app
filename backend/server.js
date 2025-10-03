const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// CRITICAL: Set authenticator options to match Google Authenticator
authenticator.options = {
  step: 30,
  window: 1,
  digits: 6,
  algorithm: 'sha1' // Google Authenticator uses SHA1
};

// ---------------- MongoDB (Temporary In-Memory) ---------------- //
async function connectDB() {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to temporary in-memory MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}
connectDB();

// ---------------- Schema ---------------- //
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accounts: [
    {
      name: { type: String, required: true },
      secret: { type: String, required: true },
      issuer: { type: String, default: 'MyApp' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// ---------------- Helper Functions ---------------- //

// Fix Base32 padding if needed
function fixBase32Padding(secret) {
  // Remove any existing padding and spaces
  let cleaned = secret.replace(/[\s=]/g, '').toUpperCase();
  
  // Add proper padding
  const paddingNeeded = (8 - (cleaned.length % 8)) % 8;
  return cleaned + '='.repeat(paddingNeeded);
}

// Extract and clean secret from otpauth URL
function parseOtpauthUrl(url) {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.protocol !== 'otpauth:') {
      throw new Error('Invalid otpauth URL');
    }
    
    const params = new URLSearchParams(urlObj.search);
    const secret = params.get('secret');
    const issuer = params.get('issuer');
    
    // Extract account name from path
    const pathParts = urlObj.pathname.replace('/totp/', '').replace('/hotp/', '');
    let accountName = pathParts;
    
    // Handle format "Issuer:account" or just "account"
    if (pathParts.includes(':')) {
      const parts = pathParts.split(':');
      accountName = parts[1] || parts[0];
    }
    
    return {
      secret: secret ? fixBase32Padding(secret) : null,
      issuer: issuer || 'Unknown',
      accountName: decodeURIComponent(accountName)
    };
  } catch (error) {
    console.error('Error parsing otpauth URL:', error);
    return null;
  }
}

// ---------------- Routes ---------------- //

app.get("/", (req, res) => {
  res.send("Backend running...");
});

// 1. Register/Create User
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.json({ message: 'User already exists' });
    }

    user = new User({ email, password, accounts: [] });
    await user.save();

    res.json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Add New Account with Secret (FIXED)
app.post('/api/account/add-by-secret', async (req, res) => {
  try {
    const { email, accountName, secret, issuer } = req.body;

    if (!email || !accountName || !secret) {
      return res
        .status(400)
        .json({ error: 'Email, account name, and secret are required' });
    }

    // Clean and fix Base32 padding
    const cleanSecret = fixBase32Padding(secret);
    
    // Validate Base32 format
    if (!/^[A-Z2-7]+=*$/.test(cleanSecret)) {
      return res.status(400).json({ error: 'Invalid secret format. Must be Base32 (A-Z, 2-7)' });
    }

    // Test if secret is valid by generating a token
    try {
      const testToken = authenticator.generate(cleanSecret);
      console.log('🔐 Test token generated:', testToken, 'for secret:', cleanSecret);
    } catch (err) {
      console.error('Secret validation error:', err);
      return res.status(400).json({ error: 'Invalid secret key: ' + err.message });
    }

    // Find user
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please login first' });
    }

    // Check if account with same secret already exists
    const existingAccount = user.accounts.find(acc => acc.secret === cleanSecret);
    if (existingAccount) {
      return res.status(400).json({ error: 'Account with this secret already exists' });
    }

    // Add account
    user.accounts.push({
      name: accountName,
      secret: cleanSecret, // Save the properly formatted secret
      issuer: issuer || 'MyApp',
    });

    await user.save();

    // Log for debugging
    console.log('💾 Saved account for user:', email);
    console.log('   Account:', accountName);
    console.log('   Issuer:', issuer);
    console.log('   Secret (saved):', cleanSecret);

    res.json({
      message: 'Account added successfully',
      accountId: user.accounts[user.accounts.length - 1]._id,
      accountName: accountName,
      issuer: issuer || 'MyApp'
    });
  } catch (error) {
    console.error('Error in add-by-secret:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3b. Add account by parsing otpauth URL
app.post('/api/account/add-by-url', async (req, res) => {
  try {
    const { email, otpauthUrl } = req.body;

    if (!email || !otpauthUrl) {
      return res.status(400).json({ error: 'Email and otpauth URL are required' });
    }

    const parsed = parseOtpauthUrl(otpauthUrl);
    if (!parsed || !parsed.secret) {
      return res.status(400).json({ error: 'Invalid otpauth URL' });
    }

    // Use the add-by-secret logic
    req.body = {
      email,
      accountName: parsed.accountName,
      secret: parsed.secret,
      issuer: parsed.issuer
    };

    // Forward to add-by-secret endpoint
    return app._router.handle(req, res, () => {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Verify OTP Code (IMPROVED)
app.post('/api/verify', async (req, res) => {
  try {
    const { email, accountId, token } = req.body;

    if (!email || !accountId || !token) {
      return res
        .status(400)
        .json({ error: 'Email, account ID, and token are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const account = user.accounts.id(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Clean the token (remove spaces)
    const cleanToken = token.replace(/\s/g, '');

    // Log for debugging
    console.log('🔍 Verifying token:', cleanToken);
    console.log('   Using secret:', account.secret);
    console.log('   Current time:', new Date().toISOString());

    // Generate current token for comparison
    const currentToken = authenticator.generate(account.secret);
    console.log('   Expected token:', currentToken);

    // Use verify with window for time drift tolerance
    const verified = authenticator.verify({
      token: cleanToken,
      secret: account.secret,
      window: 2 // Allow ±2 time steps (±60 seconds) for clock drift
    });

    res.json({
      verified,
      message: verified ? 'Token verified successfully' : 'Invalid token',
      debug: {
        provided: cleanToken,
        expected: currentToken,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Get User Accounts
app.get('/api/accounts/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const accounts = user.accounts.map((acc) => ({
      id: acc._id,
      name: acc.name,
      issuer: acc.issuer,
      secret: acc.secret,
      createdAt: acc.createdAt,
    }));

    res.json({ accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Delete Account
app.delete('/api/account/:email/:accountId', async (req, res) => {
  try {
    const { email, accountId } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.accounts = user.accounts.filter(
      (acc) => acc._id.toString() !== accountId
    );
    await user.save();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Generate Current OTP (for testing/debugging)
app.post('/api/generate-otp', async (req, res) => {
  try {
    const { email, accountId } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const account = user.accounts.id(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const token = authenticator.generate(account.secret);
    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = 30 - (now % 30);

    console.log('🔢 Generated OTP:', token);
    console.log('   Secret:', account.secret);
    console.log('   Time remaining:', timeRemaining, 'seconds');

    res.json({ 
      token, 
      timestamp: now, 
      timeRemaining,
      step: authenticator.options.step 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Debug endpoint to check time sync
app.get('/api/time-check', (req, res) => {
  const now = Date.now();
  const nowSeconds = Math.floor(now / 1000);
  const step = 30;
  const currentStep = Math.floor(nowSeconds / step);
  const timeInStep = nowSeconds % step;
  const timeRemaining = step - timeInStep;

  res.json({
    serverTime: new Date(now).toISOString(),
    timestamp: nowSeconds,
    currentStep,
    timeInStep,
    timeRemaining,
    message: 'Compare this with your device time. Large differences can cause OTP mismatches.'
  });
});

// ---------------- Start Server ---------------- //
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Check time sync at http://localhost:${PORT}/api/time-check`);
});