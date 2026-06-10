"use client";

import { useMemo, useState } from "react";
import { CandidateInternal } from "@/lib/types";
import { STORES, Store } from "@/lib/data/stores";
import { IconSearch } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// ── 통근 기준 (법규·취업규칙) ─────────────────────────
// 편도 최대: 75분 (왕복 150분) / 환승 최대: 3회
// ODsay API 연동 전 → 주소 시/도 기준 참고 표시

// ── 시/도 추출 ───────────────────────────────────────
function getRegion(address: string): string {
  if (!address) return "";
  const tokens = address.trim().split(/\s+/);
  const first = tokens[0] ?? "";
  const map: Record<string, string> = {
    "서울특별시": "서울", "서울": "서울",
    "경기도": "경기", "인천광역시": "인천", "인천": "인천",
    "부산광역시": "부산", "부산": "부산",
    "대구광역시": "대구", "대구": "대구",
    "광주광역시": "광주", "광주": "광주",
    "대전광역시": "대전", "대전": "대전",
    "울산광역시": "울산", "울산": "울산",
    "세종특별자치시": "세종", "세종": "세종",
    "강원도": "강원", "강원특별자치도": "강원",
    "충청북도": "충북", "충북": "충북",
    "충청남도": "충남", "충남": "충남",
    "전라북도": "전북", "전북특별자치도": "전북",
    "전라남도": "전남", "전남": "전남",
    "경상북도": "경북", "경북": "경북",
    "경상남도": "경남", "경남": "경남",
    "제주특별자치도": "제주", "제주": "제주",
  };
  return map[first] ?? first;
}

// 인접 권역 (동일권역 통근 가능성 높음)
const ADJACENT: Record<string, string[]> = {
  "서울": ["경기", "인천"],
  "경기": ["서울", "인천", "강원", "충북", "충남"],
  "인천": ["서울", "경기"],
  "충남": ["경기", "충북", "전북", "전남", "대전", "세종"],
  "충북": ["경기", "강원", "경북", "충남", "전북", "대전", "세종"],
  "강원": ["경기", "충북", "경북"],
  "대전": ["충남", "충북", "세종"],
  "세종": ["충남", "충북", "대전"],
  "전북": ["충남", "충북", "전남", "경남", "광주"],
  "전남": ["전북", "경남", "광주"],
  "광주": ["전남", "전북"],
  "경북": ["강원", "충북", "경남", "대구", "울산"],
  "경남": ["전남", "전북", "경북", "부산", "울산"],
  "대구": ["경북", "경남"],
  "부산": ["경남", "울산"],
  "울산": ["경남", "경북", "부산"],
};

type FeasibilityLabel = "근접" | "검토 가능" | "원거리" | "미확인";
const FEASIBILITY_CHIP: Record<FeasibilityLabel, string> = {
  "근접":     "bg-signal-greenBg text-signal-green",
  "검토 가능":"bg-signal-amberBg text-signal-amber",
  "원거리":   "bg-signal-redBg text-signal-red",
  "미확인":   "bg-canvas text-ink-400",
};
const FEASIBILITY_ORDER: Record<FeasibilityLabel, number> = {
  "근접": 0, "검토 가능": 1, "원거리": 2, "미확인": 3,
};

function feasibility(empRegion: string, storeRegion: string): FeasibilityLabel {
  if (!empRegion || !storeRegion) return "미확인";
  if (empRegion === storeRegion) return "근접";
  if ((ADJACENT[empRegion] ?? []).includes(storeRegion)) return "검토 가능";
  return "원거리";
}

type SubMode = "employee" | "store";

// ── 메인 컴포넌트 ──────────────────────────────────────
export function PlacementMode({ pool }: { pool: CandidateInternal[] }) {
  const [subMode, setSubMode] = useState<SubMode>("employee");

  const BTN = "rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition";
  const BTN_ON  = "border-brand-200 bg-brand-50 text-brand-700";
  const BTN_OFF = "border-line bg-surface text-ink-500 hover:bg-canvas";

  return (
    <div className="space-y-4">

      {/* 서브 모드 토글 */}
      <div className="flex items-center gap-2">
        <button onClick={() => setSubMode("employee")}
          className={cn(BTN, subMode === "employee" ? BTN_ON : BTN_OFF)}>
          👤 직원 검색 → 가능 점포
        </button>
        <button onClick={() => setSubMode("store")}
          className={cn(BTN, subMode === "store" ? BTN_ON : BTN_OFF)}>
          🏬 점포 선택 → 근거리 직원
        </button>
        <span className="ml-2 rounded-lg bg-signal-amberBg px-2.5 py-1 text-[11px] font-medium text-signal-amber">
          ODsay 연동 전 — 시/도 기준 참고용
        </span>
      </div>

      {subMode === "employee"
        ? <EmployeeSearchPanel pool={pool} />
        : <StoreSearchPanel pool={pool} />
      }
    </div>
  );
}

// ── 직원 검색 패널 ─────────────────────────────────────
function EmployeeSearchPanel({ pool }: { pool: CandidateInternal[] }) {
  const [query, setQuery]     = useState("");
  const [selected, setSelected] = useState<CandidateInternal | null>(null);
  const [showList, setShowList] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pool
      .filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.orgName.toLowerCase().includes(q) ||
        (e.address ?? "").toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [query, pool]);

  const empRegion = selected?.address ? getRegion(selected.address) : "";

  const topStores = useMemo(() => {
    if (!selected || STORES.length === 0) return [];
    return STORES
      .map(store => ({ store, label: feasibility(empRegion, store.region) }))
      .sort((a, b) => FEASIBILITY_ORDER[a.label] - FEASIBILITY_ORDER[b.label])
      .slice(0, 5);
  }, [selected, empRegion]);

  function pickEmployee(emp: CandidateInternal) {
    setSelected(emp);
    setQuery("");
    setShowList(false);
  }

  return (
    <div className="grid grid-cols-[340px_1fr] gap-4 items-start">

      {/* 왼쪽: 검색 */}
      <div className="space-y-2">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setShowList(true); }}
            onFocus={() => setShowList(true)}
            placeholder="직원 이름·조직·지역 검색"
            className="input pl-9"
          />
        </div>

        {showList && results.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            {results.map(emp => (
              <button
                key={emp.id}
                onClick={() => pickEmployee(emp)}
                className="flex w-full items-center gap-3 border-b border-line/60 px-4 py-2.5 text-left transition last:border-0 hover:bg-canvas"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[13px] font-semibold text-ink-900">{emp.name}</span>
                  <span className="ml-1.5 text-[11px] text-ink-400">{emp.grade} · {emp.orgName}</span>
                </div>
                {emp.address ? (
                  <span className="shrink-0 rounded-md bg-canvas px-1.5 py-0.5 text-[10.5px] text-ink-500">
                    {getRegion(emp.address)}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-md bg-canvas px-1.5 py-0.5 text-[10.5px] text-ink-400">주소없음</span>
                )}
              </button>
            ))}
          </div>
        )}

        {!query && !selected && (
          <p className="text-[12px] text-ink-400 leading-relaxed pt-1">
            직원을 검색·선택하면<br />배치 가능 점포 Top 5를 확인합니다.
          </p>
        )}
      </div>

      {/* 오른쪽: 결과 */}
      {selected ? (
        <div className="space-y-3">
          {/* 직원 카드 */}
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-ink-900">{selected.name}</span>
                  <span className="rounded-lg bg-canvas px-2 py-0.5 text-[11.5px] text-ink-500">{selected.grade}</span>
                </div>
                <div className="mt-0.5 text-[12px] text-ink-500">{selected.orgName}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg bg-canvas px-2 py-1 text-[11px] text-ink-400 hover:text-ink-700 transition"
              >
                초기화
              </button>
            </div>
            {selected.address ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-canvas px-3 py-2.5">
                <span className="mt-0.5 shrink-0 text-[13px]">🏠</span>
                <div>
                  <div className="text-[10.5px] text-ink-400">자택 주소 · {empRegion} 거주</div>
                  <div className="text-[12.5px] text-ink-700 leading-snug">{selected.address}</div>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-canvas px-3 py-2 text-[12px] text-ink-400">자택 주소 데이터 없음</div>
            )}
          </div>

          {/* Top 5 점포 */}
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="text-[12px] font-bold text-ink-700">배치 가능 점포 Top 5</span>
              {STORES.length === 0 && (
                <span className="text-[11px] text-ink-400">— 점포 데이터 입력 대기 중</span>
              )}
              {STORES.length > 0 && empRegion && (
                <span className="text-[11px] text-ink-400">({empRegion} 거주 기준)</span>
              )}
            </div>
            {STORES.length === 0 ? (
              <SetupPromptInline />
            ) : topStores.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-ink-400">
                배치 가능 점포 없음
              </div>
            ) : (
              topStores.map(({ store, label }, i) => (
                <div key={store.id} className="flex items-center gap-3 border-b border-line/60 px-4 py-3 last:border-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-ink-900">{store.name}</div>
                    <div className="text-[11px] text-ink-400">{store.address}</div>
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    <span className={cn("chip text-[11px]", FEASIBILITY_CHIP[label])}>{label}</span>
                    <div className="text-[10px] text-ink-400">ODsay 연동 후 정확한 시간</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-line text-[12px] text-ink-400">
          왼쪽에서 직원을 선택하세요
        </div>
      )}
    </div>
  );
}

// ── 점포 선택 패널 ─────────────────────────────────────
function StoreSearchPanel({ pool }: { pool: CandidateInternal[] }) {
  const [query, setQuery]         = useState("");
  const [selected, setSelected]   = useState<Store | null>(null);

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STORES;
    return STORES.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.region.includes(q)
    );
  }, [query]);

  const nearbyEmployees = useMemo(() => {
    if (!selected) return [];
    return pool
      .filter(e => e.address && getRegion(e.address) === selected.region)
      .slice(0, 15);
  }, [selected, pool]);

  return (
    <div className="grid grid-cols-[280px_1fr] gap-4 items-start">

      {/* 왼쪽: 점포 목록 */}
      <div className="space-y-2">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="점포명 검색"
            className="input pl-9"
            disabled={STORES.length === 0}
          />
        </div>
        {STORES.length === 0 ? (
          <SetupPromptInline />
        ) : (
          <div className="max-h-[520px] overflow-y-auto overflow-hidden rounded-2xl border border-line bg-surface">
            {filteredStores.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-ink-400">검색 결과 없음</div>
            ) : filteredStores.map(store => (
              <button
                key={store.id}
                onClick={() => setSelected(store)}
                className={cn(
                  "flex w-full items-center gap-2.5 border-b border-line/60 px-3 py-2.5 text-left transition last:border-0 hover:bg-canvas",
                  selected?.id === store.id && "bg-brand-50"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-ink-900">{store.name}</div>
                  <div className="text-[10.5px] text-ink-400">{store.region} · {store.type}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 오른쪽: 근거리 직원 */}
      {selected ? (
        <div className="space-y-3">
          {/* 점포 카드 */}
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start gap-3">
              <span className="text-[22px]">🏬</span>
              <div>
                <div className="text-[15px] font-bold text-ink-900">{selected.name}</div>
                <div className="mt-0.5 text-[12px] text-ink-500">{selected.address}</div>
                <div className="mt-1.5 flex gap-1.5">
                  <span className="rounded-lg bg-canvas px-2 py-0.5 text-[11px] text-ink-500">{selected.type}</span>
                  <span className="rounded-lg bg-canvas px-2 py-0.5 text-[11px] text-ink-500">{selected.region}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 근거리 직원 */}
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="text-[12px] font-bold text-ink-700">근거리 직원</span>
              <span className="text-[11px] text-ink-400">
                {selected.region} 거주 · {nearbyEmployees.length}명
              </span>
            </div>
            {nearbyEmployees.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-ink-400">
                {selected.region} 거주 직원 없음
              </div>
            ) : (
              nearbyEmployees.map(emp => (
                <div key={emp.id} className="flex items-center gap-3 border-b border-line/60 px-4 py-2.5 last:border-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-[13px] font-semibold text-ink-900">{emp.name}</span>
                    <span className="ml-1.5 text-[11px] text-ink-400">{emp.grade} · {emp.orgName}</span>
                  </div>
                  <div className="shrink-0 max-w-[200px] text-right">
                    <div className="truncate text-[10.5px] text-ink-400">{emp.address}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-line text-[12px] text-ink-400">
          {STORES.length > 0 ? "왼쪽에서 점포를 선택하세요" : ""}
        </div>
      )}
    </div>
  );
}

// ── 준비 중 안내 ───────────────────────────────────────
function SetupPromptInline() {
  return (
    <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-5 text-center space-y-1.5">
      <div className="text-[24px]">🗺️</div>
      <div className="text-[12.5px] font-bold text-brand-700">점포 데이터 입력 대기 중</div>
      <div className="text-[11.5px] text-brand-500 space-y-0.5">
        <p>① 점포 주소 목록 40개 입력</p>
        <p>② ODsay API 키 등록 (대중교통 시간)</p>
        <p className="text-[10.5px] text-brand-400 pt-1">완료 후 자동 활성화됩니다</p>
      </div>
    </div>
  );
}
