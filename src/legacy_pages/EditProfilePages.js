'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = ["Influencer", "Photographer", "Videographer", "UGC Creator", "Social Media Manager", "Editor"];
const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Twitter", "LinkedIn", "Facebook"];
const NICHES = ["Fashion", "Beauty", "Tech", "Food", "Travel", "Fitness", "Lifestyle", "Gaming", "Business", "Education", "Entertainment"];

export const EditInfluencerProfile = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        display_name: '', category: '', bio: '', niches: [], platforms: [],
        portfolio_links: [], instagram_handle: '', youtube_handle: '',
        followers_count: 0, hourly_rate: 0, profile_image_url: ''
    });

    useEffect(() => {
        axios.get(`${API}/creators/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                const p = res.data;
                setForm({
                    display_name: p.display_name || '',
                    category: p.category || '',
                    bio: p.bio || '',
                    niches: p.niches || [],
                    platforms: p.platforms || [],
                    portfolio_links: p.portfolio_links || [],
                    instagram_handle: p.instagram_handle || '',
                    youtube_handle: p.youtube_handle || '',
                    followers_count: p.followers_count || 0,
                    hourly_rate: p.hourly_rate || 0,
                    profile_image_url: p.profile_image_url || '',
                });
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, [token]);

    const toggleItem = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    const handleSave = async () => {
        if (!form.display_name || !form.category || !form.bio) {
            toast.error('Name, category, and bio are required');
            return;
        }
        setSaving(true);
        try {
            await axios.put(`${API}/creators/profile`, {
                ...form,
                followers_count: parseInt(form.followers_count) || 0,
                hourly_rate: parseFloat(form.hourly_rate) || 0,
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Profile updated');
            navigate('/dashboard/influencer/profile');
        } catch (err) { toast.error(err.response?.data?.detail || 'Save failed'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-black" data-testid="back-btn"><ArrowLeft className="w-5 h-5" /></button>
                <h1 className="text-sm font-bold">Edit Profile</h1>
            </div>

            <div className="space-y-5">
                <div>
                    <Label className="text-sm font-medium">Display Name *</Label>
                    <Input value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} className="mt-2" data-testid="edit-display-name" />
                </div>
                <div>
                    <Label className="text-sm font-medium">Category *</Label>
                    <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                        <SelectTrigger className="mt-2" data-testid="edit-category"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-sm font-medium">Bio *</Label>
                    <Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="mt-2 min-h-[80px]" data-testid="edit-bio" />
                </div>
                <div>
                    <Label className="text-sm font-medium mb-2 block">Platforms</Label>
                    <div className="flex flex-wrap gap-2">
                        {PLATFORMS.map(p => (
                            <button key={p} type="button" onClick={() => toggleItem('platforms', p)}
                                className={`px-4 py-2 rounded-full text-sm font-medium border ${form.platforms.includes(p) ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'}`}
                                data-testid={`platform-${p}`}>{p}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <Label className="text-sm font-medium mb-2 block">Niches</Label>
                    <div className="flex flex-wrap gap-2">
                        {NICHES.map(n => (
                            <button key={n} type="button" onClick={() => toggleItem('niches', n)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${form.niches.includes(n) ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'}`}
                                data-testid={`niche-${n}`}>{n}</button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium">Followers</Label>
                        <Input type="number" value={form.followers_count} onChange={e => setForm({...form, followers_count: e.target.value})} className="mt-2" data-testid="edit-followers" />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Rate (₹/day)</Label>
                        <Input type="number" value={form.hourly_rate} onChange={e => setForm({...form, hourly_rate: e.target.value})} className="mt-2" data-testid="edit-rate" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium">Instagram</Label>
                        <Input value={form.instagram_handle} onChange={e => setForm({...form, instagram_handle: e.target.value})} className="mt-2" placeholder="@handle" data-testid="edit-instagram" />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">YouTube</Label>
                        <Input value={form.youtube_handle} onChange={e => setForm({...form, youtube_handle: e.target.value})} className="mt-2" placeholder="@channel" data-testid="edit-youtube" />
                    </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-5" data-testid="save-profile-btn">
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
};

export const EditBrandProfile = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        company_name: '', industry: '', description: '', website: '', logo_url: ''
    });

    useEffect(() => {
        axios.get(`${API}/brands/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                const p = res.data;
                setForm({
                    company_name: p.company_name || '',
                    industry: p.industry || '',
                    description: p.description || '',
                    website: p.website || '',
                    logo_url: p.logo_url || '',
                });
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, [token]);

    const handleSave = async () => {
        if (!form.company_name || !form.industry || !form.description) {
            toast.error('Company name, industry, and description are required');
            return;
        }
        setSaving(true);
        try {
            await axios.put(`${API}/brands/profile`, form, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Profile updated');
            navigate('/dashboard/brand/profile');
        } catch (err) { toast.error(err.response?.data?.detail || 'Save failed'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-black" data-testid="back-btn"><ArrowLeft className="w-5 h-5" /></button>
                <h1 className="text-sm font-bold">Edit Brand Profile</h1>
            </div>

            <div className="space-y-5">
                <div>
                    <Label className="text-sm font-medium">Company Name *</Label>
                    <Input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} className="mt-2" data-testid="edit-company-name" />
                </div>
                <div>
                    <Label className="text-sm font-medium">Industry *</Label>
                    <Input value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} className="mt-2" placeholder="e.g., Fashion, Tech, Food" data-testid="edit-industry" />
                </div>
                <div>
                    <Label className="text-sm font-medium">Description *</Label>
                    <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="mt-2 min-h-[100px]" placeholder="Tell creators about your brand..." data-testid="edit-description" />
                </div>
                <div>
                    <Label className="text-sm font-medium">Website</Label>
                    <Input value={form.website} onChange={e => setForm({...form, website: e.target.value})} className="mt-2" placeholder="https://..." data-testid="edit-website" />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-5" data-testid="save-profile-btn">
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
};
