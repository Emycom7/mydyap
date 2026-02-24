import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Create() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
      setFile(f);
      toast.success(`Fichier "${f.name}" prêt !`);
    } else {
      toast.error("Format non supporté. Utilisez CSV, XLSX ou XLS.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      toast.success(`Fichier "${f.name}" prêt !`);
    }
  };

  const handleGenerate = () => {
    if (!file) return;
    toast.info("Génération du diaporama en cours... (fonctionnalité à venir)");
  };

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Créer un diaporama</h1>
        <p className="text-sm text-muted-foreground mt-1">Importez vos données et laissez l'IA faire le reste</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`glass-card border-2 border-dashed p-8 text-center transition-all duration-300 ${
            dragOver ? "border-primary glow-cyan" : "border-border/50"
          }`}
        >
          {file ? (
            <div className="space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} Ko
              </p>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-secondary hover:underline"
              >
                Changer de fichier
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Glissez votre fichier ici</p>
                <p className="text-xs text-muted-foreground mt-1">CSV, XLSX, XLS supportés</p>
              </div>
              <label className="inline-block cursor-pointer">
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
                <span className="text-sm text-primary hover:underline">Parcourir les fichiers</span>
              </label>
            </div>
          )}
        </div>
      </motion.div>

      {file && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="glass-card p-4 space-y-3">
            <h2 className="font-display text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Pipeline IA
            </h2>
            <div className="space-y-2 text-xs text-muted-foreground">
              {["Parsing & nettoyage", "Détection de patterns", "Génération d'insights", "Structuration narrative", "Création des visuels", "Génération PDF"].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            className="mt-4 w-full bg-gradient-mixed hover:opacity-90 text-primary-foreground font-semibold"
          >
            Générer le diaporama
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
