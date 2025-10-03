export default function LoginView({ email, setEmail, password, setPassword, onLogin, onRegister, message }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Authenticator</h1>

        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {message && <div className="text-red-500">{message}</div>}

          <button type="submit" className="w-full bg-gray-800 text-white py-3 rounded-lg">
            Login
          </button>
        </form>

        <button 
          onClick={onRegister}
          className="w-full mt-4 py-2 text-gray-600 hover:text-gray-900"
        >
          Create New Account
        </button>
      </div>
    </div>
  );
}