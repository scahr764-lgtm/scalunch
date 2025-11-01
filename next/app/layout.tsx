import './globals.css'
import React from 'react'

export const metadata = { title: 'SCA Lunch', description: 'Supabase + Next.js' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="bg-slate-900 text-slate-100">
          <div className="max-w-6xl mx-auto px-4 py-3 font-semibold">도시락 주문 시스템</div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}


