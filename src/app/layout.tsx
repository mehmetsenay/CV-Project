import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import AnimatedBackground from '@/components/ui/animated-background'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'CVAI — AI ile ATS CV Oluşturucu',
    template: '%s | CVAI',
  },
  description:
    'LinkedIn profilini ve iş ilanını analiz ederek sana özel, ATS sistemlerini geçen CV üret.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white selection:bg-violet-500/30`}>
        <AnimatedBackground />
        <div className="relative z-10 w-full min-h-screen">
          {children}
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
