import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Zenlit - Connect Locally',
  description: 'A modern social media application built with Next.js 15',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="min-h-screen bg-black text-white overflow-hidden">{children}</body>
    </html>
  )
}