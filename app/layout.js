import './globals.css'
import PwaInstallPrompt from './PwaInstallPrompt'

export const metadata = {
  title: 'Palermo Online',
  description: 'A browser-based social deduction game for friends.',
  applicationName: 'Palermo Online',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Palermo',
    statusBarStyle: 'black-translucent'
  },
  icons: {
    icon: '/palermo-icon.svg',
    apple: '/palermo-icon.svg'
  },
  themeColor: '#08070d'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  )
}
