import Header from './Header';
import AccountsList from './AccountsList';
import AddAccountForm from './AddAccountForm';
import VerifyTokenForm from './VerifyTokenForm';

export default function DashboardView({
  email,
  accounts,
  otpCodes,
  timeRemaining,
  message,
  // Updated props for new add account flow
  onOpenScanner,
  onOpenManualEntry,
  // Verify
  verifyToken,
  setVerifyToken,
  verifyAccountId,
  setVerifyAccountId,
  onVerify,
  // Actions
  onDeleteAccount,
  onCopy,
  onLogout
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-4 py-8">
        <Header email={email} onLogout={onLogout} />

        {message && (
          <div className="bg-gray-800 text-white p-4 rounded-xl mb-6 shadow-lg">
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <AccountsList
            accounts={accounts}
            otpCodes={otpCodes}
            timeRemaining={timeRemaining}
            onDelete={onDeleteAccount}
            onCopy={onCopy}
          />

          <div className="space-y-6">
            <AddAccountForm
              onOpenScanner={onOpenScanner}
              onOpenManualEntry={onOpenManualEntry}
            />

            <VerifyTokenForm
              accounts={accounts}
              selectedAccountId={verifyAccountId}
              setSelectedAccountId={setVerifyAccountId}
              token={verifyToken}
              setToken={setVerifyToken}
              onSubmit={onVerify}
            />
          </div>
        </div>
      </div>
    </div>
  );
}