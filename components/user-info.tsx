"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { getToken, isTokenValid, apiGetMe } from "@/lib/api";

export function UserInfo() {
  const [user, setUser] = useState<{ nickname: string; server: string } | null>(null);

  useEffect(() => {
    const check = async () => {
      const token = getToken();
      if (token && isTokenValid()) {
        try {
          const res = await apiGetMe();
          setUser({ nickname: res.user.nickname, server: res.user.server });
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    check();
    const handler = () => check();
    window.addEventListener("participant-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("participant-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 text-amber-300/80 text-sm ml-auto">
      <User className="h-4 w-4" />
      <span>{user.nickname}</span>
      <span className="text-amber-200/40">(Сервер {user.server})</span>
    </div>
  );
}
