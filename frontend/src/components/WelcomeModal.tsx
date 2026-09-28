import React, { useState } from 'react';
import { 
  X, 
  Play, 
  FolderTree, 
  Layers, 
  Sliders, 
  HelpCircle,
  Command
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('snakestudio_hide_welcome', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-[#121622] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#161b2a]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <HelpCircle size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">SnakeStudio Quick Start Guide</h2>
              <p className="text-[11px] text-slate-400">Local-first visual genomic workflow editor</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300 overflow-y-auto max-h-[65vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-3 items-start">
              <FolderTree size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-100 mb-1">1. Select & Add Data</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Add genomic files (BED, SAM, BAM, FASTA) from the Explorer or via the file browser icon on file nodes.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-3 items-start">
              <Sliders size={18} className="text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-100 mb-1">2. Configure Parameters</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Adjust window distances, quality thresholds (MAPQ), or subsample counts with real-time controls.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-3 items-start">
              <Play size={18} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-100 mb-1">3. Run & Inspect</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Click <b>Run</b> to test execution in-memory. Save successful results directly into the <code className="text-sky-300">results/</code> directory.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-3 items-start">
              <Layers size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-100 mb-1">4. Multi-Tool Chaining</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Feed generated outputs back into new pipeline sheets as inputs using the <b>(+)</b> icon in Explorer.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/20 space-y-2">
            <h4 className="font-semibold text-sky-300 text-[11px] flex items-center gap-1.5">
              <Command size={13} /> Useful Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
              <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px]">Ctrl + S</kbd> : Save All Workflows</div>
              <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px]">Double Click</kbd> : Rename Sheet or File Label</div>
              <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px]">Snakefile</kbd> : Export Snakemake Rule</div>
              <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px]">Eye Icon</kbd> : Preview Output in Terminal</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-[#161b2a] flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded bg-black/40 border-white/20 text-sky-500 focus:ring-0 cursor-pointer"
            />
            <span>Don't show again on startup</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};