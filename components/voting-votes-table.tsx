"use client";

import { Users } from "lucide-react";

interface Props {
  votes: { userId: string; nickname: string; optionId: string; optionText: string }[];
}

export function VotingVotesTable({ votes }: Props) {
  if (votes.length === 0) {
    return (
      <div className="rounded-xl border border-amber-700/30 bg-black/40 p-4 text-center">
        <Users className="h-8 w-8 text-amber-700/40 mx-auto mb-2" />
        <p className="text-amber-200/60 text-sm">Пока нет голосов</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-700/30 bg-black/40 p-4">
      <h4 className="font-heading text-sm text-amber-300 mb-3">Голоса участников</h4>
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
              <tr key={i} className="border-b border-amber-900/20 hover:bg-amber-900/10">
                <td className="px-2 py-1 text-amber-200/60">{i + 1}</td>
                <td className="px-2 py-1 text-amber-200">{v.nickname}</td>
                <td className="px-2 py-1 text-amber-200/80">{v.optionText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
