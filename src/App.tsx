import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { clsx } from "clsx";
import {
  boardsForTrack,
  complexity,
  datasetMeta,
  type Board,
} from "./data/boards";
import {
  copy,
  datasetLabels,
  tracks,
  type Lang,
  type TrackId,
} from "./data/i18n";
import data from "./data/leaderboard.json";
import {
  formatPct,
  formatScore,
  horizonsFor,
  isOurs,
  metricValue,
  modelNames,
  rankedRows,
} from "./lib/ranking";
import { Chip } from "./components/ui";

const CHART_COLORS = {
  light: { best: "#1f6b52", grid: "#d8d6cf", muted: "#5f615b", alt: ["#6e736c", "#9aa194", "#5f615b", "#8b8d86"] as const },
  dark: { best: "#3d9a7a", grid: "#2a2b30", muted: "#8b8d86", alt: ["#9aa194", "#6e736c", "#8b8d86", "#5f615b"] as const },
} as const;

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("tsf-theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tsf-theme", theme);
  }, [theme]);

  return {
    theme,
    colors: CHART_COLORS[theme],
    toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
  };
}

function datasetLabel(id: string, lang: Lang) {
  return datasetLabels[id]?.[lang] ?? id;
}

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const { theme, colors, toggle } = useTheme();
  const t = copy[lang];

  const [track, setTrack] = useState<TrackId>("multivariate");
  const trackBoards = boardsForTrack(track);
  const [boardId, setBoardId] = useState(trackBoards[0]?.id ?? "mv-sota");
  const board = trackBoards.find((b) => b.id === boardId) ?? trackBoards[0];

  const [dataset, setDataset] = useState(board?.datasets[0] ?? "ETT");
  const [metric, setMetric] = useState(board?.defaultMetric ?? "mse");
  const [horizon, setHorizon] = useState("avg");

  useEffect(() => {
    const next = boardsForTrack(track)[0];
    if (!next) return;
    setBoardId(next.id);
    setDataset(next.datasets[0]);
    setMetric(next.defaultMetric);
    setHorizon("avg");
  }, [track]);

  useEffect(() => {
    if (!board) return;
    if (!board.datasets.includes(dataset)) setDataset(board.datasets[0]);
    if (!board.metricKeys.includes(metric)) setMetric(board.defaultMetric);
    const activeDs = board.datasets.includes(dataset)
      ? dataset
      : board.datasets[0];
    const hs = horizonsFor(board.table, activeDs);
    if (!hs.includes(horizon)) setHorizon(hs.includes("avg") ? "avg" : hs[0]);
  }, [board, dataset, metric, horizon]);

  const matrixModels = useMemo(() => {
    if (!board) return [];
    const set = new Set<string>();
    for (const ds of board.datasets) {
      for (const m of modelNames(board.table, ds)) set.add(m);
    }
    const all = [...set];
    all.sort(
      (a, b) => Number(isOurs(b)) - Number(isOurs(a)) || a.localeCompare(b),
    );
    return all.slice(0, 9);
  }, [board]);

  if (!board) return null;

  const hs = horizonsFor(board.table, dataset);
  const rows = rankedRows(board, dataset, horizon, metric);
  const best = rows.find((r) => r.value != null)?.value ?? null;
  const meta =
    datasetMeta[dataset] ??
    datasetMeta[dataset === "ELC" ? "Electricity" : ""];

  const chartHorizons = hs.filter((h) => h !== "avg");
  const allModels = modelNames(board.table, dataset);
  const chartModels = allModels.filter(isOurs).length
    ? allModels
        .filter(
          (m) =>
            isOurs(m) ||
            [
              "TimeXer",
              "TimeMixer",
              "iTransformer",
              "PatchTST",
              "PSLD",
            ].includes(m),
        )
        .slice(0, 5)
    : allModels.slice(0, 5);

  const chartData = chartHorizons.map((h) => {
    const point: Record<string, string | number | null> = { horizon: h };
    for (const m of chartModels) {
      point[m] = metricValue(board.table, dataset, m, h, metric);
    }
    return point;
  });

  const rideImp = formatPct(
    (
      data.monashMultivariate as Record<
        string,
        Record<string, { imp?: Record<string, number> }>
      >
    ).Rideshare?.DeepBooTS?.imp?.MSE,
  );
  const m4Imp = formatPct(
    (
      data.monashUnivariate as Record<
        string,
        Record<string, { imp?: Record<string, number> }>
      >
    )["M4 Hourly"]?.DeepBooTS?.imp?.MSE,
  );

  const stats = [
    {
      v: "17/20",
      l: lang === "zh" ? "ETT 多变量第一" : "ETT multivariate #1",
    },
    {
      v: "24 / 27",
      l: lang === "zh" ? "单变量 MSE / MAE 第一" : "Univariate 1sts",
    },
    { v: rideImp ?? "+26.61%", l: "Rideshare MSE" },
    { v: m4Imp ?? "+28.06%", l: "M4 Hourly MSE" },
  ];

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <a href="./" className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-sm font-semibold text-accent-foreground">
              T
            </span>
            <span className="truncate font-display text-base font-semibold tracking-tight">
              {t.brand}
            </span>
          </a>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <div className="flex rounded-full border border-border p-0.5">
              <button
                type="button"
                onClick={() => setLang("zh")}
                className={clsx(
                  "h-8 rounded-full px-2.5 text-xs",
                  lang === "zh" ? "bg-surface text-fg" : "text-muted",
                )}
              >
                中文
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={clsx(
                  "h-8 rounded-full px-2.5 text-xs",
                  lang === "en" ? "bg-surface text-fg" : "text-muted",
                )}
              >
                EN
              </button>
            </div>
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggle}
              className="inline-flex size-10 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-fg"
            >
              {theme === "light" ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10">
        <div className="-mx-1 mb-8 flex gap-1 overflow-x-auto px-1 pb-1">
          {tracks.map((tr) => (
            <Chip
              key={tr.id}
              active={track === tr.id}
              onClick={() => setTrack(tr.id)}
            >
              {tr[lang]}
            </Chip>
          ))}
        </div>

        <section className="max-w-3xl">
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-[-0.03em] md:text-5xl">
            {t.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {t.sub}
          </p>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.l}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="font-mono text-2xl tabular-nums tracking-tight">
                {s.v}
              </div>
              <div className="mt-1 text-xs text-muted">{s.l}</div>
            </div>
          ))}
        </section>

        <BoardPanel
          board={board}
          boards={trackBoards}
          lang={lang}
          t={t}
          dataset={dataset}
          setDataset={setDataset}
          metric={metric}
          setMetric={setMetric}
          horizon={horizon}
          setHorizon={setHorizon}
          setBoardId={setBoardId}
          hs={hs}
          rows={rows}
          best={best}
          meta={meta}
          chartData={chartData}
          chartModels={chartModels}
          chartColors={colors}
          matrixModels={matrixModels}
          showLargeNote={track === "large"}
        />

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">{t.complexity}</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="bg-surface text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-3 py-2 font-medium">{t.model}</th>
                  <th className="px-3 py-2 text-right font-medium">sec/epoch</th>
                  <th className="px-3 py-2 text-right font-medium">GPU GB</th>
                  <th className="px-3 py-2 text-right font-medium">Params MB</th>
                  <th className="px-3 py-2 text-right font-medium">FLOPs GB</th>
                </tr>
              </thead>
              <tbody>
                {complexity.map((row) => (
                  <tr key={row.model} className="border-t border-border">
                    <td className="px-3 py-2">{row.model}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {row.secPerEpoch}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {row.gpuGB}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {row.paramsMB}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {row.flopsGB}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function BoardPanel(props: {
  board: Board;
  boards: Board[];
  lang: Lang;
  t: (typeof copy)["en"];
  dataset: string;
  setDataset: (v: string) => void;
  metric: string;
  setMetric: (v: string) => void;
  horizon: string;
  setHorizon: (v: string) => void;
  setBoardId: (v: string) => void;
  hs: string[];
  rows: ReturnType<typeof rankedRows>;
  best: number | null;
  meta?: {
    features?: number;
    freq?: string;
    length?: number;
    nodes?: number;
    size?: string;
  };
  chartData: Record<string, string | number | null>[];
  chartModels: string[];
  chartColors: (typeof CHART_COLORS)[keyof typeof CHART_COLORS];
  matrixModels: string[];
  showLargeNote: boolean;
}) {
  const {
    board,
    boards,
    lang,
    t,
    dataset,
    setDataset,
    metric,
    setMetric,
    horizon,
    setHorizon,
    setBoardId,
    hs,
    rows,
    best,
    meta,
    chartData,
    chartModels,
    chartColors,
    matrixModels,
    showLargeNote,
  } = props;

  return (
    <section className="mt-10 rounded-2xl border border-border bg-surface p-4 md:p-6">
      {boards.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {boards.map((b) => (
            <Chip
              key={b.id}
              active={board.id === b.id}
              onClick={() => setBoardId(b.id)}
            >
              {b.label[lang]}
            </Chip>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {board.datasets.map((ds) => (
          <Chip key={ds} active={dataset === ds} onClick={() => setDataset(ds)}>
            {datasetLabel(ds, lang)}
          </Chip>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs text-muted">{t.horizon}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {hs.map((h) => (
              <Chip key={h} active={horizon === h} onClick={() => setHorizon(h)}>
                {h === "avg" ? t.avg : h}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted">{t.metric}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {board.metricKeys.map((m) => (
              <Chip key={m} active={metric === m} onClick={() => setMetric(m)}>
                {board.metricLabel(m)}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="font-display text-xl font-semibold">
          {datasetLabel(dataset, lang)}
          <span className="ml-2 text-sm font-normal text-muted">
            {board.metricLabel(metric)} ·{" "}
            {horizon === "avg" ? t.avg : horizon}
          </span>
        </h2>
        {meta && (
          <p className="mt-1 text-xs text-muted">
            {meta.features != null && `${meta.features} vars · `}
            {meta.freq ?? ""}
            {meta.length != null && ` · n=${meta.length.toLocaleString()}`}
            {meta.nodes != null && ` · nodes=${meta.nodes.toLocaleString()}`}
            {meta.size != null && ` · ${meta.size}`}
          </p>
        )}
      </div>

      <div className="mt-4 max-w-full overflow-x-auto">
        <table className="w-full min-w-[32rem] table-fixed text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="w-14 py-2 pr-3 font-medium">{t.rank}</th>
              <th className="py-2 pr-3 font-medium">{t.model}</th>
              <th className="w-28 py-2 pr-3 text-right font-medium">
                {board.metricLabel(metric)}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isBest = row.value != null && row.value === best;
              return (
                <tr
                  key={row.model}
                  className={clsx(
                    "border-b border-border/70",
                    row.ours && "bg-best/5",
                    isBest && "bg-best/10",
                  )}
                >
                  <td className="w-14 py-2.5 pr-3 font-mono tabular-nums text-muted">
                    {row.rank}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="font-medium">{row.model}</span>
                  </td>
                  <td
                    className={clsx(
                      "w-28 py-2.5 pr-3 text-right font-mono tabular-nums",
                      isBest && "font-semibold text-best",
                    )}
                  >
                    {formatScore(row.value)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {chartData.length > 1 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium">{t.horizonChart}</h3>
          <div className="mt-3 h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height={224} minWidth={0}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis dataKey="horizon" stroke={chartColors.muted} fontSize={12} />
                <YAxis stroke={chartColors.muted} fontSize={12} width={48} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                {chartModels.map((m, i) => (
                  <Line
                    key={m}
                    type="monotone"
                    dataKey={m}
                    stroke={isOurs(m) ? chartColors.best : chartColors.alt[i % 4]}
                    strokeWidth={isOurs(m) ? 2.5 : 1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {t.matrix}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t.matrixSub}
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-surface">
                <th className="sticky left-0 bg-surface px-3 py-2 text-left font-medium text-muted">
                  {t.dataset}
                </th>
                {matrixModels.map((m) => (
                  <th
                    key={m}
                    className={clsx(
                      "px-2 py-2 text-right font-medium",
                      isOurs(m) ? "text-best" : "text-muted",
                    )}
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {board.datasets.map((ds) => {
                const vals = matrixModels.map((m) =>
                  metricValue(board.table, ds, m, horizon, metric),
                );
                const finite = vals.filter((v): v is number => v != null);
                const rowBest = finite.length ? Math.min(...finite) : null;
                return (
                  <tr key={ds} className="border-t border-border">
                    <th className="sticky left-0 bg-bg px-3 py-2 text-left font-medium">
                      {datasetLabel(ds, lang)}
                    </th>
                    {vals.map((v, i) => (
                      <td
                        key={matrixModels[i]}
                        className={clsx(
                          "px-2 py-2 text-right font-mono tabular-nums",
                          v == null && "text-muted/50",
                          v != null &&
                            v === rowBest &&
                            "bg-best/10 font-semibold text-best",
                        )}
                      >
                        {formatScore(v)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {showLargeNote && (
          <p className="mt-4 text-sm text-muted">{t.largeNote}</p>
        )}
      </div>
    </section>
  );
}
