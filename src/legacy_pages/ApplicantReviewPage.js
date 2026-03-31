'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, MapPin, Star, Clock, CheckCircle, XCircle, Users, Bookmark, ChevronDown, DollarSign } from 'lucide-react';
import { EscrowModal, ReleasePaymentModal } from './dashboard/MonetizationModals';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLUMNS = [
    { key: 'pending', label: 'New', color: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-600' },
    { key: 'shortlisted', label: 'Shortlisted', color: 'bg-yellow-500', lightBg: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { key: 'hired', label: 'Accepted', color: 'bg-green-500', lightBg: 'bg-green-50', textColor: 'text-green-600' },
    { key: 'rejected', label: 'Rejected', color: 'bg-red-500', lightBg: 'bg-red-50', textColor: 'text-red-400' },
];

const ApplicantCard = ({ app, onStatusChange, updating, escrow, onFundEscrow, onReleasePayment }) => {
    const navigate = useNavigate();
    const [showActions, setShowActions] = useState(false);
    const profile = app.creator_profile;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3" data-testid={`applicant-card-${app.id}`}>
            <div className="flex items-start gap-3 mb-3">
                <div
                    className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/influencers/${app.creator_id}`)}
                >
                    {profile?.profile_image_url ? (
                        <img src={profile.profile_image_url} alt={app.creator_name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                            <span className="text-sm font-bold text-white/50">{app.creator_name?.charAt(0)}</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate cursor-pointer hover:underline" onClick={() => navigate(`/influencers/${app.creator_id}`)}>
                        {app.creator_name}
                    </p>
                    <p className="text-sm text-gray-500">{app.creator_category || profile?.category}</p>
                    {app.creator_city && (
                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {app.creator_city}
                        </p>
                    )}
                </div>
            </div>

            {/* Proposal */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{app.proposal}</p>

            <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                <span className="font-semibold text-black">₹{app.price?.toLocaleString('en-IN')}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {app.timeline}</span>
                {profile?.avg_rating > 0 && (
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {profile.avg_rating.toFixed(1)}</span>
                )}
            </div>

            {/* Action buttons based on status */}
            <div className="relative">
                <button
                    onClick={() => setShowActions(!showActions)}
                    className="w-full text-sm font-semibold border border-gray-200 rounded-lg py-2 hover:bg-gray-50 flex items-center justify-center gap-1"
                    data-testid={`actions-btn-${app.id}`}
                >
                    Move to <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showActions ? 'rotate-180' : ''}`} />
                </button>
                {showActions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden" data-testid={`actions-menu-${app.id}`}>
                        {COLUMNS.filter(c => c.key !== app.status).map(col => (
                            <button
                                key={col.key}
                                onClick={() => { onStatusChange(app.id, col.key); setShowActions(false); }}
                                disabled={updating}
                                className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 flex items-center gap-2 ${col.textColor} disabled:opacity-50`}
                                data-testid={`move-to-${col.key}-${app.id}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                                {col.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Escrow actions for hired applicants */}
            {app.status === 'hired' && (
                <div className="mt-2">
                    {!escrow ? (
                        <button
                            onClick={() => onFundEscrow(app)}
                            className="w-full text-sm font-semibold bg-black text-white rounded-lg py-2 hover:bg-gray-800 flex items-center justify-center gap-1.5"
                            data-testid={`fund-escrow-applicant-${app.id}`}
                        >
                            <DollarSign className="w-3.5 h-3.5" /> Fund Escrow Payment
                        </button>
                    ) : escrow.status === 'funded' ? (
                        <button
                            onClick={() => onReleasePayment(escrow)}
                            className="w-full text-sm font-semibold bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 flex items-center justify-center gap-1.5"
                            data-testid={`release-payment-${app.id}`}
                        >
                            <DollarSign className="w-3.5 h-3.5" /> Release Payment
                        </button>
                    ) : escrow.status === 'released' ? (
                        <div className="text-center py-2 bg-gray-50 rounded-lg text-sm text-gray-500 font-medium" data-testid={`payment-released-${app.id}`}>
                            Payment Released
                        </div>
                    ) : (
                        <div className="text-center py-2 bg-yellow-50 rounded-lg text-sm text-yellow-700 font-medium" data-testid={`escrow-pending-${app.id}`}>
                            Escrow: {escrow.status}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ApplicantReviewPage = () => {
    const { id: campaignId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [activeColumn, setActiveColumn] = useState('pending');
    const [escrowModal, setEscrowModal] = useState(null);
    const [escrows, setEscrows] = useState([]);
    const [releaseModal, setReleaseModal] = useState(null);

    useEffect(() => { fetchData(); }, [campaignId]);

    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [appsRes, campRes, escrowRes] = await Promise.all([
                axios.get(`${API}/applications/campaign/${campaignId}`, { headers }),
                axios.get(`${API}/jobs/${campaignId}`),
                axios.get(`${API}/escrow/campaign/${campaignId}`, { headers }).catch(() => ({ data: [] })),
            ]);
            setApplications(appsRes.data);
            setCampaign(campRes.data);
            setEscrows(escrowRes.data || []);
        } catch (err) { toast.error('Failed to load applicants'); }
        finally { setLoading(false); }
    };

    const handleStatusChange = async (appId, newStatus) => {
        setUpdating(true);
        try {
            await axios.put(`${API}/applications/${appId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
            const col = COLUMNS.find(c => c.key === newStatus);
            toast.success(`Moved to ${col?.label}`);
        } catch (err) { toast.error('Failed to update'); }
        finally { setUpdating(false); }
    };

    const getColumnApps = (status) => applications.filter(a => a.status === status);

    const getEscrowForCreator = (creatorId) => escrows.find(e => e.creator_id === creatorId);

    const handleFundEscrow = (app) => {
        setEscrowModal({ campaign: campaign, creator: { id: app.creator_id, name: app.creator_name } });
    };

    const handleReleasePayment = (escrow) => {
        setReleaseModal(escrow);
    };

    if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-black" data-testid="back-btn">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-bold truncate">{campaign?.title || 'Campaign'}</h1>
                    <p className="text-sm text-gray-500">{applications.length} applicant{applications.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Column tabs (mobile) */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar" data-testid="column-tabs">
                {COLUMNS.map(col => {
                    const count = getColumnApps(col.key).length;
                    return (
                        <button
                            key={col.key}
                            onClick={() => setActiveColumn(col.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors ${
                                activeColumn === col.key ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'
                            }`}
                            data-testid={`tab-${col.key}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${activeColumn === col.key ? 'bg-white' : col.color}`} />
                            {col.label} <span className={activeColumn === col.key ? 'text-gray-400' : 'text-gray-300'}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Desktop: Kanban columns, Mobile: active tab */}
            {/* Mobile view */}
            <div className="md:hidden">
                {getColumnApps(activeColumn).length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                        <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">No applicants in {COLUMNS.find(c => c.key === activeColumn)?.label}</p>
                    </div>
                ) : (
                    getColumnApps(activeColumn).map(app => (
                        <ApplicantCard key={app.id} app={app} onStatusChange={handleStatusChange} updating={updating}
                            escrow={getEscrowForCreator(app.creator_id)} onFundEscrow={handleFundEscrow} onReleasePayment={handleReleasePayment} />
                    ))
                )}
            </div>

            {/* Desktop: 4-column Kanban */}
            <div className="hidden md:grid md:grid-cols-4 gap-4">
                {COLUMNS.map(col => (
                    <div key={col.key} data-testid={`column-${col.key}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                            <span className="text-sm font-bold">{col.label}</span>
                            <span className="text-sm text-gray-400">{getColumnApps(col.key).length}</span>
                        </div>
                        <div className="min-h-[200px]">
                            {getColumnApps(col.key).length === 0 ? (
                                <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center">
                                    <p className="text-sm text-gray-300">Empty</p>
                                </div>
                            ) : (
                                getColumnApps(col.key).map(app => (
                                    <ApplicantCard key={app.id} app={app} onStatusChange={handleStatusChange} updating={updating}
                                        escrow={getEscrowForCreator(app.creator_id)} onFundEscrow={handleFundEscrow} onReleasePayment={handleReleasePayment} />
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {escrowModal && (
                <EscrowModal
                    campaign={escrowModal.campaign}
                    creator={escrowModal.creator}
                    onClose={() => setEscrowModal(null)}
                    onSuccess={() => { fetchData(); setEscrowModal(null); }}
                />
            )}

            {releaseModal && (
                <ReleasePaymentModal
                    escrow={releaseModal}
                    onClose={() => setReleaseModal(null)}
                    onReleased={() => { fetchData(); setReleaseModal(null); }}
                />
            )}
        </div>
    );
};

export default ApplicantReviewPage;
