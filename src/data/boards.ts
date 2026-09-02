import data from "./leaderboard.json";
import type { TrackId } from "./i18n";

export type HorizonCell = Record<string, number>;
export type ModelRow = Record<string, HorizonCell | Record<string, number> | unknown>;
export type DatasetTable = Record<string, ModelRow>;

export type Board = {
  id: string;
  track: TrackId;
  label: { zh: string; en: string };
  datasets: string[];
  table: DatasetTable;
  defaultMetric: string;
  metricKeys: string[];
  metricLabel: (key: string) => string;
};

const mseMae = ["mse", "mae"];

function largeTable(): DatasetTable {
  return Object.fromEntries(
    Object.entries(data.largeScale).map(([name, entry]) => [
      name,
      (entry as { models: DatasetTable }).models,
    ]),
  ) as DatasetTable;
}

export const boards: Board[] = [
  {
    id: "mv-sota",
    track: "multivariate",
    label: { zh: "主流对照", en: "SOTA baselines" },
    datasets: ["ETT", "Traffic", "ELC", "Weather", "Solar", "PEMS"],
    table: data.multivariate as unknown as DatasetTable,
    defaultMetric: "mse",
    metricKeys: mseMae,
    metricLabel: (e) => e.toUpperCase(),
  },
  {
    id: "mv-ett",
    track: "multivariate",
    label: { zh: "ETT 四子集", en: "ETT subsets" },
    datasets: ["ETTh1", "ETTh2", "ETTm1", "ETTm2"],
    table: data.ettMultivariateSplit as unknown as DatasetTable,
    defaultMetric: "mse",
    metricKeys: mseMae,
    metricLabel: (e) => e.toUpperCase(),
  },
  {
    id: "uv",
    track: "univariate",
    label: { zh: "单变量", en: "Univariate" },
    datasets: [
      "ETTh1",
      "ETTh2",
      "ETTm1",
      "ETTm2",
      "Traffic",
      "Electricity",
      "Weather",
      "Exchange",
    ],
    table: data.univariate as unknown as DatasetTable,
    defaultMetric: "mse",
    metricKeys: mseMae,
    metricLabel: (e) => e.toUpperCase(),
  },
  {
    id: "monash-mv",
    track: "monash",
    label: { zh: "Monash 多变量", en: "Monash multivariate" },
    datasets: [
      "Traffic",
      "Electricity",
      "Solar",
      "ILI",
      "Oik_Weather",
      "NN5",
      "Rideshare",
    ],
    table: data.monashMultivariate as unknown as DatasetTable,
    defaultMetric: "MSE",
    metricKeys: ["MSE", "MAE", "RMSP", "MAPE", "sMAPE", "MASE", "Q25", "Q75"],
    metricLabel: (e) => e,
  },
  {
    id: "monash-uv",
    track: "monash",
    label: { zh: "Monash 单变量", en: "Monash univariate" },
    datasets: ["M4 Hourly", "Us_births", "Sunspot", "Saugeenday"],
    table: data.monashUnivariate as unknown as DatasetTable,
    defaultMetric: "MSE",
    metricKeys: ["MSE", "MAE", "RMDSPE", "MAPE", "sMAPE", "MASE", "Q25", "Q75"],
    metricLabel: (e) => (e === "RMDSPE" ? "RMSP" : e),
  },
  {
    id: "large",
    track: "large",
    label: { zh: "大规模", en: "Large-scale" },
    datasets: ["CBS", "Milano"],
    table: largeTable(),
    defaultMetric: "mse",
    metricKeys: mseMae,
    metricLabel: (e) => e.toUpperCase(),
  },
];

export const complexity = data.complexity as Array<{
  model: string;
  secPerEpoch: number;
  gpuGB: number;
  paramsMB: number;
  flopsGB: number;
}>;

export const modelMeta = data.modelMeta as Record<
  string,
  { lookback?: number }
>;

export const datasetMeta = data.datasetMeta as Record<
  string,
  { features?: number; freq?: string; length?: number; nodes?: number; size?: string }
>;

export function boardsForTrack(track: TrackId) {
  return boards.filter((b) => b.track === track);
}
