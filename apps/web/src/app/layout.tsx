import type { Metadata } from "next";
import { Inter, Roboto, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "École Saint Joseph",
  description: "Système de Gestion Scolaire - École Saint Joseph, Goma, RDC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${roboto.variable} ${poppins.variable} antialiased`}
      >
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
