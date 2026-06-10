// ── 점포 데이터 (43개) ──────────────────────────────────────────
// 뉴코아/2001 → 아울렛 | NC/동아 → 백화점 | 복합몰 → 기타
// region: 시/도 단위 (PlacementMode 직주근접 매칭에 사용)
// ────────────────────────────────────────────────────────────────

export type StoreType = "아울렛" | "백화점" | "기타";

export interface Store {
  id: string;
  name: string;
  type: StoreType;
  address: string;
  region: string; // 시/도 단위 (예: "서울", "경기", "부산")
}

export const STORES: Store[] = [
  // ── 뉴코아 아울렛 ────────────────────────────────
  { id: "s001", name: "뉴코아 강남점",              type: "아울렛", address: "서울 서초구 잠원로 51",                          region: "서울" },
  { id: "s002", name: "뉴코아 팩토리아울렛 천호점", type: "아울렛", address: "서울 강동구 구천면로 189",                        region: "서울" },
  { id: "s003", name: "뉴코아 팩토리아울렛 광명점", type: "아울렛", address: "경기 광명시 하안로287번길 8",                     region: "경기" },
  { id: "s004", name: "뉴코아 동수원점",             type: "아울렛", address: "경기 수원시 팔달구 인계로 154",                   region: "경기" },
  { id: "s005", name: "뉴코아 부천점",               type: "아울렛", address: "경기 부천시 원미구 송내대로 239",                 region: "경기" },
  { id: "s006", name: "뉴코아 산본점",               type: "아울렛", address: "경기 군포시 번영로 504",                          region: "경기" },
  { id: "s007", name: "뉴코아 인천점",               type: "아울렛", address: "인천 남동구 인하로 485",                          region: "인천" },
  { id: "s008", name: "뉴코아 평촌점",               type: "아울렛", address: "경기 안양시 동안구 동안로 119",                   region: "경기" },
  { id: "s009", name: "뉴코아 평택점",               type: "아울렛", address: "경기 평택시 경기대로 279",                        region: "경기" },
  { id: "s010", name: "뉴코아 일산점",               type: "아울렛", address: "경기 고양시 일산동구 중앙로 1206",                region: "경기" },
  { id: "s011", name: "뉴코아 괴정점",               type: "아울렛", address: "부산 사하구 사하로 190",                          region: "부산" },
  { id: "s012", name: "뉴코아 덕천점",               type: "아울렛", address: "부산 북구 만덕대로 23",                           region: "부산" },
  { id: "s013", name: "뉴코아 팩토리아울렛 울산성남점", type: "아울렛", address: "울산 중구 시계탑거리 20",                    region: "울산" },
  { id: "s014", name: "뉴코아 창원점",               type: "아울렛", address: "경남 창원시 의창구 창원대로397번길 6",            region: "경남" },
  { id: "s015", name: "뉴코아 울산점",               type: "아울렛", address: "울산 남구 삼산로 217",                            region: "울산" },

  // ── 2001 아울렛 ──────────────────────────────────
  { id: "s016", name: "2001 중계점",                 type: "아울렛", address: "서울 노원구 동일로204가길 46",                    region: "서울" },
  { id: "s017", name: "2001 부평점",                 type: "아울렛", address: "인천 부평구 경원대로 1277",                       region: "인천" },
  { id: "s018", name: "2001 안양점",                 type: "아울렛", address: "경기 안양시 만안구 안양로 275",                   region: "경기" },
  { id: "s019", name: "2001 분당점",                 type: "아울렛", address: "경기 성남시 분당구 미금일로154번길 20",            region: "경기" },

  // ── NC 백화점 (서울/경기) ─────────────────────────
  { id: "s020", name: "NC 강서점",                   type: "백화점", address: "서울 강서구 강서로56길 17",                       region: "서울" },
  { id: "s021", name: "NC 불광점",                   type: "백화점", address: "서울 은평구 불광로 20",                           region: "서울" },
  { id: "s022", name: "NC 송파점",                   type: "백화점", address: "서울 송파구 충민로 66",                           region: "서울" },
  { id: "s023", name: "NC 신구로점",                 type: "백화점", address: "서울 구로구 구로중앙로 152",                      region: "서울" },
  { id: "s024", name: "NC 이스트폴(구의점)",         type: "기타",   address: "서울 광진구 아차산로 200",                        region: "서울" },
  { id: "s025", name: "NC 고잔점",                   type: "백화점", address: "경기 안산시 단원구 광덕대로 194",                 region: "경기" },
  { id: "s026", name: "NC 야탑점",                   type: "백화점", address: "경기 성남시 분당구 야탑로81번길 11",              region: "경기" },
  { id: "s027", name: "NC 수원터미널점",             type: "백화점", address: "경기 수원시 권선구 경수대로 270",                 region: "경기" },

  // ── NC 백화점 (지방) ──────────────────────────────
  { id: "s028", name: "NC 광주역점",                 type: "백화점", address: "광주 북구 경열로 249",                            region: "광주" },
  { id: "s029", name: "NC 중앙로역점",               type: "백화점", address: "대전 중구 중앙로 141",                            region: "대전" },
  { id: "s030", name: "NC 부산대점",                 type: "백화점", address: "부산 금정구 부산대학로63번길 2",                  region: "부산" },
  { id: "s031", name: "NC 엑스코점",                 type: "백화점", address: "대구 북구 유통단지로14길 22",                     region: "대구" },
  { id: "s032", name: "NC 해운대점",                 type: "백화점", address: "부산 해운대구 해운대로 813",                      region: "부산" },
  { id: "s033", name: "NC 전주점",                   type: "백화점", address: "전북 전주시 완산구 전주객사5길 35",               region: "전북" },
  { id: "s034", name: "NC 충장점",                   type: "백화점", address: "광주 동구 중앙로 163",                            region: "광주" },
  { id: "s035", name: "NC 순천점",                   type: "백화점", address: "전남 순천시 비봉2길 22",                          region: "전남" },
  { id: "s036", name: "NC 경산점",                   type: "백화점", address: "경북 경산시 중앙로 39",                           region: "경북" },
  { id: "s037", name: "NC 청주점",                   type: "백화점", address: "충북 청주시 흥덕구 2순환로 1233",                 region: "충북" },
  { id: "s038", name: "NC 대전유성점",               type: "백화점", address: "대전 유성구 계룡로 119",                          region: "대전" },
  { id: "s039", name: "NC 포항점",                   type: "백화점", address: "경북 포항시 북구 중앙상가길 6",                   region: "경북" },

  // ── 동아 백화점 ────────────────────────────────────
  { id: "s040", name: "동아 쇼핑점",                 type: "백화점", address: "대구 중구 달구벌대로 2085",                       region: "대구" },
  { id: "s041", name: "동아 수성점",                 type: "백화점", address: "대구 수성구 지범로 191",                          region: "대구" },
  { id: "s042", name: "동아 구미점",                 type: "백화점", address: "경북 구미시 송원동로 28",                         region: "경북" },
  { id: "s043", name: "동아 강북점",                 type: "백화점", address: "대구 북구 칠곡중앙대로 416",                      region: "대구" },
];
