import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Presentation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Update() {
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const mockPresentations = [
    { id: "1", title: "Rapport Q4 2025", slides: 12 },
    { id: "2", title: "Analyse Marketing", slides: 8 },
    { id: "3", title: "KPIs Ventes", slides: 15 },
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col p-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Modifier via IA</h1>
        <p className="text-sm text-muted-foreground mt-1">Sélectionnez un diaporama puis discutez avec l'IA</p>
      </motion.div>

      {!selectedPresentation ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 space-y-3 flex-1">
          {mockPresentations.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPresentation(p.id)}
              className="glass-card-hover w-full p-4 text-left flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Presentation className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.slides} slides</p>
              </div>
            </button>
          ))}
        </motion.div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col">
          <button onClick={() => setSelectedPresentation(null)} className="text-xs text-muted-foreground hover:text-primary mb-3">
            ← Retour à la sélection
          </button>
          <div className="flex-1 glass-card p-4 overflow-y-auto space-y-3">
            <div className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                Bonjour ! Je suis prêt à modifier votre diaporama. Que souhaitez-vous changer ?
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Ajouter une slide comparative..."
              className="bg-muted/50 border-border/50"
            />
            <Button size="icon" className="bg-gradient-mixed shrink-0 text-primary-foreground">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
