'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { Bookmark, Star, X, DollarSign, Calendar, Users } from 'lucide-react';
import { API } from '../shared';

export const InfluencerMyJobs = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('applied');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => { fetchApplications(); }, []);

    const fetchApplications = async () => {
        try {
            const res = await axios.get(`${API}/applications/my`);
            setApplications(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmitReview = async () => {
        if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }
        setSubmittingReview(true);
        try {
            await axios.post(`${API}/reviews`, {
                campaign_id: reviewModal.campaign_id,
                reviewee_id: reviewModal.brand_id,
                rating: reviewRating,
                comment: reviewComment,
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Review submitted!');
            setReviewModal(null);
            setReviewRating(5);
            setReviewComment('');
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to submit review'); }
        finally { setSubmittingReview(false); }
    };

    const tabs = [
        { key: 'saved', label: 'Saved', count: 0 },
        { key: 'applied', label: 'Applied', count: applications.filter(a => a.status === 'pending').length },
        { key: 'active', label: 'Active', count: applications.filter(a => a.status === 'hired').length },
        { key: 'archived', label: 'Archived', count: applications.filter(a => a.status === 'rejected').length },
    ];

    const filteredApps = applications.filter(a => {
        if (activeTab === 'applied') return a.status === 'pending';
        if (activeTab === 'active') return a.status === 'hired';
        if (activeTab === 'archived') return a.status === 'rejected';
        return false;
    });

    const statusLabels = { pending: 'Applied', hired: 'Hired', rejected: 'Not selected' };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">My Jobs</h1>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar" data-testid="my-jobs-tabs">
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
            ) : activeTab === 'saved' ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                    <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No saved jobs yet</p>
                    <p className="text-gray-300 text-xs mt-1">Save jobs you&apos;re interested in for later</p>
                </div>
            ) : filteredApps.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-400">No jobs in this category</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredApps.map(app => (
                        <div key={app.id} className="bg-[#0a0a0a] text-white rounded-2xl p-7 flex flex-col justify-between cursor-pointer hover:bg-[#111] transition-colors group" onClick={() => navigate(`/jobs/${app.campaign_id}`)} data-testid={`app-card-${app.id}`}>
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <span className="inline-block text-sm font-medium text-white border border-white/30 rounded px-3 py-1">
                                        {app.campaign?.category || 'Job'}
                                    </span>
                                    <span className="text-xs font-medium text-gray-400 bg-white/10 rounded-full px-2.5 py-0.5">
                                        {statusLabels[app.status]}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mb-1">{app.campaign?.brand_name || 'Brand'}</p>
                                <h3 className="text-sm font-bold tracking-tight mb-3 leading-tight underline decoration-white/40 underline-offset-4">
                                    {app.campaign?.title || 'Campaign'}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-6 leading-relaxed">{app.campaign?.description}</p>
                                <div className="space-y-2.5 mb-6">
                                    <div className="flex items-center gap-3 text-base">
                                        <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-white font-medium">Rs.{app.campaign?.budget_min?.toLocaleString('en-IN')}{app.campaign?.budget_max ? ` - Rs.${app.campaign.budget_max.toLocaleString('en-IN')}` : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-gray-400">Deadline: {app.campaign?.deadline}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-base">
                                        <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-gray-400">{app.campaign?.applicants_count || 0} applicants</span>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full bg-white text-black text-sm font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${app.campaign_id}`); }} data-testid={`view-job-${app.id}`}>
                                View Details
                            </button>
                            {app.status === 'hired' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setReviewModal({ campaign_id: app.campaign_id, brand_id: app.campaign?.brand_id, brand_name: app.campaign?.brand_name }); }}
                                    className="w-full mt-2 text-sm font-semibold text-white border-2 border-white rounded-lg py-2.5 hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
                                    data-testid={`write-review-${app.id}`}
                                >
                                    <Star className="w-4 h-4" /> Write Review for Brand
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {reviewModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center" onClick={() => setReviewModal(null)}>
                    <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6" onClick={e => e.stopPropagation()} data-testid="review-modal">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Review {reviewModal.brand_name}</h3>
                            <button onClick={() => setReviewModal(null)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex gap-2 justify-center mb-4">
                            {[1,2,3,4,5].map(s => (
                                <button key={s} onClick={() => setReviewRating(s)} data-testid={`star-${s}`}>
                                    <Star className={`w-8 h-8 ${s <= reviewRating ? 'fill-white text-white' : 'text-gray-600'}`} />
                                </button>
                            ))}
                        </div>
                        <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="How was your experience working with this brand?" className="mb-4 min-h-[100px]" data-testid="review-comment" />
                        <Button onClick={handleSubmitReview} disabled={submittingReview} className="w-full bg-black text-white hover:bg-gray-800 rounded-full" data-testid="submit-review-btn">
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
