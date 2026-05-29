import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/shell/Sidebar";

export const metadata: Metadata = {
  title: "유통BG 인재 컨트롤타워",
  description:
    "조직의 핵심 포스트 현황을 한눈에 파악하고 데이터 기반으로 내·외부 인재를 추천하는 HR Intelligence 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-canvas font-sans text-ink-900 antialiased">
        <Sidebar />
        <main className="ml-[248px] min-h-screen">{children}</main>
      </body>
    </html>
  );
}
