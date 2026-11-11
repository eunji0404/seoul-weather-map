# 서울 동네별 기상 지도 (Weather Map)

기상청 단기예보 격자 데이터를 서울 지도(자치구 단위)에 색으로 시각화하는 React 웹 애플리케이션입니다.  
나중에 집값 레이어와 쉽게 결합할 수 있도록 기상 기능은 독립 모듈(`src/features/weather/`)로 설계되어 있습니다.

## 🚀 빠른 시작 (팀원용 가이드)

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 파일 생성 (.env)
cp .env.example .env

# 3. .env 파일에 본인의 기상청 API허브 인증키 입력
# KMA_AUTH_KEY=발급받은_키

# 4. 개발 서버 실행
npm run dev
```

- 웹 브라우저: [http://localhost:5173](http://localhost:5173)
- 백엔드 프록시: [http://localhost:3001](http://localhost:3001)
- 인증키가 없거나 API 호출에 실패해도 화면이 멈추지 않고 **가짜(mock) 데이터**로 정상 동작합니다.

## 📂 프로젝트 구조

```
seoul-weather-map/
├── server/
│   ├── index.js          # Express 프록시 서버 (30분 캐시, API 키 은닉)
│   ├── kma.js            # 기상청 격자 API(nph-dfs_shrt_grd) 호출, 파싱, 침수 점수 산출
│   ├── districts.js      # 서울 25개 자치구 목록 및 격자(nx, ny) 좌표
│   ├── mock.js           # API 실패 시 대체할 시드 기반 가짜 데이터
│   └── probe.js          # API 응답 확인용 디버깅 스크립트
├── src/
│   ├── components/
│   │   ├── WeatherMap.tsx    # Leaflet 기반 서울 지도 (OpenStreetMap 타일 + GeoJSON)
│   │   ├── Legend.tsx        # 지표별 범례 및 발표 시각
│   │   └── DetailPanel.tsx   # 자치구 클릭 시 상세 날씨 패널
│   ├── features/weather/
│   │   ├── types.ts          # 기상 데이터 및 공통 레이어(MapLayer) 인터페이스
│   │   ├── layers.ts         # 지표별 색상 단계 및 구간 설정
│   │   └── api.ts            # 백엔드 API 및 자치구 GeoJSON fetch
│   └── App.tsx
```

## 🤝 팀 프로젝트 통합 규칙 (집값 팀원 참고)

기상 지도와 집값 지도는 동일한 인터페이스(`MapLayer`)를 공유합니다:
- **지역 키**: 현재는 서울 자치구 이름(예: `"종로구"`, `"강남구"`), 추후 행정동 코드로 확장 가능.
- **레이어 데이터 구조** (`src/features/weather/types.ts`):
  ```ts
  export interface MapLayer {
    id: string;        // 예: 'temp', 'rain', 'price'
    label: string;     // 예: '기온', '1시간 강수량', '평당 실거래가'
    unit: string;      // 예: '℃', 'mm', '만원'
    values: Record<string, number | null>; // { "종로구": 16, "강남구": 16 }
    breaks: number[];  // 색상 구간 경계값
    colors: string[];  // 구간별 색상 코드
  }
  ```
- 집값 팀원이 위 구조에 맞춰 데이터를 반환하는 레이어를 만들면, `WeatherMap` 컴포넌트에 코드 수정 없이 그대로 얹을 수 있습니다.
