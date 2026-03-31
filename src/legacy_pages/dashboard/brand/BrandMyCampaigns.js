'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { Briefcase, Plus, DollarSign, Users, MapPin, Calendar, Star, X, Search, Zap } from 'lucide-react';
import { API } from '../shared';
import { BoostModal, EscrowModal } from '../MonetizationModals';

const formatBudget = (min, max) => {
    const fmt = (n) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n;
    if (!max || max === min) return `Rs.${fmt(min)}`;
    return `Rs.${fmt(min)}–${fmt(max)}`;
};

export const BrandMyCampaigns = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState(null);
    const [hiredCreators, setHiredCreators] = useState([]);
    const [loadingCreators, setLoadingCreators] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [boostModal, setBoostModal] = useState(null);
    const [escrowModal, setEscrowModal] = useState(null);

    useEffect(() => { fetchJobs(); }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${API}/jobs/my`);
            setJobs(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const tabs = [
        { key: 'active', label: 'Active', count: jobs.filter(j => j.status === 'active' || j.status === 'open').length },
        { key: 'inactive', label: 'Inactive', count: jobs.filter(j => j.status === 'inactive').length },
        { key: 'draft', label: 'Drafts', count: jobs.filter(j => j.status === 'draft').length },
        { key: 'completed', label: 'Completed', count: jobs.filter(j => j.status === 'completed').length },
    ];

    const filteredJobs = jobs.filter(j => {
        if (activeTab === 'active') return j.status === 'active' || j.status === 'open';
        if (activeTab === 'inactive') return j.status === 'inactive';
        if (activeTab === 'draft') return j.status === 'draft';
        if (activeTab === 'completed') return j.status === 'completed';
        return true;
    });

    const [searchQuery, setSearchQuery] = useState('');

    const searchedJobs = filteredJobs.filter(job => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return job.title?.toLowerCase().includes(q) || job.description?.toLowerCase().includes(q) || job.category?.toLowerCase().includes(q) || job.niche?.toLowerCase().includes(q);
    });

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name?.split(' ')[0]}</h1>

            <div className="relative mt-4 mb-4" data-testid="brand-jobs-search">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your jobs..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                    data-testid="search-jobs-input"
                />
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold">My Jobs</h2>
                <Button onClick={() => navigate('/post-job')} className="bg-black text-white rounded-full text-sm px-4" data-testid="new-campaign-btn">
                    <Plus className="w-4 h-4 mr-1" /> New
                </Button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar" data-testid="campaigns-tabs">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors ${activeTab === tab.key ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                        data-testid={`tab-${tab.key}`}
                    >
                        {tab.label} <span className={`${activeTab === tab.key ? 'text-gray-300' : 'text-gray-400'}`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>
            ) : searchedJobs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                    <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 mb-3">No {activeTab} jobs</p>
                    <Button onClick={() => navigate('/post-job')} className="bg-black text-white rounded-full">Post a Job</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {searchedJobs.map(job => (
                        <div
                            key={job.id}
                            className="bg-[#0a0a0a] text-white rounded-2xl p-7 flex flex-col justify-between cursor-pointer hover:bg-[#111] transition-colors group"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            data-testid={`campaign-card-${job.id}`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <span className="inline-block text-sm font-medium text-white border border-white/30 rounded px-3 py-1">
                                        {job.niche || job.category}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {job.is_boosted && (
                                            <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 rounded-full px-2.5 py-0.5 flex items-center gap-1" data-testid={`boosted-badge-${job.id}`}>
                                                <Zap className="w-3 h-3" /> Boosted
                                            </span>
                                        )}
                                        <span className="text-xs font-medium text-gray-400 bg-white/10 rounded-full px-2.5 py-0.5">
                                            {job.status}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mb-1">{job.brand_name || user?.name}</p>
                                <h3 className="text-sm font-bold tracking-tight mb-3 leading-tight underline decoration-white/40 underline-offset-4">
                                    {job.title}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-6 leading-relaxed">{job.description}</p>
                                <div className="space-y-2.5 mb-6">
                                    <div className="flex items-center gap-3 text-base">
                                        <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-white font-medium">{formatBudget(job.budget_min, job.budget_max)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-gray-400">Deadline: {job.deadline}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-base">
                                        <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-gray-400">{job.applicants_count || 0} applicants</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const newStatus = (job.status === 'active' || job.status === 'open') ? 'inactive' : 'active';
                                        try {
                                            await axios.put(`${API}/jobs/${job.id}/status?status=${newStatus}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                                            toast.success(`Job ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
                                            fetchJobs();
                                        } catch (err) { toast.error('Failed to update status'); }
                                    }}
                                    className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors ${(job.status === 'active' || job.status === 'open') ? 'bg-white text-black hover:bg-gray-100' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                                    data-testid={`toggle-status-${job.id}`}
                                >
                                    {(job.status === 'active' || job.status === 'open') ? 'Active' : 'Inactive'} 
                                </button>
                                <div
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const newStatus = (job.status === 'active' || job.status === 'open') ? 'inactive' : 'active';
                                        try {
                                            await axios.put(`${API}/jobs/${job.id}/status?status=${newStatus}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                                            toast.success(`Job ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
                                            fetchJobs();
                                        } catch (err) { toast.error('Failed to update status'); }
                                    }}
                                    className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative flex-shrink-0 ${(job.status === 'active' || job.status === 'open') ? 'bg-white' : 'bg-gray-700'}`}
                                    data-testid={`toggle-switch-${job.id}`}
                                >
                                    <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${(job.status === 'active' || job.status === 'open') ? 'left-6 bg-black' : 'left-0.5 bg-gray-500'}`} />
                                </div>
                            </div>
                            <button className="w-full bg-white text-black text-sm font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }} data-testid={`view-campaign-${job.id}`}>
                                Manage Job
                            </button>
                            <div className="flex gap-2 mt-2">
                                {!job.is_boosted && (job.status === 'active' || job.status === 'open') && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setBoostModal(job); }}
                                        className="flex-1 text-sm font-semibold text-yellow-400 border border-yellow-400/40 rounded-lg py-2.5 hover:bg-yellow-400/10 transition-colors flex items-center justify-center gap-2"
                                        data-testid={`boost-btn-${job.id}`}
                                    >
                                        <Zap className="w-4 h-4" /> Boost
                                    </button>
                                )}
                                {(job.status === 'active' || job.status === 'open') && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEscrowModal(job); }}
                                        className="flex-1 text-sm font-semibold text-white border border-white/30 rounded-lg py-2.5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                        data-testid={`fund-escrow-btn-${job.id}`}
                                    >
                                        <DollarSign className="w-4 h-4" /> Fund Escrow
                                    </button>
                                )}
                            </div>
                            {(job.hired_count > 0 || job.status === 'completed') && (
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        setReviewModal(job);
                                        setLoadingCreators(true);
                                        try {
                                            const res = await axios.get(`${API}/applications/campaign/${job.id}`, { headers: { Authorization: `Bearer ${token}` } });
                                            setHiredCreators(res.data.filter(a => a.status === 'hired'));
                                        } catch (err) { console.error(err); }
                                        finally { setLoadingCreators(false); }
                                    }}
                                    className="w-full mt-2 text-sm font-semibold text-white border-2 border-white rounded-lg py-2.5 hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
                                    data-testid={`review-creators-${job.id}`}
                                >
                                    <Star className="w-4 h-4" /> Review Creators
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {boostModal && (
                <BoostModal
                    campaign={boostModal}
                    onClose={() => setBoostModal(null)}
                    onBoosted={() => { fetchJobs(); setBoostModal(null); }}
                />
            )}

            {escrowModal && (
                <EscrowModal
                    campaign={escrowModal}
                    onClose={() => setEscrowModal(null)}
                    onSuccess={() => { fetchJobs(); setEscrowModal(null); }}
                />
            )}

            {reviewModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center" onClick={() => { setReviewModal(null); setHiredCreators([]); }}>
                    <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="brand-review-modal">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Review Creators</h3>
                            <button onClick={() => { setReviewModal(null); setHiredCreators([]); }}><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Review hired creators for &quot;{reviewModal.title}&quot;</p>
                        {loadingCreators ? (
                            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>
                        ) : hiredCreators.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">No hired creators to review</p>
                        ) : (
                            <div className="space-y-4">
                                {hiredCreators.map(app => (
                                    <div key={app.id} className="border border-gray-200 rounded-xl p-4" data-testid={`review-creator-${app.creator_id}`}>
                                        <p className="text-sm font-bold mb-2">{app.creator_name || 'Creator'}</p>
                                        <div className="flex gap-2 justify-center mb-3">
                                            {[1,2,3,4,5].map(s => (
                                                <button key={s} onClick={() => setReviewRating(s)} data-testid={`brand-star-${s}`}>
                                                    <Star className={`w-7 h-7 ${s <= reviewRating ? 'fill-white text-white' : 'text-gray-600'}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="How was your experience with this creator?" className="mb-3 min-h-[80px]" data-testid="brand-review-comment" />
                                        <Button
                                            onClick={async () => {
                                                if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }
                                                setSubmittingReview(true);
                                                try {
                                                    await axios.post(`${API}/reviews`, {
                                                        campaign_id: reviewModal.id,
                                                        reviewee_id: app.creator_id,
                                                        rating: reviewRating,
                                                        comment: reviewComment,
                                                    }, { headers: { Authorization: `Bearer ${token}` } });
                                                    toast.success(`Review submitted for ${app.creator_name}!`);
                                                    setReviewComment('');
                                                    setReviewRating(5);
                                                } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
                                                finally { setSubmittingReview(false); }
                                            }}
                                            disabled={submittingReview}
                                            className="w-full bg-black text-white hover:bg-gray-800 rounded-full"
                                            data-testid={`submit-brand-review-${app.creator_id}`}
                                        >
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
