import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import "@/lib/scheduler";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jost = Jost({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: "The Collective | Events Calendar",
  description: "Events calendar for The Collective community.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-blush text-plum-deep">
        {children}
      </body>
    </html>
  );
}
