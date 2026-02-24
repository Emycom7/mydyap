import { motion } from "framer-motion";
import { Settings, Brain, MessageSquare, Globe, Palette, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const settingsGroups = [
  {
    title: "Intelligence Artificielle",
    items: [
      { icon: Brain, label: "Niveau d'analyse", value: "Standard", options: ["Standard", "Avancé", "Expert"] },
    ],
  },
  {
    title: "Rédaction",
    items: [
      { icon: MessageSquare, label: "Ton rédactionnel", value: "Corporate", options: ["Corporate", "Analyste", "Startup"] },
    ],
  },
  {
    title: "Préférences",
    items: [
      { icon: Globe, label: "Langue", value: "Français", options: ["Français", "English", "Español"] },
      { icon: Palette, label: "Thème graphique", value: "Néon", options: ["Néon", "Minimal", "Classique"] },
    ],
  },
];

export default function Configuration() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Configuration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
      </motion.div>

      {settingsGroups.map((group, gi) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.1 }}
        >
          <h2 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {group.title}
          </h2>
          <div className="glass-card divide-y divide-border/30">
            {group.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <select className="bg-muted/50 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground">
                  {item.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <button
          onClick={handleLogout}
          className="glass-card w-full p-4 flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Se déconnecter</span>
        </button>
      </motion.div>
    </div>
  );
}
