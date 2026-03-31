'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, Trophy, Users, Star, Check, Crown, Zap, ChevronRight } from 'lucide-react';
import { FeatureGate } from './dashboard/shared';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Enable contest mode on a specific campaign
const EnableContestSection = ({ campaigns, token, onEnabled }) => {
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [prize, setPrize] = useState('');
    const [credits, setCredits] = useState(15);
    const [enabling, setEnabling] = useState(false);

    const eligibleCampaigns = campaigns.filter(c => !c.is_contest && (c.status === 'active' || c.status === 'open'));

    const handleEnable = async () => {
        if (!selectedCampaign) { toast.error('Select a campaign'); return; }
        setEnabling(true);
        try {
            await axios.post(`${API}/campaigns/${selectedCampaign.id}/contest`, {
                credits, prize: parseFloat(prize) || 0
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Contest mode enabled!');
            onEnabled();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to enable contest mode'); }
        finally { setEnabling(false); }
    };

    return (
        <section className="mb-8" data-testid="enable-contest-section">
            <h2 className="text-lg font-bold mb-4">Create a Contest</h2>
            <p className="text-sm text-gray-500 mb-6">Turn any campaign into a contest. Pay only for the winning submission.</p>

            {eligibleCampaigns.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                    <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No eligible campaigns. Post a new job first to create a contest.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-semibold mb-2 block">Select Campaign</Label>
                        <div className="space-y-2">
                            {eligibleCampaigns.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedCampaign(c)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedCampaign?.id === c.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
                                    data-testid={`contest-campaign-${c.id}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold">{c.title}</p>
                                            <p className="text-xs text-gray-500">{c.category} &middot; {c.city} &middot; {c.applicants_count || 0} applicants</p>
                                        </div>
                                        {selectedCampaign?.id === c.id && (
                                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                                                <Check className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-semibold mb-2 block">Prize Amount (Rs.)</Label>
                        <Input
                            type="number"
                            value={prize}
                            onChange={e => setPrize(e.target.value)}
                            placeholder="e.g. 10000"
                            className="border-gray-300 rounded-lg"
                            data-testid="contest-prize-input"
                        />
                        <p className="text-xs text-gray-400 mt-1">This is the amount the winner will receive</p>
                    </div>

                    <div>
                        <Label className="text-sm font-semibold mb-2 block">Credits to Spend: {credits}</Label>
                        <input
                            type="range"
                            min={15}
                            max={70}
                            value={credits}
                            onChange={e => setCredits(parseInt(e.target.value))}
                            className="w-full accent-black"
                            data-testid="contest-credits-slider"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>15 credits (basic)</span>
                            <span>70 credits (max visibility)</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold">Total Cost</p>
                            <p className="text-xs text-gray-500">{credits} credits will be deducted</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-lg font-bold">{credits}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleEnable}
                        disabled={enabling || !selectedCampaign}
                        className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-5 disabled:opacity-50"
                        data-testid="enable-contest-btn"
                    >
                        <Trophy className="w-4 h-4 mr-2" />
                        {enabling ? 'Enabling...' : 'Enable Contest Mode'}
                    </Button>
                </div>
            )}
        </section>
    );
};

// Active contests list with winner selection
const ActiveContestsSection = ({ campaigns, token, onUpdate }) => {
    const navigate = useNavigate();
    const [selectingWinner, setSelectingWinner] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const activeContests = campaigns.filter(c => c.is_contest);

    const openWinnerPicker = async (campaign) => {
        setSelectingWinner(campaign);
        setLoadingApps(true);
        try {
            const res = await axios.get(`${API}/applications/campaign/${campaign.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplicants(res.data);
        } catch (err) { toast.error('Failed to load applicants'); }
        finally { setLoadingApps(false); }
    };

    const handleSelectWinner = async (winnerId) => {
        setSubmitting(true);
        try {
            await axios.post(`${API}/campaigns/${selectingWinner.id}/contest/winner`, {
                winner_id: winnerId
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Winner selected! Contest completed.');
            setSelectingWinner(null);
            setApplicants([]);
            onUpdate();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to select winner'); }
        finally { setSubmitting(false); }
    };

    if (activeContests.length === 0) return null;

    return (
        <section className="mb-8" data-testid="active-contests-section">
            <h2 className="text-lg font-bold mb-4">Active Contests</h2>
            <div className="space-y-3">
                {activeContests.map(contest => (
                    <div key={contest.id} className="border border-gray-200 rounded-xl p-4" data-testid={`contest-card-${contest.id}`}>
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-bold">{contest.title}</h3>
                                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">Contest</Badge>
                                </div>
                                <p className="text-xs text-gray-500">{contest.category} &middot; {contest.city}</p>
                            </div>
                            {contest.contest_winner_id ? (
                                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">Winner Selected</Badge>
                            ) : (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Open</Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {contest.applicants_count || 0} submissions</span>
                            {contest.contest_prize > 0 && (
                                <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Rs.{contest.contest_prize?.toLocaleString('en-IN')} prize</span>
                            )}
                        </div>

                        {!contest.contest_winner_id ? (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => openWinnerPicker(contest)}
                                    className="flex-1 bg-black text-white hover:bg-gray-800 rounded-full text-sm"
                                    data-testid={`pick-winner-${contest.id}`}
                                >
                                    <Crown className="w-4 h-4 mr-2" /> Pick Winner
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/dashboard/brand/jobs/${contest.id}/applicants`)}
                                    className="flex-1 rounded-full text-sm"
                                    data-testid={`view-submissions-${contest.id}`}
                                >
                                    View Submissions
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                                <Crown className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-700 font-semibold">Winner has been selected</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Winner Selection Modal */}
            {selectingWinner && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center" onClick={() => setSelectingWinner(null)}>
                    <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="winner-modal">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Select Winner</h3>
                            <button onClick={() => setSelectingWinner(null)} className="text-gray-400 hover:text-black">
                                &times;
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Choose the winning submission for &quot;{selectingWinner.title}&quot;</p>

                        {loadingApps ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                            </div>
                        ) : applicants.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">No applicants yet</p>
                        ) : (
                            <div className="space-y-3">
                                {applicants.map(app => (
                                    <div key={app.id} className="border border-gray-200 rounded-xl p-4" data-testid={`applicant-${app.id}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-bold">{app.creator_name || 'Creator'}</p>
                                                <p className="text-xs text-gray-500">{app.creator_category} &middot; {app.creator_city}</p>
                                            </div>
                                            {app.creator_profile?.avg_rating > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-xs font-bold">{app.creator_profile.avg_rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{app.proposal}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-green-600">Rs.{app.price?.toLocaleString('en-IN')}</span>
                                            <Button
                                                onClick={() => handleSelectWinner(app.creator_id)}
                                                disabled={submitting}
                                                className="bg-black text-white hover:bg-gray-800 rounded-full text-xs px-4 py-1.5"
                                                data-testid={`select-winner-${app.creator_id}`}
                                            >
                                                <Crown className="w-3 h-3 mr-1.5" />
                                                {submitting ? 'Selecting...' : 'Select as Winner'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

const ContestPage = () => {
    const { user, token, subscription } = useAuth();
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchCampaigns(); }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await axios.get(`${API}/jobs/my`, { headers: { Authorization: `Bearer ${token}` } });
            setCampaigns(res.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div data-testid="contest-page">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-black" data-testid="back-btn">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold">Contest Mode</h1>
            </div>

            <FeatureGate plan={subscription?.plan} requiredPlan="pro" featureName="Contest Mode">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6" data-testid="contest-info">
                    <div className="flex items-start gap-3">
                        <Trophy className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-yellow-800 mb-1">How Contest Mode Works</p>
                            <p className="text-xs text-yellow-700 leading-relaxed">
                                Turn any campaign into a contest. Creators submit their work, and you only pay the winner.
                                Set a prize amount, enable contest mode, review submissions, and pick the best one.
                            </p>
                        </div>
                    </div>
                </div>

                <ActiveContestsSection campaigns={campaigns} token={token} onUpdate={fetchCampaigns} />
                <EnableContestSection campaigns={campaigns} token={token} onEnabled={fetchCampaigns} />
            </FeatureGate>
        </div>
    );
};

export default ContestPage;
