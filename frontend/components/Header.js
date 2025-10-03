export default function Header({ email, onLogout }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authenticator</h1>
          <p className="text-gray-500 text-sm mt-1">{email}</p>
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