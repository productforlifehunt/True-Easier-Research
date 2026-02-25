import React, { useState } from 'react';
import { Home, Trees, Building2, Hospital, ShoppingCart, Pill, Car, Heart, Users, MapPin, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

// Simple cartoonish context map showing caregiving locations
// Inspired by Boots et al. context mapping methodology

interface LocationActivity {
  id: string;
  activity: string;
  challenges: string;
  peopleInvolved: string;
  toolsNeeded: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasionally';
}

interface Location {
  id: string;
  name: string;
  type: 'home' | 'nearby' | 'remote';
  icon: string;
  color: string;
  activities: LocationActivity[];
  customName?: string;
}

interface Props {
  language: string;
  onSave?: (locations: Location[]) => void;
  initialData?: Location[];
}

const DEFAULT_LOCATIONS: Location[] = [
  // HOME - Center
  { id: 'home', name: 'Home', type: 'home', icon: '🏠', color: '#10B981', activities: [] },
  
  // NEARBY - Inner ring
  { id: 'park', name: 'Park / Outdoor', type: 'nearby', icon: '🌳', color: '#84CC16', activities: [] },
  { id: 'pharmacy', name: 'Pharmacy', type: 'nearby', icon: '💊', color: '#F97316', activities: [] },
  { id: 'grocery', name: 'Grocery / Market', type: 'nearby', icon: '🛒', color: '#3B82F6', activities: [] },
  { id: 'clinic', name: 'Local Clinic', type: 'nearby', icon: '🏥', color: '#EF4444', activities: [] },
  { id: 'community', name: 'Community Center', type: 'nearby', icon: '🏛️', color: '#8B5CF6', activities: [] },
  { id: 'neighbor', name: 'Neighbor\'s Home', type: 'nearby', icon: '🏡', color: '#EC4899', activities: [] },
  
  // REMOTE - Outer ring
  { id: 'hospital', name: 'Hospital', type: 'remote', icon: '🏨', color: '#DC2626', activities: [] },
  { id: 'specialist', name: 'Specialist / Doctor', type: 'remote', icon: '👨‍⚕️', color: '#7C3AED', activities: [] },
  { id: 'family', name: 'Family Member\'s Home', type: 'remote', icon: '👨‍👩‍👧', color: '#06B6D4', activities: [] },
  { id: 'daycare', name: 'Day Care Center', type: 'remote', icon: '🏢', color: '#F59E0B', activities: [] },
];

export default function ContextMap({ language, onSave, initialData }: Props) {
  const [locations, setLocations] = useState<Location[]>(initialData || DEFAULT_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [expandedView, setExpandedView] = useState(false);
  
  const [newActivity, setNewActivity] = useState<Partial<LocationActivity>>({
    activity: '',
    challenges: '',
    peopleInvolved: '',
    toolsNeeded: '',
    frequency: 'weekly'
  });

  const zh = language === 'zh';
  
  const t = {
    title: zh ? '照护活动地点图' : 'Caregiving Context Map',
    subtitle: zh ? '点击地点查看和添加照护活动' : 'Click locations to view and add caregiving activities',
    home: zh ? '家' : 'Home',
    nearby: zh ? '附近' : 'Nearby',
    remote: zh ? '远处' : 'Remote',
    addActivity: zh ? '添加活动' : 'Add Activity',
    activity: zh ? '活动描述' : 'Activity',
    challenges: zh ? '遇到的挑战' : 'Challenges',
    people: zh ? '涉及的人' : 'People Involved',
    tools: zh ? '需要的工具/资源' : 'Tools/Resources Needed',
    frequency: zh ? '频率' : 'Frequency',
    daily: zh ? '每天' : 'Daily',
    weekly: zh ? '每周' : 'Weekly',
    monthly: zh ? '每月' : 'Monthly',
    occasionally: zh ? '偶尔' : 'Occasionally',
    save: zh ? '保存' : 'Save',
    cancel: zh ? '取消' : 'Cancel',
    noActivities: zh ? '暂无活动记录' : 'No activities recorded',
    clickToAdd: zh ? '点击添加' : 'Click to add',
    expand: zh ? '展开详情' : 'Expand Details',
    collapse: zh ? '收起' : 'Collapse',
    locationNames: {
      home: zh ? '家' : 'Home',
      park: zh ? '公园/户外' : 'Park / Outdoor',
      pharmacy: zh ? '药房' : 'Pharmacy',
      grocery: zh ? '超市/市场' : 'Grocery / Market',
      clinic: zh ? '社区诊所' : 'Local Clinic',
      community: zh ? '社区中心' : 'Community Center',
      neighbor: zh ? '邻居家' : 'Neighbor\'s Home',
      hospital: zh ? '医院' : 'Hospital',
      specialist: zh ? '专科医生' : 'Specialist',
      family: zh ? '亲属家' : 'Family\'s Home',
      daycare: zh ? '日托中心' : 'Day Care',
    } as Record<string, string>
  };

  const selectedLoc = locations.find(l => l.id === selectedLocation);

  const addActivity = () => {
    if (!selectedLocation || !newActivity.activity) return;
    
    const activity: LocationActivity = {
      id: Date.now().toString(),
      activity: newActivity.activity || '',
      challenges: newActivity.challenges || '',
      peopleInvolved: newActivity.peopleInvolved || '',
      toolsNeeded: newActivity.toolsNeeded || '',
      frequency: newActivity.frequency || 'weekly'
    };
    
    setLocations(prev => prev.map(loc => 
      loc.id === selectedLocation 
        ? { ...loc, activities: [...loc.activities, activity] }
        : loc
    ));
    
    setNewActivity({ activity: '', challenges: '', peopleInvolved: '', toolsNeeded: '', frequency: 'weekly' });
    setShowAddActivity(false);
  };

  const removeActivity = (locationId: string, activityId: string) => {
    setLocations(prev => prev.map(loc =>
      loc.id === locationId
        ? { ...loc, activities: loc.activities.filter(a => a.id !== activityId) }
        : loc
    ));
  };

  // Calculate positions for the cartoonish map
  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    };
  };

  const homeLocation = locations.find(l => l.type === 'home');
  const nearbyLocations = locations.filter(l => l.type === 'nearby');
  const remoteLocations = locations.filter(l => l.type === 'remote');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-green)' }}>
          {t.title}
        </h3>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {t.subtitle}
        </p>
      </div>

      {/* Cartoonish Map SVG */}
      <div className="relative mx-auto" style={{ maxWidth: '400px' }}>
        <svg viewBox="0 0 100 100" className="w-full" style={{ background: 'var(--bg-primary)', borderRadius: '16px' }}>
          {/* Background circles - like a target/radar */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="2,2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="2,2" />
          <circle cx="50" cy="50" r="15" fill="rgba(16,185,129,0.1)" stroke="var(--border-light)" strokeWidth="0.5" />
          
          {/* Zone labels */}
          <text x="50" y="8" textAnchor="middle" fontSize="3" fill="var(--text-secondary)">{t.remote}</text>
          <text x="50" y="22" textAnchor="middle" fontSize="3" fill="var(--text-secondary)">{t.nearby}</text>
          
          {/* Connecting lines from home to locations */}
          {nearbyLocations.map((loc, i) => {
            const pos = getPosition(i, nearbyLocations.length, 25);
            return (
              <line
                key={`line-${loc.id}`}
                x1="50" y1="50"
                x2={pos.x} y2={pos.y}
                stroke={loc.activities.length > 0 ? loc.color : 'var(--border-light)'}
                strokeWidth={loc.activities.length > 0 ? 0.8 : 0.3}
                strokeDasharray={loc.activities.length > 0 ? undefined : '1,1'}
                opacity={0.5}
              />
            );
          })}
          
          {remoteLocations.map((loc, i) => {
            const pos = getPosition(i, remoteLocations.length, 40);
            return (
              <line
                key={`line-${loc.id}`}
                x1="50" y1="50"
                x2={pos.x} y2={pos.y}
                stroke={loc.activities.length > 0 ? loc.color : 'var(--border-light)'}
                strokeWidth={loc.activities.length > 0 ? 0.8 : 0.3}
                strokeDasharray="2,1"
                opacity={0.4}
              />
            );
          })}

          {/* Remote locations - outer ring */}
          {remoteLocations.map((loc, i) => {
            const pos = getPosition(i, remoteLocations.length, 40);
            const isSelected = selectedLocation === loc.id;
            return (
              <g
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 7 : 6}
                  fill="white"
                  stroke={isSelected ? 'var(--color-green)' : loc.color}
                  strokeWidth={isSelected ? 1 : 0.5}
                />
                <text x={pos.x} y={pos.y + 1.5} textAnchor="middle" fontSize="5">
                  {loc.icon}
                </text>
                {loc.activities.length > 0 && (
                  <circle cx={pos.x + 4} cy={pos.y - 4} r="2" fill="var(--color-green)" />
                )}
                {loc.activities.length > 0 && (
                  <text x={pos.x + 4} y={pos.y - 3} textAnchor="middle" fontSize="2" fill="white" fontWeight="bold">
                    {loc.activities.length}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nearby locations - inner ring */}
          {nearbyLocations.map((loc, i) => {
            const pos = getPosition(i, nearbyLocations.length, 25);
            const isSelected = selectedLocation === loc.id;
            return (
              <g
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 7 : 6}
                  fill="white"
                  stroke={isSelected ? 'var(--color-green)' : loc.color}
                  strokeWidth={isSelected ? 1 : 0.5}
                />
                <text x={pos.x} y={pos.y + 1.5} textAnchor="middle" fontSize="5">
                  {loc.icon}
                </text>
                {loc.activities.length > 0 && (
                  <circle cx={pos.x + 4} cy={pos.y - 4} r="2" fill="var(--color-green)" />
                )}
                {loc.activities.length > 0 && (
                  <text x={pos.x + 4} y={pos.y - 3} textAnchor="middle" fontSize="2" fill="white" fontWeight="bold">
                    {loc.activities.length}
                  </text>
                )}
              </g>
            );
          })}

          {/* Home - center (larger) */}
          {homeLocation && (
            <g
              onClick={() => setSelectedLocation(homeLocation.id)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx="50"
                cy="50"
                r={selectedLocation === homeLocation.id ? 12 : 10}
                fill={homeLocation.color}
                stroke={selectedLocation === homeLocation.id ? 'white' : 'none'}
                strokeWidth="1"
              />
              <text x="50" y="52" textAnchor="middle" fontSize="8">
                🏠
              </text>
              {homeLocation.activities.length > 0 && (
                <>
                  <circle cx="58" cy="42" r="3" fill="white" />
                  <text x="58" y="43.5" textAnchor="middle" fontSize="3" fill="var(--color-green)" fontWeight="bold">
                    {homeLocation.activities.length}
                  </text>
                </>
              )}
            </g>
          )}

          {/* Simple decorations - roads/paths */}
          <path d="M50 62 L50 95" stroke="var(--border-light)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <path d="M62 50 L95 50" stroke="var(--border-light)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          
          {/* Little trees decoration */}
          <text x="85" y="35" fontSize="4" opacity="0.4">🌲</text>
          <text x="15" y="70" fontSize="4" opacity="0.4">🌳</text>
          <text x="80" y="75" fontSize="3" opacity="0.3">🚗</text>
        </svg>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>🏠 = {t.home}</span>
          <span>○ = {t.nearby}</span>
          <span>◯ = {t.remote}</span>
        </div>
      </div>

      {/* Location List (expandable) */}
      <button
        onClick={() => setExpandedView(!expandedView)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm"
        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
      >
        {expandedView ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expandedView ? t.collapse : t.expand}
      </button>

      {expandedView && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {locations.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc.id)}
              className={`p-2 rounded-lg text-xs text-left transition-all ${selectedLocation === loc.id ? 'ring-2' : ''}`}
              style={{
                background: selectedLocation === loc.id ? 'var(--color-green)' : 'var(--bg-secondary)',
                color: selectedLocation === loc.id ? 'white' : 'var(--text-primary)'
              }}
            >
              <span className="text-base mr-1">{loc.icon}</span>
              <span>{t.locationNames[loc.id] || loc.name}</span>
              {loc.activities.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs" style={{
                  background: selectedLocation === loc.id ? 'white' : 'var(--color-green)',
                  color: selectedLocation === loc.id ? 'var(--color-green)' : 'white'
                }}>
                  {loc.activities.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected Location Panel */}
      {selectedLoc && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-secondary)' }}>
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: 'var(--border-light)', background: selectedLoc.color }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedLoc.icon}</span>
              <span className="font-medium text-white">{t.locationNames[selectedLoc.id] || selectedLoc.name}</span>
            </div>
            <button onClick={() => setSelectedLocation(null)} className="p-1 rounded bg-white/20 text-white">
              <X size={16} />
            </button>
          </div>

          {/* Activities List */}
          <div className="p-3 space-y-2">
            {selectedLoc.activities.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                {t.noActivities}
              </p>
            ) : (
              selectedLoc.activities.map(activity => (
                <div key={activity.id} className="p-3 rounded-lg bg-white border" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{activity.activity}</span>
                    <button
                      onClick={() => removeActivity(selectedLoc.id, activity.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {activity.challenges && (
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <strong>{t.challenges}:</strong> {activity.challenges}
                    </p>
                  )}
                  {activity.peopleInvolved && (
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <strong>{t.people}:</strong> {activity.peopleInvolved}
                    </p>
                  )}
                  {activity.toolsNeeded && (
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <strong>{t.tools}:</strong> {activity.toolsNeeded}
                    </p>
                  )}
                  <span className="inline-block px-2 py-0.5 rounded text-xs" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    {activity.frequency === 'daily' ? t.daily : activity.frequency === 'weekly' ? t.weekly : activity.frequency === 'monthly' ? t.monthly : t.occasionally}
                  </span>
                </div>
              ))
            )}

            {/* Add Activity Button/Form */}
            {!showAddActivity ? (
              <button
                onClick={() => setShowAddActivity(true)}
                className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: 'var(--color-green)', color: 'white' }}
              >
                <Plus size={16} />
                {t.addActivity}
              </button>
            ) : (
              <div className="p-3 rounded-lg border space-y-3" style={{ borderColor: 'var(--color-green)', background: 'white' }}>
                <input
                  type="text"
                  value={newActivity.activity}
                  onChange={e => setNewActivity({ ...newActivity, activity: e.target.value })}
                  placeholder={t.activity}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{ borderColor: 'var(--border-light)' }}
                />
                <textarea
                  value={newActivity.challenges}
                  onChange={e => setNewActivity({ ...newActivity, challenges: e.target.value })}
                  placeholder={t.challenges}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{ borderColor: 'var(--border-light)' }}
                  rows={2}
                />
                <input
                  type="text"
                  value={newActivity.peopleInvolved}
                  onChange={e => setNewActivity({ ...newActivity, peopleInvolved: e.target.value })}
                  placeholder={t.people}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{ borderColor: 'var(--border-light)' }}
                />
                <input
                  type="text"
                  value={newActivity.toolsNeeded}
                  onChange={e => setNewActivity({ ...newActivity, toolsNeeded: e.target.value })}
                  placeholder={t.tools}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{ borderColor: 'var(--border-light)' }}
                />
                <div>
                  <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>{t.frequency}</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['daily', 'weekly', 'monthly', 'occasionally'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setNewActivity({ ...newActivity, frequency: f })}
                        className={`py-1 rounded text-xs ${newActivity.frequency === f ? 'ring-2' : ''}`}
                        style={{
                          background: newActivity.frequency === f ? 'var(--color-green)' : 'var(--bg-secondary)',
                          color: newActivity.frequency === f ? 'white' : 'var(--text-primary)'
                        }}
                      >
                        {t[f]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddActivity(false)}
                    className="flex-1 py-2 rounded text-sm"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={addActivity}
                    disabled={!newActivity.activity}
                    className="flex-1 py-2 rounded text-sm font-medium disabled:opacity-50"
                    style={{ background: 'var(--color-green)', color: 'white' }}
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interview Guide Hint */}
      <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>
        <strong>{zh ? '访谈提示' : 'Interview Tip'}:</strong>{' '}
        {zh 
          ? '在访谈中，可以指着这张地图询问：「您在这个地方通常做什么照护活动？遇到什么困难？希望有什么工具或帮助？」'
          : 'During interviews, point to this map and ask: "What care activities do you usually do at this location? What challenges? What tools or help do you wish you had?"'}
      </div>
    </div>
  );
}
