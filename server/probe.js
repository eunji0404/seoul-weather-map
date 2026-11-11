// 기상청 API허브 응답을 그대로 출력해 보는 확인용 스크립트 (내 컴퓨터에서 실행).
// 사용법:
//   node server/probe.js fct_shrt_reg.php tmfc=0
//   node server/probe.js fct_afs_dl.php reg=11B10101 tmfc1=2026111005 tmfc2=2026111017 disp=0 help=1
// 인증키는 .env 의 KMA_AUTH_KEY 를 쓰므로 명령어에 적지 않는다.
import 'dotenv/config';

const [file, ...pairs] = process.argv.slice(2);
if (!file) {
  console.error('사용법: node server/probe.js <파일명.php> [키=값 ...]');
  process.exit(1);
}
if (!process.env.KMA_AUTH_KEY) {
  console.error('.env 에 KMA_AUTH_KEY 를 먼저 설정하세요.');
  process.exit(1);
}

const qs = new URLSearchParams();
for (const p of pairs) {
  const i = p.indexOf('=');
  qs.set(p.slice(0, i), p.slice(i + 1));
}
qs.set('authKey', process.env.KMA_AUTH_KEY);

const url = `https://apihub.kma.go.kr/api/typ01/url/${file}?${qs}`;
const res = await fetch(url);
const text = await res.text();
console.log(`HTTP ${res.status}, ${text.length}자`);
console.log(text.split('\n').slice(0, 60).join('\n'));
