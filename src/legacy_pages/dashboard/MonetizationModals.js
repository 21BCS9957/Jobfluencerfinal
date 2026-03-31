import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { X, Zap, Shield, Crown, DollarSign, TrendingUp, ArrowRight, Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ===== BOOST CAMPAIGN MODAL =====
export const BoostModal = ({ campaign, onClose, onBoosted }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState('basic');
    const tiers = [
        { key: 'basic', name: 'Basic Boost', credits: 10, price: 299, days: 7, features: ['Priority in search', '7-day boost'] },
        { key: 'premium', name: 'Premium', credits: 25, price: 699, days: 14, features: ['Homepage placement', '14-day boost', 'Highlighted listing'] },
        { key: 'top', name: 'Top Placement', credits: 35, price: 999, days: 30, features: ['#1 in category', '30-day boost', 'Push notifications', 'Featured badge'] },
    ];

    const handleBoost = async () => {
        setLoading(true);
        try {
            await axios.post(`${API}/campaigns/${campaign.id}/boost`, { level: selected }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Campaign boosted to ${selected}!`);
            onBoosted?.();
            onClose();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to boost'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="boost-modal">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Boost Campaign</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Increase visibility for &quot;{campaign.title}&quot;</p>
                <div className="space-y-3 mb-6">
                    {tiers.map(tier => (
                        <div key={tier.key} onClick={() => setSelected(tier.key)}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selected === tier.key ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'}`}
                            data-testid={`boost-tier-${tier.key}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm">{tier.name}</span>
                                <span className="text-sm font-bold">{tier.credits} credits</span>
                            </div>
                            <ul className="space-y-1">
                                {tier.features.map((f, i) => (
                                    <li key={i} className="text-xs flex items-center gap-1.5">
                                        <Check className="w-3 h-3 flex-shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <Button onClick={handleBoost} disabled={loading} className="w-full bg-black text-white rounded-full py-5" data-testid="confirm-boost-btn">
                    {loading ? 'Boosting...' : `Boost for ${tiers.find(t => t.key === selected)?.credits} credits`}
                </Button>
            </div>
        </div>
    );
};

// ===== ESCROW PAYMENT MODAL =====
export const EscrowModal = ({ campaign, creator, onClose, onSuccess }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const amount = campaign.budget_max || campaign.budget_min || 0;
    const commission = Math.round(amount * 0.15);
    const creatorPayout = amount - commission;

    const handleFund = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API}/escrow`, {
                campaign_id: campaign.id,
                creator_id: creator?.id || '',
                amount,
            }, { headers: { Authorization: `Bearer ${token}` } });
            const escrowId = res.data.id;
            await axios.put(`${API}/escrow/${escrowId}/fund`, {}, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Payment funded in escrow!');
            onSuccess?.();
            onClose();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to fund escrow'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6" onClick={e => e.stopPropagation()} data-testid="escrow-modal">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Fund Campaign</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <p className="text-sm text-gray-500 mb-6">Escrow-protected payment for &quot;{campaign.title}&quot;</p>
                <div className="bg-gray-50 rounded-xl p-5 space-y-4 mb-6" data-testid="escrow-breakdown">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Budget</span>
                        <span className="font-bold">Rs.{amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Platform Fee (15%)</span>
                        <span className="font-bold text-gray-400">- Rs.{commission.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                        <span className="font-bold">Creator Earnings</span>
                        <span className="font-bold">Rs.{creatorPayout.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <p className="text-xs text-gray-400 text-center mb-4">Funds held securely until you approve the work</p>
                <Button onClick={handleFund} disabled={loading} className="w-full bg-black text-white rounded-full py-5" data-testid="fund-escrow-btn">
                    {loading ? 'Processing...' : `Fund Rs.${amount.toLocaleString('en-IN')}`}
                </Button>
            </div>
        </div>
    );
};

// ===== RELEASE PAYMENT MODAL =====
export const ReleasePaymentModal = ({ escrow, onClose, onReleased }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const amount = escrow.amount || 0;
    const commission = Math.round(amount * 0.15);
    const creatorPayout = amount - commission;

    const handleRelease = async () => {
        setLoading(true);
        try {
            await axios.put(`${API}/escrow/${escrow.id}/release`, {}, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Payment released to creator!');
            onReleased?.();
            onClose();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to release'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6" onClick={e => e.stopPropagation()} data-testid="release-modal">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Release Payment</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Funded</span>
                        <span className="font-bold">Rs.{amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Platform Fee (15%)</span>
                        <span className="font-bold text-gray-400">- Rs.{commission.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                        <span className="font-bold">Creator Receives</span>
                        <span className="font-bold">Rs.{creatorPayout.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <Button onClick={handleRelease} disabled={loading} className="w-full bg-black text-white rounded-full py-5" data-testid="release-payment-btn">
                    {loading ? 'Releasing...' : 'Confirm & Release Payment'}
                </Button>
            </div>
        </div>
    );
};

// ===== VERIFIED BADGE MODAL =====
export const VerifiedBadgeModal = ({ onClose, onVerified }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [credits, setCredits] = useState(15);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            await axios.post(`${API}/verified-badge/purchase`, { credits }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Verified badge activated!');
            onVerified?.();
            onClose();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to purchase'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6" onClick={e => e.stopPropagation()} data-testid="verified-modal">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Get Verified</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm text-gray-500">Stand out with a verified badge on your profile, proposals, and search listings</p>
                </div>
                <div className="mb-4">
                    <label className="text-xs text-gray-500 mb-2 block">Credits to spend (15-35)</label>
                    <input type="range" min="15" max="35" value={credits} onChange={e => setCredits(Number(e.target.value))} className="w-full accent-black" data-testid="credits-slider" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1"><span>15 credits</span><span className="font-bold text-black">{credits} credits</span><span>35 credits</span></div>
                </div>
                <div className="space-y-2 mb-6">
                    {['Verified badge on profile', 'Priority in search results', 'Trust signal for brands', 'Highlighted in proposals'].map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-black" /> {f}</div>
                    ))}
                </div>
                <Button onClick={handlePurchase} disabled={loading} className="w-full bg-black text-white rounded-full py-5" data-testid="buy-verified-btn">
                    {loading ? 'Processing...' : `Get Verified for ${credits} credits`}
                </Button>
            </div>
        </div>
    );
};

// ===== SUBSCRIPTION UPGRADE MODAL =====
export const SubscriptionModal = ({ role, currentPlan, onClose, onUpgraded }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState('pro');

    const plans = role === 'brand' ? [
        { key: 'free', name: 'Free', price: 0, features: ['3 campaigns/mo', '3 invites/mo', 'Basic analytics'] },
        { key: 'pro', name: 'Pro', price: 999, features: ['15 campaigns/mo', '20 invites/mo', 'Campaign boosts', 'Advanced analytics', 'Priority support'] },
        { key: 'premium', name: 'Premium', price: 1999, features: ['Unlimited campaigns', 'Unlimited invites', 'All boost tiers', 'Full analytics', 'Dedicated manager', 'Contest mode'] },
    ] : [
        { key: 'free', name: 'Free', price: 0, features: ['5 applications/mo', 'Basic profile'] },
        { key: 'pro', name: 'Pro', price: 499, features: ['50 applications/mo', 'Higher visibility', 'Analytics access', 'Priority in search'] },
        { key: 'premium', name: 'Premium', price: 999, features: ['Unlimited applications', 'Verified badge', 'Top ranking', 'Full analytics', 'Featured profile'] },
    ];

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const endpoint = role === 'brand' ? '/subscriptions/brand' : '/subscriptions/creator';
            await axios.post(`${API}${endpoint}`, { plan: selected }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Upgraded to ${selected} plan!`);
            onUpgraded?.();
            onClose();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to upgrade'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="subscription-modal">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Upgrade Plan</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Current plan: <span className="font-bold capitalize">{currentPlan || 'Free'}</span></p>
                <div className="space-y-3 mb-6">
                    {plans.filter(p => p.key !== 'free').map(plan => (
                        <div key={plan.key} onClick={() => setSelected(plan.key)}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selected === plan.key ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'}`}
                            data-testid={`plan-${plan.key}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Crown className="w-4 h-4" />
                                    <span className="font-bold text-sm">{plan.name}</span>
                                </div>
                                <span className="text-sm font-bold">Rs.{plan.price}/mo</span>
                            </div>
                            <ul className="space-y-1">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="text-xs flex items-center gap-1.5">
                                        <Check className="w-3 h-3 flex-shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <Button onClick={handleUpgrade} disabled={loading} className="w-full bg-black text-white rounded-full py-5" data-testid="confirm-upgrade-btn">
                    {loading ? 'Upgrading...' : `Upgrade to ${selected.charAt(0).toUpperCase() + selected.slice(1)}`}
                </Button>
            </div>
        </div>
    );
};
