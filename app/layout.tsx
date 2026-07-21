import type { Metadata, Viewport } from "next";
import { Fredoka, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreInit from "@/components/StoreInit";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ToastStack from "@/components/ui/Toast";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Kulinara",
  description: "Simpan, temukan, dan bagikan resep — dari dapur ke dapur.",
  applicationName: "Kulinara",
  appleWebApp: {
    capable: true,
    title: "Kulinara",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF5A36",
  width: "device-width",
  initialScale: 1,
};

const themeInitScript = `
(function () {
  try {
    var theme = localStorage.getItem("kulinara-theme");
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${fredoka.variable} ${poppins.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans">
        <StoreInit />
        <Header />
        {children}
        <Footer />
        <ConfirmDialog />
        <ToastStack />
      </body>
    </html>
  );
}
