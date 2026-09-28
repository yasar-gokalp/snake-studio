import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Wrench, 
  RotateCw, 
  Trash2, 
  Eye, 
  CheckCircle2,
  FolderOpen,
  Dna,
  Binary,
  Layers
} from 'lucide-react';
import type { FileItem } from '../electron.d';

interface SidebarProps {
  workspacePath: string | null;
  files: FileItem[];
  onOpenDirectory: () => void;
  onRefreshDirectory: () => void;
  onAddFileToCanvas: (file: FileItem) => void;
  onAddToolToCanvas: (toolName: string) => void;
  onPreviewFile?: (file: FileItem) => void;
  onDeleteFile?: (file: FileItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspacePath,
  files,
  onOpenDirectory,
  onRefreshDirectory,
  onAddFileToCanvas,
  onAddToolToCanvas,
  onPreviewFile,
  onDeleteFile,
}) => {
  const [activeTab, setActiveTab] = useState<'explorer' | 'toolbox'>('explorer');
  const [isResultsOpen, setIsResultsOpen] = useState(true);

  const rootFiles = files.filter((f) => !f.name.startsWith('results/'));
  const resultFiles = files.filter((f) => f.name.startsWith('results/'));
  const folderName = workspacePath ? workspacePath.split('/').pop() : 'SnakeStudio_Projects';

  return (
    <aside className="w-64 bg-[#11141c] border-r border-white/10 flex flex-col h-full select-none z-30">
      <div className="flex border-b border-white/10 bg-[#0e1118]">
        <button
          type="button"
          onClick={() => setActiveTab('explorer')}
          className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'explorer'
              ? 'border-sky-500 text-sky-400 bg-white/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Folder size={13} />
          Explorer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('toolbox')}
          className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'toolbox'
              ? 'border-sky-500 text-sky-400 bg-white/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench size={13} />
          Toolbox
        </button>
      </div>

      {activeTab === 'explorer' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-2 flex items-center justify-between border-b border-white/5 bg-[#141824]/50">
            <div 
              onClick={onOpenDirectory}
              title="Click to switch workspace folder"
              className="flex items-center gap-1.5 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              <FolderOpen size={13} className="text-amber-400 shrink-0" />
              <span className="text-[11px] font-mono text-slate-300 font-semibold truncate">
                {folderName}
              </span>
            </div>
            <button
              type="button"
              onClick={onRefreshDirectory}
              title="Refresh Files"
              className="text-slate-400 hover:text-sky-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RotateCw size={12} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs font-mono">
            {rootFiles.map((file) => {
              const isProject = file.name.endsWith('.studio.json');
              return (
                <div
                  key={file.path}
                  className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-300"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={13} className={isProject ? 'text-sky-400 shrink-0' : 'text-slate-400 shrink-0'} />
                    <span className="truncate text-[11px]" title={file.name}>{file.name}</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => onAddFileToCanvas(file)}
                    title={isProject ? 'Load Pipeline Project' : 'Add to Canvas (+)'}
                    className="opacity-0 group-hover:opacity-100 hover:bg-sky-500/20 text-sky-400 p-1 rounded transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              );
            })}

            <div className="pt-2">
              <div
                onClick={() => setIsResultsOpen(!isResultsOpen)}
                className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-white/5 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  {isResultsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  <Folder size={13} className="text-emerald-400" />
                  <span className="text-[11px] font-semibold text-emerald-400/90">results</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                  {resultFiles.length}
                </span>
              </div>

              {isResultsOpen && (
                <div className="ml-3 pl-2 border-l border-white/10 mt-1 space-y-0.5">
                  {resultFiles.length === 0 ? (
                    <div className="text-[10px] text-slate-500 italic py-1 px-2">
                      No saved outputs yet
                    </div>
                  ) : (
                    resultFiles.map((file) => {
                      const cleanName = file.name.replace('results/', '');
                      return (
                        <div
                          key={file.path}
                          className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors text-slate-300"
                        >
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                            <span className="truncate text-[11px] text-emerald-200/90 font-medium" title={cleanName}>
                              {cleanName}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onPreviewFile && (
                              <button
                                type="button"
                                onClick={() => onPreviewFile(file)}
                                title="Preview Output"
                                className="hover:bg-white/10 text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                              >
                                <Eye size={12} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onAddFileToCanvas(file)}
                              title="Chain Output to Canvas (+)"
                              className="hover:bg-emerald-500/20 text-emerald-400 p-1 rounded transition-colors cursor-pointer"
                            >
                              <Plus size={13} />
                            </button>

                            {onDeleteFile && (
                              <button
                                type="button"
                                onClick={() => onDeleteFile(file)}
                                title="Delete File"
                                className="hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toolbox */}
      {activeTab === 'toolbox' && (
        <div className="flex-1 p-3 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider flex items-center gap-1.5">
              <Layers size={12} /> Genomic Intervals (BEDTools)
            </span>

            <div 
              onClick={() => onAddToolToCanvas('bedtools')}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-sky-500/40 hover:bg-sky-500/5 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300">
                  BEDTools Window
                </div>
                <div className="text-[10px] text-slate-400">
                  Genomic window & distance analysis
                </div>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-sky-400" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider flex items-center gap-1.5">
              <Binary size={12} /> Alignment & Filters (SAMtools)
            </span>

            <div 
              onClick={() => onAddToolToCanvas('samtools')}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                  SAMtools View
                </div>
                <div className="text-[10px] text-slate-400">
                  Filter BAM/SAM by MAPQ & flags
                </div>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-indigo-400" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider flex items-center gap-1.5">
              <Dna size={12} /> FASTA / FASTQ Processing (Seqtk)
            </span>

            <div 
              onClick={() => onAddToolToCanvas('seqtk')}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                  Seqtk Toolkit
                </div>
                <div className="text-[10px] text-slate-400">
                  Subsampling & region extraction
                </div>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-amber-400" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};