import { useState, useMemo, useEffect } from 'react';
import { Plus, FolderOpen, Trash2, FileText, BookOpen, BarChart3, Clock } from 'lucide-react';
import { newId } from '../lib/ids';

export interface ProjectMeta {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

const PROJECTS_INDEX_KEY = 'plenior-projects-index';
const LAST_PROJECT_KEY = 'plenior-last-project';

function loadProjectsIndex(): ProjectMeta[] {
  try {
    const raw = localStorage.getItem(PROJECTS_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjectsIndex(projects: ProjectMeta[]) {
  localStorage.setItem(PROJECTS_INDEX_KEY, JSON.stringify(projects));
}

export function getLastProjectId(): string | null {
  return localStorage.getItem(LAST_PROJECT_KEY);
}

export function setLastProjectId(id: string) {
  localStorage.setItem(LAST_PROJECT_KEY, id);
}

export function getProjectStorageKey(projectId: string) {
  return `plenior-project-${projectId}`;
}

interface Props {
  onOpenProject: (projectId: string, projectName?: string) => void;
  skipAutoOpen?: boolean;
}

export default function Dashboard({ onOpenProject, skipAutoOpen }: Props) {
  const [projects, setProjects] = useState<ProjectMeta[]>(loadProjectsIndex);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (skipAutoOpen) return;
    const lastId = getLastProjectId();
    const lastProject = projects.find(p => p.id === lastId);
    if (lastProject) {
      onOpenProject(lastProject.id, lastProject.name);
    }
  }, []);

  const sorted = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt - a.updatedAt),
    [projects],
  );

  const totalStats = useMemo(() => {
    let transcripts = 0, codes = 0, excerpts = 0;
    for (const p of projects) {
      const s = getProjectStats(p.id);
      transcripts += s.transcripts;
      codes += s.codes;
      excerpts += s.excerpts;
    }
    return { transcripts, codes, excerpts, projects: projects.length };
  }, [projects]);

  function handleCreate() {
    if (!name.trim()) return;
    const project: ProjectMeta = {
      id: newId(),
      name: name.trim(),
      description: description.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...projects, project];
    setProjects(updated);
    saveProjectsIndex(updated);
    setName('');
    setDescription('');
    setShowCreate(false);
    onOpenProject(project.id, project.name);
  }

  function handleDelete(id: string, projectName: string) {
    if (!confirm(`Delete project "${projectName}"? All data will be permanently lost.`)) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjectsIndex(updated);
    localStorage.removeItem(getProjectStorageKey(id));
  }

  function getProjectStats(projectId: string) {
    try {
      const raw = localStorage.getItem(getProjectStorageKey(projectId));
      if (!raw) return { transcripts: 0, codes: 0, excerpts: 0 };
      const state = JSON.parse(raw);
      return {
        transcripts: Object.keys(state.transcripts ?? {}).length,
        codes: Object.keys(state.codes ?? {}).length,
        excerpts: Object.keys(state.excerpts ?? {}).length,
      };
    } catch {
      return { transcripts: 0, codes: 0, excerpts: 0 };
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#0F1419] text-white">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <h1 className="text-4xl font-bold tracking-tight">Plenior</h1>
          <p className="text-slate-400 mt-2 text-lg italic font-reading">Every story carries more than it knows.</p>

          {/* Stats row */}
          <div className="flex gap-8 mt-8">
            {[
              { label: 'Projects', value: totalStats.projects, icon: FolderOpen },
              { label: 'Transcripts', value: totalStats.transcripts, icon: FileText },
              { label: 'Codes', value: totalStats.codes, icon: BookOpen },
              { label: 'Excerpts', value: totalStats.excerpts, icon: BarChart3 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Icon size={18} className="text-navy-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Projects</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-navy-600 text-white text-sm font-medium rounded-xl hover:bg-navy-700 transition-colors btn-press"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {showCreate && (
          <div className="mb-6 bg-white rounded-2xl border border-slate-200 card-elevated p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">New Project</h3>
            <div className="space-y-3">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false); }}
                placeholder="Project name (e.g. HBCU Grant Analysis 2026)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400"
                autoFocus
              />
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="px-5 py-2.5 bg-navy-600 text-white text-sm font-medium rounded-xl hover:bg-navy-700 disabled:opacity-40 transition-colors btn-press"
                >
                  Create
                </button>
                <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {sorted.length === 0 && !showCreate ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 card-shadow">
            <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No projects yet</p>
            <p className="text-slate-400 text-sm mt-1">Create your first project to start analyzing</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sorted.map(project => {
              const stats = getProjectStats(project.id);
              const isRecent = getLastProjectId() === project.id;
              return (
                <div
                  key={project.id}
                  className={`bg-white rounded-xl border px-6 py-5 cursor-pointer group card-hover ${
                    isRecent ? 'border-navy-300 ring-1 ring-navy-200' : 'border-slate-200'
                  }`}
                  onClick={() => onOpenProject(project.id, project.name)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-navy-600 transition-colors">
                          {project.name}
                        </h3>
                        {isRecent && (
                          <span className="flex items-center gap-1 text-xs text-navy-500 bg-navy-50 px-2 py-0.5 rounded-full">
                            <Clock size={10} /> Recent
                          </span>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-slate-500 mt-1">{project.description}</p>
                      )}
                      <div className="flex gap-5 mt-3 text-sm text-slate-400">
                        <span>{stats.transcripts} transcripts</span>
                        <span>{stats.codes} codes</span>
                        <span>{stats.excerpts} excerpts</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.name); }}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                      aria-label={`Delete ${project.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
