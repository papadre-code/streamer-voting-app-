"use client";

import { useState } from "react";
import { PlusCircle, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { apiCreateVoting } from "@/lib/api";

export function VotingCreationSection() {
  const [question, setQuestion] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [options, setOptions] = useState([{ id: "o1", text: "", iconUrl: "" }, { id: "o2", text: "", iconUrl: "" }]);
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    if (options.length >= 12) { toast.error("Максимум 12 вариантов"); return; }
    setOptions([...options, { id: `o${Date.now()}`, text: "", iconUrl: "" }]);
  };

  const removeOption = () => {
    if (options.length <= 2) { toast.error("Минимум 2 варианта"); return; }
    setOptions(options.slice(0, -1));
  };

  const updateOption = (id: string, field: "text" | "iconUrl", value: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) { toast.error("Введите вопрос"); return; }
    if (options.some(o => !o.text.trim())) { toast.error("Заполните все варианты"); return; }
    setLoading(true);
    try {
      await apiCreateVoting({
        question: question.trim(),
        options: options.map(o => ({ id: o.id, text: o.text.trim(), iconUrl: o.iconUrl || undefined })),
        imageUrl: imageUrl || undefined,
        allowMultiple,
      });
      toast.success("Голосование запущено!");
      setQuestion("");
      setImageUrl("");
      setAllowMultiple(false);
      setOptions([{ id: "o1", text: "", iconUrl: "" }, { id: "o2", text: "", iconUrl: "" }]);
      window.dispatchEvent(new Event("voting-changed"));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-700/30 bg-black/40 p-6 card-hover">
      <div className="flex items-center gap-3 mb-6">
        <PlusCircle className="h-6 w-6 text-amber-400" />
        <h2 className="font-heading text-xl text-amber-300">Создать голосование</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-amber-200/80">Вопрос</Label>
          <Input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ваш вопрос" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
        </div>
        <div className="space-y-2">
          <Label className="text-amber-200/80">URL изображения</Label>
          <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
          <p className="text-xs text-amber-200/40">Рекомендуемый размер: 1920×823px (21:9)</p>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={allowMultiple} onCheckedChange={setAllowMultiple} />
          <Label className="text-amber-200/80">Несколько ответов</Label>
        </div>
        <div className="space-y-3">
          <Label className="text-amber-200/80">Варианты ответа</Label>
          {options.map((opt, i) => (
            <div key={opt.id} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <Input value={opt.text} onChange={e => updateOption(opt.id, "text", e.target.value)} placeholder={`Вариант ${i + 1}`} className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50" />
                <Input value={opt.iconUrl} onChange={e => updateOption(opt.id, "iconUrl", e.target.value)} placeholder="URL иконки (опционально)" className="bg-black/60 border-amber-700/50 text-amber-100 placeholder:text-amber-700/50 text-xs" />
                <p className="text-xs text-amber-200/40">Рекомендуемый размер: 64×64px</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addOption} className="border-amber-700/40 text-amber-400/80">+ Добавить вариант</Button>
            <Button type="button" variant="outline" size="sm" onClick={removeOption} className="border-red-700/40 text-red-400/80">Удалить последний</Button>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium shadow-[0_0_15px_oklch(0.7_0.18_75/0.3)]">
          <Play className="h-4 w-4 mr-2" />
          {loading ? "Запуск..." : "Запустить голосование"}
        </Button>
      </form>
    </div>
  );
}
