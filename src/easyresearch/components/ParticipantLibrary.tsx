import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Briefcase, Users, Filter, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

interface ParticipantProfile {
  user_id: string;
  full_name: string | null;
  country: string | null;
  region: string | null;
  age: number | null;
  occupation: string | null;
  bio: string | null;
}

const ParticipantLibrary: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [participants, setParticipants] = useState<ParticipantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [occupationFilter, setOccupationFilter] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [joinedLibrary, setJoinedLibrary] = useState(false);
  const [myProfile, setMyProfile] = useState<Partial<ParticipantProfile>>({});
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Available filter options
  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [occupations, setOccupations] = useState<string[]>([]);

  const loadParticipants = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('profile')
      .select('user_id, full_name, country, region, age, occupation, bio')
      .eq('join_participant_library', true);

    if (countryFilter) query = query.eq('country', countryFilter);
    if (regionFilter) query = query.eq('region', regionFilter);
    if (occupationFilter) query = query.eq('occupation', occupationFilter);
    if (ageMin) query = query.gte('age', parseInt(ageMin));
    if (ageMax) query = query.lte('age', parseInt(ageMax));

    const { data } = await query;
    let results = (data || []) as ParticipantProfile[];

    // Client-side name/bio search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(p =>
        (p.full_name || '').toLowerCase().includes(q) ||
        (p.bio || '').toLowerCase().includes(q) ||
        (p.occupation || '').toLowerCase().includes(q)
      );
    }

    setParticipants(results);

    // Extract unique filter values from all library participants
    const allQuery = await supabase
      .from('profile')
      .select('country, region, occupation')
      .eq('join_participant_library', true);
    const allData = allQuery.data || [];
    setCountries([...new Set(allData.map(d => d.country).filter(Boolean) as string[])].sort());
    setRegions([...new Set(allData.map(d => d.region).filter(Boolean) as string[])].sort());
    setOccupations([...new Set(allData.map(d => d.occupation).filter(Boolean) as string[])].sort());

    setLoading(false);
  }, [countryFilter, regionFilter, occupationFilter, ageMin, ageMax, searchQuery]);

  // Load own profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('profile')
        .select('full_name, country, region, age, occupation, bio, join_participant_library')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setJoinedLibrary(!!data.join_participant_library);
        setMyProfile({
          full_name: data.full_name,
          country: data.country,
          region: data.region,
          age: data.age,
          occupation: data.occupation,
          bio: data.bio,
        });
      }
    })();
  }, [user]);

  useEffect(() => { loadParticipants(); }, [loadParticipants]);

  const toggleJoinLibrary = async () => {
    if (!user) return;
    const newVal = !joinedLibrary;
    await supabase
      .from('profile')
      .update({ join_participant_library: newVal })
      .eq('user_id', user.id);
    setJoinedLibrary(newVal);
    loadParticipants();
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from('profile')
      .update({
        full_name: myProfile.full_name || null,
        country: myProfile.country || null,
        region: myProfile.region || null,
        age: myProfile.age || null,
        occupation: myProfile.occupation || null,
        bio: myProfile.bio || null,
      })
      .eq('user_id', user.id);
    setSaving(false);
    setShowProfileForm(false);
    loadParticipants();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9faf8' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Users size={24} className="text-emerald-500" />
              {t('participantLibrary.title')}
            </h1>
            <p className="text-[14px] text-stone-400 mt-1">{t('participantLibrary.subtitle')}</p>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProfileForm(!showProfileForm)}
                className="px-4 py-2 text-[13px] font-medium text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                {t('participantLibrary.updateProfile')}
              </button>
              <button
                onClick={toggleJoinLibrary}
                className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg transition-all ${
                  joinedLibrary
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-stone-100 text-stone-500 border border-stone-200 hover:border-emerald-300'
                }`}
              >
                <UserPlus size={14} />
                {joinedLibrary ? '✓ ' : ''}{t('participantLibrary.joinToggle')}
              </button>
            </div>
          )}
        </div>

        {/* Join description */}
        {user && !joinedLibrary && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mb-6 text-[13px] text-emerald-700">
            {t('participantLibrary.joinDesc')}
          </div>
        )}

        {/* Profile edit form */}
        {showProfileForm && user && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
            <h3 className="text-[15px] font-semibold text-stone-800 mb-4">{t('participantLibrary.updateProfile')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-[12px] font-medium text-stone-500 mb-1 block">{t('participantLibrary.country')}</label>
                <input
                  value={myProfile.country || ''}
                  onChange={e => setMyProfile(p => ({ ...p, country: e.target.value }))}
                  className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300"
                  placeholder="e.g. United States"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-stone-500 mb-1 block">{t('participantLibrary.region')}</label>
                <input
                  value={myProfile.region || ''}
                  onChange={e => setMyProfile(p => ({ ...p, region: e.target.value }))}
                  className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300"
                  placeholder="e.g. California"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-stone-500 mb-1 block">{t('participantLibrary.age')}</label>
                <input
                  type="number"
                  value={myProfile.age || ''}
                  onChange={e => setMyProfile(p => ({ ...p, age: parseInt(e.target.value) || null }))}
                  className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-stone-500 mb-1 block">{t('participantLibrary.occupation')}</label>
                <input
                  value={myProfile.occupation || ''}
                  onChange={e => setMyProfile(p => ({ ...p, occupation: e.target.value }))}
                  className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300"
                  placeholder="e.g. Teacher"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[12px] font-medium text-stone-500 mb-1 block">Bio</label>
                <textarea
                  value={myProfile.bio || ''}
                  onChange={e => setMyProfile(p => ({ ...p, bio: e.target.value }))}
                  className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300"
                  rows={2}
                  placeholder="Brief introduction..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveProfile} disabled={saving}
                className="px-5 py-2 text-[13px] font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50">
                {saving ? t('common.loading') : t('common.save')}
              </button>
              <button onClick={() => setShowProfileForm(false)}
                className="px-5 py-2 text-[13px] font-medium text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-stone-400" />
            <span className="text-[13px] font-medium text-stone-600">{t('common.search')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('common.search') + '...'}
                className="w-full pl-9 pr-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300"
              />
            </div>
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              className="px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300 bg-white"
            >
              <option value="">{t('participantLibrary.allCountries')}</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300 bg-white"
            >
              <option value="">{t('participantLibrary.allRegions')}</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={occupationFilter}
              onChange={e => setOccupationFilter(e.target.value)}
              className="px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300 bg-white"
            >
              <option value="">{t('participantLibrary.occupation')}</option>
              {occupations.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                value={ageMin}
                onChange={e => setAgeMin(e.target.value)}
                placeholder="Age ≥"
                className="w-1/2 px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300"
              />
              <input
                type="number"
                value={ageMax}
                onChange={e => setAgeMax(e.target.value)}
                placeholder="Age ≤"
                className="w-1/2 px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-stone-400 text-[14px]">{t('common.loading')}</div>
        ) : participants.length === 0 ? (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-400 text-[14px]">{t('participantLibrary.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map(p => (
              <div key={p.user_id} className="bg-white rounded-xl border border-stone-100 p-5 hover:border-emerald-200 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-semibold text-white">{(p.full_name?.[0] || '?').toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-semibold text-stone-800 truncate">{p.full_name || 'Anonymous'}</h3>
                    {p.occupation && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Briefcase size={11} className="text-stone-300" />
                        <span className="text-[12px] text-stone-400">{p.occupation}</span>
                      </div>
                    )}
                    {(p.country || p.region) && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-stone-300" />
                        <span className="text-[12px] text-stone-400">
                          {[p.region, p.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {p.age && (
                      <span className="text-[11px] text-stone-300 mt-0.5 block">{t('participantLibrary.age')}: {p.age}</span>
                    )}
                  </div>
                </div>
                {p.bio && (
                  <p className="text-[12px] text-stone-400 mt-3 line-clamp-2 leading-relaxed">{p.bio}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 text-[12px] font-medium text-emerald-600 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors">
                    {t('participantLibrary.inviteToStudy')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantLibrary;
