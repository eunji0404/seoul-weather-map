/** 서버가 내려주는 구 하나의 기상 값 */
export interface DistrictWeather {
  code: string;
  name: string;
  nx: number;
  ny: number;
  temp: number | null; // 기온 ℃
  pop: number | null; // 강수확률 %
  rain: number | null; // 1시간 강수량 mm
  wind: number | null; // 풍속 m/s
  windDir: number | null; // 풍향 deg
  sky: number | null;
  pty: number | null;
  flood: number; // 침수 위험 점수 0~100 (임시 정의)
}

export interface WeatherResponse {
  source: 'kma' | 'mock';
  error: string | null;
  baseDate: string; // YYYYMMDD 발표일
  baseTime: string; // HHMM 발표시각
  updatedAt: string;
  districts: Record<string, DistrictWeather>; // 키: 구 이름
}

export type IndicatorId = 'temp' | 'rain' | 'wind' | 'flood';

/**
 * 지도에 올라가는 모든 "레이어"의 공통 모양.
 * 집값 팀원이 같은 모양으로 레이어를 만들면 같은 지도 컴포넌트에 바로 얹을 수 있다.
 * values 의 키는 지역 이름(지금은 구 이름, 나중에 행정동 코드로 통일 예정).
 */
export interface MapLayer {
  id: string;
  label: string;
  unit: string;
  values: Record<string, number | null>;
  breaks: number[]; // 오름차순 경계값. 색은 breaks.length + 1 개
  colors: string[];
}
