"use client";

import { useState, useEffect } from "react";
import { ScrollText } from "lucide-react";
import { apiGetVotings } from "@/lib/api";

const COLORS = ["#f97316", "#ef4444", "#3b82f6", "#22c55e", "#a855f7"];

export function VotingHistorySection() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetVotings("archived").then(({ votings }) => setHistory(votings)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-amber-200/60 text-center py-8">Загрузка...</div>;

  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-amber-700/30 bg-black/40 p-8 text-center card-hover">
        <ScrollText className="h-12 w-12 text-amber-700/40 mx-auto mb-3" />
        <p className="text-amber-200/60">Нет завершённых голосований</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-700/30 bg-black/40 p-6 card-hover">
      <h3 className="font-heading text-lg text-amber-300 mb-4">История голосований</h3>
      <div className="space-y-4">
        {history.map(voting => (
          <div key={voting.id} className="border border-amber-900/30 rounded-lg p-4 bg-black/20">
            <div className="flex items-center gap-3 mb-3">
              {voting.imageUrl && (
                <div className="w-24 shrink-0 rounded overflow-hidden" style={{ aspectRatio: "21/9" }}>
                  <img src={voting.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <h4 className="font-heading text-base text-amber-300">{voting.question}</h4>
            </div>
            <div className="space-y-2">
              {voting.options.map((opt: any, i: number) => {
                const pct = voting.totalVotes > 0 ? Math.round((opt.votes / voting.totalVotes) * 100) : 0;
                const color = COLORS[i % COLORS.length];
                return (
                  <div key={opt.id} className="flex items-center gap-2">
                    {opt.iconUrl && <img src={opt.iconUrl} alt="" className="h-8 w-8 rounded object-contain" />}
                    <span className="text-amber-200/80 text-sm w-32 truncate">{opt.text}</span>
                    <div className="flex-1 h-2 rounded-full bg-amber-900/30 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
                    </div>
                    <span className="text-amber-200/60 text-xs w-20 text-right">{opt.votes} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
