'use client';
import { useState, useEffect } from 'react';
import { authenticator } from 'otplib';
import LoginView from '../components/LoginView';
import DashboardView from '../components/DashboardView';
import QRScanner from '../components/QRScanner';
import ManualEntryForm from '../components/ManualEntryForm';

const API_URL = 'https://authenticator-app-be.onrender.com/api';

// Configure otplib to match server settings
authenticator.options = {
  step: 30,
  window: 1,
  digits: 6,
  algorithm: 'sha1'
};

export default function AuthenticatorApp() {
  const [email, setEmail] = useState('');
  const [currentView, setCurrentView] = useState('login');
  const [password, setPassword] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [verifyToken, setVerifyToken] = useState('');
  const [verifyAccountId, setVerifyAccountId] = useState('');
  const [message, setMessage] = useState('');
  const [otpCodes, setOtpCodes] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  // New states for QR scanner and manual entry
  const [showScanner, setShowScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Helper function to fix Base32 padding
  const fixBase32Padding = (secret) => {
    let cleaned = secret.replace(/[\s=]/g, '').toUpperCase();
    const paddingNeeded = (8 - (cleaned.length % 8)) % 8;
    return cleaned + '='.repeat(paddingNeeded);
  };

  // Generate OTP codes locally for all accounts
  useEffect(() => {
    if (accounts.length === 0) return;

    const generateCodes = () => {
      const codes = {};
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);

      accounts.forEach(account => {
        try {
          // Ensure secret is properly formatted
          const formattedSecret = fixBase32Padding(account.secret);
          const token = authenticator.generate(formattedSecret);
          
          codes[account.id] = token;
        } catch (error) {
          console.error(`Error generating OTP for ${account.name}:`, error);
          codes[account.id] = '------';
        }
      });

      setOtpCodes(codes);
      setTimeRemaining(remaining);
    };

    generateCodes();
    const interval = setInterval(generateCodes, 1000);

    return () => clearInterval(interval);
  }, [accounts]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        loadAccounts(email);
        setCurrentView('dashboard');
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const loadAccounts = async (userEmail) => {
    try {
      const res = await fetch(`${API_URL}/accounts/${userEmail}`);
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  // Handle QR code scan (IMPROVED)
  const handleQRScan = async (qrData) => {
    try {
      
      // Parse otpauth:// URL
      const url = new URL(qrData);
      
      if (url.protocol !== 'otpauth:') {
        setMessage('Invalid QR code. Must be an otpauth:// URL');
        return;
      }

      const params = new URLSearchParams(url.search);
      const secret = params.get('secret');
      const issuer = params.get('issuer');
      
      // Parse the path to get account name
      let pathParts = url.pathname.replace('/totp/', '').replace('/hotp/', '');
      pathParts = decodeURIComponent(pathParts); // Decode URL encoding
      
      let accountName = pathParts;
      let extractedIssuer = issuer;
      
      // Handle "Issuer:account" format
      if (pathParts.includes(':')) {
        const parts = pathParts.split(':');
        extractedIssuer = extractedIssuer || parts[0];
        accountName = parts[1] || parts[0];
      }

      if (!secret) {
        setMessage('No secret found in QR code');
        return;
      }

      // Add account via API
      await handleAddAccountBySecret({
        accountName: accountName,
        secret: secret,
        issuer: extractedIssuer || 'Unknown'
      });

      setShowScanner(false);
    } catch (error) {
      console.error('QR parsing error:', error);
      setMessage('Error parsing QR code: ' + error.message);
    }
  };

  // Handle manual entry
  const handleManualEntry = async (data) => {
    await handleAddAccountBySecret(data);
    setShowManualEntry(false);
  };

  // Add account by secret (common function)
  const handleAddAccountBySecret = async (data) => {
    try {
      
      const res = await fetch(`${API_URL}/account/add-by-secret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          accountName: data.accountName,
          secret: data.secret,
          issuer: data.issuer || 'MyApp'
        })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setMessage('✅ Account added successfully!');
        await loadAccounts(email);
        
        // Generate a test token to verify it matches
        try {
          const testSecret = fixBase32Padding(data.secret);
          const testToken = authenticator.generate(testSecret);
        } catch (e) {
          console.error('Could not generate test token:', e);
        }
      } else {
        setMessage('❌ ' + (result.error || 'Failed to add account'));
      }
    } catch (error) {
      console.error('Add account error:', error);
      setMessage('Error: ' + error.message);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
      await fetch(`${API_URL}/account/${email}/${accountId}`, {
        method: 'DELETE'
      });
      
      setMessage('Account deleted successfully');
      loadAccounts(email);
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          accountId: verifyAccountId,
          token: verifyToken
        })
      });
      const data = await res.json();
      
      if (data.verified) {
        setMessage('✅ Verification successful!');
      } else {
        setMessage(`❌ Invalid token. Expected: ${data.debug?.expected}`);
      }
      setVerifyToken('');
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const copyToClipboard = (text) => {
    if (!text || text === '------') {
      setMessage('No valid code to copy');
      return;
    }
    navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleLogout = () => {
    setCurrentView('login');
    setEmail('');
    setAccounts([]);
    setMessage('');
  };

  // Check time synchronization
  useEffect(() => {
    if (currentView === 'dashboard') {
      fetch(`${API_URL}/time-check`)
        .then(res => res.json())
        .then(data => {
          const serverTime = new Date(data.serverTime);
          const clientTime = new Date();
          const diff = Math.abs(serverTime - clientTime) / 1000;
          
          if (diff > 30) {
            console.warn(`⚠️ Time difference detected: ${diff.toFixed(1)} seconds`);
            console.warn('Server time:', data.serverTime);
            console.warn('Client time:', clientTime.toISOString());
            setMessage(`⚠️ Clock sync issue detected (${diff.toFixed(0)}s difference). This may cause OTP mismatches.`);
          }
        })
        .catch(err => console.error('Time check failed:', err));
    }
  }, [currentView]);

  if (currentView === 'login') {
    return (
      <LoginView
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onLogin={handleLogin}
        onRegister={handleRegister}
        message={message}
      />
    );
  }

  return (
    <>
      <DashboardView
        email={email}
        accounts={accounts}
        otpCodes={otpCodes}
        timeRemaining={timeRemaining}
        message={message}
        onOpenScanner={() => setShowScanner(true)}
        onOpenManualEntry={() => setShowManualEntry(true)}
        verifyToken={verifyToken}
        setVerifyToken={setVerifyToken}
        verifyAccountId={verifyAccountId}
        setVerifyAccountId={setVerifyAccountId}
        onVerify={handleVerify}
        onDeleteAccount={handleDeleteAccount}
        onCopy={copyToClipboard}
        onLogout={handleLogout}
      />

      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showManualEntry && (
        <ManualEntryForm
          onAdd={handleManualEntry}
          onClose={() => setShowManualEntry(false)}
        />
      )}
    </>
  );
}