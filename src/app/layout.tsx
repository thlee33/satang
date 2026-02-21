import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "./globals.css";
import { QueryProvider } from "@/components/shared/query-provider";

export const metadata: Metadata = {
  title: "사탕 - 달달한 AI 지식 노트북",
  description:
    "소스를 업로드하고 AI와 채팅하고, 인포그래픽과 슬라이드를 자동 생성하세요. 달달한 AI와 함께 지식을 탐험하세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster position="bottom-right" richColors />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-3MR8Q9MB7X" />
      </body>
    </html>
  );
}
