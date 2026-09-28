import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  BackgroundVariant, 
  Controls, 
  addEdge, 
  type Connection, 
  type Edge, 
  type Node 
} from '@xyflow/react';
import { BedtoolsNode, type BedtoolsParams } from './components/BedtoolsNode';
import { SamtoolsNode, type SamtoolsParams } from './components/SamtoolsNode';
import { SeqtkNode, type SeqtkParams } from './components/SeqtkNode';
import { FileNode } from './components/FileNode';
import { Sidebar } from './components/Sidebar';
import { CodeModal } from './components/CodeModal';
import { WelcomeModal } from './components/WelcomeModal';
import { generateSnakefile } from './utils/generator';
import { 
  Play, 
  FolderGit2, 
  CheckCircle2, 
  X, 
  Plus, 
  Layers, 
  Save, 
  Check, 
  FolderPlus, 
  Copy,
  Download,
  HelpCircle,
  PlusCircle
} from 'lucide-react';
import type { FileItem } from './electron.d';

export type AnyToolParams = BedtoolsParams | SamtoolsParams | SeqtkParams;

interface Sheet {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  params: BedtoolsParams;
}

const defaultParams: BedtoolsParams = {
  windowSize: 1000,
  upstream: 1000,
  downstream: 1000,
  useAsymmetric: false,
  strandAware: true,
  strandMode: 'all',
};

const initialSheets: Sheet[] = [
  {
    id: 'sheet-1',
    name: 'Example: Genomic Window',
    params: defaultParams,
    nodes: [
      {
        id: 'file-1',
        type: 'file',
        position: { x: 80, y: 140 },
        data: { label: 'Query (a.bed)', path: 'a.bed', format: 'BED' },
      },
      {
        id: 'file-2',
        type: 'file',
        position: { x: 80, y: 280 },
        data: { label: 'Target (b.bed)', path: 'b.bed', format: 'BED' },
      },
      {
        id: 'bedtools-1',
        type: 'bedtools',
        position: { x: 440, y: 140 },
        data: { params: defaultParams },
      },
    ],
    edges: [],
  },
];

export default function App() {
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileItem[]>([]);
  
  const [sheets, setSheets] = useState<Sheet[]>(initialSheets);
  const [activeSheetId, setActiveSheetId] = useState<string>('sheet-1');
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [editingSheetName, setEditingSheetName] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [isExecutionError, setIsExecutionError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isCopied, setIsCopied] = useState(false);
  const [savedOutputName, setSavedOutputName] = useState<string | null>(null);

  const sheetsRef = useRef(sheets);
  sheetsRef.current = sheets;
  const workspacePathRef = useRef(workspacePath);
  workspacePathRef.current = workspacePath;
  const saveStatusRef = useRef(saveStatus);
  saveStatusRef.current = saveStatus;

  const activeSheet = useMemo(() => {
    return sheets.find((s) => s.id === activeSheetId) || sheets[0];
  }, [sheets, activeSheetId]);

  useEffect(() => {
    const hide = localStorage.getItem('snakestudio_hide_welcome');
    if (!hide) {
      setIsWelcomeOpen(true);
    }
  }, []);

  const refreshWorkspaceFiles = useCallback(async (dirPath: string) => {
    if (window.electronAPI?.readDir) {
      const files = await window.electronAPI.readDir(dirPath);
      setWorkspaceFiles(files);
    }
  }, []);

  const loadProjectFromPath = useCallback(async (dirPath: string) => {
    setWorkspacePath(dirPath);
    await refreshWorkspaceFiles(dirPath);

    const projectFile = `${dirPath}/pipeline.studio.json`;
    if (window.electronAPI?.readFile) {
      const raw = await window.electronAPI.readFile(projectFile);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          if (data.sheets && Array.isArray(data.sheets) && data.sheets.length > 0) {
            setSheets(data.sheets);
            setActiveSheetId(data.sheets[0].id);
            setSaveStatus('saved');
          }
        } catch (err) {
          console.error('Project parsing error:', err);
        }
      }
    }
  }, [refreshWorkspaceFiles]);

  useEffect(() => {
    async function initDefaultWorkspace() {
      if (window.electronAPI?.getDefaultWorkspace) {
        const defaultDir = await window.electronAPI.getDefaultWorkspace();
        await loadProjectFromPath(defaultDir);
      }
    }
    initDefaultWorkspace();
  }, [loadProjectFromPath]);

  const handleOpenWorkspace = useCallback(async () => {
    if (window.electronAPI?.selectDirectory) {
      const selectedDir = await window.electronAPI.selectDirectory();
      if (selectedDir) {
        await loadProjectFromPath(selectedDir);
      }
    }
  }, [loadProjectFromPath]);

  const handleSaveProject = useCallback(async (): Promise<boolean> => {
    if (!window.electronAPI?.writeFile) return false;

    let targetDir = workspacePathRef.current;
    if (!targetDir && window.electronAPI.getDefaultWorkspace) {
      targetDir = await window.electronAPI.getDefaultWorkspace();
      setWorkspacePath(targetDir);
    }
    if (!targetDir) return false;

    setSaveStatus('saving');
    const projectFilePath = `${targetDir}/pipeline.studio.json`;
    const payload = JSON.stringify({ version: '1.0', sheets: sheetsRef.current }, null, 2);
    const ok = await window.electronAPI.writeFile(projectFilePath, payload);
    if (ok) {
      setSaveStatus('saved');
      await refreshWorkspaceFiles(targetDir);
      return true;
    }
    return false;
  }, [refreshWorkspaceFiles]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveProject();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveProject]);

  const handleCloseWindow = async () => {
    if (saveStatusRef.current === 'unsaved') {
      if (window.electronAPI?.confirmClose) {
        const choice = await window.electronAPI.confirmClose();
        if (choice === 0) {
          const ok = await handleSaveProject();
          if (ok) window.electronAPI?.close?.();
        } else if (choice === 1) {
          window.electronAPI?.close?.();
        }
        return;
      }
    }
    window.electronAPI?.close?.();
  };

  const handleAddSheet = () => {
    const newId = `sheet-${Date.now()}`;
    const defaultName = `Pipeline ${sheets.length + 1}`;
    const newSheet: Sheet = {
      id: newId,
      name: defaultName,
      params: defaultParams,
      nodes: [],
      edges: [],
    };
    setSheets((prev) => [...prev, newSheet]);
    setActiveSheetId(newId);
    setEditingSheetId(newId);
    setEditingSheetName(defaultName);
    setSaveStatus('unsaved');
  };

  const handleRenameSheet = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setSheets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName.trim() } : s))
    );
    setEditingSheetId(null);
    setSaveStatus('unsaved');
  };

  const handleDeleteSheet = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (sheets.length <= 1) return;
    const filtered = sheets.filter((s) => s.id !== id);
    setSheets(filtered);
    if (activeSheetId === id) {
      setActiveSheetId(filtered[0].id);
    }
    setSaveStatus('unsaved');
  };

  const setNodes = useCallback(
    (updater: (nodes: Node[]) => Node[]) => {
      setSheets((prev) =>
        prev.map((s) => {
          if (s.id === activeSheetId) {
            return { ...s, nodes: updater(s.nodes) };
          }
          return s;
        })
      );
      setSaveStatus('unsaved');
    },
    [activeSheetId]
  );

  const setEdges = useCallback(
    (updater: (edges: Edge[]) => Edge[]) => {
      setSheets((prev) =>
        prev.map((s) => {
          if (s.id === activeSheetId) {
            return { ...s, edges: updater(s.edges) };
          }
          return s;
        })
      );
      setSaveStatus('unsaved');
    },
    [activeSheetId]
  );

  const onNodesChange = useCallback(
    (changes: any[]) => {
      setSheets((prev) =>
        prev.map((s) => {
          if (s.id === activeSheetId) {
            let updated = [...s.nodes];
            for (const c of changes) {
              if (c.type === 'remove') {
                updated = updated.filter((n) => n.id !== c.id);
              } else if (c.type === 'position' && c.position) {
                updated = updated.map((n) => (n.id === c.id ? { ...n, position: c.position } : n));
              }
            }
            return { ...s, nodes: updated };
          }
          return s;
        })
      );
      setSaveStatus('unsaved');
    },
    [activeSheetId]
  );

  const onEdgesChange = useCallback(
    (changes: any[]) => {
      setSheets((prev) =>
        prev.map((s) => {
          if (s.id === activeSheetId) {
            let updated = [...s.edges];
            for (const c of changes) {
              if (c.type === 'remove') {
                updated = updated.filter((e) => e.id !== c.id);
              }
            }
            return { ...s, edges: updated };
          }
          return s;
        })
      );
      setSaveStatus('unsaved');
    },
    [activeSheetId]
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges]
  );

  const handleParamsChange = useCallback(
    (nodeId: string, updated: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const currentParams = (node.data && typeof node.data.params === 'object' && node.data.params !== null)
              ? (node.data.params as Record<string, any>)
              : {};
            return {
              ...node,
              data: {
                ...node.data,
                params: { ...currentParams, ...updated },
              },
            };
          }
          return node;
        })
      );
      if (nodeId === 'bedtools-1') {
        setSheets((prev) =>
          prev.map((s) => (s.id === activeSheetId ? { ...s, params: { ...s.params, ...updated } } : s))
        );
      }
      setSaveStatus('unsaved');
    },
    [activeSheetId, setNodes]
  );

  const handleFileSelect = useCallback(
    (id: string, fullPath: string, filename: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, label: filename, path: fullPath },
            };
          }
          return node;
        })
      );
      setSaveStatus('unsaved');
    },
    [setNodes]
  );

  const handleRenameLabel = useCallback(
    (id: string, newLabel: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, label: newLabel },
            };
          }
          return node;
        })
      );
      setSaveStatus('unsaved');
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSaveStatus('unsaved');
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'bedtools' || node.type === 'samtools' || node.type === 'seqtk') {
          return {
            ...node,
            data: { 
              ...node.data, 
              onChangeParams: handleParamsChange,
              onDeleteNode: handleDeleteNode,
            },
          };
        }
        if (node.type === 'file') {
          return {
            ...node,
            data: {
              ...node.data,
              onSelectFile: handleFileSelect,
              onRenameLabel: handleRenameLabel,
              onDeleteNode: handleDeleteNode,
            },
          };
        }
        return node;
      })
    );
  }, [handleParamsChange, handleFileSelect, handleRenameLabel, handleDeleteNode, setNodes]);

  const handleAddFileToCanvas = (file: FileItem) => {
    if (file.name === 'pipeline.studio.json' || file.name.endsWith('.studio.json')) {
      if (window.electronAPI?.readFile) {
        window.electronAPI.readFile(file.path).then((raw) => {
          if (raw) {
            try {
              const data = JSON.parse(raw);
              if (data.sheets) {
                setSheets(data.sheets);
                setActiveSheetId(data.sheets[0].id);
                setSaveStatus('saved');
              }
            } catch (e) {
              console.error(e);
            }
          }
        });
      }
      return;
    }

    const newNode: Node = {
      id: `file-${Date.now()}`,
      type: 'file',
      position: { x: 140 + Math.random() * 40, y: 150 + Math.random() * 40 },
      data: {
        label: file.name.split('/').pop() || file.name,
        path: file.path,
        format: file.name.split('.').pop()?.toUpperCase() || 'DATA',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSaveStatus('unsaved');
  };

  const handleAddToolToCanvas = (toolName: string) => {
    let initialParams: AnyToolParams = activeSheet.params;
    if (toolName === 'samtools') {
      initialParams = { minMapQ: 30, onlyMapped: true, includeHeader: true, outputFormat: 'sam' } as SamtoolsParams;
    } else if (toolName === 'seqtk') {
      initialParams = { mode: 'sample', sampleCount: 1000, seed: 100 } as SeqtkParams;
    }

    const newNode: Node = {
      id: `${toolName}-${Date.now()}`,
      type: toolName,
      position: { x: 420 + Math.random() * 30, y: 160 + Math.random() * 30 },
      data: { params: initialParams },
    };
    setNodes((nds) => [...nds, newNode]);
    setSaveStatus('unsaved');
  };

  const toolNode = activeSheet.nodes.find((n) => ['bedtools', 'samtools', 'seqtk'].includes(n.type || ''));
  const fileNodes = activeSheet.nodes.filter((n) => n.type === 'file');
  const queryFile = String(fileNodes[0]?.data?.path || '');
  const targetFile = String(fileNodes[1]?.data?.path || '');

  const cliCommand = useMemo(() => {
    if (!toolNode) return '';

    if (toolNode.type === 'samtools') {
      const p = toolNode.data.params as SamtoolsParams;
      let cmd = `samtools view -q ${p.minMapQ}`;
      if (p.onlyMapped) cmd += ' -F 4';
      if (p.includeHeader) cmd += ' -h';
      if (p.outputFormat === 'bam') cmd += ' -b';
      cmd += ` "${queryFile}"`;
      return cmd;
    }

    if (toolNode.type === 'seqtk') {
      const p = toolNode.data.params as SeqtkParams;
      if (p.mode === 'sample') {
        return `seqtk sample -s${p.seed} "${queryFile}" ${p.sampleCount}`;
      }
      return `seqtk subseq "${queryFile}" "${targetFile}"`;
    }

    const p = (toolNode.data.params || activeSheet.params) as BedtoolsParams;
    let cmd = `bedtools window -a "${queryFile}" -b "${targetFile}"`;
    if (p.useAsymmetric) {
      cmd += ` -l ${p.upstream} -r${p.downstream}`;
      if (p.strandAware) cmd += ' -sw';
    } else {
      cmd += ` -w ${p.windowSize}`;
    }
    if (p.strandMode === 'same') cmd += ' -sm';
    if (p.strandMode === 'opposite') cmd += ' -Sm';
    return cmd;
  }, [toolNode, activeSheet.params, queryFile, targetFile]);

  const outputFileName = useMemo(() => {
    if (toolNode?.type === 'samtools') {
      const p = toolNode.data.params as SamtoolsParams;
      return `filtered_q${p.minMapQ}.${p.outputFormat}`;
    }
    if (toolNode?.type === 'seqtk') {
      const p = toolNode.data.params as SeqtkParams;
      return p.mode === 'sample' ? `sampled_${p.sampleCount}.fastq` : `subseq_output.fasta`;
    }
    const p = activeSheet.params;
    const distTag = p.useAsymmetric ? `up${p.upstream}bp_down${p.downstream}bp` : `w${p.windowSize}bp`;
    const modeTag = p.strandMode !== 'all' ? `_${p.strandMode}` : '';
    return `cis_${distTag}${modeTag}.bed`;
  }, [toolNode, activeSheet.params]);

  const currentSnakefile = useMemo(() => {
    return generateSnakefile({
      params: activeSheet.params,
      queryFile: queryFile || 'input_query.bed',
      targetFile: targetFile || 'input_target.bed',
      outputFile: `results/${outputFileName}`,
    });
  }, [activeSheet.params, queryFile, targetFile, outputFileName]);

  const handleRun = async () => {
    if (!queryFile) {
      setIsExecutionError(true);
      setExecutionResult('Error: Please connect at least one input file to the tool.');
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);
    setIsExecutionError(false);
    setSavedOutputName(null);

    try {
      const res = await fetch('http://localhost:8000/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cliCommand }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setIsExecutionError(false);
        setExecutionResult(data.stdout || '(Output is empty or no records matched the filters)');
      } else {
        setIsExecutionError(true);
        setExecutionResult(`Error:\n${data.stderr}`);
      }
    } catch (err) {
      setIsExecutionError(true);
      setExecutionResult(`Backend connection error: ${err}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveResultToFile = async () => {
    if (!executionResult || isExecutionError || !window.electronAPI?.writeFile) return;

    const currentDir = workspacePath || (window.electronAPI.getDefaultWorkspace ? await window.electronAPI.getDefaultWorkspace() : null);
    if (!currentDir) return;

    const fullPath = `${currentDir}/results/${outputFileName}`;
    const header = [
      `# SnakeStudio Output`,
      `# Command: ${cliCommand}`,
      `# Date: ${new Date().toISOString()}`,
      `# -------------------------------------------------------------`,
      ``
    ].join('\n');

    const fileContent = header + executionResult;
    const ok = await window.electronAPI.writeFile(fullPath, fileContent);
    if (ok) {
      setSavedOutputName(outputFileName);
      await refreshWorkspaceFiles(currentDir);
      setTimeout(() => setSavedOutputName(null), 3500);
    }
  };

  const handleCopyResult = () => {
    if (executionResult) {
      navigator.clipboard.writeText(executionResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const nodeTypes = useMemo(() => ({ 
    bedtools: BedtoolsNode, 
    samtools: SamtoolsNode,
    seqtk: SeqtkNode,
    file: FileNode 
  }), []);

  return (
    <div className="w-screen h-screen bg-[#0b0d11] flex flex-col select-none overflow-hidden font-sans">
      <header className="h-10 bg-[#11141c] border-b border-white/10 flex items-center justify-between px-3 [app-region:drag] z-50">
        <div className="flex items-center gap-3 [app-region:no-drag]">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleCloseWindow}
              title="Close"
              className="h-3 w-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-all cursor-pointer" 
            />
            <button 
              type="button"
              onClick={() => window.electronAPI?.minimize?.()}
              title="Minimize"
              className="h-3 w-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-all cursor-pointer" 
            />
            <button 
              type="button"
              onClick={() => window.electronAPI?.maximize?.()}
              title="Maximize"
              className="h-3 w-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-all cursor-pointer" 
            />
          </div>

          <span className="text-xs font-mono text-slate-300 ml-2">
            SnakeStudio <span className="text-slate-500">|</span> <span className="text-white font-medium">{workspacePath ? workspacePath.split('/').pop() : 'SnakeStudio_Projects'}</span>
          </span>

          <div className="flex items-center gap-1.5 ml-2 text-[11px] font-mono">
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-400/80">
                <Check size={12} /> Saved
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-sky-400 animate-pulse">Saving...</span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-amber-400 font-semibold">• Unsaved (Ctrl+S)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 [app-region:no-drag]">
          <button 
            type="button"
            onClick={() => setIsWelcomeOpen(true)}
            title="User Guide & Shortcuts"
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <HelpCircle size={14} />
          </button>

          <button 
            type="button"
            onClick={handleOpenWorkspace}
            title="Open Directory"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
          >
            <FolderPlus size={13} className="text-amber-400" /> Open Folder
          </button>

          <button 
            type="button"
            onClick={() => handleSaveProject()}
            title="Save Project (Ctrl + S)"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-all cursor-pointer active:scale-95"
          >
            <Save size={13} /> Save
          </button>

          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
          >
            <FolderGit2 size={13} /> Snakefile
          </button>

          <button 
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-500/20 hover:opacity-95 disabled:opacity-50 cursor-pointer transition-all"
          >
            <Play size={12} fill="currentColor" /> {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </header>

      <div className="h-9 bg-[#0e1118] border-b border-white/10 flex items-center px-3 gap-1 overflow-x-auto z-40">
        <div className="flex items-center gap-1.5 text-slate-500 mr-2 text-xs">
          <Layers size={14} />
          <span className="text-[10px] font-mono uppercase tracking-wider">Pipelines:</span>
        </div>

        {sheets.map((sheet) => {
          const isActive = sheet.id === activeSheetId;
          const isEditing = editingSheetId === sheet.id;

          return (
            <div
              key={sheet.id}
              onClick={() => setActiveSheetId(sheet.id)}
              onDoubleClick={() => {
                setEditingSheetId(sheet.id);
                setEditingSheetName(sheet.name);
              }}
              className={`group flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                isActive
                  ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                  : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={editingSheetName}
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setEditingSheetName(e.target.value)}
                  onBlur={() => handleRenameSheet(sheet.id, editingSheetName)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSheet(sheet.id, editingSheetName);
                    if (e.key === 'Escape') setEditingSheetId(null);
                  }}
                  className="bg-black/60 border border-sky-400/80 rounded px-1.5 py-0.5 text-white text-xs outline-none w-44 font-mono shadow-inner"
                />
              ) : (
                <span>{sheet.name}</span>
              )}

              {sheets.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteSheet(e, sheet.id)}
                  title="Delete Sheet"
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-all"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleAddSheet}
          title="New Pipeline Sheet"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-all cursor-pointer ml-1"
        >
          <Plus size={13} />
          <span className="text-[11px]">New Sheet</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          workspacePath={workspacePath}
          files={workspaceFiles}
          onOpenDirectory={handleOpenWorkspace}
          onRefreshDirectory={() => workspacePath && refreshWorkspaceFiles(workspacePath)}
          onAddFileToCanvas={handleAddFileToCanvas}
          onAddToolToCanvas={handleAddToolToCanvas}
          onPreviewFile={async (file) => {
            if (window.electronAPI?.readFile) {
              const content = await window.electronAPI.readFile(file.path);
              if (content) {
                setExecutionResult(content);
                setIsExecutionError(false);
              }
            }
          }}
          onDeleteFile={async (file) => {
            if (window.confirm(`Are you sure you want to delete '${file.name}'?`)) {
              if (window.electronAPI?.deleteFile) {
                await window.electronAPI.deleteFile(file.path);
                if (workspacePath) refreshWorkspaceFiles(workspacePath);
              }
            }
          }}
        />

        <main className="flex-1 h-full relative">
          <ReactFlow
            key={activeSheet.id}
            nodes={activeSheet.nodes}
            edges={activeSheet.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#1e2433" />
            <Controls className="!bg-[#141721] !border-white/10 !rounded-xl !overflow-hidden [&>button]:!border-white/5 [&>button]:!fill-slate-300" />
          </ReactFlow>

          {activeSheet.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="p-6 rounded-2xl bg-[#141824]/60 backdrop-blur-md border border-white/5 text-center max-w-sm">
                <PlusCircle size={32} className="mx-auto text-sky-400 mb-2 opacity-60" />
                <h3 className="text-sm font-semibold text-slate-200 mb-1">Empty Workflow Canvas</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Add genomic files from the <b>Explorer</b> tab and drag analysis nodes from the <b>Toolbox</b> to build your workflow.
                </p>
              </div>
            </div>
          )}

          {executionResult !== null && (
            <div className="absolute bottom-4 left-4 right-4 z-50 rounded-2xl bg-[#141721]/95 backdrop-blur-xl border border-sky-500/30 shadow-2xl p-4 text-xs font-mono text-slate-200 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 font-semibold ${isExecutionError ? 'text-rose-400' : 'text-emerald-400'}`}>
                    <CheckCircle2 size={15} /> Terminal Output ({activeSheet.name})
                  </span>
                  {savedOutputName && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      💾 Saved: results/{savedOutputName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isExecutionError && (
                    <button 
                      type="button"
                      onClick={handleSaveResultToFile}
                      title="Save output to results/ folder"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer text-[11px] active:scale-95"
                    >
                      <Download size={13} />
                      <span>Save Output</span>
                    </button>
                  )}

                  <button 
                    type="button"
                    onClick={handleCopyResult}
                    title="Copy to Clipboard"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-white/10 hover:border-sky-500/30 transition-all cursor-pointer text-[11px]"
                  >
                    {isCopied ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setExecutionResult(null)} 
                    title="Close"
                    className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <pre className="overflow-x-auto whitespace-pre font-mono text-[11px] text-sky-200 bg-black/60 p-3 rounded-xl border border-white/5 max-h-48">
                {executionResult}
              </pre>
            </div>
          )}
        </main>
      </div>

      <CodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        code={currentSnakefile}
      />

      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
      />
    </div>
  );
}