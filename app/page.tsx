"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/google-sheets");
  }, [router]);

  // Return minimal UI while redirect happens
  return <div className="min-h-screen"></div>;
}
