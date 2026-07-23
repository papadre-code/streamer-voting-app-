"use client";

import { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiGetSettings, apiUpdateSettings } from "@/lib/api";

export function StreamerSettingsSection() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bgImage, setBgImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetSettings().then(({ settings }) => {
      const map = Object.fromEntries(settings.map(s => [s.key, s.value]));
      if (map.title) setTitle(map.title);
      if (map.description) setDescription(map.description);
      if (map.backgroundImageUrl) setBgImage(map.backgroundImageUrl);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await apiUpdateSettings({ title, description, backgroundImageUrl: bgImage });
      toast.success("Настройки сохранены");
      window.dispatchEvent(new CustomEvent("streamer-settings-changed"));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="text-amber-200/60 text-center py-8">Загрузка...</div>;

  return (
    <div className="rounded-xl border border-amber-700/30 bg-black/40 p-6 card-hover">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-amber-400" />
        <h2 className="font-heading text-xl text-amber-300">Настройки главной страницы</h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-amber-200/80">Заголовок сайта</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-black/60 border-amber-700/50 text-amber-100" />
        </div>
        <div className="space-y-2">
          <Label className="text-amber-200/80">Описание/подзаголовок</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)} className="bg-black/60 border-amber-700/50 text-amber-100" />
        </div>
        <div className="space-y-2">
          <Label className="text-amber-200/80">URL фонового изображения</Label>
          <Input value={bgImage} onChange={e => setBgImage(e.target.value)} placeholder="https://example.com/bg.jpg" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
          <p className="text-xs text-amber-200/40">Рекомендуемый размер: 1920×823px (21:9)</p>
        </div>
        <Button onClick={handleSave} className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white">
          <Save className="h-4 w-4 mr-2" />
          Сохранить
        </Button>
      </div>
    </div>
  );
}
