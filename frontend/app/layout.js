import './globals.css'

export const metadata = {
  title: 'Authenticator - 2FA App',
  description: 'Two-factor authentication app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}