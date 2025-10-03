export default function AccountsList({ 
  accounts, 
  otpCodes, 
  timeRemaining, 
  onDelete, 
  onCopy 
}) {
  const formatCode = (code) => {
    if (!code || code === '------') return code;
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Your Accounts</h2>
        <span className="text-sm text-gray-500">
          {timeRemaining}s
        </span>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p>No accounts yet</p>
          <p className="text-sm mt-2">Add your first account to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{account.issuer}</h3>
                  <p className="text-sm text-gray-500">{account.name}</p>
                </div>
                <button
                  onClick={() => onDelete(account.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <div
                  onClick={() => onCopy(otpCodes[account.id] || '------')}
                  className="cursor-pointer"
                >
                  <p className="text-3xl font-mono font-bold text-gray-900 tracking-wider">
                    {formatCode(otpCodes[account.id] || '------')}
                  </p>
                </div>
                <div className="w-12 h-12">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#1f2937"
                      strokeWidth="3"
                      strokeDasharray={`${(timeRemaining / 30) * 100.5} 100.5`}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}