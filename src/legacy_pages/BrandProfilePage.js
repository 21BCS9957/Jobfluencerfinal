'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import {
    MapPin, Star, Briefcase, ArrowLeft, LinkIcon, Users, Calendar, DollarSign
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [brand, setBrand] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAll(); }, [id]);

    const fetchAll = async () => {
        try {
            const [brandRes, jobsRes, reviewsRes] = await Promise.all([
                axios.get(`${API}/brands/${id}`),
                axios.get(`${API}/jobs`),
                axios.get(`${API}/reviews/${id}`),
            ]);
            setBrand(brandRes.data);
            setJobs((jobsRes.data.campaigns || jobsRes.data).filter(j => j.brand_id === id && (j.status === 'active' || j.status === 'open')));
            setReviews(reviewsRes.data);
        } catch (err) {
            toast.error('Brand not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const shareProfile = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => toast.success('Link copied!'))
            .catch(() => toast.error('Could not copy'));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="flex justify-center pt-24"><div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-lg mx-auto px-4 pt-24 text-center">
                    <p className="text-gray-500">Brand not found</p>
                </div>
            </div>
        );
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '0.0';

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="max-w-lg mx-auto px-4 pt-20 pb-24">
                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 mb-6 hover:text-black" data-testid="back-btn">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Brand Header */}
                <div className="flex items-start gap-4 mb-6" data-testid="brand-header">
                    <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                        {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.company_name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-white">{(brand.company_name || '?').charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold">{brand.company_name}</h1>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1"><MapPin className="w-3.5 h-3.5" /> {brand.city || 'India'}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5"><Briefcase className="w-3.5 h-3.5" /> {brand.industry || 'Brand'}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3.5 h-3.5 fill-black text-black" />
                            <span className="text-sm font-semibold">{avgRating}</span>
                            <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {brand.description && (
                    <div className="mb-6" data-testid="brand-description">
                        <h3 className="text-sm font-bold mb-2">About</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{brand.description}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6" data-testid="brand-stats">
                    <div className="bg-[#0a0a0a] rounded-xl p-4 text-center">
                        <p className="text-lg font-bold text-white">{jobs.length}</p>
                        <p className="text-xs text-gray-400">Active Jobs</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-4 text-center">
                        <p className="text-lg font-bold text-white">{reviews.length}</p>
                        <p className="text-xs text-gray-400">Reviews</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-4 text-center">
                        <p className="text-lg font-bold text-white">{avgRating}</p>
                        <p className="text-xs text-gray-400">Rating</p>
                    </div>
                </div>

                {/* Active Jobs */}
                {jobs.length > 0 && (
                    <div className="mb-6" data-testid="brand-jobs">
                        <h3 className="text-sm font-bold mb-3">Active Jobs ({jobs.length})</h3>
                        <div className="space-y-4">
                            {jobs.map(job => (
                                <div key={job.id} className="bg-[#0a0a0a] text-white rounded-2xl p-7 flex flex-col justify-between cursor-pointer hover:bg-[#111] transition-colors group" onClick={() => navigate(`/jobs/${job.id}`)} data-testid={`brand-job-${job.id}`}>
                                    <div>
                                        <span className="inline-block text-sm font-medium text-white border border-white/30 rounded px-3 py-1 mb-5">
                                            {job.niche || job.category}
                                        </span>
                                        <h3 className="text-sm font-bold tracking-tight mb-3 leading-tight underline decoration-white/40 underline-offset-4">
                                            {job.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 line-clamp-2 mb-6 leading-relaxed">{job.description}</p>
                                        <div className="space-y-2.5 mb-6">
                                            <div className="flex items-center gap-3 text-base">
                                                <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="text-white font-medium">Rs.{job.budget_min?.toLocaleString('en-IN')}{job.budget_max ? ` - Rs.${job.budget_max.toLocaleString('en-IN')}` : ''}</span>
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
                                    <button className="w-full bg-white text-black text-sm font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors" data-testid={`view-brand-job-${job.id}`}>
                                        Easy Apply
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews */}
                <div className="mb-6" data-testid="brand-reviews">
                    <h3 className="text-sm font-bold mb-3">Reviews ({reviews.length})</h3>
                    {reviews.length > 0 ? (
                        <div className="space-y-3">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-[#0a0a0a] rounded-xl p-4" data-testid={`brand-review-${review.id}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                                {review.reviewer_name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{review.reviewer_name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{review.reviewer_role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            {[1,2,3,4,5].map(s => (
                                                <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-black text-black' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">{review.comment}</p>
                                    <p className="text-xs text-gray-600 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-4">No reviews yet</p>
                    )}
                </div>

                {/* Share */}
                <Button onClick={shareProfile} className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-5 gap-2" data-testid="share-brand-profile-btn">
                    <LinkIcon className="w-4 h-4" /> Share Profile
                </Button>
            </div>
        </div>
    );
};

export default BrandProfilePage;
