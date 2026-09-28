import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers, Trash2 } from 'lucide-react';

export interface BedtoolsParams {
  windowSize: number;
  upstream: number;
  downstream: number;
  useAsymmetric: boolean;
  strandAware: boolean;
  strandMode: 'all' | 'same' | 'opposite';
}

interface BedtoolsNodeProps {
  id: string;
  data: {
    params: BedtoolsParams;
    onChangeParams?: (id: string, params: Partial<BedtoolsParams>) => void;
    onDeleteNode?: (id: string) => void;
  };
}

export const BedtoolsNode: React.FC<BedtoolsNodeProps> = ({ id, data }) => {
  const params: BedtoolsParams = data.params || {
    windowSize: 1000,
    upstream: 1000,
    downstream: 1000,
    useAsymmetric: false,
    strandAware: true,
    strandMode: 'all',
  };

  const update = (patch: Partial<BedtoolsParams>) => {
    data.onChangeParams?.(id, patch);
  };

  return (
    <div className="relative rounded-2xl bg-[#141824]/95 border border-sky-500/40 p-4 shadow-2xl min-w-[280px] text-slate-200 font-sans backdrop-blur-md hover:border-sky-500/70 transition-colors">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-sky-400 !border-2 !border-[#0b0d11] !top-1/2 !-translate-y-1/2"
      />

      <div className="flex items-center justify-between gap-3 mb-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Layers size={16} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">BEDTools Window</div>
            <div className="text-[10px] text-slate-400 font-mono">Genomic Window Analysis</div>
          </div>
        </div>

        {data.onDeleteNode && (
          <button
            type="button"
            onClick={() => data.onDeleteNode?.(id)}
            title="Delete Node"
            className="p-1 hover:bg-rose-500/20 rounded text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="space-y-3 text-xs">
        {/* Symmetric vs Asymmetric Mode */}
        <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
          <button
            type="button"
            onClick={() => update({ useAsymmetric: false })}
            className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all ${
              !params.useAsymmetric
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Symmetric (-w)
          </button>
          <button
            type="button"
            onClick={() => update({ useAsymmetric: true })}
            className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all ${
              params.useAsymmetric
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Asymmetric (-l/-r)
          </button>
        </div>

        {!params.useAsymmetric ? (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Window Size:</span>
              <span className="text-sky-300 font-semibold">{params.windowSize} bp</span>
            </div>
            <input
              type="range"
              min="100"
              max="20000"
              step="100"
              value={params.windowSize}
              onChange={(e) => update({ windowSize: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Upstream (-l):</span>
                <span className="text-sky-300 font-semibold">{params.upstream} bp</span>
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                step="100"
                value={params.upstream}
                onChange={(e) => update({ upstream: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Downstream (-r):</span>
                <span className="text-sky-300 font-semibold">{params.downstream} bp</span>
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                step="100"
                value={params.downstream}
                onChange={(e) => update({ downstream: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>
        )}

        {/* Strand Settings */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          {params.useAsymmetric && (
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300 text-[11px]">Strand-Aware (-sw)</span>
              <input
                type="checkbox"
                checked={params.strandAware}
                onChange={(e) => update({ strandAware: e.target.checked })}
                className="rounded bg-black/40 border-white/20 text-sky-500 focus:ring-0 cursor-pointer"
              />
            </label>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Strand Matching:</span>
            <select
              value={params.strandMode}
              onChange={(e) => update({ strandMode: e.target.value as any })}
              className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-[11px] text-sky-200 outline-none"
            >
              <option value="all">Any Strand</option>
              <option value="same">Same Strand (-sm)</option>
              <option value="opposite">Opposite (-Sm)</option>
            </select>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-sky-400 !border-2 !border-[#0b0d11] !top-1/2 !-translate-y-1/2"
      />
    </div>
  );
};