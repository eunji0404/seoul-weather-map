import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DISTRICTS } from './districts.js';
import { extractDistrictWeather, fetchAllGrids, floodScore, latestBase } from './kma.js';
import { mockGrid } from './mock.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.resolve(__dirname, '../dist');

const PORT = Number(process.env.PORT) || 3001;
const AUTH_KEY = process.env.KMA_AUTH_KEY
  ? process.env.KMA_AUTH_KEY.replace(/^["']|["']$/g, '').trim()
  : null;
const URL_GRID =
  process.env.KMA_GRID_URL ||
  'https://apihub.kma.go.kr/api/typ01/cgi-bin/url/nph-dfs_shrt_grd';
const USE_MOCK_ON_FAILURE = process.env.USE_MOCK_ON_FAILURE !== 'false';

const CACHE_MS = 30 * 60 * 1000; // 예보는 3시간마다 바뀌므로 30분 캐시면 충분하다
let cache = null; // { at, body }

async function build() {
  const { baseDate, baseTime, tmfc, tmef } = latestBase();

  let source = 'kma';
  let error = null;
  let gridData = null;

  if (!AUTH_KEY) {
    source = 'mock';
    error = 'KMA_AUTH_KEY가 설정되지 않아 가짜 데이터를 사용 중';
  } else {
    try {
      gridData = await fetchAllGrids({
        url: URL_GRID,
        authKey: AUTH_KEY,
        tmfc,
        tmef,
      });
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      console.error('[kma] 호출 실패:', error);
      if (!USE_MOCK_ON_FAILURE) throw e;
      source = 'mock';
    }
  }

  const districts = {};
  for (const d of DISTRICTS) {
    const w =
      source === 'kma' && gridData
        ? extractDistrictWeather(gridData, d.nx, d.ny, tmef)
        : mockGrid(d.nx, d.ny);

    districts[d.name] = {
      code: d.code,
      name: d.name,
      nx: d.nx,
      ny: d.ny,
      ...w,
      flood: floodScore(w),
    };
  }
  return { source, error, baseDate, baseTime, updatedAt: new Date().toISOString(), districts };
}

const app = express();

app.get('/api/health', (_req, res) => res.json({ ok: true, hasKey: Boolean(AUTH_KEY) }));

app.get('/api/weather/districts', async (_req, res) => {
  try {
    if (!cache || Date.now() - cache.at > CACHE_MS) {
      cache = { at: Date.now(), body: await build() };
    }
    res.json(cache.body);
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// 프론트엔드 빌드(dist) 정적 파일 서빙 (프로덕션 배포 시 한 포트에서 웹+API 모두 제공)
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}  (키 ${AUTH_KEY ? '있음' : '없음 → mock 모드'})`);
});
