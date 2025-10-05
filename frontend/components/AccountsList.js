import { useState } from "react";
import { EllipsisVertical } from "lucide-react";

export default function AccountsList({ 
  accounts, 
  otpCodes, 
  timeRemaining, 
  onDelete, 
  onCopy 
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const formatCode = (code) => {
    if (!code || code === '------') return code;
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-[rgba(102,6,121,1)] via-[rgba(95,1,212,1)] to-[rgba(209,92,203,1)] text-transparent bg-clip-text">
          Your Accounts
        </h2>
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
            <div key={account.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold bg-gradient-to-r from-[rgba(102,6,121,1)] via-[rgba(95,1,212,1)] to-[rgba(209,92,203,1)] text-transparent bg-clip-text">
                    {account.issuer}
                  </h3>
                  <p className="text-sm text-gray-500">{account.name}</p>
                </div>

                {/* Three Dots Menu */}
                <div className="relative">
                  <button
                    onClick={() => toggleMenu(account.id)}
                    className="text-gray-500 hover:text-gray-700 transition"
                  >
                    <EllipsisVertical className="w-5 h-5" />
                  </button>

                  {openMenuId === account.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          onDelete(account.id);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <div
                  onClick={() => onCopy(otpCodes[account.id] || '------')}
                  className="cursor-pointer"
                >
                  <p className="text-3xl font-mono font-bold bg-gradient-to-r from-[rgba(102,6,121,1)] via-[rgba(95,1,212,1)] to-[rgba(209,92,203,1)] text-transparent bg-clip-text tracking-wider">
                    {formatCode(otpCodes[account.id] || '------')}
                  </p>
                </div>

                <div className="w-12 h-12">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <defs>
                      <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(102,6,121,1)" />
                        <stop offset="50%" stopColor="rgba(95,1,212,1)" />
                        <stop offset="100%" stopColor="rgba(209,92,203,1)" />
                      </linearGradient>
                    </defs>

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
                      stroke="url(#circleGradient)"
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