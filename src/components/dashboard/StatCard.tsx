import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  variant?: "cyan" | "magenta" | "accent";
  delay?: number;
}

export function StatCard({ icon: Icon, label, value, change, variant = "cyan", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card-hover p-4"
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            variant === "cyan" && "bg-primary/10 text-primary",
            variant === "magenta" && "bg-secondary/10 text-secondary",
            variant === "accent" && "bg-accent/10 text-accent"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {change && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            change.startsWith("+") ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
          )}>
            {change}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}
