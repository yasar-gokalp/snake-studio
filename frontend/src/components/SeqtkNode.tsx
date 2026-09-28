import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Dna, Trash2 } from 'lucide-react';

export interface SeqtkParams {
  mode: 'sample' | 'subseq';
  sampleCount: number;
  seed: number;
}

interface SeqtkNodeProps {
  id: string;
  data: {
    params: SeqtkParams;
    onChangeParams?: (id: string, params: Partial<SeqtkParams>) => void;
    onDeleteNode?: (id: string) => void;
  };
}

export const SeqtkNode: React.FC<SeqtkNodeProps> = ({ id, data }) => {
  const params: SeqtkParams = data.params || {
    mode: 'sample',
    sampleCount: 1000,
    seed: 100,
  };

  const update = (patch: Partial<SeqtkParams>) => {
    data.onChangeParams?.(id, patch);
  };

  return (
    <div className="relative rounded-2xl bg-[#141824]/95 border border-amber-500/40 p-4 shadow-2xl min-w-[280px] text-slate-200 font-sans backdrop-blur-md hover:border-amber-500/70 transition-colors">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-[#0b0d11] !top-1/2 !-translate-y-1/2"
      />

      <div className="flex items-center justify-between gap-3 mb-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Dna size={16} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Seqtk Toolkit</div>
            <div className="text-[10px] text-slate-400 font-mono">FASTA / FASTQ Processing</div>
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
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Mode:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => update({ mode: 'sample' })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                params.mode === 'sample'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Sample
            </button>
            <button
              type="button"
              onClick={() => update({ mode: 'subseq' })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                params.mode === 'subseq'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Subseq
            </button>
          </div>
        </div>

        {params.mode === 'sample' ? (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Random Reads / Sequences:</span>
                <span className="text-amber-300 font-semibold">{params.sampleCount}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50000"
                step="100"
                value={params.sampleCount}
                onChange={(e) => update({ sampleCount: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Random Seed (-s):</span>
              <input
                type="number"
                value={params.seed}
                onChange={(e) => update({ seed: Number(e.target.value) })}
                className="w-16 bg-black/50 border border-white/10 rounded px-1.5 py-0.5 text-right text-amber-200 outline-none"
              />
            </div>
          </>
        ) : (
          <div className="p-2 rounded bg-black/30 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
            Extracts sequence records matching target BED coordinates or ID list.
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-[#0b0d11] !top-1/2 !-translate-y-1/2"
      />
    </div>
  );
};