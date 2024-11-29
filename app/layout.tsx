import { Inter } from 'next/font/google'
import { Header } from '../components/header'
import ClientSessionProvider from '../components/ClientSessionProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CardioCare',
  description: 'Plataforma de monitoramento e predição cardiovascular',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <ClientSessionProvider>
          <Header />
          <main>
            {children}
          </main>
        </ClientSessionProvider>
      </body>
    </html>
  )
}




