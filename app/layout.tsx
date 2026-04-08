import { Geist, Geist_Mono, Lora, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import TitleFromUrl from './common/TitleFromUrl'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${cormorantGaramond.variable} antialiased`}
        style={{ backgroundColor: '#333' }}
      >
        <TitleFromUrl />
        {children}
      </body>
    </html>
  );
}
