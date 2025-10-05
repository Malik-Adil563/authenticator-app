export default function Header({ email, onLogout }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
  <div className="flex items-center gap-2">
    <img
      src="/icons/logo.png"
      alt="App Logo"
      className="w-10 h-8"
    />
    <h1 className="text-2xl font-bold bg-gradient-to-r from-[rgba(102,6,121,1)] via-[rgba(95,1,212,1)] to-[rgba(209,92,203,1)] text-transparent bg-clip-text">
      Authenticator
    </h1>
  </div>

  <p className="text-gray-500 ml-12 text-sm mt-1">{email}</p>
</div>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}