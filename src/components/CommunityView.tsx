import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_STUDY_GROUPS } from '../data/initialResources';
import { Users, MessageSquare, Plus, Check, Search, BookOpen, Share2 } from 'lucide-react';

export const CommunityView: React.FC = () => {
  const [groups, setGroups] = useState(INITIAL_STUDY_GROUPS);
  const [joinedGroups, setJoinedGroups] = useState<Record<string, boolean>>({ 'sg-01': true });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'senior' | 'jss' | 'college_uni'>('all');

  // Academic Discussion Board state
  const [discussions, setDiscussions] = useState<{
    id: string;
    author: string;
    title: string;
    level: string;
    replies: number;
    time: string;
    tags: string[];
  }[]>([
    {
      id: 'd1',
      author: 'Erick Mutua',
      title: 'Tips for scoring distinction in KCSE Chemistry Paper 3 Practical (Titration & Organic analysis)?',
      level: 'Senior School',
      replies: 14,
      time: '3 hours ago',
      tags: ['Chemistry', 'KCSE', 'Practical']
    },
    {
      id: 'd2',
      author: 'Jane Kerubo',
      title: 'KJSEA 2026 Model Papers discussion: Are the Integrated Science sub-strands balanced?',
      level: 'Junior Secondary',
      replies: 28,
      time: 'Yesterday',
      tags: ['KJSEA', 'Integrated Science', 'CBC']
    },
    {
      id: 'd3',
      author: 'Collins Ombati',
      title: 'Recommended reference books for Distributed Systems: Tanenbaum vs. Martin Kleppmann',
      level: 'College & University',
      replies: 19,
      time: '2 days ago',
      tags: ['Computer Science', 'Distributed Systems']
    }
  ]);

  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');

  const toggleJoin = (groupId: string) => {
    setJoinedGroups(prev => {
      const isJoined = !prev[groupId];
      setGroups(all => all.map(g => g.id === groupId ? { ...g, membersCount: g.membersCount + (isJoined ? 1 : -1) } : g));
      return { ...prev, [groupId]: isJoined };
    });
  };

  const handlePostDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionTitle.trim()) return;

    setDiscussions([
      {
        id: `d-${Date.now()}`,
        author: 'You (Active Learner)',
        title: newDiscussionTitle.trim(),
        level: 'Senior School',
        replies: 0,
        time: 'Just now',
        tags: ['Academic Inquiry', 'Discussion']
      },
      ...discussions
    ]);
    setNewDiscussionTitle('');
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newG = {
      id: `sg-${Date.now()}`,
      name: newGroupName,
      subject: newGroupSubject || 'General Academic',
      description: newGroupDesc,
      educationLevel: 'senior' as any,
      creatorId: 'user-me',
      creatorName: 'You',
      membersCount: 1,
      createdAt: new Date().toISOString()
    };
    setGroups([newG, ...groups]);
    setJoinedGroups(prev => ({ ...prev, [newG.id]: true }));
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
  };

  const filteredGroups = groups.filter(g => activeFilter === 'all' || g.educationLevel === activeFilter);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Community Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-2 border border-teal-500/30">
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>Academic Learning Circles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Study Groups & Educator Community</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Join peer study circles, debate revision problems, collaborate with lecturers and follow top curriculum authors.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Create Study Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Study Groups */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900">Featured Study Circles</h2>
            <div className="flex items-center gap-1.5 text-xs">
              {['all', 'senior', 'jss', 'college_uni'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setActiveFilter(lvl as any)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                    activeFilter === lvl ? 'bg-teal-600 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'all' ? 'All' : lvl.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredGroups.map((g) => {
              const joined = joinedGroups[g.id];
              return (
                <div key={g.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{g.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-700">
                        {g.educationLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{g.description}</p>
                    <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
                      <span>Led by {g.creatorName}</span>
                      <span>•</span>
                      <span>{g.membersCount} active learners</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleJoin(g.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      joined
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                    }`}
                  >
                    {joined ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{joined ? 'Joined Circle' : 'Join Group'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Academic Discussion Board */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs h-fit space-y-6">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <span>Academic Discussion Forum</span>
            </h2>
            <p className="text-xs text-slate-500">Ask the collective network questions about study topics.</p>
          </div>

          {/* Quick Post Box */}
          <form onSubmit={handlePostDiscussion} className="space-y-2">
            <textarea
              rows={2}
              value={newDiscussionTitle}
              onChange={(e) => setNewDiscussionTitle(e.target.value)}
              placeholder="Start an academic discussion thread or ask for syllabus advice..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Post Topic to Forum
            </button>
          </form>

          {/* Discussion List */}
          <div className="divide-y divide-slate-100 text-xs">
            {discussions.map((d) => (
              <div key={d.id} className="py-3.5 space-y-1 cursor-pointer hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                <span className="font-bold text-slate-900 leading-snug block">{d.title}</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>By {d.author}</span>
                  <span>•</span>
                  <span>{d.time}</span>
                  <span>•</span>
                  <span className="text-teal-700 font-semibold">{d.replies} responses</span>
                </div>
                <div className="flex gap-1 pt-1">
                  {d.tags.map((tag, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal to Create Group */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 my-auto">
            <h3 className="font-bold text-lg text-slate-900 mb-1">Create Study Group</h3>
            <p className="text-xs text-slate-500 mb-6">Form a learning circle for your subject or revision track.</p>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Circle Name *</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Form 4 KCSE Biology Group"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Focus</label>
                <input
                  type="text"
                  value={newGroupSubject}
                  onChange={(e) => setNewGroupSubject(e.target.value)}
                  placeholder="e.g. Biology & Chemistry"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Circle Description</label>
                <textarea
                  rows={3}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Describe your study objectives, meeting schedule, or revision goals..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs text-xs"
                >
                  Create Circle
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
