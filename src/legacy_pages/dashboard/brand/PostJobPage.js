'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { API, CATEGORIES, PLATFORMS, NICHES, CITIES } from '../shared';

export const PostJobPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '', description: '', category: '', niche: '', platforms: [],
        budget_type: 'fixed', budget_min: '', budget_max: '', city: '',
        deadline: '', creators_needed: '1', deliverables: ['']
    });
    const [loading, setLoading] = useState(false);

    const handlePlatformToggle = (platform) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platform) ? prev.platforms.filter(p => p !== platform) : [...prev.platforms, platform]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API}/jobs`, {
                ...formData,
                budget_min: parseFloat(formData.budget_min),
                budget_max: parseFloat(formData.budget_max || formData.budget_min),
                creators_needed: parseInt(formData.creators_needed),
                deliverables: formData.deliverables.filter(d => d.trim())
            });
            toast.success('Job posted!');
            navigate('/dashboard/brand/campaigns');
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-1">Post a Job</h1>
            <p className="text-gray-500 text-sm mb-6">Find influencers for your campaign</p>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div><Label className="text-sm font-medium">Job Title *</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="mt-2" placeholder="e.g., Instagram Reel" required /></div>
                <div><Label className="text-sm font-medium">Description *</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-2 min-h-[100px]" placeholder="Describe requirements..." required /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-sm font-medium">Category *</Label><Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}><SelectTrigger className="mt-2"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label className="text-sm font-medium">Niche *</Label><Select value={formData.niche} onValueChange={(v) => setFormData({...formData, niche: v})}><SelectTrigger className="mt-2"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{NICHES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div><Label className="text-sm font-medium mb-2 block">Platforms *</Label><div className="flex flex-wrap gap-2">{PLATFORMS.map(p => (<button key={p} type="button" onClick={() => handlePlatformToggle(p)} className={`px-4 py-2 rounded-full text-sm font-medium border ${formData.platforms.includes(p) ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'}`}>{p}</button>))}</div></div>
                <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-sm font-medium">Min Pay *</Label><Input type="number" value={formData.budget_min} onChange={(e) => setFormData({...formData, budget_min: e.target.value})} className="mt-2" placeholder="10000" required /></div>
                    <div><Label className="text-sm font-medium">Max Pay</Label><Input type="number" value={formData.budget_max} onChange={(e) => setFormData({...formData, budget_max: e.target.value})} className="mt-2" placeholder="50000" /></div>
                    <div><Label className="text-sm font-medium">City</Label><Select value={formData.city} onValueChange={(v) => setFormData({...formData, city: v})}><SelectTrigger className="mt-2"><SelectValue placeholder="City" /></SelectTrigger><SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-sm font-medium">Spots *</Label><Input type="number" min="1" value={formData.creators_needed} onChange={(e) => setFormData({...formData, creators_needed: e.target.value})} className="mt-2" required /></div>
                    <div><Label className="text-sm font-medium">Deadline *</Label><Input value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="mt-2" placeholder="2 weeks" required /></div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-black text-white rounded-full py-6">{loading ? 'Posting...' : 'Post Job'}</Button>
            </form>
        </div>
    );
};
