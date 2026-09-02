export type Lang = "zh" | "en";

export type Copy = {
  brand: string;
  title: string;
  sub: string;
  paper: string;
  code: string;
  horizon: string;
  metric: string;
  dataset: string;
  rank: string;
  model: string;
  best: string;
  avg: string;
  matrix: string;
  matrixSub: string;
  horizonChart: string;
  largeNote: string;
  complexity: string;
  hosted: string;
};

export const copy: Record<Lang, Copy> = {
  zh: {
    brand: "TSF Ranking",
    title: "Time Series 完整评测榜",
    sub: "用论文附录与 GitHub 表格图补全原站缺失的预测长度、Monash 多指标与大规模结果。越低越好。",
    paper: "论文",
    code: "代码",
    horizon: "预测长度",
    metric: "指标",
    dataset: "数据集",
    rank: "排名",
    model: "模型",
    best: "最优",
    avg: "平均",
    matrix: "横向对比",
    matrixSub: "行是数据集，列是模型。当前指标与预测长度下的最优值高亮。空单元格表示该对照实验未报告。",
    horizonChart: "随预测长度变化",
    largeNote:
      "大规模数字来自 GitHub 图 LargeTS2.jpg / 论文 Fig. 5(a)。相对 PSLD 的 MSE 降幅 8.9%（CBS）与 6.2%（Milano）与正文一致。",
    complexity: "算力对照",
    hosted: "本模型",
  },
  en: {
    brand: "TSF Ranking",
    title: "Time Series Complete Leaderboard",
    sub: "Filled from the paper appendices and GitHub table figures: per-horizon scores, Monash metrics, and large-scale results. Lower is better.",
    paper: "Paper",
    code: "Code",
    horizon: "Horizon",
    metric: "Metric",
    dataset: "Dataset",
    rank: "Rank",
    model: "Model",
    best: "Best",
    avg: "Avg",
    matrix: "Comparison matrix",
    matrixSub:
      "Rows are datasets, columns are models. Best cell per row is highlighted. Em dash means that setup was not reported.",
    horizonChart: "Error vs. horizon",
    largeNote:
      "Large-scale numbers are from GitHub LargeTS2.jpg / Fig. 5(a). MSE cuts vs. PSLD of 8.9% (CBS) and 6.2% (Milano) match the paper text.",
    complexity: "Compute",
    hosted: "Ours",
  },
};

export const tracks = [
  { id: "multivariate", zh: "多变量", en: "Multivariate" },
  { id: "univariate", zh: "单变量", en: "Univariate" },
  { id: "monash", zh: "Monash", en: "Monash" },
  { id: "large", zh: "大规模", en: "Large-scale" },
] as const;

export type TrackId = (typeof tracks)[number]["id"];

export const datasetLabels: Record<string, { zh: string; en: string }> = {
  ETT: { zh: "ETT 合计", en: "ETT (avg of 4)" },
  Traffic: { zh: "Traffic", en: "Traffic" },
  ELC: { zh: "Electricity", en: "Electricity" },
  Electricity: { zh: "Electricity", en: "Electricity" },
  Weather: { zh: "Weather", en: "Weather" },
  Solar: { zh: "Solar", en: "Solar" },
  PEMS: { zh: "PEMS", en: "PEMS" },
  ETTh1: { zh: "ETTh1", en: "ETTh1" },
  ETTh2: { zh: "ETTh2", en: "ETTh2" },
  ETTm1: { zh: "ETTm1", en: "ETTm1" },
  ETTm2: { zh: "ETTm2", en: "ETTm2" },
  Exchange: { zh: "Exchange", en: "Exchange" },
  ILI: { zh: "ILI", en: "ILI" },
  Oik_Weather: { zh: "Oik Weather", en: "Oik Weather" },
  NN5: { zh: "NN5", en: "NN5" },
  Rideshare: { zh: "Rideshare", en: "Rideshare" },
  "M4 Hourly": { zh: "M4 Hourly", en: "M4 Hourly" },
  Us_births: { zh: "US Births", en: "US Births" },
  Sunspot: { zh: "Sunspot", en: "Sunspot" },
  Saugeenday: { zh: "Saugeen Day", en: "Saugeen Day" },
  CBS: { zh: "CBS", en: "CBS" },
  Milano: { zh: "Milano", en: "Milano" },
};

export const links = {
  arxiv: "https://arxiv.org/abs/2511.06893",
  github: "https://github.com/Anoise/DeepBooTS",
};
