'use client';

import Image from "next/image";
import ChatWidget from "../components/ChatWidget";
import Wizard from "../components/Wizard";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <ChatWidget />
      <Wizard />
    </main>
  );
}
