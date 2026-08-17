import React from 'react';
import { useStudioStore } from '../../store/StudioStore';
import {
  Sparkles, Film, ShieldCheck, Grid3x3, Cpu, FolderPlus,
  Coffee, Bookmark, Clapperboard, Images, Settings2,
} from 'lucide-react';

type NavItem = {
  view: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  activeColor: string;
  badge?: string | number;
};

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, addShot, sceneKeyframes, savedPrompts } = useStudioStore();
  const keyframeCount = (sceneKeyframes || []).length;
  const savedCount = savedPrompts?.length ?? 0;

  const isActive = (view: string) => activeView === view;

  const navItem = (item: NavItem) => {
    const active = isActive(item.view);
    return (
      <button
        key={item.view}
        type="button"
        onClick={() => setActiveView(item.view as any)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-100 cursor-pointer ${
          active ? item.activeColor : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <item.icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? '' : item.iconColor}`} />
          <span className={active ? 'font-semibold' : ''}>{item.label}</span>
        </div>
        {item.badge !== undefined && (
          <span className={`px-1.5 py-px rounded-full text-[10px] font-mono font-bold ${
            active ? 'bg-white/10 text-white' : 'bg-zinc-800 text-zinc-500'
          }`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-60 bg-zinc-950 border-r border-zinc-800/60 flex flex-col h-full flex-shrink-0">

      <div className="flex-1 overflow-y-auto p-3 space-y-5">

        <section>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600 px-2 mb-1.5">AI Modes</p>
          <nav className="space-y-0.5">
            {navItem({ view: 'gemini-director', label: 'AI Director Studio', icon: Sparkles, iconColor: 'text-cyan-400', activeColor: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' })}
            {navItem({ view: 'wizard', label: 'Director Wizard', icon: Clapperboard, iconColor: 'text-violet-400', activeColor: 'bg-violet-500/15 text-violet-300 border border-violet-500/30' })}
            {navItem({ view: 'scene-creator', label: 'Scene Creator', icon: Film, iconColor: 'text-amber-400', activeColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30' })}
          </nav>
        </section>

        <section>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600 px-2 mb-1.5">Creative Tools</p>
          <nav className="space-y-0.5">
            {navItem({ view: 'scene-gallery', label: 'Keyframe Gallery', icon: Images, iconColor: 'text-amber-400', activeColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30', badge: keyframeCount })}
            {navItem({ view: 'storyboard', label: 'Visual Storyboard', icon: Grid3x3, iconColor: 'text-purple-400', activeColor: 'bg-purple-500/15 text-purple-300 border border-purple-500/30' })}
            {navItem({ view: 'prompt-library', label: 'Saved Prompts', icon: Bookmark, iconColor: 'text-pink-400', activeColor: 'bg-pink-500/15 text-pink-300 border border-pink-500/30', badge: savedCount })}
            {navItem({ view: 'templates', label: '140+ Templates', icon: Grid3x3, iconColor: 'text-sky-400', activeColor: 'bg-sky-500/15 text-sky-300 border border-sky-500/30' })}
          </nav>
        </section>

        <section>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600 px-2 mb-1.5">System</p>
          <nav className="space-y-0.5">
            {navItem({ view: 'comfy', label: 'ComfyUI Payload', icon: Cpu, iconColor: 'text-rose-400', activeColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30' })}
            {navItem({ view: 'diagnostics', label: 'Diagnostics', icon: ShieldCheck, iconColor: 'text-emerald-400', activeColor: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' })}
            {navItem({ view: 'ai-settings', label: 'AI Settings', icon: Settings2, iconColor: 'text-zinc-400', activeColor: 'bg-zinc-700/40 text-zinc-200 border border-zinc-600/50' })}
          </nav>
        </section>

        <section>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600 px-2 mb-1.5">Quick Actions</p>
          <button
            type="button"
            onClick={() => addShot()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-zinc-700 hover:border-cyan-500/50 text-zinc-500 hover:text-cyan-300 hover:bg-cyan-500/5 text-xs font-medium transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Add Shot Node</span>
          </button>
        </section>
      </div>

      <div className="p-3 border-t border-zinc-800/60 space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-mono text-zinc-600">MiniMax H3 Engine</span>
          <span className="px-1.5 py-px rounded-full bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-cyan-500">v1.0</span>
        </div>
        <div className="px-2">
          <span className="text-[9px] font-mono text-zinc-700 tracking-wider">T2VA · I2VA · FL2VA · L2VA</span>
        </div>
        <a
          href="https://buymeacoffee.com/shubzworld"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-amber-500/10 border border-zinc-800 hover:border-amber-500/30 transition-all group"
          title="Support project on Buy Me a Coffee"
        >
          <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-zinc-300 group-hover:text-amber-300 transition-colors leading-none">Support Development</span>
            <span className="text-[9px] text-zinc-600 mt-0.5">buymeacoffee.com</span>
          </div>
        </a>
      </div>
    </aside>
  );
};
