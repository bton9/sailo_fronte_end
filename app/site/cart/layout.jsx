'use client'

import Providers from '@/components/providers/Providers'
import Footer from '@/components/footer'

export default function CartLayout({ children }) {
  return (
    <Providers>
      {children}
      <Footer/>
    </Providers>
  )
}