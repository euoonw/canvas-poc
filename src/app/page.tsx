"use client";
import dynamic from "next/dynamic";

// SSR 비활성화 (Konva는 브라우저 전용)
const CanvasEditor = dynamic(() => import("@/components/CanvasEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-[800px] h-[600px] bg-gray-100 animate-pulse rounded-lg" />
  ),
});

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Canvas POC</h1>
      <CanvasEditor />
    </main>
  );
}
