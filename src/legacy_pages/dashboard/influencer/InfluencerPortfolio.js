'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import {
    MapPin, Shield, Star, Upload, Trash2, Video, LinkIcon, Plus,
    ExternalLink, Users, TrendingUp, Eye, MessageCircle, ArrowRight,
    Instagram, Youtube, Globe, Share2, Copy, DollarSign, Pencil
} from 'lucide-react';
import { API } from '../shared';
import { VerifiedBadgeModal } from '../MonetizationModals';

export const InfluencerPortfolio = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [portfolioLinks, setPortfolioLinks] = useState([]);
    const [services, setServices] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showAddLink, setShowAddLink] = useState(false);
    const [newLink, setNewLink] = useState({ url: '', title: '', platform: 'other' });
    const [showAddService, setShowAddService] = useState(false);
    const [newService, setNewService] = useState({ name: '', price: '', description: '' });
    const [editingService, setEditingService] = useState(null);
    const fileInputRef = useRef(null);
    const [showVerifiedModal, setShowVerifiedModal] = useState(false);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [profileRes, portfolioRes, linksRes, servicesRes, reviewsRes, appsRes] = await Promise.all([
                axios.get(`${API}/creators/${user?.id}`),
                axios.get(`${API}/portfolio/${user?.id}`),
                axios.get(`${API}/portfolio/links/${user?.id}`),
                axios.get(`${API}/portfolio/services/${user?.id}`),
                axios.get(`${API}/reviews/${user?.id}`),
                axios.get(`${API}/applications/my`, { headers }).catch(() => ({ data: [] })),
            ]);
            setProfile(profileRes.data);
            setPortfolio(portfolioRes.data);
            setPortfolioLinks(linksRes.data);
            setServices(servicesRes.data);
            setReviews(reviewsRes.data);
            setApplications(appsRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                await axios.post(`${API}/portfolio/upload?title=${encodeURIComponent(file.name)}`, formData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
            }
            toast.success(`${files.length} file(s) uploaded`);
            const res = await axios.get(`${API}/portfolio/${user?.id}`);
            setPortfolio(res.data);
        } catch (err) { toast.error(err.response?.data?.detail || 'Upload failed'); }
        finally { setUploading(false); }
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${API}/portfolio/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setPortfolio(prev => prev.filter(p => p.id !== id));
            toast.success('Item removed');
        } catch (err) { toast.error('Delete failed'); }
    };

    const handleAddLink = async () => {
        if (!newLink.url) return;
        try {
            const res = await axios.post(`${API}/portfolio/links`, newLink, { headers: { Authorization: `Bearer ${token}` } });
            setPortfolioLinks(prev => [res.data, ...prev]);
            setNewLink({ url: '', title: '', platform: 'other' });
            setShowAddLink(false);
            toast.success('Link added');
        } catch (err) { toast.error('Failed to add link'); }
    };

    const handleDeleteLink = async (id) => {
        try {
            await axios.delete(`${API}/portfolio/links/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setPortfolioLinks(prev => prev.filter(l => l.id !== id));
            toast.success('Link removed');
        } catch (err) { toast.error('Delete failed'); }
    };

    const handleAddService = async () => {
        if (!newService.name || !newService.price) { toast.error('Name and price are required'); return; }
        try {
            const res = await axios.post(`${API}/portfolio/services`, newService, { headers: { Authorization: `Bearer ${token}` } });
            setServices(prev => [res.data, ...prev]);
            setNewService({ name: '', price: '', description: '' });
            setShowAddService(false);
            toast.success('Service added');
        } catch (err) { toast.error('Failed to add service'); }
    };

    const handleUpdateService = async () => {
        if (!editingService) return;
        try {
            const res = await axios.put(`${API}/portfolio/services/${editingService.id}`, {
                name: editingService.name, price: editingService.price, description: editingService.description
            }, { headers: { Authorization: `Bearer ${token}` } });
            setServices(prev => prev.map(s => s.id === editingService.id ? res.data : s));
            setEditingService(null);
            toast.success('Service updated');
        } catch (err) { toast.error('Failed to update service'); }
    };

    const handleDeleteService = async (id) => {
        try {
            await axios.delete(`${API}/portfolio/services/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setServices(prev => prev.filter(s => s.id !== id));
            toast.success('Service removed');
        } catch (err) { toast.error('Delete failed'); }
    };

    const sharePortfolio = () => {
        const url = `${window.location.origin}/influencers/${user?.id}`;
        navigator.clipboard.writeText(url).then(() => toast.success('Portfolio link copied! Share it with brands.')).catch(() => toast.error('Could not copy'));
    };

    const formatFollowers = (n) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);

    const pastCampaigns = applications.filter(a => a.status === 'hired');

    if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>;

    return (
        <div data-testid="portfolio-page">
            {/* Share Bar */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">My Portfolio</h1>
                <Button onClick={sharePortfolio} variant="outline" className="rounded-full text-sm gap-2" data-testid="share-btn">
                    <Share2 className="w-4 h-4" /> Share
                </Button>
            </div>

            {/* ===== PROFILE OVERVIEW ===== */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6" data-testid="profile-overview">
                <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-full bg-black flex-shrink-0 overflow-hidden">
                        {profile?.profile_image_url ? (
                            <img src={profile.profile_image_url} alt={profile.display_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">{(profile?.display_name || '?').split(' ').map(n => n[0]).join('')}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-sm font-bold truncate">{profile?.display_name || user?.name}</h2>
                            {profile?.is_verified && (
                                <span className="inline-flex items-center gap-1 bg-black text-white rounded-full px-2 py-0.5" style={{ fontSize: '9px' }}>
                                    <Shield className="w-2.5 h-2.5" /> Verified
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-1"><MapPin className="w-3.5 h-3.5" /> {profile?.city || user?.city}</p>
                        <p className="text-sm text-gray-500 mb-2">{profile?.category || 'Creator'}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {(profile?.platforms || []).map(p => (
                                <span key={p} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full font-medium">{p}</span>
                            ))}
                        </div>
                    </div>
                </div>
                {profile?.bio && <p className="text-sm text-gray-600 mt-4 leading-relaxed">{profile.bio}</p>}
                <button onClick={() => navigate('/edit-profile')} className="mt-3 text-sm font-semibold text-black flex items-center gap-1.5 hover:underline" data-testid="edit-profile-btn">
                    <Pencil className="w-3.5 h-3.5" /> Edit Profile
                </button>
            </div>

            {/* ===== KEY STATS ===== */}
            <div className="grid grid-cols-4 gap-2 mb-6" data-testid="key-stats">
                <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
                    <p className="text-lg font-bold">{formatFollowers(profile?.followers_count || 0)}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
                    <p className="text-lg font-bold">{profile?.avg_rating?.toFixed(1) || '0.0'}</p>
                    <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
                    <p className="text-lg font-bold">{pastCampaigns.length}</p>
                    <p className="text-xs text-gray-500">Projects</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
                    <p className="text-lg font-bold">{reviews.length}</p>
                    <p className="text-xs text-gray-500">Reviews</p>
                </div>
            </div>

            {/* ===== NICHES ===== */}
            {(profile?.niches || []).length > 0 && (
                <div className="mb-6" data-testid="niches-section">
                    <h3 className="text-sm font-bold mb-2">Niches</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.niches.map(n => (
                            <span key={n} className="text-xs font-medium bg-black text-white px-3 py-1.5 rounded-full">{n}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== SERVICES & PRICING ===== */}
            <div className="mb-6" data-testid="services-section">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">Services & Pricing</h3>
                    <button onClick={() => setShowAddService(!showAddService)} className="text-sm font-semibold text-black flex items-center gap-1" data-testid="add-service-toggle">
                        <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                </div>

                {showAddService && (
                    <div className="border border-gray-200 rounded-xl p-4 mb-3 space-y-3" data-testid="add-service-form">
                        <Input value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="Service name (e.g. Instagram Reel)" className="border-gray-300 rounded-lg" data-testid="service-name-input" />
                        <Input value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} placeholder="Price (e.g. Rs.5,000 or On request)" className="border-gray-300 rounded-lg" data-testid="service-price-input" />
                        <Input value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} placeholder="Brief description (optional)" className="border-gray-300 rounded-lg" data-testid="service-desc-input" />
                        <div className="flex gap-2">
                            <Button onClick={handleAddService} className="flex-1 bg-black text-white rounded-lg" data-testid="save-service-btn">Save</Button>
                            <Button variant="outline" onClick={() => setShowAddService(false)} className="rounded-lg">Cancel</Button>
                        </div>
                    </div>
                )}

                {editingService && (
                    <div className="border-2 border-black rounded-xl p-4 mb-3 space-y-3" data-testid="edit-service-form">
                        <Input value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} placeholder="Service name" className="border-gray-300 rounded-lg" />
                        <Input value={editingService.price} onChange={e => setEditingService({...editingService, price: e.target.value})} placeholder="Price" className="border-gray-300 rounded-lg" />
                        <Input value={editingService.description || ''} onChange={e => setEditingService({...editingService, description: e.target.value})} placeholder="Brief description (optional)" className="border-gray-300 rounded-lg" />
                        <div className="flex gap-2">
                            <Button onClick={handleUpdateService} className="flex-1 bg-black text-white rounded-lg" data-testid="update-service-btn">Update</Button>
                            <Button variant="outline" onClick={() => setEditingService(null)} className="rounded-lg">Cancel</Button>
                        </div>
                    </div>
                )}

                {services.length > 0 ? (
                    <div className="space-y-2">
                        {services.map(svc => (
                            <div key={svc.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl group" data-testid={`service-${svc.id}`}>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium">{svc.name}</span>
                                    {svc.description && <p className="text-xs text-gray-400 truncate">{svc.description}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">{svc.price}</span>
                                    <button onClick={() => setEditingService({...svc})} className="text-gray-300 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`edit-service-${svc.id}`}>
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteService(svc.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`delete-service-${svc.id}`}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                        <DollarSign className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Add your services and pricing</p>
                    </div>
                )}
            </div>

            {/* ===== CONTENT PORTFOLIO ===== */}
            <div className="mb-6" data-testid="content-portfolio">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">Content Portfolio</h3>
                    <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-sm font-semibold text-black flex items-center gap-1" data-testid="upload-btn">
                        {uploading ? <div className="w-3 h-3 border-2 border-gray-300 border-t-black rounded-full animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
                {portfolio.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        {portfolio.map(item => (
                            <div key={item.id} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square" data-testid={`portfolio-item-${item.id}`}>
                                {item.type === 'image' ? (
                                    <img src={`${API}/files/${item.storage_path}`} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        <Video className="w-6 h-6 text-white" />
                                    </div>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`delete-${item.id}`}>
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                        <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Upload your best work</p>
                    </div>
                )}
            </div>

            {/* ===== CONTENT LINKS ===== */}
            <div className="mb-6" data-testid="content-links">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">Content Links</h3>
                    <button onClick={() => setShowAddLink(!showAddLink)} className="text-sm font-semibold text-black flex items-center gap-1" data-testid="add-link-toggle">
                        <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                </div>

                {showAddLink && (
                    <div className="border border-gray-200 rounded-xl p-4 mb-3 space-y-3">
                        <Input value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} placeholder="Title" className="border-gray-300 rounded-lg" />
                        <Input value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} placeholder="https://..." className="border-gray-300 rounded-lg" />
                        <Select value={newLink.platform} onValueChange={v => setNewLink({...newLink, platform: v})}>
                            <SelectTrigger className="border-gray-300 rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {['Instagram', 'YouTube', 'Behance', 'Dribbble', 'Website', 'Other'].map(p => (
                                    <SelectItem key={p} value={p.toLowerCase()}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                            <Button onClick={handleAddLink} className="flex-1 bg-black text-white rounded-lg">Save</Button>
                            <Button variant="outline" onClick={() => setShowAddLink(false)} className="rounded-lg">Cancel</Button>
                        </div>
                    </div>
                )}

                {portfolioLinks.length > 0 ? (
                    <div className="space-y-2">
                        {portfolioLinks.map(link => (
                            <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl" data-testid={`link-${link.id}`}>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                                        <LinkIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{link.title || link.url}</p>
                                        <p className="text-xs text-gray-400 capitalize">{link.platform}</p>
                                    </div>
                                </a>
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                                    <button onClick={() => handleDeleteLink(link.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center py-4">Add your best reels, posts, and collaborations</p>
                )}
            </div>

            {/* ===== REVIEWS & PAST CAMPAIGNS ===== */}
            <div className="mb-6" data-testid="reviews-section">
                <h3 className="text-sm font-bold mb-3">Reviews & Past Work</h3>
                {reviews.length > 0 ? (
                    <div className="space-y-3">
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
                                    <div className="flex items-center gap-0.5">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-black text-black' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : pastCampaigns.length > 0 ? (
                    <div className="space-y-2">
                        {pastCampaigns.map(app => (
                            <div key={app.id} className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm font-bold">{app.campaign?.title || 'Campaign'}</p>
                                <p className="text-xs text-gray-500">{app.campaign?.brand_name} &middot; {app.campaign?.city}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center py-4">Complete campaigns to build your review history</p>
                )}
            </div>

            {/* ===== CTA BUTTONS ===== */}
            <div className="space-y-3 mb-6" data-testid="cta-section">
                {!profile?.is_verified && (
                    <Button onClick={() => setShowVerifiedModal(true)} className="w-full bg-gray-900 text-white hover:bg-black rounded-full py-5 gap-2" data-testid="get-verified-portfolio-btn">
                        <Shield className="w-4 h-4" /> Get Verified Badge
                    </Button>
                )}
                <Button onClick={sharePortfolio} className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-5 gap-2" data-testid="share-portfolio-btn">
                    <Copy className="w-4 h-4" /> Share Portfolio Link
                </Button>
            </div>

            {showVerifiedModal && (
                <VerifiedBadgeModal
                    onClose={() => setShowVerifiedModal(false)}
                    onVerified={() => { fetchAll(); setShowVerifiedModal(false); }}
                />
            )}
        </div>
    );
};
