"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "@/components/hero-section";
import { TabNavigation } from "@/components/tab-navigation";
import { getToken, isTokenValid } from "@/lib/api";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <HeroSection />
      <TabNavigation />
    </div>
  );
}
