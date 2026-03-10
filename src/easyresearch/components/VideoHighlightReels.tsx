import React, { useState } from 'react';
import { Film, Scissors, Tag, Share2, Play, Pause, Plus, Trash2, Clock, Download, ChevronRight } from 'lucide-react';

interface Clip { id: string; sourceId: string; participantName: string; startTime: number; endTime: number; transcript?: string; tags: string[]; note?: string; }
interface Reel { id: string; title: string; description: string; clips: Clip[]; createdAt: string; duration: number; shared: boolean; }

interface Props { projectId: string; }

const VideoHighlightReels: React.FC<Props> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'clips' | 'reels' | 'editor'>('clips');
  const [clips] = useState<Clip[]>(Array.from({ length: 10 }, (_, i) => ({
    id: `clip-${i}`, sourceId: `rec-${i % 5}`, participantName: `P${(i % 5) + 1}`,
    startTime: i * 15, endTime: i * 15 + 12 + Math.floor(Math.random() * 20),
    transcript: ['I expected the button to be here...', 'This is really confusing', 'Oh I see, that makes sense now', 'Wait, where did my data go?', 'This flow is actually quite smooth'][i % 5],
    tags: [['usability', 'pain-point'], ['confusion'], ['aha-moment', 'positive'], ['bug', 'data-loss'], ['positive', 'efficiency']][i % 5],
    note: i % 3 === 0 ? 'Key insight about navigation' : undefined,
  })));
  const [reels, setReels] = useState<Reel[]>([
    { id: 'r1', title: 'Usability Pain Points', description: 'Key moments showing user frustration', clips: clips.slice(0, 4), createdAt: '2026-03-01', duration: 78, shared: true },
    { id: 'r2', title: 'Positive Feedback Compilation', description: 'Users expressing satisfaction', clips: clips.slice(4, 7), createdAt: '2026-03-05', duration: 45, shared: false },
  ]);
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [tagFilter, setTagFilter] = useState<string>('all');

  const allTags = [...new Set(clips.flatMap(c => c.tags))];
  const filteredClips = tagFilter === 'all' ? clips : clips.filter(c => c.tags.includes(tagFilter));
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Film className="w-5 h-5 text-purple-600" /></div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Video Highlight Reels / 视频集锦</h2>
            <p className="text-sm text-stone-500">{clips.length} clips · {reels.length} reels</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['clips', 'reels', 'editor'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === v ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {v === 'clips' ? 'Clips' : v === 'reels' ? 'Reels' : 'Editor'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'clips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setTagFilter('all')} className={`px-2 py-1 text-xs rounded-full ${tagFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600'}`}>All ({clips.length})</button>
              {allTags.map(tag => (
                <button key={tag} onClick={() => setTagFilter(tag)} className={`px-2 py-1 text-xs rounded-full ${tagFilter === tag ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                  {tag} ({clips.filter(c => c.tags.includes(tag)).length})
                </button>
              ))}
            </div>
            <button onClick={() => { if (selectedClips.size > 0) { setEditingReel({ id: crypto.randomUUID(), title: 'New Reel', description: '', clips: clips.filter(c => selectedClips.has(c.id)), createdAt: new Date().toISOString(), duration: 0, shared: false }); setActiveView('editor'); }}}
              disabled={selectedClips.size === 0}
              className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-1">
              <Film className="w-3 h-3" /> Create Reel ({selectedClips.size})
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredClips.map(clip => (
              <div key={clip.id} className={`p-4 bg-white rounded-xl border-2 transition-all cursor-pointer ${selectedClips.has(clip.id) ? 'border-purple-500 bg-purple-50' : 'border-stone-200 hover:border-stone-300'}`}
                onClick={() => { const next = new Set(selectedClips); next.has(clip.id) ? next.delete(clip.id) : next.add(clip.id); setSelectedClips(next); }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-stone-900 flex items-center justify-center"><Play className="w-4 h-4 text-white" /></div>
                    <div>
                      <div className="text-sm font-medium text-stone-800">{clip.participantName}</div>
                      <div className="text-xs text-stone-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(clip.startTime)} - {formatTime(clip.endTime)}</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={selectedClips.has(clip.id)} onChange={() => {}} className="rounded text-purple-600" />
                </div>
                {clip.transcript && <p className="text-xs text-stone-600 italic mb-2 line-clamp-2">"{clip.transcript}"</p>}
                <div className="flex gap-1 flex-wrap">
                  {clip.tags.map(tag => (
                    <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full ${tag === 'pain-point' || tag === 'confusion' || tag === 'bug' ? 'bg-red-50 text-red-600' : tag === 'positive' || tag === 'aha-moment' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>{tag}</span>
                  ))}
                </div>
                {clip.note && <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-1.5 rounded-lg">{clip.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'reels' && (
        <div className="space-y-4">
          {reels.map(reel => (
            <div key={reel.id} className="p-4 bg-white rounded-xl border border-stone-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-stone-900">{reel.title}</h3>
                  <p className="text-xs text-stone-500">{reel.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {reel.shared && <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"><Share2 className="w-3 h-3" /> Shared</span>}
                  <button onClick={() => { setEditingReel(reel); setActiveView('editor'); }} className="text-xs px-2 py-1 bg-stone-100 rounded-lg">Edit</button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-stone-500 mb-3">
                <span className="flex items-center gap-1"><Scissors className="w-3 h-3" /> {reel.clips.length} clips</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(reel.duration)}</span>
                <span>{new Date(reel.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {reel.clips.slice(0, 5).map((clip, i) => (
                  <div key={clip.id} className="flex-shrink-0 w-24 h-16 bg-stone-900 rounded-lg flex items-center justify-center relative">
                    <Play className="w-4 h-4 text-white/60" />
                    <span className="absolute bottom-1 right-1 text-[9px] text-white/80 font-mono">{formatTime(clip.endTime - clip.startTime)}</span>
                  </div>
                ))}
                {reel.clips.length > 5 && <div className="flex-shrink-0 w-24 h-16 bg-stone-100 rounded-lg flex items-center justify-center text-xs text-stone-500">+{reel.clips.length - 5} more</div>}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg flex items-center gap-1"><Play className="w-3 h-3" /> Play Reel</button>
                <button className="text-xs px-3 py-1.5 bg-stone-100 rounded-lg flex items-center gap-1"><Share2 className="w-3 h-3" /> Share</button>
                <button className="text-xs px-3 py-1.5 bg-stone-100 rounded-lg flex items-center gap-1"><Download className="w-3 h-3" /> Export</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'editor' && editingReel && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
            <input value={editingReel.title} onChange={e => setEditingReel({ ...editingReel, title: e.target.value })}
              className="text-lg font-bold border-none outline-none w-full text-stone-900" placeholder="Reel title..." />
            <input value={editingReel.description} onChange={e => setEditingReel({ ...editingReel, description: e.target.value })}
              className="text-sm border-none outline-none w-full text-stone-500" placeholder="Description..." />
          </div>
          <h3 className="font-semibold text-stone-800">Timeline / 时间线 ({editingReel.clips.length} clips)</h3>
          <div className="space-y-2">
            {editingReel.clips.map((clip, idx) => (
              <div key={clip.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200">
                <span className="text-xs font-bold text-purple-600 w-6">{idx + 1}</span>
                <div className="w-16 h-10 bg-stone-900 rounded-lg flex items-center justify-center"><Play className="w-3 h-3 text-white/60" /></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-stone-800">{clip.participantName}</div>
                  <div className="text-xs text-stone-500">{formatTime(clip.startTime)} → {formatTime(clip.endTime)} ({formatTime(clip.endTime - clip.startTime)})</div>
                </div>
                <div className="flex gap-1">{clip.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full">{t}</span>)}</div>
                <button onClick={() => setEditingReel({ ...editingReel, clips: editingReel.clips.filter(c => c.id !== clip.id) })} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setReels(prev => { const idx = prev.findIndex(r => r.id === editingReel.id); if (idx >= 0) { const next = [...prev]; next[idx] = editingReel; return next; } return [...prev, editingReel]; }); setActiveView('reels'); }}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold">Save Reel / 保存集锦</button>
            <button onClick={() => setActiveView('reels')} className="px-4 py-2 bg-stone-100 rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoHighlightReels;
