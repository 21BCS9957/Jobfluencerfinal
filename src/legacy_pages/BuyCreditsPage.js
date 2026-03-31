'use client';

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Check, Zap, ArrowLeft, HelpCircle, ArrowRight, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const CREDIT_TIERS = [
    { credits: 250, price: 499 },
    { credits: 500, price: 999 },
    { credits: 1000, price: 1999 },
    { credits: 1500, price: 2999 },
    { credits: 2000, price: 3999 },
    { credits: 3000, price: 5999 },
    { credits: 5000, price: 9999, best: true },
];

const SuccessModal = ({ credits, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center" data-testid="success-modal">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white" data-testid="close-success-modal">
                <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-yellow-400/20 border-2 border-yellow-400/40 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-yellow-400" />
            </div>
            <p className="text-sm font-bold text-white mb-1">You have received</p>
            <p className="text-sm font-bold text-yellow-400 mb-2">{credits} Invite Credits</p>
            <p className="text-sm text-gray-500 mb-6">Top-up complete — you&apos;re all set to invite.</p>
            <Button
                onClick={onClose}
                className="w-full bg-white text-black hover:bg-gray-100 font-bold py-4 rounded-full text-sm gap-2"
                data-testid="continue-btn"
            >
                Continue <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
    </div>
);

const BuyCreditsPage = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(1);
    const [wallet, setWallet] = useState(null);
    const [showSuccess, setShowSuccess] = useState(null);
    const [buying, setBuying] = useState(false);

    useEffect(() => {
        if (token) {
            axios.get(`${API}/wallet`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setWallet(res.data)).catch(() => {});
        }
    }, [token]);

    const handleBuy = async () => {
        if (!token) { navigate('/login'); return; }
        const tier = CREDIT_TIERS[selected];
        if (!tier) return;
        setBuying(true);
        try {
            await axios.post(`${API}/wallet/topup`, {
                invite_credits: tier.credits,
                amount: tier.price
            }, { headers: { Authorization: `Bearer ${token}` } });
            const res = await axios.get(`${API}/wallet`, { headers: { Authorization: `Bearer ${token}` } });
            setWallet(res.data);
            setShowSuccess(tier.credits);
        } catch (err) { toast.error('Purchase failed'); }
        finally { setBuying(false); }
    };

    const selectedTier = CREDIT_TIERS[selected];

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {showSuccess && <SuccessModal credits={showSuccess} onClose={() => setShowSuccess(null)} />}

            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white flex items-center gap-2 text-sm" data-testid="back-btn">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                {wallet && (
                    <div className="flex items-center gap-1.5 text-sm text-white/60">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{wallet.invite_credits} credits</span>
                    </div>
                )}
            </div>

            <div className="flex-1 px-4 pb-24 max-w-lg mx-auto w-full">
                <h1 className="text-sm font-bold text-white mb-2 mt-4" style={{ fontSize: '14px' }}>Buy Invite Credits</h1>
                <p className="text-sm text-gray-500 mb-6">Select a credit package below</p>

                <div className="space-y-3">
                    {CREDIT_TIERS.map((tier, i) => {
                        const isSelected = selected === i;
                        return (
                            <button
                                key={i}
                                onClick={() => setSelected(i)}
                                className={`w-full text-left rounded-xl p-4 border transition-all ${
                                    isSelected
                                        ? 'border-white bg-white/5'
                                        : tier.best
                                            ? 'border-yellow-500/30 bg-yellow-900/10'
                                            : 'border-white/10 bg-white/[0.03]'
                                }`}
                                data-testid={`credit-tier-${tier.credits}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white">{tier.credits} credits</span>
                                                {tier.best && (
                                                    <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">BEST VALUE</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-green-400 font-medium mt-0.5">INR {tier.price.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-black" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <Link
                    to="/pricing"
                    className="flex items-center justify-center gap-2 text-white/40 hover:text-white/70 text-sm font-medium mt-8 py-4 border border-white/10 rounded-xl transition-colors"
                    data-testid="how-credits-work-link"
                >
                    <HelpCircle className="w-3.5 h-3.5" /> How do credits work?
                </Link>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 p-4 z-50">
                <div className="max-w-lg mx-auto">
                    <Button
                        onClick={handleBuy}
                        disabled={buying}
                        className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold py-5 rounded-xl text-sm disabled:opacity-50"
                        data-testid="buy-credits-submit"
                    >
                        {buying ? 'Processing...' : `Buy ${selectedTier?.credits} Credits — INR ${selectedTier?.price.toLocaleString('en-IN')}`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BuyCreditsPage;
