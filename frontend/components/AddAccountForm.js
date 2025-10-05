export default function AddAccountForm({ onOpenScanner, onOpenManualEntry }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold bg-gradient-to-r from-[rgba(102,6,121,1)] via-[rgba(95,1,212,1)] to-[rgba(209,92,203,1)] text-transparent bg-clip-text mb-6">Add New Account</h2>

      <div className="space-y-3">
        <button
          onClick={onOpenScanner}
          className="w-full bg-white border-1 border-gray-800 text-gray-900 py-2 rounded-xl font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan QR Code
        </button>

        <button
  onClick={onOpenManualEntry}
  className="w-full text-white py-2 rounded-xl font-semibold transition flex items-center justify-center gap-3 bg-gradient-to-r from-[rgba(102,6,121,1)] via-[rgba(95,1,212,1)] to-[rgba(209,92,203,1)] hover:opacity-90 border-2 border-transparent"
>
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
  Enter Setup Key
</button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold bg-gradient-to-r from-[rgba(102,6,121,1)] via-[rgba(95,1,212,1)] to-[rgba(209,92,203,1)] text-transparent bg-clip-text mb-2 text-sm">How to add an account:</h3>
        <ol className="text-sm text-gray-800 space-y-2">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Open the service you want to add (Google, GitHub, etc.)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Enable two-factor authentication (2FA)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>Scan the QR code or copy the secret key</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Use the generated code to verify setup</span>
          </li>
        </ol>
      </div>
    </div>
  );
}