import { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Download, Trash2, Copy, Presentation, Loader2, Eye } from "lucide-react";
import { usePresentations } from "@/hooks/usePresentations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { generatePDF, downloadPDF } from "@/lib/pdfGenerator";
import { useAuth } from "@/hooks/useAuth";

export default function MediaTech() {
  const { data: presentations, isLoading } = usePresentations();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("presentations").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Présentation supprimée");
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
    }
  };

  const handleDuplicate = async (pres: any) => {
    const { error } = await supabase.from("presentations").insert({
      user_id: user!.id,
      title: `${pres.title} (copie)`,
      description: pres.description,
      slide_data: pres.slide_data,
      source_file_name: pres.source_file_name,
      status: pres.status,
    });
    if (error) {
      toast.error("Erreur lors de la duplication");
    } else {
      toast.success("Présentation dupliquée");
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
    }
  };

  const handlePDF = async (pres: any) => {
    setPdfGenerating(pres.id);
    // We need to view it first so the slides render
    setViewingId(pres.id);
    // Wait for render
    setTimeout(async () => {
      try {
        const blob = await generatePDF("slides-container-" + pres.id, pres.title);
        downloadPDF(blob, `${pres.title}.pdf`);
        toast.success("PDF téléchargé !");
      } catch (err) {
        toast.error("Erreur lors de la génération du PDF");
      } finally {
        setPdfGenerating(null);
      }
    }, 1000);
  };

  const viewingPresentation = presentations?.find((p) => p.id === viewingId);

  if (viewingPresentation) {
    const slides = Array.isArray(viewingPresentation.slide_data) ? viewingPresentation.slide_data : [];
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setViewingId(null)} className="text-xs text-muted-foreground hover:text-primary">
            ← Retour à la bibliothèque
          </button>
          <button
            onClick={() => handlePDF(viewingPresentation)}
            disabled={!!pdfGenerating}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            {pdfGenerating === viewingPresentation.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} PDF
          </button>
        </div>
        <h1 className="font-display text-xl font-bold">{viewingPresentation.title}</h1>
        <div id={`slides-container-${viewingPresentation.id}`} className="space-y-4">
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
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-primary" />
          MediaTech
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Votre bibliothèque de diaporamas</p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : !presentations?.length ? (
        <div className="text-center py-12">
          <Presentation className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Aucune présentation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {presentations.map((item, i) => {
            const slideCount = Array.isArray(item.slide_data) ? item.slide_data.length : 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card-hover p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Presentation className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {slideCount} slides · v{item.version} · {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <button onClick={() => setViewingId(item.id)} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                    <Eye className="h-3.5 w-3.5" /> Voir
                  </button>
                  <button
                    onClick={() => handlePDF(item)}
                    disabled={!!pdfGenerating}
                    className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    {pdfGenerating === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} PDF
                  </button>
                  <button onClick={() => handleDuplicate(item)} className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Copy className="h-3.5 w-3.5" /> Dupliquer
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
