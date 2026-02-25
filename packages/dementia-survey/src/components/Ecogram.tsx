import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import IOSDropdown from './ui/IOSDropdown';

export interface EcogramMember {
  id: string;
  name: string;
  relationship: string;
  age?: number; // Age of the network member
  gender?: string; // Gender of the network member
  distance: 'same_home' | 'same_community' | 'same_district' | 'same_city' | 'different_city' | 'abroad'; // Geographical distance
  customDistance?: string; // Custom text for detailed distance info
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasionally'; // Frequency of support
  importance: number; // 0-100 scale
  x: number;
  y: number;
  circle: 1 | 2 | 3;
  lineStyle: 'solid' | 'dashed' | 'jagged';
  arrowDirection: 'to' | 'from' | 'both';
  supportTypes: string[];
  // Custom text for each support category
  customADL?: string;
  customIADL?: string;
  customMaintenance?: string;
  customOther?: string;
  color: string;
}

interface Props {
  userId?: string;
  language: string;
  initialData?: { members: EcogramMember[]; lastUpdated: string | null };
  primaryCaregiverCode?: string | null; // PP### code of the primary caregiver whose network this is
  isPrimaryCaregiver?: boolean;
}

const RELS = [
  { v: 'spouse', en: 'Spouse', zh: '配偶', c: '#EC4899' },
  { v: 'child', en: 'Child', zh: '子女', c: '#8B5CF6' },
  { v: 'parent', en: 'Parent', zh: '父母', c: '#3B82F6' },
  { v: 'sibling', en: 'Sibling', zh: '兄弟姐妹', c: '#06B6D4' },
  { v: 'friend', en: 'Friend', zh: '朋友', c: '#10B981' },
  { v: 'neighbor', en: 'Neighbor', zh: '邻居', c: '#84CC16' },
  { v: 'doctor', en: 'Doctor', zh: '医生', c: '#EF4444' },
  { v: 'nurse', en: 'Nurse', zh: '护士', c: '#F97316' },
  { v: 'professional', en: 'Professional', zh: '专业护理', c: '#A855F7' },
  { v: 'other', en: 'Other', zh: '其他', c: '#6B7280' },
];

// Two-level category system from paper (PMC7098392 Table 3)
// All specific tasks listed exactly as in the paper
const ADL_TASKS = [
  { v: 'adl_clinical', en: 'Clinical: medication, medical tasks (catheter, wound care)', zh: '临床: 给药、医疗任务（导尿管、伤口护理）' },
  { v: 'adl_functional', en: 'Functional: feeding/eating, bathing, dressing, grooming, toileting, ambulation (walking)', zh: '功能性: 进食、洗澡、穿衣、梳洗、如厕、行走辅助' },
  { v: 'adl_cognitive', en: 'Cognitive: orientation (time, day, names, location), conversation, answering questions, current events', zh: '认知: 定向（时间、日期、人名、位置）、对话、回答问题、时事新闻' },
];

const IADL_TASKS = [
  { v: 'iadl_decision', en: 'Decision Making: medical decisions, financial decisions, non-medical decisions', zh: '决策: 医疗决策、财务决策、非医疗决策' },
  { v: 'iadl_housekeeping', en: 'House-Keeping: preparing meals, cleaning house/yard, shopping, managing wardrobe', zh: '家务: 备餐、打扫房屋/庭院、购物、管理衣物' },
  { v: 'iadl_info', en: 'Info Management: coordinating care with others, communicating with care team, managing finances/bills', zh: '信息管理: 协调照护、与医护团队沟通、管理财务/账单' },
  { v: 'iadl_logistics', en: 'Logistics: scheduling appointments, reminding, ensuring delivery of necessities (food, supplies)', zh: '后勤: 预约安排、提醒、确保必需品送达（食物、用品）' },
  { v: 'iadl_transport', en: 'Transportation: driving, arranging rides, accompanying to appointments', zh: '交通: 驾车、安排接送、陪同就医' },
];

const MAINT_TASKS = [
  { v: 'maint_companion', en: 'Companionship: social interaction, conversation, games, music, walks, outings', zh: '陪伴: 社交互动、聊天、游戏、音乐、散步、外出' },
  { v: 'maint_caregiver', en: 'Caregiver Support: emotional support for other caregivers, filling in/respite', zh: '照护者支持: 给其他照护者情感支持、替班/喘息服务' },
  { v: 'maint_vigilance', en: 'Vigilance: supervision, safety monitoring, accompanying on walks/errands, preventing wandering', zh: '监护: 监督、安全监控、陪同散步/外出办事、防止走失' },
  { v: 'maint_pet', en: 'Pet Care: walking pets, feeding, vet visits, pet management', zh: '宠物照顾: 遛宠物、喂食、看兽医、宠物管理' },
  { v: 'maint_skill', en: 'Skill Development: attending classes, reading books, self-reflection, learning about dementia', zh: '技能发展: 参加课程、阅读书籍、自我反思、学习失智症知识' },
];

export default function Ecogram({ userId, language, initialData, primaryCaregiverCode, isPrimaryCaregiver }: Props) {
  const [members, setMembers] = useState<EcogramMember[]>(initialData?.members || []);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', rel: '', age: '' as string, gender: '' as string,
    distance: 'same_city' as 'same_home'|'same_community'|'same_district'|'same_city'|'different_city'|'abroad',
    frequency: 'weekly' as 'daily'|'weekly'|'monthly'|'occasionally',
    importance: 50,
    circle: 2 as 1|2|3, line: 'solid' as 'solid'|'dashed'|'jagged',
    arrow: 'both' as 'to'|'from'|'both', support: [] as string[],
    customADL: '', customIADL: '', customMaintenance: '', customOther: ''
  });
  const svgRef = useRef<SVGSVGElement>(null);
  const zh = language === 'zh';

  const drag = useCallback((e: MouseEvent | TouchEvent, id: string) => {
    if (!svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = Math.max(8, Math.min(92, ((cx - r.left) / r.width) * 100));
    const y = Math.max(8, Math.min(92, ((cy - r.top) / r.height) * 100));
    const d = Math.sqrt((x-50)**2 + (y-50)**2);
    const circle: 1|2|3 = d < 18 ? 1 : d < 32 ? 2 : 3;
    setMembers(p => p.map(m => m.id === id ? {...m, x, y, circle} : m));
  }, []);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({ 
        ecogram_data: { members, lastUpdated: new Date().toISOString() }
      }).eq('id', userId);
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const add = () => {
    if (!form.name || !form.rel) return;
    const rel = RELS.find(r => r.v === form.rel);
    const angle = members.length * 45 * Math.PI / 180;
    const rad = form.circle === 1 ? 14 : form.circle === 2 ? 26 : 38;
    setMembers([...members, {
      id: Date.now().toString(), name: form.name, relationship: form.rel,
      age: form.age ? parseInt(form.age) : undefined,
      gender: form.gender || undefined,
      distance: form.distance, frequency: form.frequency, importance: form.importance,
      x: 50 + rad * Math.cos(angle), y: 50 + rad * Math.sin(angle),
      circle: form.circle, lineStyle: form.line, arrowDirection: form.arrow,
      supportTypes: form.support, color: rel?.c || '#6B7280',
      customADL: form.customADL || undefined,
      customIADL: form.customIADL || undefined,
      customMaintenance: form.customMaintenance || undefined,
      customOther: form.customOther || undefined
    }]);
    setForm({ name: '', rel: '', age: '', gender: '', distance: 'same_city', frequency: 'weekly', importance: 50, circle: 2, line: 'solid', arrow: 'both', support: [], customADL: '', customIADL: '', customMaintenance: '', customOther: '' });
    setShowAdd(false);
  };

  const renderLine = (m: EcogramMember) => {
    const sw = Math.max(2, m.importance / 25); // Line width based on importance (0-100 -> 2-4)
    const dash = m.lineStyle === 'dashed' ? '6,3' : undefined;
    const [mx, my] = [m.x * 4, m.y * 4];
    
    if (m.lineStyle === 'jagged') {
      const dx = mx - 200, dy = my - 200;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const steps = Math.floor(dist / 12);
      const px = -dy/dist*4, py = dx/dist*4;
      let d = 'M200,200';
      for (let i = 1; i <= steps; i++) {
        const t = i/steps, bx = 200+dx*t, by = 200+dy*t;
        d += i < steps ? ` L${bx + px*(i%2?1:-1)},${by + py*(i%2?1:-1)}` : ` L${mx},${my}`;
      }
      return <path key={`l-${m.id}`} d={d} stroke={m.color} strokeWidth={sw} fill="none" opacity={0.5}/>;
    }
    return <line key={`l-${m.id}`} x1="200" y1="200" x2={mx} y2={my} stroke={m.color} strokeWidth={sw} strokeDasharray={dash} opacity={0.5}/>;
  };

  const renderArrow = (m: EcogramMember) => {
    const [mx, my] = [m.x * 4, m.y * 4];
    const ang = Math.atan2(my-200, mx-200) * 180/Math.PI;
    const arrows = [];
    if (m.arrowDirection === 'to' || m.arrowDirection === 'both') {
      arrows.push(<polygon key={`a1-${m.id}`} points="0,-4 8,0 0,4" fill={m.color} 
        transform={`translate(${200+(mx-200)*0.35},${200+(my-200)*0.35}) rotate(${ang})`}/>);
    }
    if (m.arrowDirection === 'from' || m.arrowDirection === 'both') {
      arrows.push(<polygon key={`a2-${m.id}`} points="0,-4 8,0 0,4" fill={m.color}
        transform={`translate(${200+(mx-200)*0.65},${200+(my-200)*0.65}) rotate(${ang+180})`}/>);
    }
    return arrows;
  };

  const exp = () => {
    if (!svgRef.current) return;
    const svg = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 800;
    const img = new Image();
    img.onload = () => {
      canvas.getContext('2d')?.drawImage(img, 0, 0, 800, 800);
      const a = document.createElement('a');
      a.download = `ecogram-${new Date().toISOString().split('T')[0]}.png`;
      a.href = canvas.toDataURL();
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  };

  const sel = members.find(m => m.id === selected);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{color:'var(--color-green)'}}>
          {primaryCaregiverCode 
            ? (zh ? `${primaryCaregiverCode} 的照护网络` : `Care Network of ${primaryCaregiverCode}`)
            : (zh ? '我的照护网络' : 'My Care Network')}
        </h3>
        <p className="text-xs" style={{color:'var(--text-secondary)'}}>
          {!isPrimaryCaregiver && primaryCaregiverCode
            ? (zh ? '您正在查看主要照护者的照护网络' : 'Viewing the primary caregiver\'s care network')
            : (zh ? '拖拽调整位置，点击编辑详情' : 'Drag to adjust position, click to edit details')}
        </p>
      </div>

      <div className="relative mx-auto" style={{maxWidth:'420px'}}>
        <svg ref={svgRef} viewBox="0 0 400 400" className="w-full" style={{background:'var(--bg-primary)',borderRadius:'50%'}}>
          <circle cx="200" cy="200" r="176" fill="rgba(16,185,129,0.05)" stroke="var(--border-light)" strokeWidth="2" strokeDasharray="5,5"/>
          <circle cx="200" cy="200" r="124" fill="rgba(16,185,129,0.1)" stroke="var(--border-light)" strokeWidth="2" strokeDasharray="5,5"/>
          <circle cx="200" cy="200" r="68" fill="rgba(16,185,129,0.15)" stroke="var(--border-light)" strokeWidth="2" strokeDasharray="5,5"/>
          <text x="200" y="28" textAnchor="middle" fontSize="9" fill="var(--text-secondary)">{zh?'远: 偶尔支持':'Distant: sporadic support'}</text>
          <text x="200" y="82" textAnchor="middle" fontSize="9" fill="var(--text-secondary)">{zh?'中: 定期支持':'Medium: regular support'}</text>
          <text x="200" y="138" textAnchor="middle" fontSize="9" fill="var(--text-secondary)">{zh?'近: 必要支持':'Close: essential support'}</text>
          {members.map(renderLine)}
          {members.map(renderArrow)}
          <circle cx="200" cy="200" r="22" fill="var(--color-green)"/>
          <text x="200" y="205" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">{zh?'我':'You'}</text>
          {members.map(m => {
            const [mx, my] = [m.x*4, m.y*4];
            const isSel = selected === m.id;
            return (
              <g key={m.id} style={{cursor:'grab'}}
                onMouseDown={e => {
                  e.preventDefault();
                  setSelected(m.id);
                  const mv = (ev: MouseEvent) => drag(ev, m.id);
                  const up = () => { document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); };
                  document.addEventListener('mousemove',mv);
                  document.addEventListener('mouseup',up);
                }}
                onTouchStart={() => {
                  setSelected(m.id);
                  const mv = (ev: TouchEvent) => drag(ev, m.id);
                  const up = () => { document.removeEventListener('touchmove',mv); document.removeEventListener('touchend',up); };
                  document.addEventListener('touchmove',mv);
                  document.addEventListener('touchend',up);
                }}>
                <circle cx={mx} cy={my} r={isSel?26:22} fill={m.color} stroke={isSel?'var(--color-green)':'white'} strokeWidth={isSel?3:2}/>
                <text x={mx} y={my-3} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">{m.name.slice(0,5)}</text>
                <text x={mx} y={my+8} textAnchor="middle" fontSize="7" fill="white" opacity={0.9}>
                  {RELS.find(r=>r.v===m.relationship)?.[zh?'zh':'en']?.slice(0,4)}
                </text>
                {m.supportTypes.length > 0 && (
                  <text x={mx} y={my+32} textAnchor="middle" fontSize="8" fill="var(--text-secondary)">
                    {m.supportTypes.length} {zh?'项支持':'supports'}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button onClick={()=>setShowAdd(true)} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{background:'var(--color-green)'}}>{zh?'+ 添加成员':'+ Add Member'}</button>
        <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{background:'var(--color-green)'}}>{saving?(zh?'保存中...':'Saving...'):(zh?'保存':'Save')}</button>
        <button onClick={exp} className="px-4 py-2 rounded-lg text-sm font-medium" style={{border:'1px solid var(--border-light)',color:'var(--text-primary)'}}>{zh?'导出':'Export'}</button>
      </div>


      {/* Selected Member Edit Panel */}
      {sel && (
        <div className="rounded-xl border overflow-hidden" style={{borderColor:'var(--border-light)',background:'var(--bg-secondary)'}}>
          {/* Header with name, hide and delete */}
          <div className="flex justify-between items-center p-3 border-b" style={{borderColor:'var(--border-light)',background:'var(--bg-primary)'}}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{background:sel.color}}/>
              <span className="font-medium" style={{color:'var(--text-primary)'}}>{sel.name}</span>
              {sel.age && <span className="text-xs" style={{color:'var(--text-secondary)'}}>({sel.age}{zh?'岁':' yrs'})</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setSelected(null)} className="px-2 py-1 rounded text-xs" style={{background:'var(--bg-secondary)',color:'var(--text-secondary)'}}>
                {zh?'隐藏':'Hide'} ▲
              </button>
              <button onClick={()=>{setMembers(p=>p.filter(m=>m.id!==sel.id));setSelected(null);}} className="px-2 py-1 rounded text-xs bg-red-100 text-red-600">
                {zh?'删除':'Delete'}
              </button>
            </div>
          </div>
          
          {/* Editable content */}
          <div className="p-4 space-y-3">
          
          {/* Reminder about existing participants */}
          <div className="p-2 rounded-lg text-xs" style={{background:'rgba(16,185,129,0.1)',color:'var(--color-green)'}}>
            {zh 
              ? '提示：如果此网络成员已加入研究（有PO编号），可跳过这些问题。' 
              : 'Tip: You can skip these questions if this network member has already joined the research (has a PO code).'}
          </div>
          
          {/* Age & Gender */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs" style={{color:'var(--text-secondary)'}}>{zh?'年龄':'Age'}:</label>
              <input type="number" value={sel.age||''} onChange={e=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,age:e.target.value?parseInt(e.target.value):undefined}:m))} 
                className="w-16 px-2 py-1 rounded text-xs border" style={{background:'var(--bg-primary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}} placeholder="--"/>
            </div>
            <div className="flex items-center gap-2" style={{width:'80px'}}>
              <label className="text-xs" style={{color:'var(--text-secondary)'}}>{zh?'性别':'Gender'}:</label>
              <IOSDropdown
                value={sel.gender||''}
                onChange={(value)=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,gender:value||undefined}:m))}
                placeholder="--"
                options={[
                  { value: 'male', label: zh?'男':'M' },
                  { value: 'female', label: zh?'女':'F' },
                  { value: 'other', label: zh?'其他':'Other' }
                ]}
              />
            </div>
          </div>
          
          {/* Relationship Type */}
          <div>
            <label className="text-xs block mb-1" style={{color:'var(--text-secondary)'}}>{zh?'关系类型':'Relationship'}</label>
            <IOSDropdown
              value={sel.relationship}
              onChange={(value)=>{
                const rel = RELS.find(r=>r.v===value);
                setMembers(p=>p.map(m=>m.id===sel.id?{...m,relationship:value,color:rel?.c||'#6B7280'}:m));
              }}
              placeholder={zh?'选择关系':'Select'}
              options={RELS.map(r=>({ value: r.v, label: zh?r.zh:r.en }))}
            />
          </div>
          
          {/* Support Direction - Under Relationship */}
          <div>
            <div className="grid grid-cols-3 gap-1">
              {(['to','from','both'] as const).map(ad=>(
                <button key={ad} onClick={()=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,arrowDirection:ad}:m))}
                  className={`py-1 px-2 rounded text-xs ${sel.arrowDirection===ad?'ring-2':''}`}
                  style={{background:sel.arrowDirection===ad?'var(--color-green)':'var(--bg-primary)',color:sel.arrowDirection===ad?'white':'var(--text-primary)'}}>
                  {ad==='to'?'→me':ad==='from'?'me→':'me↔'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Geographical Distance - Expanded */}
          <div>
            <label className="text-xs block mb-1" style={{color:'var(--text-secondary)'}}>{zh?'地理距离':'Distance'}</label>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {([
                {v:'same_home',en:'Same Home',zh:'同住'},
                {v:'same_community',en:'Same Community',zh:'同社区'},
                {v:'same_district',en:'Same District',zh:'同区'},
                {v:'same_city',en:'Same City',zh:'同城'},
                {v:'different_city',en:'Diff City',zh:'异地'},
                {v:'abroad',en:'Abroad',zh:'国外'}
              ] as const).map(d=>(
                <button key={d.v} onClick={()=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,distance:d.v}:m))}
                  className={`py-1 rounded text-xs ${sel.distance===d.v?'ring-2':''}`}
                  style={{background:sel.distance===d.v?'var(--color-green)':'var(--bg-primary)',color:sel.distance===d.v?'white':'var(--text-primary)'}}>
                  {zh?d.zh:d.en}
                </button>
              ))}
            </div>
            <input 
              type="text" 
              value={sel.customDistance || ''} 
              onChange={e=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,customDistance:e.target.value}:m))}
              placeholder={zh?'详细距离信息（如：步行5分钟、开车30分钟等）':'Distance details (e.g., 5 min walk, 30 min drive)'}
              className="w-full px-2 py-1 rounded text-xs border" 
              style={{background:'var(--bg-primary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}}
            />
          </div>
          
          {/* Frequency */}
          <div>
            <label className="text-xs block mb-1" style={{color:'var(--text-secondary)'}}>{zh?'支持频率':'Frequency'}</label>
            <div className="grid grid-cols-4 gap-1">
              {([{v:'daily',en:'Daily',zh:'每天'},{v:'weekly',en:'Weekly',zh:'每周'},{v:'monthly',en:'Monthly',zh:'每月'},{v:'occasionally',en:'Occasionally',zh:'偶尔'}] as const).map(f=>(
                <button key={f.v} onClick={()=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,frequency:f.v}:m))}
                  className={`py-1 rounded text-xs ${sel.frequency===f.v?'ring-2':''}`}
                  style={{background:sel.frequency===f.v?'var(--color-green)':'var(--bg-primary)',color:sel.frequency===f.v?'white':'var(--text-primary)'}}>
                  {zh?f.zh:f.en}
                </button>
              ))}
            </div>
          </div>
          
          {/* Support Types - Each category separate with own text input */}
          <div className="space-y-3">
            <label className="text-xs block" style={{color:'var(--text-secondary)'}}>{zh?'支持类型（可多选）':'Support Types (multiple)'}</label>
            
            {/* ADL - Multi-select subcategories */}
            <div className="p-2 rounded border" style={{borderColor:'var(--border-light)',background:'var(--bg-secondary)'}}>
              <span className="text-xs font-medium block mb-1" style={{color:'var(--color-green)'}}>ADL</span>
              <div className="flex flex-wrap gap-1 mb-1">
                {ADL_TASKS.map(t=>(
                  <button key={t.v} onClick={()=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,supportTypes:m.supportTypes.includes(t.v)?m.supportTypes.filter(x=>x!==t.v):[...m.supportTypes,t.v]}:m))}
                    className={`py-0.5 px-2 rounded text-xs border ${sel.supportTypes.includes(t.v)?'ring-1':''}`}
                    style={{background:sel.supportTypes.includes(t.v)?'var(--color-green)':'var(--bg-primary)',color:sel.supportTypes.includes(t.v)?'white':'var(--text-primary)',borderColor:'var(--border-light)'}}>
                    {zh?t.zh:t.en}
                  </button>
                ))}
              </div>
              <input type="text" value={sel.customADL || ''} onChange={e=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,customADL:e.target.value}:m))}
                placeholder={zh?'其他ADL...':'Other ADL...'} className="w-full px-2 py-1 rounded text-xs border" 
                style={{background:'var(--bg-primary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}}/>
            </div>
            
            {/* IADL - Multi-select subcategories */}
            <div className="p-2 rounded border" style={{borderColor:'var(--border-light)',background:'var(--bg-secondary)'}}>
              <span className="text-xs font-medium block mb-1" style={{color:'var(--color-green)'}}>IADL</span>
              <div className="flex flex-wrap gap-1 mb-1">
                {IADL_TASKS.map(t=>(
                  <button key={t.v} onClick={()=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,supportTypes:m.supportTypes.includes(t.v)?m.supportTypes.filter(x=>x!==t.v):[...m.supportTypes,t.v]}:m))}
                    className={`py-0.5 px-2 rounded text-xs border ${sel.supportTypes.includes(t.v)?'ring-1':''}`}
                    style={{background:sel.supportTypes.includes(t.v)?'var(--color-green)':'var(--bg-primary)',color:sel.supportTypes.includes(t.v)?'white':'var(--text-primary)',borderColor:'var(--border-light)'}}>
                    {zh?t.zh:t.en}
                  </button>
                ))}
              </div>
              <input type="text" value={sel.customIADL || ''} onChange={e=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,customIADL:e.target.value}:m))}
                placeholder={zh?'其他IADL...':'Other IADL...'} className="w-full px-2 py-1 rounded text-xs border" 
                style={{background:'var(--bg-primary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}}/>
            </div>
            
            {/* Maintenance - Multi-select subcategories */}
            <div className="p-2 rounded border" style={{borderColor:'var(--border-light)',background:'var(--bg-secondary)'}}>
              <span className="text-xs font-medium block mb-1" style={{color:'var(--color-green)'}}>{zh?'维护性支持':'Maintenance'}</span>
              <div className="flex flex-wrap gap-1 mb-1">
                {MAINT_TASKS.map(t=>(
                  <button key={t.v} onClick={()=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,supportTypes:m.supportTypes.includes(t.v)?m.supportTypes.filter(x=>x!==t.v):[...m.supportTypes,t.v]}:m))}
                    className={`py-0.5 px-2 rounded text-xs border ${sel.supportTypes.includes(t.v)?'ring-1':''}`}
                    style={{background:sel.supportTypes.includes(t.v)?'var(--color-green)':'var(--bg-primary)',color:sel.supportTypes.includes(t.v)?'white':'var(--text-primary)',borderColor:'var(--border-light)'}}>
                    {zh?t.zh:t.en}
                  </button>
                ))}
              </div>
              <input type="text" value={sel.customMaintenance || ''} onChange={e=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,customMaintenance:e.target.value}:m))}
                placeholder={zh?'其他维护性支持...':'Other Maintenance...'} className="w-full px-2 py-1 rounded text-xs border" 
                style={{background:'var(--bg-primary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}}/>
            </div>
            
            {/* Other - Just text input */}
            <div className="p-2 rounded border" style={{borderColor:'var(--border-light)',background:'var(--bg-secondary)'}}>
              <span className="text-xs font-medium block mb-1" style={{color:'var(--color-green)'}}>{zh?'其他':'Other'}</span>
              <input type="text" value={sel.customOther || ''} onChange={e=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,customOther:e.target.value}:m))}
                placeholder={zh?'其他支持类型...':'Other support types...'} className="w-full px-2 py-1 rounded text-xs border" 
                style={{background:'var(--bg-primary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}}/>
            </div>
          </div>
          
          {/* Importance */}
          <div>
            <label className="text-xs" style={{color:'var(--text-secondary)'}}>{zh?'重要程度':'Importance'}: {sel.importance}/100</label>
            <input type="range" min="0" max="100" value={sel.importance} onChange={e=>setMembers(p=>p.map(m=>m.id===sel.id?{...m,importance:+e.target.value}:m))} className="w-full appearance-none h-2 rounded-full" style={{accentColor:'var(--color-green)',background:'linear-gradient(to right, var(--color-green) ' + sel.importance + '%, #e5e7eb ' + sel.importance + '%)'}}/>
          </div>
          
          {/* Save Button for this member */}
          <div className="pt-2 border-t" style={{borderColor:'var(--border-light)'}}>
            <button onClick={save} disabled={saving} className="w-full py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{background:'var(--color-green)'}}>
              {saving ? (zh?'保存中...':'Saving...') : (zh?'保存此成员':'Save Member')}
            </button>
          </div>
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={()=>setShowAdd(false)}>
          <div className="w-11/12 max-w-md bg-white rounded-2xl shadow-2xl flex flex-col" style={{maxHeight:'70vh'}} onClick={e=>e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h4 className="text-lg font-bold text-gray-900">{zh?'添加网络成员':'Add Network Member'}</h4>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
            
            {/* Name, Age & Gender */}
            <div className="flex gap-2">
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={zh?'姓名':'Name'} className="flex-1 px-3 py-2 rounded-lg border text-sm" style={{background:'var(--bg-secondary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}}/>
              <input type="number" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder={zh?'年龄':'Age'} className="w-16 px-3 py-2 rounded-lg border text-sm" style={{background:'var(--bg-secondary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}}/>
              <div style={{width:'80px'}}>
                <IOSDropdown
                  value={form.gender}
                  onChange={(value)=>setForm({...form,gender:value})}
                  placeholder={zh?'性别':'Gender'}
                  options={[
                    { value: 'male', label: zh?'男':'M' },
                    { value: 'female', label: zh?'女':'F' },
                    { value: 'other', label: zh?'其他':'Other' }
                  ]}
                />
              </div>
            </div>
            
            {/* Relationship */}
            <IOSDropdown
              value={form.rel}
              onChange={(value)=>setForm({...form,rel:value})}
              placeholder={zh?'选择关系':'Select relationship'}
              options={RELS.map(r=>({ value: r.v, label: zh?r.zh:r.en }))}
            />
            
            {/* Geographical Distance */}
            <div>
              <label className="text-xs block mb-1" style={{color:'var(--text-secondary)'}}>{zh?'地理距离':'Geographical Distance'}</label>
              <div className="grid grid-cols-3 gap-1">
                {([
                  {v:'same_home',en:'Same Home',zh:'同住'},
                  {v:'same_community',en:'Same Community',zh:'同社区'},
                  {v:'same_district',en:'Same District',zh:'同区'},
                  {v:'same_city',en:'Same City',zh:'同城'},
                  {v:'different_city',en:'Diff City',zh:'异地'},
                  {v:'abroad',en:'Abroad',zh:'国外'}
                ] as const).map(d=>(
                  <button key={d.v} onClick={()=>setForm({...form,distance:d.v})} className={`py-1.5 rounded text-xs ${form.distance===d.v?'ring-2':''}`}
                    style={{background:form.distance===d.v?'var(--color-green)':'var(--bg-secondary)',color:form.distance===d.v?'white':'var(--text-primary)'}}>
                    {zh?d.zh:d.en}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Frequency of Support */}
            <div>
              <label className="text-xs block mb-1" style={{color:'var(--text-secondary)'}}>{zh?'支持频率':'Frequency of Support'}</label>
              <div className="grid grid-cols-4 gap-1">
                {([{v:'daily',en:'Daily',zh:'每天'},{v:'weekly',en:'Weekly',zh:'每周'},{v:'monthly',en:'Monthly',zh:'每月'},{v:'occasionally',en:'Occasionally',zh:'偶尔'}] as const).map(f=>(
                  <button key={f.v} onClick={()=>setForm({...form,frequency:f.v})} className={`py-1.5 rounded text-xs ${form.frequency===f.v?'ring-2':''}`}
                    style={{background:form.frequency===f.v?'var(--color-green)':'var(--bg-secondary)',color:form.frequency===f.v?'white':'var(--text-primary)'}}>
                    {zh?f.zh:f.en}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Importance (0-100) */}
            <div>
              <label className="text-xs block mb-1" style={{color:'var(--text-secondary)'}}>{zh?'重要程度':'Importance'}: {form.importance}/100</label>
              <input type="range" min="0" max="100" value={form.importance} onChange={e=>setForm({...form,importance:+e.target.value})} className="w-full appearance-none h-2 rounded-full" style={{accentColor:'var(--color-green)',background:'linear-gradient(to right, var(--color-green) ' + form.importance + '%, #e5e7eb ' + form.importance + '%)'}}/>
            </div>
            
            {/* Closeness (Circle) */}
            <div>
              <label className="text-xs block mb-1" style={{color:'var(--text-secondary)'}}>{zh?'亲密程度':'Closeness'}</label>
              <div className="flex gap-2">
                {([1,2,3] as const).map(c=>(
                  <button key={c} onClick={()=>setForm({...form,circle:c})} className={`flex-1 py-1.5 rounded text-xs ${form.circle===c?'ring-2':''}`}
                    style={{background:form.circle===c?'var(--color-green)':'var(--bg-secondary)',color:form.circle===c?'white':'var(--text-primary)'}}>
                    {c===1?(zh?'近':'Close'):c===2?(zh?'中':'Medium'):(zh?'远':'Distant')}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Relationship Quality */}
            <div>
              <label className="text-xs block mb-1" style={{color:'var(--text-secondary)'}}>{zh?'关系质量':'Relationship Quality'}</label>
              <div className="flex gap-2">
                {(['solid','dashed','jagged'] as const).map(ls=>(
                  <button key={ls} onClick={()=>setForm({...form,line:ls})} className={`flex-1 py-1.5 rounded text-xs ${form.line===ls?'ring-2':''}`}
                    style={{background:form.line===ls?(ls==='jagged'?'#EF4444':ls==='dashed'?'#F59E0B':'var(--color-green)'):'var(--bg-secondary)',color:form.line===ls?'white':'var(--text-primary)'}}>
                    {ls==='solid'?(zh?'良好':'Strong'):ls==='dashed'?(zh?'一般':'Weak'):(zh?'紧张':'Stress')}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Support Direction */}
            <div>
              <div className="grid grid-cols-3 gap-2">
                {(['to','from','both'] as const).map(ad=>(
                  <button key={ad} onClick={()=>setForm({...form,arrow:ad})} className={`py-1.5 rounded text-xs ${form.arrow===ad?'ring-2':''}`}
                    style={{background:form.arrow===ad?'var(--color-green)':'var(--bg-secondary)',color:form.arrow===ad?'white':'var(--text-primary)'}}>
                    {ad==='to'?'→me':ad==='from'?'me→':'me↔'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Support Types - Multi-select subcategories */}
            <div className="space-y-2">
              <label className="text-xs block" style={{color:'var(--text-secondary)'}}>{zh?'支持类型':'Support Types'}</label>
              
              {/* ADL */}
              <div className="p-2 rounded border" style={{borderColor:'var(--border-light)',background:'var(--bg-secondary)'}}>
                <span className="text-xs font-medium" style={{color:'var(--color-green)'}}>ADL</span>
                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                  {ADL_TASKS.map(t=>(
                    <button key={t.v} type="button" onClick={()=>setForm({...form,support:form.support.includes(t.v)?form.support.filter(x=>x!==t.v):[...form.support,t.v]})}
                      className={`py-1 px-2 rounded text-xs border ${form.support.includes(t.v)?'ring-1':''}`}
                      style={{background:form.support.includes(t.v)?'var(--color-green)':'var(--bg-primary)',color:form.support.includes(t.v)?'white':'var(--text-primary)',borderColor:'var(--border-light)'}}>
                      {zh?t.zh:t.en}
                    </button>
                  ))}
                </div>
                <input type="text" value={form.customADL} onChange={e=>setForm({...form,customADL:e.target.value})}
                  placeholder={zh?'其他ADL...':'Other ADL...'} className="w-full px-2 py-1 rounded text-xs border" 
                  style={{background:'var(--bg-primary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}}/>
              </div>
              
              {/* IADL */}
              <div className="p-2 rounded border" style={{borderColor:'var(--border-light)',background:'var(--bg-secondary)'}}>
                <span className="text-xs font-medium" style={{color:'var(--color-green)'}}>IADL</span>
                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                  {IADL_TASKS.map(t=>(
                    <button key={t.v} type="button" onClick={()=>setForm({...form,support:form.support.includes(t.v)?form.support.filter(x=>x!==t.v):[...form.support,t.v]})}
                      className={`py-1 px-2 rounded text-xs border ${form.support.includes(t.v)?'ring-1':''}`}
                      style={{background:form.support.includes(t.v)?'var(--color-green)':'var(--bg-primary)',color:form.support.includes(t.v)?'white':'var(--text-primary)',borderColor:'var(--border-light)'}}>
                      {zh?t.zh:t.en}
                    </button>
                  ))}
                </div>
                <input type="text" value={form.customIADL} onChange={e=>setForm({...form,customIADL:e.target.value})}
                  placeholder={zh?'其他IADL...':'Other IADL...'} className="w-full px-2 py-1 rounded text-xs border" 
                  style={{background:'var(--bg-primary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}}/>
              </div>
              
              {/* Maintenance */}
              <div className="p-2 rounded border" style={{borderColor:'var(--border-light)',background:'var(--bg-secondary)'}}>
                <span className="text-xs font-medium" style={{color:'var(--color-green)'}}>{zh?'维护性支持':'Maintenance'}</span>
                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                  {MAINT_TASKS.map(t=>(
                    <button key={t.v} type="button" onClick={()=>setForm({...form,support:form.support.includes(t.v)?form.support.filter(x=>x!==t.v):[...form.support,t.v]})}
                      className={`py-1 px-2 rounded text-xs border ${form.support.includes(t.v)?'ring-1':''}`}
                      style={{background:form.support.includes(t.v)?'var(--color-green)':'var(--bg-primary)',color:form.support.includes(t.v)?'white':'var(--text-primary)',borderColor:'var(--border-light)'}}>
                      {zh?t.zh:t.en}
                    </button>
                  ))}
                </div>
                <input type="text" value={form.customMaintenance} onChange={e=>setForm({...form,customMaintenance:e.target.value})}
                  placeholder={zh?'其他维护性支持...':'Other Maintenance...'} className="w-full px-2 py-1 rounded text-xs border" 
                  style={{background:'var(--bg-primary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}}/>
              </div>
              
              {/* Other - General catch-all */}
              <div className="p-2 rounded border" style={{borderColor:'var(--border-light)',background:'var(--bg-secondary)'}}>
                <span className="text-xs font-medium" style={{color:'var(--color-green)'}}>{zh?'其他':'Other'}</span>
                <input type="text" value={form.customOther} onChange={e=>setForm({...form,customOther:e.target.value})}
                  placeholder={zh?'其他支持类型...':'Other support types...'} className="w-full px-2 py-1 rounded text-xs border mt-1" 
                  style={{background:'var(--bg-primary)',borderColor:'var(--border-light)',color:'var(--text-primary)'}}/>
              </div>
            </div>
            
            </div>
            {/* Action Buttons - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0 bg-white">
              <button onClick={()=>setShowAdd(false)} className="flex-1 py-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">{zh?'取消':'Cancel'}</button>
              <button onClick={add} disabled={!form.name||!form.rel} className="flex-1 py-3 rounded-lg text-sm font-medium text-white disabled:opacity-50 bg-emerald-500">{zh?'添加':'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
