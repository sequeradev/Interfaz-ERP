import type { Metadata } from "next";
import { JetBrains_Mono, Montserrat, Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";

const headingFont = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap"
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap"
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "FlowOps – ERP inteligente",
  description: "Gestión de equipos, tareas y proyectos en un panel profesional.",
  keywords: ["ERP", "gestión", "equipos", "tareas", "FlowOps"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
