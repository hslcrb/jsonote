import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "제이소노트 (JSONOTE)",
  description: "GitHub 연동형 미니멀리스트 JSON 노트 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
