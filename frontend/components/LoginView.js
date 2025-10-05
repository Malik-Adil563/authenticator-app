import Image from "next/image";

export default function LoginView({ email, setEmail, password, setPassword, onLogin, onRegister, message }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        
        <div className="flex flex-col items-center gap-2 mb-6">
            <Image
              src="/icons/logo.png"
              alt="App Logo"
              width={50}
              height={50}
              className="rounded-lg"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[rgba(102,6,121,1)] via-[rgba(95,1,212,1)] to-[rgba(209,92,203,1)] text-transparent bg-clip-text">
              Authenticator
            </h1>
        </div>

        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-xl"
              required
            />
          </div>

          {message && <div className="text-red-500">{message}</div>}

          <button
            type="submit"
            className="w-full mt-6 text-white py-2 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-[rgba(102,6,121,1)] via-[rgba(95,1,212,1)] to-[rgba(209,92,203,1)] hover:opacity-90"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}