"use client";

import { useState, useEffect } from "react";
import { UserPlus, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiRegister, apiLogin, getToken, setToken, getTokenPayload, apiGetMe } from "@/lib/api";

const SERVERS = Array.from({ length: 19 }, (_, i) => String(i + 1));

interface Props {
  showDelete?: boolean;
}

export function RegistrationSection({ showDelete = false }: Props) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [form, setForm] = useState({ login: "", password: "", nickname: "", server: "", telegram: "", discord: "", supportId: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      apiGetMe().then(res => {
        setUserData(res.user);
        setIsRegistered(true);
      }).catch(() => {});
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.telegram && !form.discord) {
      toast.error("Заполните хотя бы Telegram или Discord");
      return;
    }
    setLoading(true);
    try {
      await apiRegister(form);
      const loginRes = await apiLogin(form.login, form.password);
      setToken(loginRes.token);
      setUserData(loginRes.user);
      setIsRegistered(true);
      setEditing(false);
      toast.success("Регистрация успешна!");
      window.dispatchEvent(new CustomEvent("participant-changed"));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (userData) {
      setForm({ login: userData.login, password: "", nickname: userData.nickname, server: userData.server, telegram: userData.telegram, discord: userData.discord, supportId: userData.supportId });
      setEditing(true);
    }
  };

  if (isRegistered && !editing) {
    return (
      <div className="rounded-xl border border-amber-700/30 bg-black/40 p-6 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-300 font-heading text-lg">{userData?.nickname}</p>
            <p className="text-amber-200/60 text-sm">Сервер {userData?.server}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2 border-amber-700/40 text-amber-400/80">
            <Edit3 className="h-4 w-4" />
            <span>Изменить данные</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-700/30 bg-black/40 p-6 card-hover">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="h-6 w-6 text-amber-400" />
        <h2 className="font-heading text-xl text-amber-300">{editing ? "Изменить данные" : "Регистрация"}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-amber-200/80">Логин</Label>
            <Input value={form.login} onChange={e => setForm(p => ({ ...p, login: e.target.value }))} required placeholder="Ваш логин" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-amber-200/80">Пароль</Label>
            <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required={!editing} placeholder="Минимум 6 символов" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-amber-200/80">Игровой ник</Label>
            <Input value={form.nickname} onChange={e => setForm(p => ({ ...p, nickname: e.target.value }))} required placeholder="Ваш ник" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-amber-200/80">Сервер</Label>
            <Select value={form.server} onValueChange={v => setForm(p => ({ ...p, server: v }))} required>
              <SelectTrigger className="bg-black/60 border-amber-700/50 text-amber-100">
                <SelectValue placeholder="Выберите сервер" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-amber-700/50 text-amber-100">
                {SERVERS.map(s => <SelectItem key={s} value={s}>Сервер {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-amber-200/80">Telegram</Label>
            <Input value={form.telegram} onChange={e => setForm(p => ({ ...p, telegram: e.target.value }))} placeholder="@username" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-amber-200/80">Discord</Label>
            <Input value={form.discord} onChange={e => setForm(p => ({ ...p, discord: e.target.value }))} placeholder="username#0000" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-amber-200/80">ID техподдержки</Label>
            <Input value={form.supportId} onChange={e => setForm(p => ({ ...p, supportId: e.target.value }))} required placeholder="Например, SUP-001" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
          </div>
        </div>
        <p className="text-xs text-amber-200/40">Заполните хотя бы Telegram или Discord</p>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium shadow-[0_0_15px_oklch(0.7_0.18_75/0.3)]">
          {loading ? "Сохранение..." : editing ? "Сохранить изменения" : "Зарегистрироваться"}
        </Button>
      </form>
    </div>
  );
}
