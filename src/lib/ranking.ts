import type { Board, DatasetTable } from "../data/boards";
import { modelMeta } from "../data/boards";

const HORIZON_ORDER = ["avg", "96", "192", "336", "720", "12", "24", "36", "48"];

export function modelNames(table: DatasetTable, dataset: string) {
  const row = table[dataset];
  if (!row) return [];
  return Object.keys(row).filter((k) => k !== "imp");
}

export function horizonsFor(table: DatasetTable, dataset: string) {
  const row = table[dataset];
  if (!row) return ["avg"];
  const set = new Set<string>();
  for (const model of Object.keys(row)) {
    const cell = row[model];
    if (!cell || typeof cell !== "object") continue;
    for (const h of Object.keys(cell as Record<string, unknown>)) {
      if (h !== "imp") set.add(h);
    }
  }
  return [...set].sort(
    (a, b) => HORIZON_ORDER.indexOf(a) - HORIZON_ORDER.indexOf(b),
  );
}

export function metricValue(
  table: DatasetTable,
  dataset: string,
  model: string,
  horizon: string,
  metric: string,
): number | null {
  const modelRow = table[dataset]?.[model];
  if (!modelRow || typeof modelRow !== "object") return null;
  const cell = (modelRow as Record<string, unknown>)[horizon];
  if (!cell || typeof cell !== "object") return null;
  const v = (cell as Record<string, number>)[metric];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export type RankRow = {
  rank: number;
  model: string;
  value: number | null;
  lookback?: number;
  ours: boolean;
};

export function rankedRows(
  board: Board,
  dataset: string,
  horizon: string,
  metric: string,
): RankRow[] {
  const rows = modelNames(board.table, dataset).map((model) => ({
    model,
    value: metricValue(board.table, dataset, model, horizon, metric),
    lookback: modelMeta[model]?.lookback,
    ours: model.startsWith("DeepBooTS"),
  }));
  rows.sort((a, b) => {
    if (a.value == null && b.value == null) return 0;
    if (a.value == null) return 1;
    if (b.value == null) return -1;
    return a.value - b.value;
  });
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

export function formatScore(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 10) return v.toFixed(2);
  if (abs >= 1 || abs >= 0.01) return v.toFixed(3);
  return v.toFixed(4);
}

export function formatPct(v: number | null | undefined) {
  if (v == null) return null;
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export function isOurs(model: string) {
  return model.startsWith("DeepBooTS");
}
