"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkAdminPassword, setToken } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  onAuth: () => void;
  onClose: () => void;
}

export function StreamerAuthModal({ onAuth, onClose }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!checkAdminPassword(password)) {
        throw new Error("Неверный пароль");
      }
      const token = btoa(JSON.stringify({ userId: "admin", login: "admin", role: "admin", exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
      setToken(token);
      toast.success("Добро пожаловать в панель стримера!");
      onAuth();
    } catch (err: any) {
      toast.error(err.message || "Неверный пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-amber-500/40 bg-black/90 p-8 shadow-[0_0_40px_oklch(0.7_0.18_75/0.2)]">
        <button onClick={onClose} className="absolute top-3 right-3 text-amber-400/60 hover:text-amber-300 transition-colors">
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-amber-900/40 p-3 border border-amber-500/30">
            <Lock className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="font-heading text-2xl text-amber-300">Панель стримера</h2>
          <p className="text-sm text-amber-200/60 text-center">Введите пароль для доступа к управлению</p>
          <form onSubmit={handleSubmit} className="w-full space-y-4 mt-2">
            <Input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)}
              className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium shadow-[0_0_15px_oklch(0.7_0.18_75/0.3)]">
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
