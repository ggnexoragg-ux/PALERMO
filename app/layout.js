import './globals.css'

export const metadata = {
  title: 'Palermo Online',
  description: 'A browser-based social deduction game for friends.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
