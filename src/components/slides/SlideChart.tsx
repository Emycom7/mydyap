import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = [
  "hsl(187, 100%, 45%)",
  "hsl(336, 100%, 50%)",
  "hsl(270, 60%, 55%)",
  "hsl(187, 80%, 60%)",
  "hsl(336, 80%, 65%)",
  "hsl(45, 100%, 55%)",
  "hsl(150, 70%, 45%)",
  "hsl(30, 90%, 55%)",
];

const tooltipStyle = {
  backgroundColor: "hsl(222, 41%, 10%)",
  border: "1px solid hsl(222, 30%, 18%)",
  borderRadius: "0.75rem",
  color: "hsl(210, 40%, 96%)",
  fontSize: 12,
};

interface SlideChartProps {
  chartType: string;
  data: any[];
  dataKeys?: string[];
  xKey?: string;
}

export function SlideChart({ chartType, data, dataKeys = ["value"], xKey = "name" }: SlideChartProps) {
  if (!data || data.length === 0) return <div className="text-muted-foreground text-xs text-center py-8">Aucune donnée</div>;

  const width = "100%";
  const height = 220;

  switch (chartType) {
    case "bar":
      return (
        <ResponsiveContainer width={width} height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis dataKey={xKey} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );

    case "line":
      return (
        <ResponsiveContainer width={width} height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis dataKey={xKey} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            {dataKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case "area":
      return (
        <ResponsiveContainer width={width} height={height}>
          <AreaChart data={data}>
            <defs>
              {dataKeys.map((key, i) => (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis dataKey={xKey} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            {dataKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fill={`url(#gradient-${key})`} strokeWidth={2} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width={width} height={height}>
          <PieChart>
            <Pie data={data} dataKey={dataKeys[0]} nameKey={xKey} cx="50%" cy="50%" outerRadius={80} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215, 20%, 55%)" }} />
          </PieChart>
        </ResponsiveContainer>
      );

    case "radar":
      return (
        <ResponsiveContainer width={width} height={height}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(222, 30%, 18%)" />
            <PolarAngleAxis dataKey={xKey} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 9 }} />
            {dataKeys.map((key, i) => (
              <Radar key={key} dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.2} />
            ))}
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      );

    case "scatter":
      return (
        <ResponsiveContainer width={width} height={height}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis dataKey={xKey} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} name={xKey} />
            <YAxis dataKey={dataKeys[0]} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} name={dataKeys[0]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Scatter data={data} fill={COLORS[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );

    default:
      return (
        <ResponsiveContainer width={width} height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis dataKey={xKey} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
  }
}
