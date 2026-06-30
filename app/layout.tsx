import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Archivo } from 'next/font/google'
const ArchivoFont = Archivo({ weight: "400", subsets: ["latin"] })

export const metadata: Metadata = {
    title: "belong²",
    description: "belong² Links",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={ArchivoFont.className} style={{ colorScheme: "light" }}>
        <body className={ArchivoFont.className}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}