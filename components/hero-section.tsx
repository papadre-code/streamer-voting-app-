"use client";

import { useState, useEffect } from "react";
import { apiGetSettings } from "@/lib/api";

export function HeroSection() {
  const [title, setTitle] = useState("Streamer Voting");
  const [description, setDescription] = useState("Проводите голосования на стримах в реальном времени.");
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { settings } = await apiGetSettings();
        const map = Object.fromEntries(settings.map(s => [s.key, s.value]));
        if (map.title) setTitle(map.title);
        if (map.description) setDescription(map.description);
        if (map.backgroundImageUrl) setBgImage(map.backgroundImageUrl);
      } catch {}
    };
    load();
    const handler = () => load();
    window.addEventListener("streamer-settings-changed", handler);
    return () => window.removeEventListener("streamer-settings-changed", handler);
  }, []);

  return (
    <section className="relative w-full overflow-hidden rounded-xl mb-8" style={{ aspectRatio: "21/9" }}>
      {bgImage && (
        <div className="absolute inset-0">
          <img src={bgImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-8 px-4 text-center">
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-amber-300 drop-shadow-[0_0_20px_oklch(0.7_0.18_75/0.5)]">
          {title}
        </h1>
        <p className="mt-20 text-lg md:text-xl text-amber-100/80 max-w-2xl">
          {description}
        </p>
      </div>
    </section>
  );
}
