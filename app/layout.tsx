import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ThemeProvider } from "@components/theme-provider"
import { AuthGate } from "@/components/auth-gate"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Local Marketplace",
  description: "Connect with your community through local buying and selling",
  generator: "v0.dev",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
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
