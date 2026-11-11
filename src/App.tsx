import { useEffect, useMemo, useState } from 'react';
import DetailPanel from './components/DetailPanel';
import Legend from './components/Legend';
import WeatherMap from './components/WeatherMap';
import { fetchDistrictGeoJson, fetchWeather } from './features/weather/api';
import { buildLayer, INDICATORS } from './features/weather/layers';
import type { IndicatorId, WeatherResponse } from './features/weather/types';

function formatBase(d: string, t: string) {
  return `${d.slice(4, 6)}/${d.slice(6, 8)} ${t.slice(0, 2)}:${t.slice(2)} 발표 기준`;
}

export default function App() {
  const [indicator, setIndicator] = useState<IndicatorId>('rain');
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchWeather(), fetchDistrictGeoJson()])
      .then(([w, g]) => {
        setWeather(w);
        setGeojson(g);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const layer = useMemo(
    () => (weather ? buildLayer(indicator, weather) : null),
    [weather, indicator],
  );

  return (
    <div className="app">
      <header>
        <h1>서울 동네별 기상 지도</h1>
        <nav>
          {INDICATORS.map((i) => (
            <button
              key={i.id}
              className={i.id === indicator ? 'active' : ''}
              onClick={() => setIndicator(i.id)}
            >
              {i.label}
            </button>
          ))}
        </nav>
      </header>

      {weather?.source === 'mock' && (
        <div className="banner">
          가짜(mock) 데이터를 표시 중입니다. {weather.error ?? ''}
        </div>
      )}
      {error && <div className="banner error">불러오기 실패: {error}</div>}

      <main>
        <div className="map-wrap">
          {!weather || !geojson || !layer ? (
            <div className="loading">{error ? '데이터를 불러오지 못했습니다.' : '불러오는 중…'}</div>
          ) : (
            <>
              <WeatherMap geojson={geojson} layer={layer} selected={selected} onSelect={setSelected} />
              <Legend layer={layer} caption={formatBase(weather.baseDate, weather.baseTime)} />
            </>
          )}
        </div>
        <DetailPanel data={weather && selected ? (weather.districts[selected] ?? null) : null} />
      </main>
    </div>
  );
}
