'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import {
    MapPin, Briefcase, Star, Edit3, Settings, LogOut, Shield,
    LinkIcon, BarChart3, ChevronRight, Crown
} from 'lucide-react';
import { API, WalletSection } from '../shared';
import { SubscriptionModal, VerifiedBadgeModal } from '../MonetizationModals';

export const InfluencerProfile = () => {
    const { user, token, logout, subscription, fetchUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [showReviews, setShowReviews] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [wallet, setWallet] = useState(null);
    const [showSubModal, setShowSubModal] = useState(false);
    const [showVerifiedModal, setShowVerifiedModal] = useState(false);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [profileRes, reviewsRes, analyticsRes, walletRes] = await Promise.all([
                axios.get(`${API}/creators/${user?.id}`),
                axios.get(`${API}/reviews/${user?.id}`),
                axios.get(`${API}/analytics/dashboard`, { headers }).catch(() => ({ data: null })),
                axios.get(`${API}/wallet`, { headers }).catch(() => ({ data: null })),
            ]);
            setProfile(profileRes.data);
            setReviews(reviewsRes.data);
            setAnalytics(analyticsRes.data);
            setWallet(walletRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const sharePortfolio = () => {
        const url = `${window.location.origin}/influencers/${user?.id}`;
        navigator.clipboard.writeText(url).then(() => toast.success('Portfolio link copied!')).catch(() => toast.error('Could not copy'));
    };

    if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>;

    return (
        <div>
            {/* Profile Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">{profile?.display_name || user?.name}</h2>
                        {profile?.is_verified && (
                            <span className="inline-flex items-center gap-1 bg-black text-white rounded-full px-2 py-0.5" style={{ fontSize: '10px' }} data-testid="verified-badge">
                                <Shield className="w-3 h-3" /> Verified
                            </span>
                        )}
                    </div>
                    <div className="space-y-1.5 mt-3">
                        <p className="text-sm text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> {profile?.city || user?.city || 'India'}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2"><Briefcase className="w-4 h-4" /> {profile?.category || 'Influencer'}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2"><Star className="w-4 h-4" /> {profile?.avg_rating?.toFixed(1) || '0.0'} ({reviews.length} reviews)</p>
                    </div>
                </div>
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {profile?.profile_image_url ? (
                        <img src={profile.profile_image_url} alt={profile.display_name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl font-bold text-white">{(profile?.display_name || user?.name || '?').split(' ').map(n => n[0]).join('')}</span>
                    )}
                </div>
            </div>

            {/* Niches */}
            {(profile?.niches || []).length > 0 && (
                <div className="mb-6" data-testid="niches-section">
                    <h3 className="text-sm font-bold mb-2">Niches</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.niches.map(n => (
                            <span key={n} className="text-xs font-medium bg-gray-100 px-3 py-1.5 rounded-full">{n}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Analytics */}
            <div className="mb-4">
                <button onClick={() => setShowAnalytics(!showAnalytics)} className="flex items-center justify-between w-full py-3" data-testid="toggle-analytics">
                    <span className="text-sm font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Analytics</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showAnalytics ? 'rotate-90' : ''}`} />
                </button>
                {showAnalytics && analytics && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {[
                            { val: analytics.total_applied || 0, label: 'Applied' },
                            { val: analytics.total_hired || 0, label: 'Hired' },
                            { val: `${analytics.hire_rate || 0}%`, label: 'Hire Rate' },
                            { val: analytics.avg_rating || 0, label: 'Avg Rating' },
                        ].map((item, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-lg font-bold">{item.val}</p>
                                <p className="text-xs text-gray-500">{item.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reviews */}
            <div className="mb-6">
                <button onClick={() => setShowReviews(!showReviews)} className="flex items-center justify-between w-full py-3" data-testid="toggle-reviews">
                    <span className="text-sm font-bold flex items-center gap-2"><Star className="w-4 h-4" /> Reviews ({reviews.length})</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showReviews ? 'rotate-90' : ''}`} />
                </button>
                {showReviews && (
                    reviews.length > 0 ? (
                        <div className="space-y-3 mt-2">
                            {reviews.map(review => (
                                <div key={review.id} className="border border-gray-100 rounded-xl p-4" data-testid={`review-${review.id}`}>
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
                                        <div className="flex items-center gap-1">
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
                        <p className="text-sm text-gray-400 text-center py-4">No reviews yet.</p>
                    )
                )}
            </div>

            {/* Wallet & Subscription */}
            <WalletSection wallet={wallet} subscription={subscription} />

            {/* Action Buttons */}
            <div className="space-y-3">
                <Button onClick={() => setShowSubModal(true)} className="w-full rounded-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800" data-testid="upgrade-plan-btn">
                    <Crown className="w-4 h-4" /> {subscription?.plan === 'free' ? 'Upgrade Plan' : `${subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1)} Plan`}
                </Button>
                {!profile?.is_verified && (
                    <Button onClick={() => setShowVerifiedModal(true)} className="w-full rounded-full flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-black" data-testid="get-verified-btn">
                        <Shield className="w-4 h-4" /> Get Verified Badge
                    </Button>
                )}
                <Button onClick={sharePortfolio} className="w-full rounded-full flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-black" data-testid="share-portfolio-btn">
                    <LinkIcon className="w-4 h-4" /> Share Portfolio Link
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard/influencer/edit-profile')} className="w-full rounded-full flex items-center justify-center gap-2" data-testid="edit-profile-btn">
                    <Edit3 className="w-4 h-4" /> Edit Profile
                </Button>
                <Button variant="outline" onClick={logout} className="w-full rounded-full text-red-500 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2" data-testid="logout-profile-btn">
                    <LogOut className="w-4 h-4" /> Log Out
                </Button>
            </div>

            {showSubModal && (
                <SubscriptionModal
                    role="creator"
                    currentPlan={subscription?.plan}
                    onClose={() => setShowSubModal(false)}
                    onUpgraded={() => { fetchUser(); fetchAll(); setShowSubModal(false); }}
                />
            )}

            {showVerifiedModal && (
                <VerifiedBadgeModal
                    onClose={() => setShowVerifiedModal(false)}
                    onVerified={() => { fetchAll(); setShowVerifiedModal(false); }}
                />
            )}
        </div>
    );
};
