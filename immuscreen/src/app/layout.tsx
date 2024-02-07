import "./globals.css"
import { Inter } from "next/font/google"
import AppBar from "../common/components/HomeAppBar"
import Footer from "../common/components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "immuSCREEN: Search Immune Candidate cis-Regulatory Elements by ENCODE",
  description: "immuSCREEN: Search Immune Candidate cis-Regulatory Elements by ENCODE",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} id="page-container">
        <div id="content-wrapper">
          <AppBar />
          <div id="body-wrapper">{children}</div>
        </div>
        <Footer />
      </body>
    </html>
  )
}