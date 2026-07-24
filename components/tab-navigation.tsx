"use client";

import { useState, useEffect } from "react";
import { Lock, LogOut, Users, Vote, Settings, Gift, PlusCircle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RegistrationSection } from "@/components/registration-section";
import { ParticipantsTable } from "@/components/participants-table";
import { VotingCreationSection } from "@/components/voting-creation-section";
import { ActiveVotingSection } from "@/components/active-voting-section";
import { VotingHistorySection } from "@/components/voting-history-section";
import { StreamerSettingsSection } from "@/components/streamer-settings-section";
import { GiveawaySection } from "@/components/giveaway-section";
import { StreamerAuthModal } from "@/components/streamer-auth-modal";
import { getToken, isTokenValid, getTokenPayload, apiGetMe } from "@/lib/api";

type Tab = "registration" | "voting" | "giveaway" | "participants" | "create-voting" | "settings";

const USER_TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "registration", label: "Регистрация", icon: UserPlus },
  { id: "voting", label: "Голосования", icon: Vote },
  { id: "giveaway", label: "Розыгрыши", icon: Gift },
];

const STREAMER_TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "voting", label: "Голосования", icon: Vote },
  { id: "giveaway", label: "Розыгрыши", icon: Gift },
  { id: "participants", label: "Участники", icon: Users },
  { id: "create-voting", label: "Создать голосование", icon: PlusCircle },
  { id: "settings", label: "Настройки", icon: Settings },
];

export function TabNavigation() {
  const [activeTab, setActiveTab] = useState<Tab>("registration");
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getToken();
    if (token && isTokenValid()) {
      setIsAuthed(true);
      const payload = getTokenPayload();
      if (payload?.role === "admin") setIsAdmin(true);
    }
  }, []);

  if (!mounted) return null;

  const tabs = isAdmin ? STREAMER_TABS : USER_TABS;

    const handleAuth = () => {
    setIsAuthed(true);
    const payload = getTokenPayload();
    if (payload?.role === "admin") {
      setIsAdmin(true);
      setActiveTab("voting");
    }
    setShowAuthModal(false);
  };

  const handleExitAdmin = () => {
    localStorage.removeItem("jwt-token");
    setIsAuthed(false);
    setIsAdmin(false);
    setActiveTab("registration");
  };

  return (
    <div className="space-y-8">
      {isAdmin ? (
        <div className="flex gap-6">
          <aside className="w-56 shrink-0 flex flex-col gap-1 rounded-xl p-2 bg-black/40 border border-amber-900/30">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} data-active={isActive} onClick={() => setActiveTab(tab.id)}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 text-left",
                    isActive ? "bg-amber-900/40 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_oklch(0.7_0.18_75/0.3)]" : "text-amber-700/70 hover:text-amber-400/80 hover:bg-amber-900/20")}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <div className="mt-auto pt-2 border-t border-amber-900/30">
              <Button variant="outline" size="sm" onClick={handleExitAdmin} className="w-full gap-2 border-amber-700/40 text-amber-400/80 hover:text-amber-300">
                <LogOut className="h-4 w-4" />
                <span>Выйти из админки</span>
              </Button>
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            {activeTab === "voting" && <div className="space-y-8 animate-fade-in"><ActiveVotingSection isStreamer /></div>}
            {activeTab === "giveaway" && <div className="animate-fade-in"><GiveawaySection isStreamer /></div>}
            {activeTab === "participants" && <div className="space-y-8 animate-fade-in"><RegistrationSection showDelete /><ParticipantsTable /></div>}
            {activeTab === "create-voting" && <div className="space-y-8 animate-fade-in"><VotingCreationSection /><ActiveVotingSection isStreamer /><VotingHistorySection /></div>}
            {activeTab === "settings" && <div className="animate-fade-in"><StreamerSettingsSection /></div>}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-1 rounded-xl p-1 bg-black/40 border border-amber-900/30 flex-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} data-active={isActive} onClick={() => setActiveTab(tab.id)}
                    className={cn("tab-glow flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                      isActive ? "bg-amber-900/40 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_oklch(0.7_0.18_75/0.3)]" : "text-amber-700/70 hover:text-amber-400/80 hover:bg-amber-900/20")}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)} className="gap-2 border-amber-700/40 text-amber-400/80 hover:text-amber-300 ml-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Панель стримера</span>
            </Button>
          </div>
          {showAuthModal && <StreamerAuthModal onAuth={handleAuth} onClose={() => setShowAuthModal(false)} />}
          {activeTab === "registration" && <div className="space-y-8 animate-fade-in"><RegistrationSection showDelete={false} /></div>}
          {activeTab === "voting" && <div className="space-y-8 animate-fade-in"><ActiveVotingSection isStreamer={false} /></div>}
          {activeTab === "giveaway" && <div className="animate-fade-in"><GiveawaySection isStreamer={false} /></div>}
        </>
      )}
    </div>
  );
}
