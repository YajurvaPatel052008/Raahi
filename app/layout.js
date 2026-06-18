import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RAAHI — Travel Together. Trust First.',
  description: 'Find verified college travel partners. RAAHI connects AITR and Acropolis students for safe, compatible travel experiences.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
