import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata, Viewport } from "next"
import { ThemeProvider } from "@components/theme-provider"
import { AuthGate } from "@/components/auth-gate"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
}

export const metadata: Metadata = {
  title: "Local Marketplace",
  description: "Connect with your community through local buying and selling",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <AuthGate>
            {children}
          </AuthGate>
        </ThemeProvider>
      </body>
    </html>
  )
}
