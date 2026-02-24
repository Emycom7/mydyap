import { motion } from "framer-motion";
import { BarChart3, Clock, Sparkles, Database, TrendingUp, Presentation } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/hooks/useAuth";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const mockChartData = [
  { name: "Lun", value: 2 },
  { name: "Mar", value: 5 },
  { name: "Mer", value: 3 },
  { name: "Jeu", value: 8 },
  { name: "Ven", value: 6 },
  { name: "Sam", value: 4 },
  { name: "Dim", value: 7 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Utilisateur";

  return (
    <div className="p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="font-display text-2xl font-bold">
          Bonjour, <span className="text-gradient-cyan">{displayName}</span>
        </h1>
        <p className="text-sm text-muted-foreground">Votre tableau de bord DYAP</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Presentation} label="Diaporamas créés" value={12} change="+3" variant="cyan" delay={0.1} />
        <StatCard icon={Clock} label="Temps économisé" value="4.2h" change="+18%" variant="magenta" delay={0.2} />
        <StatCard icon={Sparkles} label="Score IA" value="94" variant="accent" delay={0.3} />
        <StatCard icon={Database} label="Données analysées" value="2.4k" change="+12%" variant="cyan" delay={0.4} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold">Activité hebdomadaire</h2>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 100%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(187, 100%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 41%, 10%)",
                  border: "1px solid hsl(222, 30%, 18%)",
                  borderRadius: "0.75rem",
                  color: "hsl(210, 40%, 96%)",
                }}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(187, 100%, 45%)" fillOpacity={1} fill="url(#colorCyan)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-4"
      >
        <h2 className="font-display text-sm font-semibold mb-3">Dernières présentations</h2>
        <div className="space-y-3">
          {[
            { title: "Rapport Q4 2025", date: "Il y a 2h", slides: 12 },
            { title: "Analyse Marketing", date: "Hier", slides: 8 },
            { title: "KPIs Ventes", date: "Il y a 3j", slides: 15 },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Presentation className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.slides} slides · {item.date}</p>
                </div>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
