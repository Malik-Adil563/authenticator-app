import { useState } from 'react';

export default function ManualEntryForm({ onAdd, onClose }) {
  const [accountName, setAccountName] = useState('');
  const [secret, setSecret] = useState('');
  const [issuer, setIssuer] = useState('');
  const [error, setError] = useState('');

  // Helper to fix Base32 padding
  const fixBase32Padding = (secret) => {
    let cleaned = secret.replace(/[\s=]/g, '').toUpperCase();
    const paddingNeeded = (8 - (cleaned.length % 8)) % 8;
    return cleaned + '='.repeat(paddingNeeded);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
    
    if (!accountName || !cleanSecret) {
      setError('Account name and secret key are required');
      return;
    }

    if (cleanSecret.length < 16) {
      setError('Secret key must be at least 16 characters');
      return;
    }

    // Validate Base32 format (A-Z, 2-7) and allow padding '='
    if (!/^[A-Z2-7]+=*$/.test(fixBase32Padding(cleanSecret))) {
      setError('Invalid secret key format. Must be Base32 (A-Z, 2-7)');
      return;
    }

    // Send cleaned and padded secret
    onAdd({
      accountName,
      secret: fixBase32Padding(cleanSecret),
      issuer: issuer || 'Manual Entry'
    });

    // Clear fields after adding
    setAccountName('');
    setSecret('');
    setIssuer('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Enter Setup Key</h2>
          <button
            onClick={onClose}
            className="text-gray-500 text-3xl hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Tip:</strong> Copy the secret key exactly as shown by the service. 
            Spaces will be removed automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              placeholder="e.g., john@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your email or username for this service
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key <span className="text-red-500">*</span>
            </label>
            <textarea
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent font-mono text-sm"
              placeholder="Enter your secret key"
              rows="3"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The 16+ character key provided by your service (Base32 format)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issuer (Optional)
            </label>
            <input
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              placeholder="e.g., Google, GitHub, AWS"
            />
            <p className="text-xs text-gray-500 mt-1">
              The service name (helps identify the account)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}