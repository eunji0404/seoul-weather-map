import type { DistrictWeather } from '../features/weather/types';

const SKY: Record<number, string> = { 1: '맑음', 3: '구름 많음', 4: '흐림' };
const PTY: Record<number, string> = { 0: '없음', 1: '비', 2: '비/눈', 3: '눈', 4: '소나기' };

const fmt = (v: number | null, unit: string) => (v == null ? '-' : `${v}${unit}`);

export default function DetailPanel({ data }: { data: DistrictWeather | null }) {
  if (!data) {
    return <aside className="detail">지도에서 구를 눌러 보세요.</aside>;
  }
  return (
    <aside className="detail">
      <h2>{data.name}</h2>
      <dl>
        <dt>기온</dt>
        <dd>{fmt(data.temp, '℃')}</dd>
        <dt>하늘 상태</dt>
        <dd>{data.sky != null ? (SKY[data.sky] ?? '-') : '-'}</dd>
        <dt>강수 형태</dt>
        <dd>{data.pty != null ? (PTY[data.pty] ?? '-') : '-'}</dd>
        <dt>강수 확률</dt>
        <dd>{fmt(data.pop, '%')}</dd>
        <dt>1시간 강수량</dt>
        <dd>{fmt(data.rain, 'mm')}</dd>
        <dt>풍속</dt>
        <dd>{fmt(data.wind, 'm/s')}</dd>
        <dt>침수 위험(임시)</dt>
        <dd>{data.flood}점</dd>
      </dl>
      <p className="note">
        기상청 5km 격자 값이라 이웃한 구와 같은 값일 수 있습니다. (격자 {data.nx}, {data.ny})
      </p>
    </aside>
  );
}
