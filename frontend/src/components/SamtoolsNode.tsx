import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Binary, Trash2 } from 'lucide-react';

export interface SamtoolsParams {
  minMapQ: number;
  onlyMapped: boolean;
  includeHeader: boolean;
  outputFormat: 'bam' | 'sam';
}

interface SamtoolsNodeProps {
  id: string;
  data: {
    params: SamtoolsParams;
    onChangeParams?: (id: string, params: Partial<SamtoolsParams>) => void;
    onDeleteNode?: (id: string) => void;
  };
}

export const SamtoolsNode: React.FC<SamtoolsNodeProps> = ({ id, data }) => {
  const params: SamtoolsParams = data.params || {
    minMapQ: 30,
    onlyMapped: true,
    includeHeader: true,
    outputFormat: 'sam',
  };

  const update = (patch: Partial<SamtoolsParams>) => {
    data.onChangeParams?.(id, patch);
  };

  return (
    <div className="relative rounded-2xl bg-[#141824]/95 border border-indigo-500/40 p-4 shadow-2xl min-w-[280px] text-slate-200 font-sans backdrop-blur-md hover:border-indigo-500/70 transition-colors">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-[#0b0d11] !top-1/2 !-translate-y-1/2"
      />

      <div className="flex items-center justify-between gap-3 mb-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Binary size={16} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">SAMtools View</div>
            <div className="text-[10px] text-slate-400 font-mono">BAM/SAM Quality Filter</div>
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
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400">Min MAPQ (-q):</span>
            <span className="text-indigo-300 font-semibold">{params.minMapQ}</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={params.minMapQ}
            onChange={(e) => update({ minMapQ: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300 text-[11px]">Mapped Reads Only (-F 4)</span>
            <input
              type="checkbox"
              checked={params.onlyMapped}
              onChange={(e) => update({ onlyMapped: e.target.checked })}
              className="rounded bg-black/40 border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300 text-[11px]">Include Header (-h)</span>
            <input
              type="checkbox"
              checked={params.includeHeader}
              onChange={(e) => update({ includeHeader: e.target.checked })}
              className="rounded bg-black/40 border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-slate-400 text-[11px]">Output Format:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => update({ outputFormat: 'sam' })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                params.outputFormat === 'sam'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              SAM
            </button>
            <button
              type="button"
              onClick={() => update({ outputFormat: 'bam' })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                params.outputFormat === 'bam'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              BAM (-b)
            </button>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-[#0b0d11] !top-1/2 !-translate-y-1/2"
      />
    </div>
  );
};