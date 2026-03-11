import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Briefcase, Users, Filter, UserPlus, Mail, X, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import toast from 'react-hot-toast';

interface ParticipantProfile {
  user_id: string;
  full_name: string | null;
  country: string | null;
  region: string | null;
  age: number | null;
  occupation: string | null;
  bio: string | null;
}

interface ResearchProject {
  id: string;
  title: string;
  status: string;
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

  // Invite modal state
  const [inviteTarget, setInviteTarget] = useState<ParticipantProfile | null>(null);
  const [myProjects, setMyProjects] = useState<ResearchProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

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

  // Open invite modal — load researcher's projects
  const openInviteModal = async (participant: ParticipantProfile) => {
    if (!user) {
      toast.error('Please sign in to invite participants');
      return;
    }
    setInviteTarget(participant);
    setSelectedProjectId('');
    setInviteMessage(`Hi ${participant.full_name || 'there'}, I'd like to invite you to participate in my research study.`);
    setLoadingProjects(true);

    // Find researcher record for current user
    const { data: researcher } = await supabase
      .from('researcher')
      .select('id, organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (researcher) {
      const { data: projects } = await supabase
        .from('research_project')
        .select('id, title, status')
        .eq('researcher_id', researcher.id)
        .eq('is_template', false)
        .in('status', ['published', 'active', 'draft'])
        .order('created_at', { ascending: false });
      setMyProjects(projects || []);
    } else {
      setMyProjects([]);
    }
    setLoadingProjects(false);
  };

  // Send invitation — creates a conversation + first message + notification
  const sendInvitation = async () => {
    if (!user || !inviteTarget || !selectedProjectId) return;
    setInviting(true);

    try {
      const selectedProject = myProjects.find(p => p.id === selectedProjectId);

      // 1. Create or find existing conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('project_id', selectedProjectId)
        .eq('participant_user_id', inviteTarget.user_id)
        .eq('researcher_user_id', user.id)
        .maybeSingle();

      let conversationId: string;

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        const { data: newConv, error: convErr } = await supabase
          .from('conversations')
          .insert({
            project_id: selectedProjectId,
            participant_user_id: inviteTarget.user_id,
            researcher_user_id: user.id,
            last_message_at: new Date().toISOString(),
            last_message_preview: inviteMessage.slice(0, 100),
            unread_count: 1,
          })
          .select('id')
          .single();
        if (convErr) throw convErr;
        conversationId = newConv.id;
      }

      // 2. Send the invitation message
      const { error: msgErr } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: inviteMessage,
          is_read: false,
        });
      if (msgErr) throw msgErr;

      // 3. Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: inviteMessage.slice(0, 100),
          unread_count: 1,
        })
        .eq('id', conversationId);

      // 4. Create a notification for the participant
      await supabase
        .from('notifications')
        .insert({
          user_id: inviteTarget.user_id,
          type: 'study_invitation',
          title: `Study Invitation: ${selectedProject?.title || 'Research Study'}`,
          body: inviteMessage.slice(0, 200),
          is_read: false,
          reference_id: selectedProjectId,
          reference_type: 'research_project',
        });

      toast.success(`Invitation sent to ${inviteTarget.full_name || 'participant'}!`);
      setInviteTarget(null);
    } catch (err: any) {
      console.error('Invitation error:', err);
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9faf8' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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
                <label className="text-[12px] font-medium text-stone-500 mb-1 block">{t('participantLibrary.bio')}</label>
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
                placeholder={t('participantLibrary.ageMin')}
                className="w-1/2 px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300"
              />
              <input
                type="number"
                value={ageMax}
                onChange={e => setAgeMax(e.target.value)}
                placeholder={t('participantLibrary.ageMax')}
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
                    <h3 className="text-[14px] font-semibold text-stone-800 truncate">{p.full_name || t('participantLibrary.anonymous')}</h3>
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
                  <button
                    onClick={() => openInviteModal(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-medium text-emerald-600 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
                  >
                    <Mail size={12} />
                    {t('participantLibrary.inviteToStudy')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {inviteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="text-[15px] font-semibold text-stone-800">{t('participantLibrary.inviteTitle')}</h3>
              <button onClick={() => setInviteTarget(null)} className="p-1 rounded-lg hover:bg-stone-100 transition-colors">
                <X size={16} className="text-stone-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Participant info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-[13px] font-semibold text-white">{(inviteTarget.full_name?.[0] || '?').toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-[14px] font-medium text-stone-800">{inviteTarget.full_name || t('participantLibrary.anonymous')}</p>
                  <p className="text-[12px] text-stone-400">
                    {[inviteTarget.occupation, inviteTarget.country].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>

              {/* Select study */}
              <div>
                <label className="text-[12px] font-semibold text-stone-600 mb-2 block">{t('participantLibrary.selectStudy')}</label>
                {loadingProjects ? (
                  <div className="text-[13px] text-stone-400 py-3">Loading your studies...</div>
                ) : myProjects.length === 0 ? (
                  <div className="text-[13px] text-stone-400 bg-stone-50 rounded-lg p-4">
                    You don't have any research projects yet. Create a study first to invite participants.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {myProjects.map(proj => (
                      <button
                        key={proj.id}
                        onClick={() => setSelectedProjectId(proj.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                          selectedProjectId === proj.id
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            : 'bg-stone-50 border border-transparent text-stone-600 hover:border-stone-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium truncate">{proj.title}</p>
                          <p className="text-[11px] text-stone-400 capitalize">{proj.status}</p>
                        </div>
                        {selectedProjectId === proj.id && (
                          <ChevronRight size={14} className="text-emerald-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              {myProjects.length > 0 && (
                <div>
                  <label className="text-[12px] font-semibold text-stone-600 mb-2 block">Invitation message</label>
                  <textarea
                    value={inviteMessage}
                    onChange={e => setInviteMessage(e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-300 resize-none"
                    rows={3}
                    placeholder="Write a message to the participant..."
                  />
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button
                onClick={() => setInviteTarget(null)}
                className="px-4 py-2 text-[13px] font-medium text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendInvitation}
                disabled={!selectedProjectId || inviting || !inviteMessage.trim()}
                className="flex items-center gap-1.5 px-5 py-2 text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={13} />
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantLibrary;
