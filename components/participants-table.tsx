"use client";

import { useState, useEffect } from "react";
import { Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGetParticipants, apiDeleteParticipant } from "@/lib/api";
import { toast } from "sonner";

export function ParticipantsTable() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { participants } = await apiGetParticipants();
      setParticipants(participants.filter((p: any) => p.role !== "admin"));
    } catch {
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteParticipant(id);
      toast.success("Участник удалён");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCSV = () => {
    const headers = ["Ник", "Сервер", "Telegram", "Discord", "ID техподдержки"];
    const rows = participants.map(p => [p.nickname, p.server, p.telegram, p.discord, p.supportId]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-amber-200/60 text-center py-8">Загрузка...</div>;

  return (
    <div className="rounded-xl border border-amber-700/30 bg-black/40 p-4 card-hover">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-lg text-amber-300">Участники ({participants.length})</h3>
        <Button variant="outline" size="sm" onClick={handleCSV} className="gap-2 border-amber-700/40 text-amber-400/80 hover:text-amber-300">
          <Download className="h-3 w-3" />
          <span className="text-xs">CSV</span>
        </Button>
      </div>
      {participants.length === 0 ? (
        <p className="text-amber-200/40 text-center py-4 text-sm">Нет зарегистрированных участников</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-amber-900/30">
                <th className="text-left px-1.5 py-1 text-amber-400/60 font-medium h-7">Ник</th>
                <th className="text-left px-1.5 py-1 text-amber-400/60 font-medium h-7">Сервер</th>
                <th className="text-left px-1.5 py-1 text-amber-400/60 font-medium h-7 hidden md:table-cell">Telegram</th>
                <th className="text-left px-1.5 py-1 text-amber-400/60 font-medium h-7 hidden md:table-cell">Discord</th>
                <th className="text-left px-1.5 py-1 text-amber-400/60 font-medium h-7 hidden lg:table-cell">ID</th>
                <th className="px-1.5 py-1 h-7 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => (
                <tr key={p.id} className="border-b border-amber-900/20 hover:bg-amber-900/10">
                  <td className="px-1.5 py-1 text-amber-200">{p.nickname}</td>
                  <td className="px-1.5 py-1 text-amber-200/60">{p.server}</td>
                  <td className="px-1.5 py-1 text-amber-200/60 hidden md:table-cell">{p.telegram || "—"}</td>
                  <td className="px-1.5 py-1 text-amber-200/60 hidden md:table-cell">{p.discord || "—"}</td>
                  <td className="px-1.5 py-1 text-amber-200/60 hidden lg:table-cell">{p.supportId || "—"}</td>
                  <td className="px-1.5 py-1">
                    <button onClick={() => handleDelete(p.id)} className="text-red-400/60 hover:text-red-400 transition-colors size-6 flex items-center justify-center">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
