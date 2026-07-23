"use client";

import { useState, useEffect, useRef } from "react";
import { Vote, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiGetVotings, apiVote, apiGetVotes, apiUpdateVoting, getToken, isTokenValid } from "@/lib/api";

const COLORS = ["#f97316", "#ef4444", "#3b82f6", "#22c55e", "#a855f7"];

interface Props {
  isStreamer: boolean;
}

export function ActiveVotingSection({ isStreamer }: Props) {
  const [votings, setVotings] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const load = async () => {
    try {
      const { votings } = await apiGetVotings("active");
      setVotings(votings);
    } catch { setVotings([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); const interval = setInterval(load, 5000); return () => clearInterval(interval); }, []);

  useEffect(() => {
    if (!expandedId) return;
    apiGetVotes(expandedId).then(res => setVotes(res.votes)).catch(() => {});
  }, [expandedId]);

  const handleVote = async (votingId: string, optionId: string) => {
    if (!getToken() || !isTokenValid()) {
      toast.error("Зарегистрируйтесь для голосования");
      return;
    }
    try {
      const { voting } = await apiVote(votingId, optionId);
      setVotings(prev => prev.map(v => v.id === votingId ? voting : v));
      if (expandedId === votingId) {
        apiGetVotes(votingId).then(res => setVotes(res.votes)).catch(() => {});
      }
      toast.success("Голос учтён!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEnd = async (votingId: string) => {
    try {
      await apiUpdateVoting(votingId, { status: "archived" });
      toast.success("Голосование завершено");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (!expandedId || !canvasRef.current) return;
    const voting = votings.find(v => v.id === expandedId);
    if (!voting || voting.totalVotes === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 320;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const r = 130;

    let progress = 0;
    const targetAngles = voting.options.map((o: any) => (o.votes / voting.totalVotes) * Math.PI * 2);

    const draw = () => {
      progress = Math.min(1, progress + 0.03);
      ctx.clearRect(0, 0, size, size);

      // фон
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + 20);
      grad.addColorStop(0, "oklch(0.15 0.04 285)");
      grad.addColorStop(1, "oklch(0.1 0.03 285)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 20, 0, Math.PI * 2);
      ctx.fill();

      let startAngle = -Math.PI / 2;
      voting.options.forEach((opt: any, i: number) => {
        const sweepAngle = targetAngles[i] * progress;
        const color = COLORS[i % COLORS.length];

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + sweepAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // обводка
        ctx.strokeStyle = "#d4a017";
        ctx.lineWidth = 2;
        ctx.stroke();

        // проценты
        if (voting.totalVotes > 0) {
          const midAngle = startAngle + sweepAngle / 2;
          const pct = Math.round((opt.votes / voting.totalVotes) * 100);
          if (pct > 3) {
            const tx = cx + Math.cos(midAngle) * (r * 0.65);
            const ty = cy + Math.sin(midAngle) * (r * 0.65);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 16px Cinzel, serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${pct}%`, tx, ty);
          }
        }

        startAngle += sweepAngle;
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [expandedId, votings]);

  if (loading) return <div className="text-amber-200/60 text-center py-8">Загрузка...</div>;

  const activeVotings = votings.filter(v => v.status === "active");

  if (activeVotings.length === 0) {
    return (
      <div className="rounded-xl border border-amber-700/30 bg-black/40 p-8 text-center card-hover">
        <Vote className="h-12 w-12 text-amber-700/40 mx-auto mb-3" />
        <p className="text-amber-200/60">Активных голосований сейчас нет</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeVotings.map(voting => (
        <div key={voting.id} className="rounded-xl border border-amber-700/30 bg-black/40 overflow-hidden card-hover">
          {expandedId === voting.id ? (
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-heading text-2xl text-amber-300">{voting.question}</h3>
                <button onClick={() => setExpandedId(null)} className="text-amber-400/60 hover:text-amber-300">
                  <ChevronUp className="h-6 w-6" />
                </button>
              </div>

              {voting.imageUrl && (
                <div className="w-full mb-4 rounded-lg overflow-hidden" style={{ aspectRatio: "21/9" }}>
                  <img src={voting.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {voting.options.map((opt: any, i: number) => {
                    const pct = voting.totalVotes > 0 ? Math.round((opt.votes / voting.totalVotes) * 100) : 0;
                    const color = COLORS[i % COLORS.length];
                    return (
                      <div key={opt.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          {opt.iconUrl && <img src={opt.iconUrl} alt="" className="h-16 w-16 rounded object-contain" />}
                          <span className="text-amber-200 text-sm flex-1">{opt.text}</span>
                          <span className="text-amber-200/60 text-xs">{opt.votes} голосов ({pct}%)</span>
                        </div>
                        <div className="h-3 rounded-full bg-amber-900/30 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleVote(voting.id, opt.id)}
                          className="w-full border-amber-700/40 text-amber-400/80 hover:text-amber-300 mt-1">
                          Голосовать
                        </Button>
                      </div>
                    );
                  })}
                  {isStreamer && (
                    <Button variant="destructive" size="sm" onClick={() => handleEnd(voting.id)} className="w-full gap-2 mt-4">
                      <XCircle className="h-4 w-4" />
                      Завершить голосование
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <canvas ref={canvasRef} className="max-w-full" style={{ width: 320, height: 320 }} />
                </div>
              </div>

              {isStreamer && votes.length > 0 && (
                <div className="mt-6 pt-4 border-t border-amber-900/30">
                  <h4 className="font-heading text-sm text-amber-300 mb-2">Голоса участников</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-amber-900/30">
                          <th className="text-left px-2 py-1 text-amber-400/60">№</th>
                          <th className="text-left px-2 py-1 text-amber-400/60">Участник</th>
                          <th className="text-left px-2 py-1 text-amber-400/60">Вариант</th>
                        </tr>
                      </thead>
                      <tbody>
                        {votes.map((v, i) => (
                          <tr key={i} className="border-b border-amber-900/20">
                            <td className="px-2 py-1 text-amber-200/60">{i + 1}</td>
                            <td className="px-2 py-1 text-amber-200">{v.nickname}</td>
                            <td className="px-2 py-1 text-amber-200/80">{v.optionText}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setExpandedId(voting.id)} className="w-full p-4 text-left hover:bg-amber-900/10 transition-colors">
              <div className="flex items-center gap-4">
                {voting.imageUrl && (
                  <div className="w-32 shrink-0 rounded overflow-hidden" style={{ aspectRatio: "21/9" }}>
                    <img src={voting.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg text-amber-300 truncate">{voting.question}</h3>
                  <p className="text-amber-200/60 text-sm mt-1">{voting.totalVotes} голосов</p>
                </div>
                <ChevronDown className="h-5 w-5 text-amber-400/60 shrink-0" />
              </div>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
