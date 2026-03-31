'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Zap, Eye, Shield, Trophy, BarChart3, Check, Crown, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const CREATOR_PLANS = [
    { plan: 'Free', key: 'free', price: '₹0', period: '', features: ['Basic profile', 'Apply to limited campaigns'] },
    { plan: 'Pro', key: 'pro', price: '₹499', period: '/month', features: ['Higher visibility', 'Apply to more campaigns'], popular: true },
    { plan: 'Premium', key: 'premium', price: '₹999', period: '/month', features: ['Verified badge', 'Top search ranking', 'Analytics access'] },
];

const BRAND_PLANS = [
    { plan: 'Free', key: 'free', price: '₹0', period: '', features: ['Post campaigns', 'Basic analytics'] },
    { plan: 'Pro', key: 'pro', price: '₹999', period: '/month', features: ['Boost campaigns', 'Invite creators', 'Advanced analytics'], popular: true },
    { plan: 'Premium', key: 'premium', price: '₹1,999', period: '/month', features: ['Unlimited invites', 'Featured campaigns', 'Analytics & ROI reports'] },
];

const s14 = { fontSize: '14px', lineHeight: '1.4' };
const s12 = { fontSize: '12px', lineHeight: '1.4' };
const s10 = { fontSize: '10px', lineHeight: '1.3' };

const PlanCard = ({ plan, currentPlan, onSelect }) => {
    const dark = plan.popular;
    const isCurrent = currentPlan === plan.key;
    return (
        <button
            onClick={() => onSelect(plan.key)}
            className={`rounded-2xl p-4 flex flex-col text-left transition-all ${dark ? 'bg-black text-white' : 'border border-gray-200 bg-white'} ${isCurrent ? 'ring-2 ring-yellow-400' : ''}`}
            style={{ minHeight: '180px' }}
            data-testid={`plan-${plan.key}`}
        >
            {isCurrent && <span className="text-yellow-500 font-bold mb-1" style={s10}>CURRENT PLAN</span>}
            {!isCurrent && plan.popular && <span className="text-yellow-400 font-bold mb-1" style={s10}>POPULAR</span>}
            <p className="font-bold" style={s14}>{plan.plan}</p>
            <p className="mb-3" style={s14}>
                <span className={`font-bold ${dark ? 'text-white' : 'text-black'}`}>{plan.price}</span>
                {plan.period && <span className={dark ? 'text-gray-400' : 'text-gray-500'}>{plan.period}</span>}
            </p>
            <div className="space-y-1.5 flex-1">
                {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-1.5">
                        <Check className={`w-3 h-3 mt-0.5 flex-shrink-0 ${dark ? 'text-yellow-400' : 'text-black'}`} />
                        <span className={dark ? 'text-gray-300' : 'text-gray-600'} style={s12}>{f}</span>
                    </div>
                ))}
            </div>
        </button>
    );
};

const UpgradeModal = ({ plan, planType, onConfirm, onClose, loading }) => {
    const plans = planType === 'creator' ? CREATOR_PLANS : BRAND_PLANS;
    const selected = plans.find(p => p.key === plan);
    if (!selected) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full" data-testid="upgrade-modal">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
                <div className="text-center mb-5">
                    <div className="w-12 h-12 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
                        <Crown className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="font-bold" style={s14}>Upgrade to {selected.plan}</p>
                    <p className="text-gray-500 mt-1" style={s12}>{selected.price}{selected.period}</p>
                </div>
                <div className="space-y-2 mb-5">
                    {selected.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-green-500" />
                            <span style={s12}>{f}</span>
                        </div>
                    ))}
                </div>
                <Button onClick={onConfirm} disabled={loading} className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-4" style={s14} data-testid="confirm-upgrade">
                    {loading ? 'Processing...' : `Subscribe to ${selected.plan}`}
                </Button>
            </div>
        </div>
    );
};

const PricingPage = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [wallet, setWallet] = useState(null);
    const [currentSub, setCurrentSub] = useState(null);
    const [upgradeModal, setUpgradeModal] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            const headers = { Authorization: `Bearer ${token}` };
            axios.get(`${API}/wallet`, { headers }).then(res => setWallet(res.data)).catch(() => {});
            axios.get(`${API}/subscriptions/my`, { headers }).then(res => setCurrentSub(res.data)).catch(() => {});
        }
    }, [token]);

    const handleUpgrade = async () => {
        if (!token) { navigate('/login'); return; }
        setLoading(true);
        try {
            const endpoint = upgradeModal.type === 'creator' ? 'subscriptions/creator' : 'subscriptions/brand';
            await axios.post(`${API}/${endpoint}`, { plan: upgradeModal.plan }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Upgraded to ${upgradeModal.plan}!`);
            setCurrentSub({ plan: upgradeModal.plan });
            setUpgradeModal(null);
        } catch (err) { toast.error(err.response?.data?.detail || 'Upgrade failed'); }
        finally { setLoading(false); }
    };

    const handlePlanSelect = (plan, type) => {
        if (plan === 'free') return;
        if (plan === currentSub?.plan) { toast('Already on this plan'); return; }
        if (!token) { navigate('/login'); return; }
        setUpgradeModal({ plan, type });
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {upgradeModal && (
                <UpgradeModal
                    plan={upgradeModal.plan}
                    planType={upgradeModal.type}
                    onConfirm={handleUpgrade}
                    onClose={() => setUpgradeModal(null)}
                    loading={loading}
                />
            )}

            {/* Hero */}
            <section className="pt-24 pb-10 px-4 bg-black text-white text-center" data-testid="pricing-hero">
                <div className="max-w-2xl mx-auto">
                    <h1 className="font-bold mb-2 tracking-tight" style={{ fontSize: '24px' }}>Credits & Pricing</h1>
                    <p className="text-gray-400" style={s14}>Buy Credits. Invite Creators. Run Campaigns Faster.</p>
                    {wallet && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5" data-testid="pricing-wallet-bar">
                            <Zap className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="font-semibold" style={s14}>{wallet.invite_credits} credits</span>
                        </div>
                    )}
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">

                {/* Subscriptions */}
                <section data-testid="subscriptions-section">
                    <div className="mb-10">
                        <h3 className="font-bold mb-4" style={s14}>Creator Subscriptions</h3>
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                            {CREATOR_PLANS.map((plan, i) => (
                                <PlanCard key={i} plan={plan} currentPlan={user?.role === 'creator' ? currentSub?.plan : null} onSelect={(p) => handlePlanSelect(p, 'creator')} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4" style={s14}>Brand Subscriptions</h3>
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                            {BRAND_PLANS.map((plan, i) => (
                                <PlanCard key={i} plan={plan} currentPlan={user?.role === 'brand' ? currentSub?.plan : null} onSelect={(p) => handlePlanSelect(p, 'brand')} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Other Paid Features */}
                <section data-testid="paid-features-section">
                    <h2 className="font-bold mb-5" style={{ fontSize: '18px' }}>Other Paid Features</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: <Eye className="w-4 h-4" />, title: 'Boost Campaign', price: '₹299 – ₹999', desc: 'Feature your campaign for more visibility' },
                            { icon: <Shield className="w-4 h-4" />, title: 'Verified Badge', price: '₹499 – ₹999', desc: 'Show credibility on creator profile' },
                            { icon: <Trophy className="w-4 h-4" />, title: 'Contest Mode', price: '₹499 – ₹1,999', desc: 'Pay only for winning submissions' },
                            { icon: <BarChart3 className="w-4 h-4" />, title: 'Advanced Analytics', price: '₹299 – ₹799/mo', desc: 'Track campaign performance' },
                        ].map((card, i) => (
                            <div key={i} className="border border-gray-200 rounded-xl p-4 flex flex-col" data-testid={`feature-card-${i}`}>
                                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mb-3 text-white">{card.icon}</div>
                                <h3 className="font-bold mb-0.5" style={s14}>{card.title}</h3>
                                <p className="text-gray-500 mb-3 flex-1" style={s12}>{card.desc}</p>
                                <p className="font-bold" style={s14}>{card.price}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="flex gap-3" data-testid="pricing-cta-section">
                    <Button onClick={() => navigate('/buy-credits')} className="flex-1 bg-black text-white hover:bg-gray-800 rounded-full font-semibold py-5" style={s14} data-testid="pricing-buy-credits-btn">
                        Buy Credits
                    </Button>
                    <Button onClick={() => navigate('/post-job')} variant="outline" className="flex-1 border-black text-black rounded-full font-semibold py-5" style={s14} data-testid="pricing-post-campaign-btn">
                        Post a Campaign
                    </Button>
                </section>
            </div>
        </div>
    );
};

export default PricingPage;
