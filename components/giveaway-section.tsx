"use client";

import { useState, useEffect } from "react";
import { Gift, Trophy, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiGetGiveaways, apiCreateGiveaway, apiUpdateGiveaway, apiJoinGiveaway, apiGetGiveawayWinners, getToken, isTokenValid, getTokenPayload, apiGetMe } from "@/lib/api";

interface Props {
  isStreamer: boolean;
}

export function GiveawaySection({ isStreamer }: Props) {
  const [giveaway, setGiveaway] = useState<any>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [bannerUrl, setBannerUrl] = useState("");
  const [manualNick, setManualNick] = useState("");
  const [loading, setLoading] = useState(true);
  const [userNickname, setUserNickname] = useState("");

  useEffect(() => {
    const token = getToken();
    if (token && isTokenValid()) {
      apiGetMe().then(res => setUserNickname(res.user.nickname)).catch(() => {});
    }
  }, []);

  const load = async () => {
    try {
      const { giveaways } = await apiGetGiveaways();
      const active = giveaways.find((g: any) => g.status === "active" || g.status === "drawing");
      const idle = giveaways.find((g: any) => g.status === "idle");
      setGiveaway(active || idle || null);
      if (active?.bannerUrl) setBannerUrl(active.bannerUrl);
      if (isStreamer) {
        apiGetGiveawayWinners().then(res => setWinners(res.winners)).catch(() => {});
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [isStreamer]);

  const handleStart = async () => {
    try {
      if (giveaway && giveaway.status === "idle") {
        await apiUpdateGiveaway(giveaway.id, { status: "active", bannerUrl });
      } else {
        await apiCreateGiveaway({ bannerUrl });
      }
      toast.success("Розыгрыш начат!");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleEnd = async () => {
    if (!giveaway || giveaway.participants.length === 0) {
      toast.error("Нет участников");
      return;
    }
    try {
      const shuffled = [...giveaway.participants];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      let current = [...shuffled];
      await apiUpdateGiveaway(giveaway.id, { status: "drawing", participants: current });

      const eliminate = async () => {
        while (current.length > 1) {
          await new Promise(r => setTimeout(r, 100));
          current = current.slice(0, -1);
          await apiUpdateGiveaway(giveaway.id, { participants: current });
          setGiveaway((prev: any) => prev ? { ...prev, participants: current } : prev);
        }
        const winner = current[0];
        await apiUpdateGiveaway(giveaway.id, { status: "complete", winnerNickname: winner, participants: current });
        setGiveaway((prev: any) => prev ? { ...prev, status: "complete", winnerNickname: winner, participants: current } : prev);
        toast.success(`Победитель: ${winner}!`);
        load();
      };
      eliminate();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleReset = async () => {
    if (!giveaway) return;
    try {
      await apiUpdateGiveaway(giveaway.id, { status: "idle", participants: [], winnerNickname: "" });
      toast.success("Розыгрыш сброшен");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleJoin = async () => {
    if (!getToken() || !isTokenValid()) {
      toast.error("Зарегистрируйтесь для участия");
      return;
    }
    if (!giveaway || giveaway.status !== "active") {
      toast.error("Розыгрыш не активен");
      return;
    }
    try {
      await apiJoinGiveaway(giveaway.id, userNickname);
      toast.success("Вы присоединились!");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleManualAdd = async () => {
    if (!manualNick.trim()) return;
    if (!giveaway) return;
    try {
      const newParticipants = [...giveaway.participants, manualNick.trim()];
      await apiUpdateGiveaway(giveaway.id, { participants: newParticipants });
      setManualNick("");
      toast.success("Ник добавлен");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return <div className="text-amber-200/60 text-center py-8">Загрузка...</div>;

  const isActive = giveaway && (giveaway.status === "active" || giveaway.status === "drawing");
  const isDrawing = giveaway?.status === "drawing";

  return (
    <div className="rounded-xl border border-amber-700/30 bg-black/40 p-6 card-hover">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="h-6 w-6 text-amber-400" />
        <h2 className="font-heading text-xl text-amber-300">Розыгрыши</h2>
      </div>

      {isStreamer && (
        <div className="space-y-4 mb-6 p-4 border border-amber-900/30 rounded-lg bg-black/20">
          <div className="flex gap-2">
            <Button onClick={handleStart} disabled={isActive || isDrawing} className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white">
              Начать розыгрыш
            </Button>
            <Button onClick={handleEnd} disabled={!isActive} variant="destructive">
              Закончить розыгрыш
            </Button>
            <Button onClick={handleReset} disabled={isDrawing} variant="outline" className="border-amber-700/40 text-amber-400/80">
              <RotateCcw className="h-4 w-4 mr-1" />
              Сбросить
            </Button>
          </div>
          <div className="space-y-2">
            <Input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="URL баннера (1920×823px, 21:9)" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
            <p className="text-xs text-amber-200/40">Рекомендуемый размер: 1920×823px (21:9)</p>
          </div>
          <div className="flex gap-2">
            <Input value={manualNick} onChange={e => setManualNick(e.target.value)} placeholder="Введите ник для добавления" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
            <Button onClick={handleManualAdd} variant="outline" className="border-amber-700/40 text-amber-400/80">
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </div>
        </div>
      )}

      {!isActive && !isDrawing && (
        <div className="text-center py-8">
          <Gift className="h-12 w-12 text-amber-700/40 mx-auto mb-3" />
          <p className="text-amber-200/60">Сейчас активных розыгрышей нет</p>
          {!isStreamer && (
            <p className="text-amber-200/40 text-sm mt-2">Ожидайте начала розыгрыша от стримера</p>
          )}
        </div>
      )}

      {(isActive || isDrawing) && giveaway && (
        <div className="space-y-4">
          {giveaway.bannerUrl && (
            <div className="w-full rounded-lg overflow-hidden" style={{ aspectRatio: "21/9" }}>
              <img src={giveaway.bannerUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {!isStreamer && (
            <Button onClick={handleJoin} disabled={giveaway.status !== "active"} className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium shadow-[0_0_15px_oklch(0.7_0.18_75/0.3)]">
              Присоединиться
            </Button>
          )}

          <div className="flex flex-wrap gap-2 justify-center">
            {giveaway.participants.map((nick: string, i: number) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-amber-900/30 border border-amber-700/30 text-amber-200 text-sm animate-fade-in">
                {nick}
              </span>
            ))}
          </div>

          {giveaway.winnerNickname && (
            <div className="text-center py-4">
              <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-2" />
              <p className="font-heading text-2xl text-amber-300">Победитель: {giveaway.winnerNickname}</p>
            </div>
          )}
        </div>
      )}

      {isStreamer && winners.length > 0 && (
        <div className="mt-6 pt-4 border-t border-amber-900/30">
          <h3 className="font-heading text-sm text-amber-300 mb-2">История победителей</h3>
          <div className="space-y-1">
            {winners.map((w: any) => (
              <div key={w.id} className="flex items-center gap-2 text-sm text-amber-200/60">
                <Trophy className="h-3 w-3 text-amber-400" />
                <span className="text-amber-200">{w.nickname}</span>
                <span className="text-xs">— {new Date(w.wonAt).toLocaleDateString()}</span>
                <span className="text-xs">({w.participantsCount} участников)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
