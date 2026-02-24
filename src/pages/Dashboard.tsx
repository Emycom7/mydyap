import { motion } from "framer-motion";
import { BarChart3, Clock, Sparkles, Database, TrendingUp, Presentation, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { usePresentations } from "@/hooks/usePresentations";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useMemo } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: presentations, isLoading } = usePresentations();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Utilisateur";

  const stats = useMemo(() => {
    if (!presentations) return { count: 0, totalSlides: 0, avgSlides: 0, weeklyData: [] };
    const count = presentations.length;
    const totalSlides = presentations.reduce((acc, p) => acc + (Array.isArray(p.slide_data) ? p.slide_data.length : 0), 0);
    const avgSlides = count > 0 ? Math.round(totalSlides / count) : 0;

    // Group by day of week for chart
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const weeklyData = days.map((name) => ({ name, value: 0 }));
    presentations.forEach((p) => {
      const day = new Date(p.created_at).getDay();
      weeklyData[day].value++;
    });

    return { count, totalSlides, avgSlides, weeklyData };
  }, [presentations]);

  const recentPresentations = presentations?.slice(0, 5) || [];

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="font-display text-2xl font-bold">
          Bonjour, <span className="text-gradient-cyan">{displayName}</span>
        </h1>
        <p className="text-sm text-muted-foreground">Votre tableau de bord DYAP</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Presentation} label="Diaporamas créés" value={stats.count} variant="cyan" delay={0.1} />
        <StatCard icon={Clock} label="Temps économisé" value={`${(stats.count * 0.35).toFixed(1)}h`} variant="magenta" delay={0.2} />
        <StatCard icon={Sparkles} label="Slides générées" value={stats.totalSlides} variant="accent" delay={0.3} />
        <StatCard icon={Database} label="Moy. slides/pres." value={stats.avgSlides} variant="cyan" delay={0.4} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold">Activité hebdomadaire</h2>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.weeklyData}>
              <defs>
                <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 100%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(187, 100%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 41%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: "0.75rem", color: "hsl(210, 40%, 96%)" }} />
              <Area type="monotone" dataKey="value" stroke="hsl(187, 100%, 45%)" fillOpacity={1} fill="url(#colorCyan)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-4">
        <h2 className="font-display text-sm font-semibold mb-3">Dernières présentations</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : recentPresentations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Aucune présentation encore</p>
            <button onClick={() => navigate("/create")} className="mt-2 text-sm text-primary hover:underline">Créer votre première</button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPresentations.map((item) => {
              const slideCount = Array.isArray(item.slide_data) ? item.slide_data.length : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate("/mediatech")}
                  className="flex w-full items-center justify-between rounded-lg bg-muted/30 p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Presentation className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {slideCount} slides · {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
