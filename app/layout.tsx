import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import StoreInit from "@/components/StoreInit";

export const metadata: Metadata = {
  title: "Kulinara",
  description: "Simpan, temukan, dan bagikan resep — dari dapur ke dapur.",
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
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans">
        <StoreInit />
        <Header />
        {children}
      </body>
    </html>
  );
}
