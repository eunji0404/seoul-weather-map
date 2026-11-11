// 기상청 동네예보 격자자료(nph-dfs_shrt_grd) 호출과 가공.
// 전국 149 x 253 = 37,697개 격자 데이터를 한 번에 가져와 서울 25개 구에 매핑합니다.

const BASE_TIMES = [2, 5, 8, 11, 14, 17, 20, 23]; // 발표 시각(KST)
const GRID_WIDTH = 149;
const GRID_HEIGHT = 253;
const TOTAL_GRIDS = GRID_WIDTH * GRID_HEIGHT; // 37697

function kstNow() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;

/** 지금 시점에 조회 가능한 가장 최근 발표 일시(tmfc)와 예보 대상 시각(tmef)을 구한다. */
export function latestBase() {
  const now = kstNow();
  // 발표 후 자료 반영까지 약 15분 여유를 둔다.
  const checkTime = new Date(now.getTime() - 15 * 60 * 1000);
  const hour = checkTime.getUTCHours();
  const candidates = BASE_TIMES.filter((h) => h <= hour);

  let baseDate, baseTime;
  if (candidates.length === 0) {
    // 02시 이전이면 전날 23시 발표분을 사용
    const prev = new Date(checkTime.getTime() - 24 * 60 * 60 * 1000);
    baseDate = ymd(prev);
    baseTime = '2300';
  } else {
    baseDate = ymd(checkTime);
    baseTime = `${pad(candidates[candidates.length - 1])}00`;
  }

  const tmfcHour = Number(baseTime.slice(0, 2));
  const currentHour = now.getUTCHours();
  // 격자 예보는 발표 시각(tmfc) 최소 1시간 이후(tmef)부터 제공됨
  const forecastHour = Math.max(currentHour, tmfcHour + 1);

  // tmef 날짜 계산
  const tmefDateObj = new Date(now);
  tmefDateObj.setUTCHours(forecastHour, 0, 0, 0);
  const tmefDate = ymd(tmefDateObj);
  const tmefHourStr = pad(tmefDateObj.getUTCHours());

  const tmfc = `${baseDate}${baseTime.slice(0, 2)}`;
  const tmef = `${tmefDate}${tmefHourStr}`;

  return { baseDate, baseTime, tmfc, tmef };
}

/** 전국 격자(37,697개)에서 한 변수를 가져와 숫자 배열로 반환한다. */
async function fetchVarGrid({ url, authKey, tmfc, tmef, variable }) {
  const qs = new URLSearchParams({
    tmfc,
    tmef,
    vars: variable,
    authKey,
  });
  const res = await fetch(`${url}?${qs}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`KMA HTTP ${res.status}`);
  const text = await res.text();
  const values = text.trim().split(/[\s,]+/).filter(Boolean).map(Number);
  if (values.length !== TOTAL_GRIDS) {
    throw new Error(`KMA 격자 개수 불일치 (기대: ${TOTAL_GRIDS}, 실제: ${values.length}) - 응답 시작: ${text.slice(0, 100)}`);
  }
  return values;
}

/** 6개 기상 변수(TMP, POP, PCP, WSD, SKY, PTY)의 전국 격자를 동시에 가져온다. */
export async function fetchAllGrids({ url, authKey, tmfc, tmef }) {
  const VARS = ['TMP', 'POP', 'PCP', 'WSD', 'SKY', 'PTY'];
  const results = {};
  await Promise.all(
    VARS.map(async (v) => {
      results[v] = await fetchVarGrid({ url, authKey, tmfc, tmef, variable: v });
    })
  );
  return results;
}

/** 격자 좌표 (nx, ny)에 해당하는 인덱스의 기상 값을 추출한다. */
export function extractDistrictWeather(gridData, nx, ny, tmef) {
  // 기상청 격자 공식: 1-indexed (1~149, 1~253), 하단(남쪽)부터 순서대로 나열됨
  const idx = (ny - 1) * GRID_WIDTH + (nx - 1);

  const clean = (v) => (v == null || v === -99 ? null : v);
  const cleanPositive = (v) => (v == null || v <= -99 ? 0 : Math.max(0, v));

  return {
    forecastAt: tmef ? `${tmef}00` : null,
    temp: clean(gridData.TMP?.[idx]),
    pop: cleanPositive(gridData.POP?.[idx]),
    rain: cleanPositive(gridData.PCP?.[idx]),
    wind: cleanPositive(gridData.WSD?.[idx]),
    windDir: null,
    sky: clean(gridData.SKY?.[idx]),
    pty: clean(gridData.PTY?.[idx]),
  };
}

/**
 * 침수 위험 점수(0~100). 임시 정의입니다.
 * 기상청은 침수 값을 주지 않으므로 강수량과 강수확률로 만든 파생 지표입니다.
 * 이후 호우특보와 서울시 침수흔적도를 더해 팀과 가중치를 정하세요.
 */
export function floodScore({ rain, pop }) {
  const r = Math.min((rain ?? 0) / 50, 1) * 70;
  const p = Math.min((pop ?? 0) / 100, 1) * 30;
  return Math.round(r + p);
}
