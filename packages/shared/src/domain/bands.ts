export const BAND_KEYS = ["starting", "building", "on_track", "final_stretch"] as const;
export type BandKey = (typeof BAND_KEYS)[number];

export type Band = {
  key: BandKey;
  label: string;
  message: string;
  min: number;
  max: number;
};

// Ranges are inclusive and contiguous over 0..100, ordered ascending.
export const BANDS: readonly Band[] = [
  {
    key: "starting",
    label: "Ponto de partida",
    message: "Você está começando. Uma rotina estruturada faz a maior diferença agora.",
    min: 0,
    max: 30,
  },
  {
    key: "building",
    label: "Em construção",
    message: "Você já tem base, mas falta consistência para chegar na nota de corte.",
    min: 31,
    max: 55,
  },
  {
    key: "on_track",
    label: "Bom caminho",
    message: "Sua preparação está sólida. O ganho agora vem de ajuste fino.",
    min: 56,
    max: 80,
  },
  {
    key: "final_stretch",
    label: "Reta final",
    message: "Você está muito bem posicionado. O foco é manter o ritmo e não perder pontos bobos.",
    min: 81,
    max: 100,
  },
];

export function getBand(score: number): Band {
  const band = BANDS.find((b) => score >= b.min && score <= b.max);
  if (!band) throw new RangeError(`Score out of range: ${score}`);
  return band;
}

export function getBandByKey(key: BandKey): Band {
  return BANDS.find((b) => b.key === key)!;
}
