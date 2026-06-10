"use client";

import { useMemo, useState } from "react";
import { CandidateInternal } from "@/lib/types";
import { STORES, Store } from "@/lib/data/stores";
import { IconSearch } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import commuteData from "@/lib/data/commute-matrix.json";

// ── 통근 기준 (법규·취업규칙) ─────────────────────────
// 편도 최대: 75분 (왕복 150분)
const MAX_ONE_WAY_MIN = 75;

// ── commute-matrix 타입 ───────────────────────────────
type CommuteMatrix = {
  generatedAt: string;
  storeIds: string[];
  storeNames: Record<string, string>;
  storeCoords: Record<string, { lat: number; lng: number } | null>;
  employees: Record<string, { lat: number; lng: number; km: (number | null)[] }>;
};
const RAW_MATRIX = commuteData as unknown as CommuteMatrix;

// ── 편도 소요시간 추정 ────────────────────────────────
// 직선거리 기준 (Haversine) + 대중교통 평균속도 + 대기 10분
function estimateMin(km: number): number {
  if (km <= 0) return 0;
  const speed = km < 8 ? 18 : km < 20 ? 22 : 27; // km/h
  return Math.round((km / speed) * 60 + 10);
}

// ── 소요시간 → 칩 스타일 ─────────────────────────────
function timeChipClass(min: number): string {
  if (min <= 30) return "bg-signal-greenBg text-signal-green";
  if (min <= 60) return "bg-signal-amberBg text-signal-amber";
  return "bg-orange-50 text-orange-600";
}

// ── 직원의 점포별 소요시간 (정렬 후 반환) ────────────
function getStoreCommutes(empId: string) {
  const entry = RAW_MATRIX.employees[empId];
  if (!entry) return [];
  return RAW_MATRIX.storeIds
    .map((storeId, i) => {
      const km = entry.km[i];
      if (km === null || km === undefined) return null;
      const min = estimateMin(km);
      return { storeId, km, min };
    })
    .filter((x): x is { storeId: string; km: number; min: number } => x !== null)
    .filter(x => x.min <= MAX_ONE_WAY_MIN)
    .sort((a, b) => a.min - b.min);
}

// ── 점포의 근거리 직원 소요시간 (정렬 후 반환) ───────
function getEmployeeCommutes(storeId: string, pool: CandidateInternal[]) {
  const idx = RAW_MATRIX.storeIds.indexOf(storeId);
  if (idx === -1) return [];
  const result: { emp: CandidateInternal; km: number; min: number }[] = [];
  for (const emp of pool) {
    const entry = RAW_MATRIX.employees[emp.id];
    if (!entry) continue;
    const km = entry.km[idx];
    if (km === null || km === undefined) continue;
    const min = estimateMin(km);
    if (min <= MAX_ONE_WAY_MIN) result.push({ emp, km, min });
  }
  return result.sort((a, b) => a.min - b.min);
}

type SubMode = "employee" | "store";

// ── 메인 컴포넌트 ──────────────────────────────────────
export function PlacementMode({ pool }: { pool: CandidateInternal[] }) {
  const [subMode, setSubMode] = useState<SubMode>("employee");

  const BTN     = "rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition";
  const BTN_ON  = "border-brand-200 bg-brand-50 text-brand-700";
  const BTN_OFF = "border-line bg-surface text-ink-500 hover:bg-canvas";

  const matrixCount = Object.keys(RAW_MATRIX.employees).length;

  return (
    <div className="space-y-4">

      {/* 서브 모드 토글 */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setSubMode("employee")}
          className={cn(BTN, subMode === "employee" ? BTN_ON : BTN_OFF)}>
          👤 직원 검색 → 가능 점포
        </button>
        <button onClick={() => setSubMode("store")}
          className={cn(BTN, subMode === "store" ? BTN_ON : BTN_OFF)}>
          🏬 점포 선택 → 근거리 직원
        </button>
        {matrixCount > 0 && (
          <span className="ml-1 rounded-lg bg-signal-greenBg px-2.5 py-1 text-[11px] font-medium text-signal-green">
            ✅ 직선거리 기반 · {matrixCount.toLocaleString()}명 산출 완료
          </span>
        )}
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
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState<CandidateInternal | null>(null);
  const [showList, setShowList] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pool
      .filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.orgName.toLowerCase().includes(q) ||
        (e.address ?? "").includes(q)
      )
      .slice(0, 15);
  }, [query, pool]);

  // 가능 점포 Top 5 (75분 이내, 가까운 순)
  const topStores = useMemo(() => {
    if (!selected) return [];
    const commutes = getStoreCommutes(selected.id);
    return commutes
      .slice(0, 5)
      .map(c => {
        const store = STORES.find(s => s.id === c.storeId);
        return store ? { store, km: c.km, min: c.min } : null;
      })
      .filter((x): x is { store: Store; km: number; min: number } => x !== null);
  }, [selected]);

  const hasMatrix = selected ? !!RAW_MATRIX.employees[selected.id] : false;

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
                {RAW_MATRIX.employees[emp.id] ? (
                  <span className="shrink-0 rounded-md bg-signal-greenBg px-1.5 py-0.5 text-[10.5px] text-signal-green">
                    거리산출
                  </span>
                ) : emp.address ? (
                  <span className="shrink-0 rounded-md bg-canvas px-1.5 py-0.5 text-[10.5px] text-ink-400">
                    조회실패
                  </span>
                ) : (
                  <span className="shrink-0 rounded-md bg-canvas px-1.5 py-0.5 text-[10.5px] text-ink-400">
                    주소없음
                  </span>
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
                  <span className="rounded-lg bg-canvas px-2 py-0.5 text-[11.5px] text-ink-500">
                    {selected.grade}
                  </span>
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
                  <div className="text-[10.5px] text-ink-400">자택 주소</div>
                  <div className="text-[12.5px] text-ink-700 leading-snug">{selected.address}</div>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-canvas px-3 py-2 text-[12px] text-ink-400">
                자택 주소 데이터 없음
              </div>
            )}
          </div>

          {/* Top 5 점포 */}
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="text-[12px] font-bold text-ink-700">배치 가능 점포 Top 5</span>
              {hasMatrix ? (
                <span className="text-[11px] text-ink-400">— 편도 75분 이내 · 직선거리 기반</span>
              ) : (
                <span className="text-[11px] text-signal-amber">
                  — {selected.address ? "좌표 조회 실패" : "주소 없음"}
                </span>
              )}
            </div>

            {!hasMatrix ? (
              <div className="px-4 py-8 text-center space-y-1">
                <div className="text-[22px]">{selected.address ? "📍" : "🏠"}</div>
                <div className="text-[12.5px] font-medium text-ink-500">
                  {selected.address ? "이 직원의 좌표 변환에 실패했습니다" : "자택 주소가 없어 배치 거리를 계산할 수 없습니다"}
                </div>
              </div>
            ) : topStores.length === 0 ? (
              <div className="px-4 py-8 text-center space-y-1">
                <div className="text-[22px]">🚌</div>
                <div className="text-[12.5px] font-medium text-ink-500">편도 75분 이내 배치 가능 점포 없음</div>
              </div>
            ) : (
              topStores.map(({ store, km, min }, i) => (
                <div
                  key={store.id}
                  className="flex items-center gap-3 border-b border-line/60 px-4 py-3 last:border-0"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-ink-900">{store.name}</div>
                    <div className="text-[11px] text-ink-400">{store.address}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={cn("chip text-[11px] mb-0.5", timeChipClass(min))}>
                      편도 약 {min}분
                    </div>
                    <div className="text-[10.5px] text-ink-400">{km.toFixed(1)} km (직선)</div>
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
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState<Store | null>(null);

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STORES;
    return STORES.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.region.includes(q)
    );
  }, [query]);

  // 근거리 직원 (75분 이내, 가까운 순, 최대 30명 표시)
  const nearbyEmployees = useMemo(() => {
    if (!selected) return [];
    return getEmployeeCommutes(selected.id, pool);
  }, [selected, pool]);

  const displayed = nearbyEmployees.slice(0, 30);

  return (
    <div className="grid grid-cols-[280px_1fr] gap-4 items-start">

      {/* 왼쪽: 점포 목록 */}
      <div className="space-y-2">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="점포명·지역 검색"
            className="input pl-9"
          />
        </div>
        <div className="max-h-[540px] overflow-y-auto rounded-2xl border border-line bg-surface">
          {filteredStores.length === 0 ? (
            <div className="px-4 py-6 text-center text-[12px] text-ink-400">검색 결과 없음</div>
          ) : (
            filteredStores.map(store => (
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
            ))
          )}
        </div>
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
                  <span className="rounded-lg bg-canvas px-2 py-0.5 text-[11px] text-ink-500">
                    {selected.type}
                  </span>
                  <span className="rounded-lg bg-canvas px-2 py-0.5 text-[11px] text-ink-500">
                    {selected.region}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 근거리 직원 목록 */}
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="text-[12px] font-bold text-ink-700">배치 가능 직원</span>
              <span className="text-[11px] text-ink-400">
                편도 75분 이내 · 총 {nearbyEmployees.length.toLocaleString()}명
              </span>
            </div>

            {nearbyEmployees.length === 0 ? (
              <div className="px-4 py-8 text-center space-y-1">
                <div className="text-[22px]">🚌</div>
                <div className="text-[12.5px] font-medium text-ink-500">
                  편도 75분 이내 거주 직원 없음
                </div>
              </div>
            ) : (
              <>
                {displayed.map(({ emp, km, min }) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 border-b border-line/60 px-4 py-2.5 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[13px] font-semibold text-ink-900">{emp.name}</span>
                      <span className="ml-1.5 text-[11px] text-ink-400">
                        {emp.grade} · {emp.orgName}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={cn("chip text-[11px] mb-0.5", timeChipClass(min))}>
                        편도 약 {min}분
                      </div>
                      <div className="text-[10.5px] text-ink-400">{km.toFixed(1)} km</div>
                    </div>
                  </div>
                ))}
                {nearbyEmployees.length > 30 && (
                  <div className="border-t border-line px-4 py-2.5 text-center text-[11.5px] text-ink-400">
                    외 {(nearbyEmployees.length - 30).toLocaleString()}명 더 있음
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-line text-[12px] text-ink-400">
          왼쪽에서 점포를 선택하세요
        </div>
      )}
    </div>
  );
}
