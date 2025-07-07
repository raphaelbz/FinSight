import Header from '@/components/header'
import Hero from '@/components/hero'
import Features from '@/components/features'
import CTA from '@/components/cta'
import Footer from '@/components/footer'
import ScrollAnimations from '@/components/scroll-animations'

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative page-transition">
      <ScrollAnimations />
      <Header />
      <main className="relative z-10">
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  )
} 