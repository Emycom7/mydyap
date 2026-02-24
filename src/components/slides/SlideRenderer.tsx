import { SlideChart } from "./SlideChart";
import { TrendingUp, TrendingDown, Minus, Lightbulb, Target, CheckCircle2 } from "lucide-react";

interface SlideRendererProps {
  slide: any;
  index: number;
  total: number;
}

export function SlideRenderer({ slide, index, total }: SlideRendererProps) {
  const slideNumber = `${index + 1} / ${total}`;

  switch (slide.type) {
    case "cover":
      return (
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
          <div className="text-xs text-muted-foreground mb-4">{slideNumber}</div>
          <h2 className="font-display text-2xl font-bold text-gradient mb-2">{slide.title}</h2>
          {slide.subtitle && <p className="text-muted-foreground text-sm">{slide.subtitle}</p>}
        </div>
      );

    case "summary":
      return (
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-lg font-bold">{slide.title}</h3>
            <span className="text-xs text-muted-foreground">{slideNumber}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{slide.content}</p>
          {slide.keyPoints && (
            <ul className="space-y-2">
              {slide.keyPoints.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case "chart":
      return (
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-lg font-bold">{slide.title}</h3>
            <span className="text-xs text-muted-foreground">{slideNumber}</span>
          </div>
          <SlideChart
            chartType={slide.chartType || "bar"}
            data={slide.data || []}
            dataKeys={slide.dataKeys}
            xKey={slide.xKey}
          />
          {slide.interpretation && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">{slide.interpretation}</p>
              {slide.impact && (
                <div className="flex items-start gap-2 text-xs">
                  <Target className="h-3.5 w-3.5 text-secondary mt-0.5 shrink-0" />
                  <span className="text-secondary">{slide.impact}</span>
                </div>
              )}
              {slide.recommendation && (
                <div className="flex items-start gap-2 text-xs">
                  <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-primary">{slide.recommendation}</span>
                </div>
              )}
            </div>
          )}
        </div>
      );

    case "kpi":
      return (
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-lg font-bold">{slide.title}</h3>
            <span className="text-xs text-muted-foreground">{slideNumber}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(slide.kpis || []).map((kpi: any, i: number) => (
              <div key={i} className="rounded-xl bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="font-display text-xl font-bold mt-1">{kpi.value}</p>
                {kpi.change && (
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.change.startsWith("+") ? (
                      <TrendingUp className="h-3 w-3 text-primary" />
                    ) : kpi.change.startsWith("-") ? (
                      <TrendingDown className="h-3 w-3 text-secondary" />
                    ) : (
                      <Minus className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={`text-xs font-medium ${kpi.change.startsWith("+") ? "text-primary" : kpi.change.startsWith("-") ? "text-secondary" : "text-muted-foreground"}`}>
                      {kpi.change}
                    </span>
                  </div>
                )}
                {kpi.interpretation && <p className="text-xs text-muted-foreground mt-1">{kpi.interpretation}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case "insights":
      return (
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-lg font-bold">{slide.title}</h3>
            <span className="text-xs text-muted-foreground">{slideNumber}</span>
          </div>
          <div className="space-y-3">
            {(slide.insights || []).map((insight: any, i: number) => (
              <div key={i} className="rounded-xl bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">{insight.title}</p>
                  {insight.impact && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      insight.impact === "high" ? "bg-secondary/10 text-secondary" :
                      insight.impact === "medium" ? "bg-primary/10 text-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>{insight.impact}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "recommendations":
      return (
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-lg font-bold">{slide.title}</h3>
            <span className="text-xs text-muted-foreground">{slideNumber}</span>
          </div>
          <div className="space-y-3">
            {(slide.recommendations || []).map((reco: any, i: number) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/30 p-3">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  reco.priority === "high" ? "bg-secondary/20 text-secondary" :
                  reco.priority === "medium" ? "bg-primary/20 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}>{i + 1}</div>
                <div>
                  <p className="text-sm font-medium">{reco.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{reco.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "conclusion":
      return (
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-lg font-bold">{slide.title}</h3>
            <span className="text-xs text-muted-foreground">{slideNumber}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{slide.content}</p>
          {slide.nextSteps && (
            <div>
              <p className="text-xs font-semibold mb-2">Prochaines étapes :</p>
              <ul className="space-y-1.5">
                {slide.nextSteps.map((step: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-lg font-bold">{slide.title || "Slide"}</h3>
            <span className="text-xs text-muted-foreground">{slideNumber}</span>
          </div>
          <p className="text-sm text-muted-foreground">{slide.content || JSON.stringify(slide)}</p>
        </div>
      );
  }
}
