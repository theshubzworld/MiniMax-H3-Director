import { create } from 'zustand';
import { StudioProject } from '../types/project';

interface HistoryState {
  past: StudioProject[];
  future: StudioProject[];
  pushState: (project: StudioProject) => void;
  undo: (currentProject: StudioProject) => StudioProject | null;
  redo: (currentProject: StudioProject) => StudioProject | null;
  canUndo: boolean;
  canRedo: boolean;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushState: (project) => {
    const { past } = get();
    const newPast = [...past.slice(-20), JSON.parse(JSON.stringify(project))];
    set({ past: newPast, future: [], canUndo: true, canRedo: false });
  },

  undo: (currentProject) => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [JSON.parse(JSON.stringify(currentProject)), ...future];

    set({
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true,
    });

    return previous;
  },

  redo: (currentProject) => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, JSON.parse(JSON.stringify(currentProject))];

    set({
      past: newPast,
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });

    return next;
  },
}));
