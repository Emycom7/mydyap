import { motion } from "framer-motion";
import { FolderOpen, Download, Trash2, Copy, Presentation } from "lucide-react";

const mockItems = [
  { id: "1", title: "Rapport Q4 2025", date: "24 Fév 2026", version: 3, slides: 12 },
  { id: "2", title: "Analyse Marketing", date: "23 Fév 2026", version: 1, slides: 8 },
  { id: "3", title: "KPIs Ventes", date: "21 Fév 2026", version: 2, slides: 15 },
];

export default function MediaTech() {
  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-primary" />
          MediaTech
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Votre bibliothèque de diaporamas</p>
      </motion.div>

      <div className="space-y-3">
        {mockItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-hover p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Presentation className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.slides} slides · v{item.version} · {item.date}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
              <button className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Copy className="h-3.5 w-3.5" /> Dupliquer
              </button>
              <button className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Supprimer
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
