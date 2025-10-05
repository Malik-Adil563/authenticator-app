export default function VerifyTokenForm({
  accounts,
  selectedAccountId,
  setSelectedAccountId,
  token,
  setToken,
  onSubmit
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold bg-gradient-to-r from-[rgba(102,6,121,1)] via-[rgba(95,1,212,1)] to-[rgba(209,92,203,1)] text-transparent bg-clip-text mb-6">Verify Token</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Select Account
          </label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full px-4 py-2 border-1 border-gray-800 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            required
          >
            <option value="">Choose an account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.issuer} - {account.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Enter 6-digit code
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-2 border-1 border-gray-800 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent text-2xl font-mono tracking-widest"
            placeholder="000000"
            maxLength="6"
            required
          />
        </div>

        <button
  type="submit"
  className="w-full text-white py-2 rounded-lg font-semibold transition bg-gradient-to-r from-[rgba(102,6,121,1)] via-[rgba(95,1,212,1)] to-[rgba(209,92,203,1)] hover:opacity-90"
>
  Verify Code
</button>

      </form>
    </div>
  );
}