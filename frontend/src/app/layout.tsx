'use client';

import "./globals.css";
import type { ReactNode } from "react";
import { ChatProvider } from "../context/ChatContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans bg-gray-50 min-h-screen">
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  );
}
