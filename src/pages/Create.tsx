import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, Sparkles, ArrowRight, Loader2, CheckCircle2, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { parseFile } from "@/lib/fileParser";
import { supabase } from "@/integrations/supabase/client";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { generatePDF, downloadPDF } from "@/lib/pdfGenerator";
import { useQueryClient } from "@tanstack/react-query";

const PIPELINE_STEPS = [
  "Parsing & nettoyage des données",
  "Analyse IA en profondeur",
  "Détection de patterns & corrélations",
  "Génération des insights stratégiques",
  "Structuration du diaporama",
  "Finalisation",
];

export default function Create() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const queryClient = useQueryClient();

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

  const handleGenerate = async () => {
    if (!file) return;
    setGenerating(true);
    setCurrentStep(0);
    setResult(null);

    try {
      // Step 1: Parse file
      setCurrentStep(0);
      const csvData = await parseFile(file);

      // Step 2-5: AI Analysis
      setCurrentStep(1);
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => Math.min(prev + 1, PIPELINE_STEPS.length - 1));
      }, 3000);

      const { data: session } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("analyze-data", {
        body: {
          csvData: csvData.substring(0, 15000), // Limit to avoid token overflow
          fileName: file.name,
          analysisLevel: "standard",
          tone: "corporate",
          language: "fr",
        },
      });

      clearInterval(stepInterval);

      if (response.error) {
        throw new Error(response.error.message || "Erreur d'analyse");
      }

      const data = response.data;
      if (data.error) throw new Error(data.error);

      setCurrentStep(PIPELINE_STEPS.length - 1);
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
      toast.success("Diaporama généré avec succès !");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    try {
      const blob = await generatePDF("slides-container", result?.slideData?.title || "presentation");
      downloadPDF(blob, `${result?.presentation?.title || "DYAP"}.pdf`);
      toast.success("PDF téléchargé !");
    } catch (err: any) {
      toast.error("Erreur lors de la génération du PDF");
      console.error(err);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setCurrentStep(0);
  };

  // Show results
  if (result) {
    const slides = result.slideData?.slides || result.presentation?.slide_data || [];
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold">{result.slideData?.title || result.presentation?.title}</h1>
            <p className="text-xs text-muted-foreground">{slides.length} slides générées</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={pdfGenerating}
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary"
            >
              {pdfGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
              PDF
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm" className="border-border/50">
              Nouveau
            </Button>
          </div>
        </div>

        <div id="slides-container" className="space-y-4">
          {slides.map((slide: any, i: number) => (
            <div key={i} data-slide>
              <SlideRenderer slide={slide} index={i} total={slides.length} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Créer un diaporama</h1>
        <p className="text-sm text-muted-foreground mt-1">Importez vos données et laissez l'IA faire le reste</p>
      </motion.div>

      {/* Upload zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} Ko</p>
              {!generating && (
                <button onClick={() => setFile(null)} className="text-xs text-secondary hover:underline">
                  Changer de fichier
                </button>
              )}
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

      {/* Pipeline / Generate */}
      <AnimatePresence>
        {file && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-4 space-y-3">
              <h2 className="font-display text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Pipeline IA
              </h2>
              <div className="space-y-2">
                {PIPELINE_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {generating && i === currentStep ? (
                      <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                    ) : generating && i < currentStep ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <div className={`h-1.5 w-1.5 rounded-full ${generating && i > currentStep ? "bg-muted-foreground/30" : "bg-primary/50"}`} />
                    )}
                    <span className={generating && i <= currentStep ? "text-foreground" : "text-muted-foreground"}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-4 w-full bg-gradient-mixed hover:opacity-90 text-primary-foreground font-semibold"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  Générer le diaporama
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
