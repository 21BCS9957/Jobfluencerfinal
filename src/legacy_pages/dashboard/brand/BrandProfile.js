'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import {
    MapPin, Briefcase, Star, Edit3, CreditCard, Settings, ChevronRight,
    LogOut, BarChart3, LinkIcon, Crown
} from 'lucide-react';
import { API, WalletSection } from '../shared';
import { SubscriptionModal } from '../MonetizationModals';

export const BrandProfile = () => {
    const { user, token, logout, subscription, fetchUser } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [showReviews, setShowReviews] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [showSubModal, setShowSubModal] = useState(false);

    useEffect(() => {
        if (user?.id) {
            const headers = { Authorization: `Bearer ${token}` };
            axios.get(`${API}/reviews/${user.id}`).then(res => setReviews(res.data)).catch(() => {});
            axios.get(`${API}/analytics/dashboard`, { headers }).then(res => setAnalytics(res.data)).catch(() => {});
            axios.get(`${API}/wallet`, { headers }).then(res => setWallet(res.data)).catch(() => {});
        }
    }, [user, token]);

    const shareProfile = () => {
        const url = `${window.location.origin}/brands/${user?.id}`;
        navigator.clipboard.writeText(url).then(() => toast.success('Profile link copied!')).catch(() => toast.error('Could not copy'));
    };

    return (
        <div>
            {/* Profile Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <div className="space-y-1.5 mt-3">
                        <p className="text-sm text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> {user?.city || 'India'}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Brand</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2"><Star className="w-4 h-4" /> {reviews.length} reviews</p>
                    </div>
                </div>
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">{user?.name?.split(' ').map(n => n[0]).join('') || '?'}</span>
                </div>
            </div>

            {/* Analytics */}
            <div className="mb-4">
                <button onClick={() => setShowAnalytics(!showAnalytics)} className="flex items-center justify-between w-full py-3" data-testid="toggle-brand-analytics">
                    <span className="text-sm font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Analytics</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showAnalytics ? 'rotate-90' : ''}`} />
                </button>
                {showAnalytics && analytics && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {[
                            { val: analytics.total_campaigns || 0, label: 'Total Jobs' },
                            { val: analytics.total_applicants || 0, label: 'Applicants' },
                            { val: analytics.total_hired || 0, label: 'Hired' },
                            { val: `${analytics.conversion_rate || 0}%`, label: 'Conversion' },
                            { val: analytics.boosted_campaigns || 0, label: 'Boosted' },
                            { val: analytics.contests || 0, label: 'Contests' },
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
                <button onClick={() => setShowReviews(!showReviews)} className="flex items-center justify-between w-full py-3" data-testid="toggle-brand-reviews">
                    <span className="text-sm font-bold flex items-center gap-2"><Star className="w-4 h-4" /> Reviews ({reviews.length})</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showReviews ? 'rotate-90' : ''}`} />
                </button>
                {showReviews && (
                    reviews.length > 0 ? (
                        <div className="space-y-3 mt-2">
                            {reviews.map(review => (
                                <div key={review.id} className="border border-gray-100 rounded-xl p-4" data-testid={`brand-review-${review.id}`}>
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
                <Button onClick={shareProfile} className="w-full rounded-full flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-black" data-testid="share-profile-btn">
                    <LinkIcon className="w-4 h-4" /> Share Profile Link
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard/brand/edit-profile')} className="w-full rounded-full flex items-center justify-center gap-2" data-testid="edit-profile-btn">
                    <Edit3 className="w-4 h-4" /> Edit Brand Details
                </Button>
                <Button variant="outline" onClick={logout} className="w-full rounded-full text-red-500 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2" data-testid="logout-profile-btn">
                    <LogOut className="w-4 h-4" /> Log Out
                </Button>
            </div>

            {showSubModal && (
                <SubscriptionModal
                    role="brand"
                    currentPlan={subscription?.plan}
                    onClose={() => setShowSubModal(false)}
                    onUpgraded={() => { fetchUser(); setShowSubModal(false); }}
                />
            )}
        </div>
    );
};
