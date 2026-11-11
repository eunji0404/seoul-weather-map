import type { IndicatorId, MapLayer, WeatherResponse } from './types';

interface IndicatorDef {
  id: IndicatorId;
  label: string;
  unit: string;
  pick: (d: WeatherResponse['districts'][string]) => number | null;
  breaks: number[];
  colors: string[];
}

// 5단계 색. 낮음 → 높음으로 갈수록 진해지는 순차 팔레트.
const BLUES = ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'];
const ORANGES = ['#fff5eb', '#fdd0a2', '#fd8d3c', '#d94801', '#7f2704'];
const GREENS = ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'];
const REDS = ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'];

export const INDICATORS: IndicatorDef[] = [
  {
    id: 'temp',
    label: '기온',
    unit: '℃',
    pick: (d) => d.temp,
    breaks: [0, 5, 10, 15],
    colors: ORANGES,
  },
  {
    id: 'rain',
    label: '강수',
    unit: 'mm/시간',
    pick: (d) => d.rain,
    breaks: [0.1, 1, 5, 15],
    colors: BLUES,
  },
  {
    id: 'wind',
    label: '바람',
    unit: 'm/s',
    pick: (d) => d.wind,
    breaks: [2, 4, 7, 10],
    colors: GREENS,
  },
  {
    id: 'flood',
    label: '침수 위험',
    unit: '점 (임시)',
    pick: (d) => d.flood,
    breaks: [10, 30, 50, 70],
    colors: REDS,
  },
];

export function buildLayer(id: IndicatorId, data: WeatherResponse): MapLayer {
  const def = INDICATORS.find((i) => i.id === id)!;
  const values: MapLayer['values'] = {};
  for (const [name, d] of Object.entries(data.districts)) values[name] = def.pick(d);
  return { id: def.id, label: def.label, unit: def.unit, values, breaks: def.breaks, colors: def.colors };
}

/** 값이 어느 구간인지 찾아 색을 돌려준다. 값이 없으면 회색. */
export function colorFor(layer: MapLayer, value: number | null | undefined): string {
  if (value == null) return '#d9d9d9';
  let i = 0;
  while (i < layer.breaks.length && value >= layer.breaks[i]) i++;
  return layer.colors[i];
}

/** 범례에 보여줄 구간 라벨 */
export function legendItems(layer: MapLayer): { color: string; label: string }[] {
  const b = layer.breaks;
  return layer.colors.map((color, i) => {
    let label: string;
    if (i === 0) label = `${b[0]} 미만`;
    else if (i === b.length) label = `${b[b.length - 1]} 이상`;
    else label = `${b[i - 1]} ~ ${b[i]}`;
    return { color, label };
  });
}
