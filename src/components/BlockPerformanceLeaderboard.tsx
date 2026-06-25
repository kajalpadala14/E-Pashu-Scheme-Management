import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DantewadaMapBlockMetric } from "@/lib/dantewadaDistrictMap";

type Props = {
  blockMetrics: DantewadaMapBlockMetric[];
  selectedBlockName: string;
  hoveredBlockName: string | null;
  isMobile: boolean;
  onHoverBlock: (blockName: string | null) => void;
  onSelectBlock: (blockName: string) => void;
};

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

function statusLabel(progress: number) {
  if (progress >= 100) return "Excellent Performance";
  if (progress >= 70) return "Good Progress";
  return "Needs Attention";
}

function statusTone(progress: number) {
  if (progress >= 100) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (progress >= 70) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-rose-100 text-rose-800 border-rose-200";
}

function rankEmoji(rank: number) {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function progressBarTone(progress: number) {
  if (progress >= 100) return "bg-emerald-600";
  if (progress >= 70) return "bg-amber-500";
  return "bg-rose-500";
}

export function BlockPerformanceLeaderboard({
  blockMetrics,
  selectedBlockName,
  hoveredBlockName,
  isMobile,
  onHoverBlock,
  onSelectBlock,
}: Props) {
  const [pinnedBlockName, setPinnedBlockName] = useState<string | null>(null);

  const rankings = useMemo(() => {
    return [...blockMetrics]
      .sort((left, right) => right.progress - left.progress || right.targetUnits - left.targetUnits || left.blockName.localeCompare(right.blockName));
  }, [blockMetrics]);

  const activeBlockName = hoveredBlockName ?? pinnedBlockName ?? (isMobile ? null : selectedBlockName);
  const activeBlock = activeBlockName
    ? rankings.find((item) => item.blockName.toLowerCase() === activeBlockName.toLowerCase()) || null
    : null;

  return (
    <Card className="overflow-hidden border-emerald-100 shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          Block Performance Leaderboard
        </CardTitle>
        <p className="text-sm text-slate-500">Sorted automatically by progress percentage from Google Sheets.</p>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            {rankings.map((block, index) => {
              const rank = index + 1;
              const isActive = block.blockName.toLowerCase() === activeBlockName.toLowerCase();

              return (
                <button
                  key={block.blockName}
                  type="button"
                  className={`group w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-300 ${
                    isActive ? "border-teal-300 ring-1 ring-teal-200" : "border-slate-200"
                  } hover:-translate-y-0.5 hover:shadow-md`}
                  onMouseEnter={() => onHoverBlock(block.blockName)}
                  onMouseLeave={() => onHoverBlock(null)}
                  onFocus={() => onHoverBlock(block.blockName)}
                  onBlur={() => onHoverBlock(null)}
                  onClick={() => {
                    setPinnedBlockName(block.blockName);
                    onSelectBlock(block.blockName);
                  }}
                  aria-label={`${block.blockName} block leaderboard card`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{rankEmoji(rank)} Rank {rank}</p>
                      <h3 className="mt-1 truncate text-lg font-bold text-slate-900">{block.blockName}</h3>
                    </div>
                    <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(block.progress)}`}>
                      {statusLabel(block.progress)}
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-black tracking-tight text-slate-900">{block.progress}%</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Progress</p>
                    </div>
                    <div className="w-full max-w-[11rem]">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${progressBarTone(block.progress)}`} style={{ width: `${Math.min(block.progress, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="block">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">Details</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{activeBlock?.blockName || "Select a block"}</h3>
                  <p className="mt-1 text-sm text-slate-500">Hover on desktop or tap on mobile to inspect live block metrics.</p>
                </div>
                <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${activeBlock ? statusTone(activeBlock.progress) : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {activeBlock ? statusLabel(activeBlock.progress) : "No block selected"}
                </div>
              </div>

              {activeBlock ? (
                <>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <Metric label="Target Units" value={formatNumber(activeBlock.targetUnits)} />
                    <Metric label="Approved Cases" value={formatNumber(activeBlock.approvedCases)} />
                    <Metric label="Achievement" value={formatNumber(activeBlock.distributedUnits)} />
                    <Metric label="Pending Cases" value={formatNumber(activeBlock.pendingCases)} />
                    <Metric label="Women Beneficiaries" value={formatNumber(activeBlock.womenBeneficiaries)} />
                    <Metric label="FRA Beneficiaries" value={formatNumber(activeBlock.fraBeneficiaries)} />
                    <Metric label="PVTG Beneficiaries" value={formatNumber(activeBlock.pvtgBeneficiaries)} />
                    <Metric label="Active Schemes" value={formatNumber(activeBlock.activeSchemes)} />
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">Progress</span>
                      <span className="font-bold text-slate-900">{activeBlock.progress}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white">
                      <div className={`h-full rounded-full ${progressBarTone(activeBlock.progress)}`} style={{ width: `${Math.min(activeBlock.progress, 100)}%` }} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  Select a block from the leaderboard to view detailed performance metrics.
                </div>
              )}
            </div>

            {isMobile && activeBlock ? (
              <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Tap details</p>
                <button
                  type="button"
                  className="mt-3 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  onClick={() => setPinnedBlockName(null)}
                >
                  Close details
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}