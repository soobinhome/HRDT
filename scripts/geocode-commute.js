/**
 * 카카오 REST API 지오코딩 + Haversine 직선거리 계산
 * → lib/data/commute-matrix.json 생성
 *
 * 실행: node scripts/geocode-commute.js
 *
 * [기준]
 * - 편도 예상 소요시간 = 직선거리 / 평균속도(25km/h) × 60 + 대기 10분
 * - 75분 이하 → 배치 가능 (왕복 150분 법적 기준)
 */

const fs    = require("fs");
const path  = require("path");
const https = require("https");

// ── Kakao API 키 로드 (.env.local) ────────────────
function loadKey() {
  const p = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(p)) return "";
  for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
    const m = line.match(/^KAKAO_REST_KEY=(.+)$/);
    if (m) return m[1].trim();
  }
  return "";
}

const KAKAO_KEY = loadKey() || process.env.KAKAO_REST_KEY || "";
if (!KAKAO_KEY) {
  console.error("❌ KAKAO_REST_KEY 없음. .env.local 확인");
  process.exit(1);
}
console.log(`🔑 API 키 확인: ${KAKAO_KEY.slice(0, 6)}...`);

// ── 43개 점포 데이터 ──────────────────────────────
const STORES = [
  { id: "s001", name: "뉴코아 강남점",                  address: "서울 서초구 잠원로 51" },
  { id: "s002", name: "뉴코아 팩토리아울렛 천호점",     address: "서울 강동구 구천면로 189" },
  { id: "s003", name: "뉴코아 팩토리아울렛 광명점",     address: "경기 광명시 하안로287번길 8" },
  { id: "s004", name: "뉴코아 동수원점",                address: "경기 수원시 팔달구 인계로 154" },
  { id: "s005", name: "뉴코아 부천점",                  address: "경기 부천시 원미구 송내대로 239" },
  { id: "s006", name: "뉴코아 산본점",                  address: "경기 군포시 번영로 504" },
  { id: "s007", name: "뉴코아 인천점",                  address: "인천 남동구 인하로 485" },
  { id: "s008", name: "뉴코아 평촌점",                  address: "경기 안양시 동안구 동안로 119" },
  { id: "s009", name: "뉴코아 평택점",                  address: "경기 평택시 경기대로 279" },
  { id: "s010", name: "뉴코아 일산점",                  address: "경기 고양시 일산동구 중앙로 1206" },
  { id: "s011", name: "뉴코아 괴정점",                  address: "부산 사하구 사하로 190" },
  { id: "s012", name: "뉴코아 덕천점",                  address: "부산 북구 만덕대로 23" },
  { id: "s013", name: "뉴코아 팩토리아울렛 울산성남점", address: "울산 중구 시계탑거리 20" },
  { id: "s014", name: "뉴코아 창원점",                  address: "경남 창원시 의창구 창원대로397번길 6" },
  { id: "s015", name: "뉴코아 울산점",                  address: "울산 남구 삼산로 217" },
  { id: "s016", name: "2001 중계점",                    address: "서울 노원구 동일로204가길 46" },
  { id: "s017", name: "2001 부평점",                    address: "인천 부평구 경원대로 1277" },
  { id: "s018", name: "2001 안양점",                    address: "경기 안양시 만안구 안양로 275" },
  { id: "s019", name: "2001 분당점",                    address: "경기 성남시 분당구 미금일로154번길 20" },
  { id: "s020", name: "NC 강서점",                      address: "서울 강서구 강서로56길 17" },
  { id: "s021", name: "NC 불광점",                      address: "서울 은평구 불광로 20" },
  { id: "s022", name: "NC 송파점",                      address: "서울 송파구 충민로 66" },
  { id: "s023", name: "NC 신구로점",                    address: "서울 구로구 구로중앙로 152" },
  { id: "s024", name: "NC 이스트폴(구의점)",            address: "서울 광진구 아차산로 200" },
  { id: "s025", name: "NC 고잔점",                      address: "경기 안산시 단원구 광덕대로 194" },
  { id: "s026", name: "NC 야탑점",                      address: "경기 성남시 분당구 야탑로81번길 11" },
  { id: "s027", name: "NC 수원터미널점",                address: "경기 수원시 권선구 경수대로 270" },
  { id: "s028", name: "NC 광주역점",                    address: "광주 북구 경열로 249" },
  { id: "s029", name: "NC 중앙로역점",                  address: "대전 중구 중앙로 141" },
  { id: "s030", name: "NC 부산대점",                    address: "부산 금정구 부산대학로63번길 2" },
  { id: "s031", name: "NC 엑스코점",                    address: "대구 북구 유통단지로14길 22" },
  { id: "s032", name: "NC 해운대점",                    address: "부산 해운대구 해운대로 813" },
  { id: "s033", name: "NC 전주점",                      address: "전북 전주시 완산구 전주객사5길 35" },
  { id: "s034", name: "NC 충장점",                      address: "광주 동구 중앙로 163" },
  { id: "s035", name: "NC 순천점",                      address: "전남 순천시 비봉2길 22" },
  { id: "s036", name: "NC 경산점",                      address: "경북 경산시 중앙로 39" },
  { id: "s037", name: "NC 청주점",                      address: "충북 청주시 흥덕구 2순환로 1233" },
  { id: "s038", name: "NC 대전유성점",                  address: "대전 유성구 계룡로 119" },
  { id: "s039", name: "NC 포항점",                      address: "경북 포항시 북구 중앙상가길 6" },
  { id: "s040", name: "동아 쇼핑점",                    address: "대구 중구 달구벌대로 2085" },
  { id: "s041", name: "동아 수성점",                    address: "대구 수성구 지범로 191" },
  { id: "s042", name: "동아 구미점",                    address: "경북 구미시 송원동로 28" },
  { id: "s043", name: "동아 강북점",                    address: "대구 북구 칠곡중앙대로 416" },
];

const STORE_IDS = STORES.map(s => s.id);

// ── 헬퍼 ──────────────────────────────────────────
function geocode(address) {
  return new Promise(resolve => {
    const q    = encodeURIComponent(address);
    const opts = {
      hostname: "dapi.kakao.com",
      path:     `/v2/local/search/address.json?query=${q}&size=1`,
      headers:  { Authorization: `KakaoAK ${KAKAO_KEY}` },
    };
    const req = https.get(opts, res => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try {
          const doc = JSON.parse(raw).documents?.[0];
          resolve(doc ? { lat: parseFloat(doc.y), lng: parseFloat(doc.x) } : null);
        } catch { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.setTimeout(6000, () => { req.destroy(); resolve(null); });
  });
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
  const a = Math.sin(dLat/2)**2
    + Math.cos(lat1*r) * Math.cos(lat2*r) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 직선거리 → 편도 예상 소요시간(분)
// 가까울수록 도심 내 이동 → 상대적으로 느림 (교차로·환승 포함)
function estimateMin(km) {
  if (km <= 0) return 0;
  const speed = km < 8 ? 18 : km < 20 ? 22 : 27; // km/h
  return Math.round(km / speed * 60 + 10);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── 메인 ───────────────────────────────────────────
async function main() {
  const employees = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "lib", "data", "employees.json"), "utf-8")
  );

  // ① 점포 좌표 변환
  console.log(`\n🏬 점포 ${STORES.length}개 지오코딩...`);
  const storeCoords = {};
  let storeFail = 0;
  for (const s of STORES) {
    const c = await geocode(s.address);
    storeCoords[s.id] = c;
    if (c) console.log(`  ✅ ${s.name}`);
    else  { console.log(`  ⚠  ${s.name} → 좌표 변환 실패`); storeFail++; }
    await sleep(130);
  }
  console.log(`  → ${STORES.length - storeFail}/${STORES.length}개 성공`);

  // ② 직원 좌표 변환
  const empWithAddr = employees.filter(e => e.address);
  const estSec = Math.ceil(empWithAddr.length * 0.13);
  console.log(`\n👥 직원 ${empWithAddr.length}명 지오코딩 (약 ${estSec}초 소요)...`);

  const empCoords = {};
  let empDone = 0;
  for (const emp of empWithAddr) {
    const c = await geocode(emp.address);
    if (c) empCoords[emp.id] = c;
    empDone++;
    if (empDone % 100 === 0)
      console.log(`  ${empDone}/${empWithAddr.length}명 완료...`);
    await sleep(130);
  }
  console.log(`  → 좌표 취득: ${Object.keys(empCoords).length}명`);

  // ③ 거리 행렬 계산
  console.log("\n📐 직선거리 행렬 계산 중...");
  const empMatrix = {};
  for (const emp of employees) {
    const ec = empCoords[emp.id];
    if (!ec) continue;
    empMatrix[emp.id] = {
      lat: Math.round(ec.lat * 10000) / 10000,
      lng: Math.round(ec.lng * 10000) / 10000,
      // km[i] = STORE_IDS[i] 점포까지 직선거리 (null = 점포 좌표 없음)
      km: STORES.map(s => {
        const sc = storeCoords[s.id];
        if (!sc) return null;
        return Math.round(haversineKm(ec.lat, ec.lng, sc.lat, sc.lng) * 10) / 10;
      }),
    };
  }

  // ④ 통계
  let feasiblePairs = 0, totalPairs = 0;
  for (const { km } of Object.values(empMatrix)) {
    for (const d of km) {
      if (d === null) continue;
      totalPairs++;
      if (estimateMin(d) <= 75) feasiblePairs++;
    }
  }

  // ⑤ 저장
  const output = {
    generatedAt:  new Date().toISOString(),
    storeIds:     STORE_IDS,
    storeNames:   Object.fromEntries(STORES.map(s => [s.id, s.name])),
    storeCoords:  Object.fromEntries(
      STORES.map(s => [s.id, storeCoords[s.id]
        ? { lat: Math.round(storeCoords[s.id].lat * 10000) / 10000,
            lng: Math.round(storeCoords[s.id].lng * 10000) / 10000 }
        : null
      ])
    ),
    employees: empMatrix,
  };

  const outPath = path.join(__dirname, "..", "lib", "data", "commute-matrix.json");
  fs.writeFileSync(outPath, JSON.stringify(output), "utf-8");

  const fileSizeKB = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`\n✅ 완료! → lib/data/commute-matrix.json (${fileSizeKB}KB)`);
  console.log(`📊 총 직원-점포 쌍:     ${totalPairs.toLocaleString()}개`);
  console.log(`✈  배치 가능(75분 이하): ${feasiblePairs.toLocaleString()}개`);
  console.log(`📍 배치 가능 비율:       ${(feasiblePairs/totalPairs*100).toFixed(1)}%`);
}

main().catch(e => { console.error("❌ 오류:", e.message); process.exit(1); });
