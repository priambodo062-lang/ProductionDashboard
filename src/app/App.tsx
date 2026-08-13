import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Factory,
  Target,
  TrendingUp,
  AlertTriangle,
  Clock,
  ChevronDown,
  Gauge,
  Activity,
} from "lucide-react";

const SHIFTS = ["Pagi 06:00–14:00", "Siang 14:00–22:00", "Malam 22:00–06:00"];

const hourlyData = [
  { jam: "06:00", produksi: 245, target: 300 },
  { jam: "07:00", produksi: 280, target: 300 },
  { jam: "08:00", produksi: 310, target: 300 },
  { jam: "09:00", produksi: 295, target: 300 },
  { jam: "10:00", produksi: 270, target: 300 },
  { jam: "11:00", produksi: 290, target: 300 },
  { jam: "12:00", produksi: 250, target: 300 },
  { jam: "13:00", produksi: 247, target: 300 },
];

const operatorData = [
  { id: "OP-01", nama: "Ahmad Fauzi", mesin: "CNC-01", jam: 8.0, hasil: 420, reject: 8, status: "aktif" },
  { id: "OP-02", nama: "Budi Santoso", mesin: "CNC-02", jam: 8.0, hasil: 395, reject: 12, status: "aktif" },
  { id: "OP-03", nama: "Citra Dewi", mesin: "INJ-01", jam: 7.5, hasil: 380, reject: 6, status: "aktif" },
  { id: "OP-04", nama: "Deni Kurniawan", mesin: "INJ-02", jam: 8.0, hasil: 412, reject: 9, status: "aktif" },
  { id: "OP-05", nama: "Eka Pratama", mesin: "PCK-01", jam: 7.0, hasil: 360, reject: 5, status: "istirahat" },
  { id: "OP-06", nama: "Fitri Handayani", mesin: "PCK-02", jam: 7.5, hasil: 420, reject: 3, status: "aktif" },
];

const totalTarget = 2400;
const totalHasil = operatorData.reduce((s, r) => s + r.hasil, 0);
const totalReject = operatorData.reduce((s, r) => s + r.reject, 0);
const totalJam = operatorData.reduce((s, r) => s + r.jam, 0);
const pencapaian = ((totalHasil / totalTarget) * 100).toFixed(1);
const rejectRate = ((totalReject / totalHasil) * 100).toFixed(2);

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  unit = "",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  unit?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-md p-5 flex flex-col gap-3 hover:border-white/15 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {label}
        </span>
        <div className={`w-8 h-8 rounded flex items-center justify-center ${color}`}>
          <Icon size={15} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-3xl font-semibold text-foreground leading-none"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-muted-foreground text-sm" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {unit}
          </span>
        )}
      </div>
      {sub && <span className="text-muted-foreground text-xs">{sub}</span>}
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  const color = pct >= 95 ? "#22c55e" : pct >= 80 ? "#f0a500" : "#ef4444";
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="64" y="60" textAnchor="middle" fill={color} fontSize="20" fontWeight="600" fontFamily="'JetBrains Mono', monospace">
        {pct}%
      </text>
      <text x="64" y="78" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="'Barlow Condensed', sans-serif" letterSpacing="2">
        PENCAPAIAN
      </text>
    </svg>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded px-3 py-2 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <p className="text-muted-foreground mb-1" style={{ fontFamily: "'Barlow', sans-serif" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey === "produksi" ? "Hasil" : "Target"}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function App() {
  const [activeShift, setActiveShift] = useState(0);
  const [shiftOpen, setShiftOpen] = useState(false);

  const statusStyle = (status: string) =>
    status === "aktif"
      ? "text-green-400 bg-green-400/10"
      : "text-yellow-400 bg-yellow-400/10";

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Barlow', sans-serif" }}
    >
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary/15 flex items-center justify-center">
              <Factory size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight tracking-tight">Laporan Produksi Harian</h1>
              <p className="text-xs text-muted-foreground">PT. Maju Bersama Industri — Divisi Manufaktur</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-right">
              <p
                className="text-sm font-medium text-primary"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                13 Agustus 2026
              </p>
              <p className="text-xs text-muted-foreground">Kamis — Hari Kerja</p>
            </div>

            {/* Shift selector */}
            <div className="relative">
              <button
                onClick={() => setShiftOpen((o) => !o)}
                className="flex items-center gap-2 bg-secondary border border-border rounded px-3 py-2 text-sm hover:border-white/20 transition-colors"
              >
                <Activity size={13} className="text-primary" />
                <span className="font-medium" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>
                  {SHIFTS[activeShift]}
                </span>
                <ChevronDown size={13} className="text-muted-foreground" />
              </button>
              {shiftOpen && (
                <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded shadow-xl z-20 min-w-[180px]">
                  {SHIFTS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveShift(i); setShiftOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${i === activeShift ? "text-primary" : "text-foreground"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Target Produksi"
            value={totalTarget.toLocaleString("id-ID")}
            unit="unit"
            sub="Kuota shift pagi"
            icon={Target}
            color="bg-blue-400/10 text-blue-400"
          />
          <KpiCard
            label="Hasil Produksi"
            value={totalHasil.toLocaleString("id-ID")}
            unit="unit"
            sub={`Selisih −${(totalTarget - totalHasil).toLocaleString("id-ID")} unit`}
            icon={TrendingUp}
            color="bg-green-400/10 text-green-400"
          />
          <KpiCard
            label="Produk Reject"
            value={totalReject}
            unit="unit"
            sub={`Reject rate ${rejectRate}%`}
            icon={AlertTriangle}
            color="bg-red-400/10 text-red-400"
          />
          <KpiCard
            label="Total Jam Produksi"
            value={totalJam.toFixed(1)}
            unit="jam"
            sub={`${operatorData.length} operator aktif`}
            icon={Clock}
            color="bg-amber-400/10 text-amber-400"
          />
        </div>

        {/* Middle: chart + gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Hourly chart — takes 2/3 */}
          <div className="lg:col-span-2 bg-card border border-border rounded-md p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2
                  className="text-sm font-semibold tracking-wide uppercase"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
                >
                  Output Per Jam
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Aktual vs. target per interval</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400/80" />Aktual</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-[2px] bg-white/30" />Target</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyData} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid key="grid" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  key="x-axis"
                  dataKey="jam"
                  tick={{ fill: "#64748b", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  key="y-axis"
                  tick={{ fill: "#64748b", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 350]}
                />
                <Tooltip key="tooltip" content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <ReferenceLine key="ref-target" y={300} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
                <Bar
                  key="bar-produksi"
                  dataKey="produksi"
                  fill="#f0a500"
                  opacity={0.85}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gauge card — 1/3 */}
          <div className="bg-card border border-border rounded-md p-5 flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <h2
                className="text-sm font-semibold tracking-wide uppercase"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
              >
                Pencapaian Target
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Kumulatif shift ini</p>
            </div>
            <ProgressRing pct={parseFloat(pencapaian)} />
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Hasil</span>
                <span
                  className="text-foreground font-medium"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {totalHasil.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Target</span>
                <span
                  className="text-foreground font-medium"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {totalTarget.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="w-full h-px bg-border my-1" />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Sisa</span>
                <span
                  className="text-amber-400 font-medium"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  −{(totalTarget - totalHasil).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Operator / Machine table */}
        <div className="bg-card border border-border rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2
                className="text-sm font-semibold tracking-wide uppercase"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
              >
                Detail Operator & Mesin
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Data real-time — shift aktif</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "Nama Operator", "Mesin", "Jam Produksi", "Hasil (unit)", "Reject", "Reject Rate", "Pencapaian", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}
                    >
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {operatorData.map((op, i) => {
                  const pct = ((op.hasil / (totalTarget / operatorData.length)) * 100).toFixed(0);
                  const rr = ((op.reject / op.hasil) * 100).toFixed(2);
                  return (
                    <tr
                      key={op.id}
                      className={`border-b border-border/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}
                    >
                      <td
                        className="px-5 py-3.5 text-muted-foreground"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
                      >
                        {op.id}
                      </td>
                      <td className="px-5 py-3.5 font-medium">{op.nama}</td>
                      <td
                        className="px-5 py-3.5 text-primary"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
                      >
                        {op.mesin}
                      </td>
                      <td
                        className="px-5 py-3.5 text-foreground"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
                      >
                        {op.jam.toFixed(1)} jam
                      </td>
                      <td
                        className="px-5 py-3.5 font-semibold text-foreground"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
                      >
                        {op.hasil.toLocaleString("id-ID")}
                      </td>
                      <td
                        className={`px-5 py-3.5 ${op.reject > 10 ? "text-red-400" : "text-foreground"}`}
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
                      >
                        {op.reject}
                      </td>
                      <td
                        className={`px-5 py-3.5 ${parseFloat(rr) > 2 ? "text-red-400" : "text-muted-foreground"}`}
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
                      >
                        {rr}%
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full max-w-[80px]">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${Math.min(parseFloat(pct), 100)}%`,
                                backgroundColor: parseFloat(pct) >= 95 ? "#22c55e" : parseFloat(pct) >= 80 ? "#f0a500" : "#ef4444",
                              }}
                            />
                          </div>
                          <span
                            className="text-xs text-muted-foreground"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${statusStyle(op.status)}`}
                          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}
                        >
                          {op.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border/80 bg-white/[0.02]">
                  <td colSpan={3} className="px-5 py-3.5 text-xs text-muted-foreground font-medium" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>
                    TOTAL
                  </td>
                  <td className="px-5 py-3.5 text-xs text-foreground font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {totalJam.toFixed(1)} jam
                  </td>
                  <td className="px-5 py-3.5 text-xs text-green-400 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {totalHasil.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-red-400 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {totalReject}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {rejectRate}%
                  </td>
                  <td colSpan={2} className="px-5 py-3.5 text-xs text-primary font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {pencapaian}% pencapaian
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-xs text-muted-foreground flex items-center justify-between py-2 border-t border-border/50">
          <span>Dicetak: 13 Agustus 2026, 13:47 WIB</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>rev. 2026.08.13-A</span>
        </footer>
      </main>
    </div>
  );

}
