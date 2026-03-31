'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { MapPin, Star, Instagram, Youtube, ArrowLeft, ExternalLink, MessageSquare, Briefcase, Share2, Copy, LinkIcon, Video, Image } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const InfluencerProfilePage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [influencer, setInfluencer] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [portfolioLinks, setPortfolioLinks] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('work');

    useEffect(() => { fetchAll(); }, [id]);

    const fetchAll = async () => {
        try {
            const [profileRes, portfolioRes, linksRes, reviewsRes] = await Promise.all([
                axios.get(`${API}/creators/${id}`),
                axios.get(`${API}/portfolio/${id}`),
                axios.get(`${API}/portfolio/links/${id}`),
                axios.get(`${API}/reviews/${id}`),
            ]);
            setInfluencer(profileRes.data);
            setPortfolio(portfolioRes.data);
            setPortfolioLinks(linksRes.data);
            setReviews(reviewsRes.data);
        } catch (error) {
            toast.error('Influencer not found');
            navigate('/influencers');
        } finally {
            setLoading(false);
        }
    };

    const formatFollowers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count?.toString() || '0';
    };

    const handleMessage = () => {
        if (!user) { navigate('/login'); return; }
        navigate(`/dashboard/${user.role}/messages?to=${id}`);
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => toast.success('Portfolio link copied!')).catch(() => toast.error('Could not copy'));
    };

    const handleShare = async () => {
        const url = window.location.href;
        const title = `${influencer?.display_name} — Portfolio on Jobfluencer`;
        if (navigator.share) {
            try { await navigator.share({ title, url }); } catch {}
        } else {
            handleCopyLink();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="pt-28 flex justify-center">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!influencer) return null;

    const totalWork = portfolio.length + portfolioLinks.length;

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="pt-24 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <button 
                            onClick={() => navigate('/influencers')}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
                            data-testid="back-btn"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleCopyLink} className="rounded-full text-sm gap-2 border-gray-300" data-testid="copy-link-btn">
                                <Copy className="w-3.5 h-3.5" /> Copy Link
                            </Button>
                            <Button variant="outline" onClick={handleShare} className="rounded-full text-sm gap-2 border-gray-300" data-testid="share-btn">
                                <Share2 className="w-3.5 h-3.5" /> Share
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <section className="pb-20 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-10">
                        {/* Left: Profile Image & Quick Info */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-28">
                                <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-6">
                                    {influencer.profile_image_url ? (
                                        <img src={influencer.profile_image_url} alt={influencer.display_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <span className="text-6xl font-bold text-gray-400">{influencer.display_name?.charAt(0) || '?'}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border border-gray-200 rounded-xl p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Rate</span>
                                        {influencer.hourly_rate > 0 ? (
                                            <span className="text-xl font-bold">Rs.{influencer.hourly_rate.toLocaleString('en-IN')}/day</span>
                                        ) : (
                                            <span className="text-gray-500">On request</span>
                                        )}
                                    </div>

                                    {user?.role === 'brand' && (
                                        <Button 
                                            onClick={handleMessage}
                                            className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-5 flex items-center justify-center gap-2"
                                            data-testid="message-influencer-btn"
                                        >
                                            <MessageSquare className="w-4 h-4" /> Message
                                        </Button>
                                    )}

                                    {!user && (
                                        <Button 
                                            onClick={() => navigate('/login')}
                                            className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-5"
                                            data-testid="login-to-hire-btn"
                                        >
                                            Login to Hire
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Main Content */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
                                    <MapPin className="w-3 h-3 mr-1" /> {influencer.city}
                                </Badge>
                                <Badge variant="secondary" className="text-xs font-medium">{influencer.category}</Badge>
                            </div>

                            <h1 className="text-3xl font-bold mb-3">{influencer.display_name}</h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                                <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-black text-black" />
                                    {influencer.avg_rating > 0 ? influencer.avg_rating.toFixed(1) : '0.0'} ({reviews.length} reviews)
                                </span>
                                <span>{formatFollowers(influencer.followers_count)} followers</span>
                                <span>{influencer.total_jobs || 0} jobs done</span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4 mb-8 p-5 bg-gray-50 rounded-xl">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{formatFollowers(influencer.followers_count)}</p>
                                    <p className="text-xs text-gray-500">Followers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{totalWork}</p>
                                    <p className="text-xs text-gray-500">Portfolio</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{reviews.length}</p>
                                    <p className="text-xs text-gray-500">Reviews</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{influencer.avg_rating > 0 ? influencer.avg_rating.toFixed(1) : '-'}</p>
                                    <p className="text-xs text-gray-500">Rating</p>
                                </div>
                            </div>

                            {/* Bio */}
                            {influencer.bio && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold mb-3">About</h3>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{influencer.bio}</p>
                                </div>
                            )}

                            {/* Niches & Platforms */}
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Niches</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {influencer.niches?.map(n => <span key={n} className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium">{n}</span>)}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Platforms</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {influencer.platforms?.map(p => <span key={p} className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium">{p}</span>)}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs: Portfolio Work / Links / Reviews */}
                            <div className="flex border-b border-gray-200 mb-6">
                                {[
                                    { key: 'work', label: 'Portfolio', count: portfolio.length },
                                    { key: 'links', label: 'Links', count: portfolioLinks.length },
                                    { key: 'reviews', label: 'Reviews', count: reviews.length },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${activeTab === tab.key ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                                        data-testid={`public-tab-${tab.key}`}
                                    >
                                        {tab.label} {tab.count > 0 && `(${tab.count})`}
                                    </button>
                                ))}
                            </div>

                            {/* Portfolio Work Tab */}
                            {activeTab === 'work' && (
                                portfolio.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {portfolio.map(item => (
                                            <div key={item.id} className="rounded-xl overflow-hidden bg-gray-100 aspect-square" data-testid={`public-portfolio-${item.id}`}>
                                                {item.type === 'image' ? (
                                                    <img src={`${API}/files/${item.storage_path}`} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
                                                        <Video className="w-8 h-8 mb-2" />
                                                        <span className="text-xs">{item.title}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-8">No portfolio work uploaded yet.</p>
                                )
                            )}

                            {/* Links Tab */}
                            {activeTab === 'links' && (
                                <div>
                                    {/* Social profiles */}
                                    {(influencer.instagram_handle || influencer.youtube_handle) && (
                                        <div className="flex flex-wrap gap-3 mb-4">
                                            {influencer.instagram_handle && (
                                                <a href={`https://instagram.com/${influencer.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-black transition-colors text-sm font-medium">
                                                    <Instagram className="w-4 h-4" /> {influencer.instagram_handle}
                                                </a>
                                            )}
                                            {influencer.youtube_handle && (
                                                <a href={`https://youtube.com/${influencer.youtube_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-black transition-colors text-sm font-medium">
                                                    <Youtube className="w-4 h-4" /> {influencer.youtube_handle}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {portfolioLinks.length > 0 ? (
                                        <div className="space-y-2">
                                            {portfolioLinks.map(link => (
                                                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors"
                                                    data-testid={`public-link-${link.id}`}>
                                                    <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium truncate">{link.title || link.url}</p>
                                                        <p className="text-xs text-gray-400 capitalize">{link.platform}</p>
                                                    </div>
                                                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        !influencer.instagram_handle && !influencer.youtube_handle && (
                                            <p className="text-sm text-gray-400 text-center py-8">No links added yet.</p>
                                        )
                                    )}
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map(review => (
                                            <div key={review.id} className="border border-gray-100 rounded-xl p-4" data-testid={`public-review-${review.id}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                                                            {review.reviewer_name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold">{review.reviewer_name}</p>
                                                            <p className="text-xs text-gray-400 capitalize">{review.reviewer_role}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1,2,3,4,5].map(s => (
                                                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-black text-black' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600">{review.comment}</p>
                                                <p className="text-xs text-gray-300 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-8">No reviews yet.</p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default InfluencerProfilePage;
