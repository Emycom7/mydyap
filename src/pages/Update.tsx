import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Presentation, Loader2, User, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePresentations } from "@/hooks/usePresentations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Update() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Bonjour ! Je suis prêt à modifier votre diaporama. Que souhaitez-vous changer ?\n\nExemples :\n- *Ajouter une slide comparative*\n- *Changer le type de graphique*\n- *Simplifier les explications*\n- *Ajouter un benchmark*" },
  ]);
  const [sending, setSending] = useState(false);
  const { data: presentations, isLoading } = usePresentations();
  const queryClient = useQueryClient();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!message.trim() || !selectedId || sending) return;
    const userMsg = message.trim();
    setMessage("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setSending(true);

    try {
      const conversationHistory = chatMessages.filter((m) => m.role !== "assistant" || chatMessages.indexOf(m) > 0);
      const response = await supabase.functions.invoke("update-presentation", {
        body: {
          presentationId: selectedId,
          message: userMsg,
          conversationHistory,
        },
      });

      if (response.error) throw new Error(response.error.message);
      const data = response.data;
      if (data.error) throw new Error(data.error);

      const assistantMsg = data.message || "Modification appliquée.";
      setChatMessages((prev) => [...prev, { role: "assistant", content: assistantMsg }]);

      if (data.action === "update") {
        queryClient.invalidateQueries({ queryKey: ["presentations"] });
        toast.success("Diaporama mis à jour !");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur");
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Désolé, une erreur s'est produite. Réessayez." }]);
    } finally {
      setSending(false);
    }
  };

  const handleSelectPresentation = (id: string) => {
    setSelectedId(id);
    setChatMessages([
      { role: "assistant", content: "Bonjour ! Je suis prêt à modifier votre diaporama. Que souhaitez-vous changer ?\n\nExemples :\n- *Ajouter une slide comparative*\n- *Changer le type de graphique*\n- *Simplifier les explications*\n- *Ajouter un benchmark*" },
    ]);
  };

  if (!selectedId) {
    return (
      <div className="flex h-[calc(100vh-6rem)] flex-col p-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold">Modifier via IA</h1>
          <p className="text-sm text-muted-foreground mt-1">Sélectionnez un diaporama puis discutez avec l'IA</p>
        </motion.div>

        <div className="mt-4 space-y-3 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !presentations?.length ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Aucune présentation disponible</p>
              <p className="text-xs text-muted-foreground mt-1">Créez d'abord un diaporama</p>
            </div>
          ) : (
            presentations.map((p) => {
              const slideCount = Array.isArray(p.slide_data) ? p.slide_data.length : 0;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPresentation(p.id)}
                  className="glass-card-hover w-full p-4 text-left flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Presentation className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {slideCount} slides · v{p.version} · {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setSelectedId(null)} className="text-xs text-muted-foreground hover:text-primary">
          ← Retour
        </button>
        <span className="text-xs text-muted-foreground">
          {presentations?.find((p) => p.id === selectedId)?.title}
        </span>
      </div>

      <div className="flex-1 glass-card p-4 overflow-y-auto space-y-3">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              msg.role === "user" ? "bg-secondary/10" : "bg-primary/10"
            }`}>
              {msg.role === "user" ? <User className="h-3.5 w-3.5 text-secondary" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
            </div>
            <div className={`rounded-lg p-3 text-sm max-w-[80%] ${
              msg.role === "user" ? "bg-secondary/10" : "bg-muted/50"
            }`}>
              <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="mt-3 flex gap-2"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex: Ajouter une slide comparative..."
          className="bg-muted/50 border-border/50"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={sending || !message.trim()} className="bg-gradient-mixed shrink-0 text-primary-foreground">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
