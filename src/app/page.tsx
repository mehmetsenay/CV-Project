import type { Metadata } from 'next'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Pricing from '@/components/landing/Pricing'
import FAQ from '@/components/landing/FAQ'

export const metadata: Metadata = {
  title: 'CVAI — AI ile ATS CV Oluşturucu',
  description:
    'LinkedIn profilini ve iş ilanını analiz ederek sana özel, ATS sistemlerini geçen CV üret. 7 gün ücretsiz dene.',
  keywords: ['CV oluşturucu', 'ATS optimized CV', 'AI CV', 'yapay zeka CV'],
  openGraph: {
    title: 'CVAI — AI ile ATS CV Oluşturucu',
    description: 'İşi Kazan. CV\'ni AI Yazar.',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
