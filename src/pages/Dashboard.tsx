import { useState, useMemo } from 'react';
import { Plus, FolderOpen, Trash2, FileText, BookOpen, BarChart3 } from 'lucide-react';
import { newId } from '../lib/ids';

export interface ProjectMeta {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

const PROJECTS_INDEX_KEY = 'plenior-projects-index';

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

export function getProjectStorageKey(projectId: string) {
  return `plenior-project-${projectId}`;
}

interface Props {
  onOpenProject: (projectId: string) => void;
}

export default function Dashboard({ onOpenProject }: Props) {
  const [projects, setProjects] = useState<ProjectMeta[]>(loadProjectsIndex);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const sorted = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt - a.updatedAt),
    [projects],
  );

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
    onOpenProject(project.id);
  }

  function handleDelete(id: string, projectName: string) {
    if (!confirm(`Delete project "${projectName}"? All data in this project will be permanently lost.`)) return;
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
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-warm-800 tracking-tight">Plenior</h1>
          <p className="text-warm-500 mt-2 italic font-reading">Every story carries more than it knows.</p>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-warm-700">Projects</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-forest-500 text-white text-sm font-medium rounded-lg hover:bg-forest-600 transition-colors btn-press"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {showCreate && (
          <div className="mb-8 bg-white rounded-2xl border border-warm-100 card-elevated p-6">
            <h3 className="text-lg font-semibold text-warm-800 mb-4">New Project</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Project Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false); }}
                  placeholder="e.g. HBCU Grant Analysis 2026"
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Description</label>
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of this analysis project..."
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="px-5 py-2 bg-forest-500 text-white text-sm font-medium rounded-lg hover:bg-forest-600 disabled:opacity-40 transition-colors btn-press"
                >
                  Create Project
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm text-warm-500 hover:text-warm-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {sorted.length === 0 && !showCreate ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-warm-100 card-shadow">
            <FolderOpen size={48} className="mx-auto text-warm-300 mb-4" />
            <p className="text-warm-500 text-lg">No projects yet</p>
            <p className="text-warm-400 text-sm mt-1">Create a project to start coding your data</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sorted.map(project => {
              const stats = getProjectStats(project.id);
              return (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-warm-100 card-shadow card-hover px-6 py-5 cursor-pointer group"
                  onClick={() => onOpenProject(project.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-warm-800 group-hover:text-forest-700 transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-warm-500 mt-1">{project.description}</p>
                      )}
                      <div className="flex gap-4 mt-3 text-xs text-warm-400">
                        <span className="flex items-center gap-1">
                          <FileText size={12} />
                          {stats.transcripts} transcript{stats.transcripts !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          {stats.codes} code{stats.codes !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 size={12} />
                          {stats.excerpts} excerpt{stats.excerpts !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-xs text-warm-400">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.name); }}
                        className="text-warm-300 hover:text-rose-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        aria-label={`Delete ${project.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
