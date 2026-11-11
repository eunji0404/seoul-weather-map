// API 키가 없거나 호출이 실패해도 화면 개발을 계속할 수 있도록 만드는 가짜 데이터.
// 같은 격자는 항상 같은 값을 돌려준다(새로고침해도 지도가 흔들리지 않음).

function seeded(nx, ny, salt) {
  const x = Math.sin(nx * 12.9898 + ny * 78.233 + salt * 37.719) * 43758.5453;
  return x - Math.floor(x);
}

export function mockGrid(nx, ny) {
  const rain = Math.round(seeded(nx, ny, 1) ** 2 * 40 * 10) / 10;
  return {
    forecastAt: null,
    temp: Math.round((5 + seeded(nx, ny, 2) * 6) * 10) / 10,
    pop: Math.round(seeded(nx, ny, 3) * 100),
    rain,
    wind: Math.round((1 + seeded(nx, ny, 4) * 8) * 10) / 10,
    windDir: Math.round(seeded(nx, ny, 5) * 360),
    sky: 3,
    pty: rain > 0 ? 1 : 0,
  };
}
