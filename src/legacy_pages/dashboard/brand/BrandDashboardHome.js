'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { MapPin, X, Check, Eye, MessageCircle, Users } from 'lucide-react';
import { API, CATEGORIES, CITIES } from '../shared';

const COVER_GRADIENTS = [
    'from-gray-800 to-gray-600',
    'from-gray-900 to-gray-700',
    'from-zinc-800 to-zinc-600',
    'from-neutral-800 to-neutral-600',
    'from-stone-800 to-stone-600',
    'from-gray-700 to-gray-500',
];
const getGradient = (i) => COVER_GRADIENTS[i % COVER_GRADIENTS.length];

export const BrandDashboardHome = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [inviteModal, setInviteModal] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [cityFilter, setCityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [creatorsRes, campaignsRes, walletRes] = await Promise.all([
                axios.get(`${API}/creators`),
                axios.get(`${API}/jobs/my`, { headers }),
                axios.get(`${API}/wallet`, { headers }),
            ]);
            setCreators(creatorsRes.data.creators || creatorsRes.data);
            setCampaigns((campaignsRes.data || []).filter(c => c.status === 'active' || c.status === 'open'));
            setWallet(walletRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const filteredCreators = creators.filter(c => {
        const matchCity = !cityFilter || c.city === cityFilter;
        const matchCategory = !categoryFilter || c.category === categoryFilter;
        return matchCity && matchCategory;
    });

    const formatFollowers = (n) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n;

    const handleInvite = async () => {
        if (!selectedCampaign) { toast.error('Select a campaign'); return; }
        setSending(true);
        try {
            await axios.post(`${API}/invites`, {
                campaign_id: selectedCampaign,
                influencer_id: inviteModal.creatorId,
                message: inviteMessage
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Invite sent to ${inviteModal.creatorName}!`);
            setInviteModal(null);
            setSelectedCampaign('');
            setInviteMessage('');
            const walletRes = await axios.get(`${API}/wallet`, { headers: { Authorization: `Bearer ${token}` } });
            setWallet(walletRes.data);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to send invite');
        } finally { setSending(false); }
    };

    return (
        <div className="bg-black -mx-4 -mt-4 px-4 pt-4 pb-24 min-h-screen">
            {/* ===== DARK HERO SECTION ===== */}
            <div className="p-6 mb-6" data-testid="find-influencers-hero">
                <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4" data-testid="hero-heading">FIND<br/>INFLUENCERS</h1>
                <div className="flex items-end justify-between mb-5">
                    <p className="text-gray-400 text-sm leading-relaxed">Discover talented influencers in<br/>your city</p>
                    <p className="text-right"><span className="text-white text-xl font-bold">{filteredCreators.length}</span><span className="text-gray-400 text-sm ml-1">influencers<br/>found</span></p>
                </div>
                <div className="flex gap-3">
                    <Select value={cityFilter || 'all'} onValueChange={(v) => setCityFilter(v === 'all' ? '' : v)}>
                        <SelectTrigger className="flex-1 bg-transparent border-gray-600 text-white rounded-lg h-12" data-testid="hero-city-filter">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="All Cities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter || 'all'} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
                        <SelectTrigger className="flex-1 bg-transparent border-gray-600 text-white rounded-lg h-12" data-testid="hero-category-filter">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {filteredCreators.slice(0, 10).map((creator, index) => (
                        <div
                            key={creator.id}
                            className="rounded-2xl overflow-hidden bg-white shadow-lg group cursor-pointer"
                            onClick={() => navigate(`/influencers/${creator.user_id}`)}
                            data-testid={`creator-card-${creator.id}`}
                        >
                            <div className="relative aspect-square overflow-hidden">
                                {creator.profile_image_url ? (
                                    <img src={creator.profile_image_url} alt={creator.display_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${getGradient(index)} flex items-center justify-center`}>
                                        <span className="text-5xl font-bold text-white/30">{creator.display_name?.charAt(0) || '?'}</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl">
                                    <Check className="w-5 h-5 text-black" />
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-sm font-bold tracking-tight mb-1 text-black">{creator.display_name}</h3>
                                <p className="text-sm text-gray-500 mb-5">{creator.city}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/messages?to=${creator.user_id}`); }}
                                        className="flex-1 text-sm font-semibold py-3 rounded-lg border-2 border-black text-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                                        data-testid={`chat-btn-${creator.id}`}
                                    >
                                        <MessageCircle className="w-4 h-4" /> Chat
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setInviteModal({ creatorId: creator.user_id, creatorName: creator.display_name }); }}
                                        className="flex-1 text-sm font-semibold py-3 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors flex items-center justify-center gap-2"
                                        data-testid={`hire-btn-${creator.id}`}
                                    >
                                        Hire
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {inviteModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center" onClick={() => setInviteModal(null)}>
                    <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="invite-modal">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Invite {inviteModal.creatorName}</h3>
                            <button onClick={() => setInviteModal(null)}><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Select a campaign and send an invite. Uses 1 invite credit (Rs.49 value).</p>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-semibold mb-2 block">Campaign</Label>
                                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                                    <SelectTrigger className="border-gray-300 rounded-lg" data-testid="invite-campaign-select"><SelectValue placeholder="Select campaign" /></SelectTrigger>
                                    <SelectContent>
                                        {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-semibold mb-2 block">Message (optional)</Label>
                                <Textarea value={inviteMessage} onChange={e => setInviteMessage(e.target.value)} placeholder="We'd love to have you on this campaign..." className="border-gray-300 rounded-lg" rows={3} data-testid="invite-message-input" />
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                                <span className="text-sm text-gray-600">Cost: 1 invite credit</span>
                                <span className="text-sm font-bold">{wallet?.invite_credits || 0} credits left</span>
                            </div>
                            <Button onClick={handleInvite} disabled={sending || !selectedCampaign} className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-3 disabled:opacity-50" data-testid="send-invite-btn">
                                {sending ? 'Sending...' : 'Send Invite'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
