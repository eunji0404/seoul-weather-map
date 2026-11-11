import type { WeatherResponse } from './types';

export async function fetchWeather(): Promise<WeatherResponse> {
  const res = await fetch('/api/weather/districts');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `서버 오류 (${res.status})`);
  }
  return res.json();
}

// 서울 자치구 경계 GeoJSON (southkorea/seoul-maps, 통계청 2013 기준).
// 외부 주소가 막히면 파일을 public/data/seoul-districts.geojson 으로 내려받고
// 아래 주소를 '/data/seoul-districts.geojson' 으로 바꾸세요.
export const GEOJSON_URL =
  'https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json';

export async function fetchDistrictGeoJson(): Promise<GeoJSON.FeatureCollection> {
  const res = await fetch(GEOJSON_URL);
  if (!res.ok) throw new Error(`경계 데이터를 불러오지 못함 (${res.status})`);
  return res.json();
}
