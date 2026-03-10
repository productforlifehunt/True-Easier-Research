import React, { useState } from 'react';
import { Video, Mic, Monitor, Camera, Settings, Play, Square, Clock, Eye, Download, Filter } from 'lucide-react';

interface RecordingConfig { webcam: boolean; screen: boolean; audio: boolean; maxDuration: number; autoTranscribe: boolean; }
interface Recording { id: string; participantId: string; duration: number; hasWebcam: boolean; hasScreen: boolean; transcript?: string; timestamp: string; tags: string[]; sentiment?: 'positive' | 'neutral' | 'negative'; }

interface Props { projectId: string; }

const VideoResponseCapture: React.FC<Props> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'config' | 'recordings' | 'preview'>('config');
  const [config, setConfig] = useState<RecordingConfig>({ webcam: true, screen: true, audio: true, maxDuration: 300, autoTranscribe: true });
  const [recordings] = useState<Recording[]>(Array.from({ length: 8 }, (_, i) => ({
    id: `rec-${i}`, participantId: `P${i + 1}`, duration: 60 + Math.floor(Math.random() * 240),
    hasWebcam: true, hasScreen: i % 3 !== 0, timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    tags: [['usability', 'frustration'], ['positive', 'feature-request'], ['confusion', 'navigation']][i % 3],
    transcript: i % 2 === 0 ? 'I found this really confusing because the button was not where I expected it...' : undefined,
    sentiment: (['positive', 'neutral', 'negative'] as const)[i % 3],
  })));
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [isRecordingPreview, setIsRecordingPreview] = useState(false);

  const filteredRecordings = filterSentiment === 'all' ? recordings : recordings.filter(r => r.sentiment === filterSentiment);
  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center"><Video className="w-5 h-5 text-rose-600" /></div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Video/Screen Response Capture / 视频/屏幕录制</h2>
            <p className="text-sm text-stone-500">{recordings.length} recordings · {config.autoTranscribe ? 'Auto-transcribe ON' : 'Manual transcription'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['config', 'recordings', 'preview'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeView === v ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {v === 'config' ? '⚙️ Config' : v === 'recordings' ? '🎬 Recordings' : '👁️ Preview'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'config' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Capture Settings / 录制设置</h3>
            <div className="space-y-3">
              {[
                { key: 'webcam' as const, icon: Camera, label: 'Webcam / 摄像头', desc: 'Record participant face / 录制参与者面部' },
                { key: 'screen' as const, icon: Monitor, label: 'Screen Share / 屏幕共享', desc: 'Capture screen activity / 捕获屏幕活动' },
                { key: 'audio' as const, icon: Mic, label: 'Microphone / 麦克风', desc: 'Record voice narration / 录制语音叙述' },
              ].map(opt => (
                <div key={opt.key} className={`p-4 rounded-xl border-2 transition-all ${config[opt.key] ? 'border-rose-200 bg-rose-50' : 'border-stone-200 bg-white'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={config[opt.key]} onChange={() => setConfig(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                      className="rounded text-rose-600" />
                    <opt.icon className={`w-5 h-5 ${config[opt.key] ? 'text-rose-600' : 'text-stone-400'}`} />
                    <div>
                      <div className="text-sm font-semibold text-stone-800">{opt.label}</div>
                      <div className="text-xs text-stone-500">{opt.desc}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-stone-600 mb-1 block">Max Duration / 最长时长: {formatDuration(config.maxDuration)}</label>
              <input type="range" min={30} max={900} step={30} value={config.maxDuration}
                onChange={e => setConfig(prev => ({ ...prev, maxDuration: Number(e.target.value) }))} className="w-full accent-rose-600" />
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
              <input type="checkbox" checked={config.autoTranscribe} onChange={() => setConfig(prev => ({ ...prev, autoTranscribe: !prev.autoTranscribe }))}
                className="rounded text-rose-600" />
              Auto-transcribe with AI / AI自动转录
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Task Prompts / 任务提示</h3>
            <div className="space-y-2">
              {['Navigate to settings and change your password', 'Find the help section and submit a ticket', 'Complete a purchase of any item'].map((prompt, i) => (
                <div key={i} className="p-3 bg-white rounded-xl border border-stone-200">
                  <div className="flex items-center gap-2 text-xs text-stone-400 mb-1"><Play className="w-3 h-3" /> Task {i + 1}</div>
                  <div className="text-sm text-stone-800">{prompt}</div>
                </div>
              ))}
            </div>
            <button className="text-sm text-rose-600 hover:text-rose-800">+ Add task prompt / 添加任务提示</button>

            <div className="p-4 bg-stone-50 rounded-xl">
              <h4 className="text-xs font-semibold text-stone-700 mb-2">Think-Aloud Protocol / 出声思维法</h4>
              <p className="text-xs text-stone-500 mb-2">Prompt participants to verbalize their thoughts / 提示参与者口头表达想法</p>
              <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-rose-600" /> Enable think-aloud reminders</label>
            </div>
          </div>
        </div>
      )}

      {activeView === 'recordings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {['all', 'positive', 'neutral', 'negative'].map(s => (
                <button key={s} onClick={() => setFilterSentiment(s)}
                  className={`px-3 py-1 text-xs rounded-full ${filterSentiment === s ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                  {s === 'all' ? `All (${recordings.length})` : `${s === 'positive' ? '😊' : s === 'neutral' ? '😐' : '😟'} ${s}`}
                </button>
              ))}
            </div>
            <button className="text-xs px-3 py-1.5 bg-stone-100 rounded-lg flex items-center gap-1"><Download className="w-3 h-3" /> Export All</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {filteredRecordings.map(rec => (
              <div key={rec.id} onClick={() => setSelectedRecording(rec)}
                className={`p-4 bg-white rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${selectedRecording?.id === rec.id ? 'border-rose-500' : 'border-stone-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">{rec.participantId}</div>
                    <div>
                      <div className="text-sm font-medium text-stone-800">{rec.participantId}</div>
                      <div className="text-xs text-stone-500">{new Date(rec.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={`text-lg ${rec.sentiment === 'positive' ? '' : rec.sentiment === 'neutral' ? '' : ''}`}>
                    {rec.sentiment === 'positive' ? '😊' : rec.sentiment === 'neutral' ? '😐' : '😟'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 mb-2">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(rec.duration)}</span>
                  {rec.hasWebcam && <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> Webcam</span>}
                  {rec.hasScreen && <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> Screen</span>}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {rec.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px]">{tag}</span>)}
                </div>
                {rec.transcript && <p className="text-xs text-stone-500 mt-2 line-clamp-2 italic">"{rec.transcript}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'preview' && (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-xl border border-stone-200">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Task Recording / 任务录制</h3>
            <p className="text-sm text-stone-500">Your screen and camera will be recorded / 您的屏幕和摄像头将被录制</p>
          </div>
          <div className="aspect-video bg-stone-900 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
            {isRecordingPreview ? (
              <>
                <div className="absolute top-3 left-3 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /><span className="text-xs text-white font-mono">REC 00:12</span></div>
                <div className="absolute bottom-3 right-3 w-24 h-18 bg-stone-700 rounded-lg border border-stone-600" />
                <span className="text-white text-sm">Screen capture area / 屏幕捕获区域</span>
              </>
            ) : <Camera className="w-12 h-12 text-stone-600" />}
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              {config.webcam && <span className="px-2 py-1 bg-stone-100 rounded">Camera</span>}
              {config.screen && <span className="px-2 py-1 bg-stone-100 rounded">Screen</span>}
              {config.audio && <span className="px-2 py-1 bg-stone-100 rounded">Audio</span>}
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button onClick={() => setIsRecordingPreview(!isRecordingPreview)}
              className={`px-8 py-3 rounded-xl font-semibold text-white flex items-center gap-2 ${isRecordingPreview ? 'bg-red-600 hover:bg-red-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
              {isRecordingPreview ? <><Square className="w-5 h-5" /> Stop Recording</> : <><Play className="w-5 h-5" /> Start Recording</>}
            </button>
          </div>
          <p className="text-xs text-stone-400 text-center mt-3">Max duration: {formatDuration(config.maxDuration)} · Think aloud! / 请出声思考！</p>
        </div>
      )}
    </div>
  );
};

export default VideoResponseCapture;
