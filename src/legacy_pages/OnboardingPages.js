'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowRight, Plus, X } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
    "Influencer", "Photographer", "Videographer", 
    "UGC Creator", "Social Media Manager", "Editor"
];

const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Twitter", "LinkedIn", "Facebook"];

const NICHES = [
    "Fashion", "Beauty", "Tech", "Food", "Travel", "Fitness",
    "Lifestyle", "Gaming", "Business", "Education", "Entertainment"
];

const INDUSTRIES = [
    "Fashion & Apparel", "Beauty & Cosmetics", "Food & Beverage",
    "Technology", "Travel & Hospitality", "Health & Fitness",
    "Entertainment", "Education", "E-commerce", "Real Estate", "Other"
];

export const BrandOnboarding = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        industry: '',
        description: '',
        website: '',
        logo_url: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API}/brands/profile`, formData);
            toast.success('Profile created successfully!');
            navigate('/dashboard/brand');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <p className="caption text-gray-500 mb-4">Step 1 of 1</p>
                    <h1 className="font-heading text-4xl font-bold tracking-tight mb-4">
                        SET UP YOUR<br />BRAND PROFILE
                    </h1>
                    <p className="text-gray-600">
                        Tell creators about your brand to attract the right talent.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <Label className="text-sm uppercase tracking-wider">Company Name *</Label>
                        <Input
                            value={formData.company_name}
                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            className="mt-2 input-minimal w-full"
                            placeholder="Your Company"
                            required
                            data-testid="brand-company-input"
                        />
                    </div>

                    <div>
                        <Label className="text-sm uppercase tracking-wider">Industry *</Label>
                        <Select 
                            value={formData.industry} 
                            onValueChange={(value) => setFormData({ ...formData, industry: value })}
                        >
                            <SelectTrigger className="mt-2 w-full border-0 border-b border-black/20 rounded-none focus:ring-0" data-testid="brand-industry-select">
                                <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                                {INDUSTRIES.map(industry => (
                                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-sm uppercase tracking-wider">Description *</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-2 border-0 border-b border-black/20 rounded-none focus:ring-0 min-h-[120px]"
                            placeholder="Tell creators about your brand, values, and what you're looking for..."
                            required
                            data-testid="brand-description-input"
                        />
                    </div>

                    <div>
                        <Label className="text-sm uppercase tracking-wider">Website (Optional)</Label>
                        <Input
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="mt-2 input-minimal w-full"
                            placeholder="https://yourcompany.com"
                            type="url"
                            data-testid="brand-website-input"
                        />
                    </div>

                    <div>
                        <Label className="text-sm uppercase tracking-wider">Logo URL (Optional)</Label>
                        <Input
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            className="mt-2 input-minimal w-full"
                            placeholder="https://example.com/logo.png"
                            type="url"
                            data-testid="brand-logo-input"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white hover:bg-white hover:text-black border border-black uppercase tracking-widest text-sm py-4 flex items-center justify-center gap-2"
                        data-testid="brand-submit-btn"
                    >
                        {loading ? <span className="loader" /> : <>Complete Setup <ArrowRight className="w-4 h-4" /></>}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const CreatorOnboarding = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        display_name: '',
        category: '',
        bio: '',
        niches: [],
        platforms: [],
        portfolio_links: [''],
        instagram_handle: '',
        youtube_handle: '',
        followers_count: 0,
        hourly_rate: 0,
        profile_image_url: ''
    });

    const handleNicheToggle = (niche) => {
        setFormData(prev => ({
            ...prev,
            niches: prev.niches.includes(niche)
                ? prev.niches.filter(n => n !== niche)
                : [...prev.niches, niche]
        }));
    };

    const handlePlatformToggle = (platform) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platform)
                ? prev.platforms.filter(p => p !== platform)
                : [...prev.platforms, platform]
        }));
    };

    const addPortfolioLink = () => {
        setFormData(prev => ({
            ...prev,
            portfolio_links: [...prev.portfolio_links, '']
        }));
    };

    const updatePortfolioLink = (index, value) => {
        setFormData(prev => ({
            ...prev,
            portfolio_links: prev.portfolio_links.map((link, i) => i === index ? value : link)
        }));
    };

    const removePortfolioLink = (index) => {
        setFormData(prev => ({
            ...prev,
            portfolio_links: prev.portfolio_links.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category) {
            toast.error('Please select your category');
            return;
        }
        if (formData.niches.length === 0) {
            toast.error('Please select at least one niche');
            return;
        }
        if (formData.platforms.length === 0) {
            toast.error('Please select at least one platform');
            return;
        }

        setLoading(true);
        try {
            const cleanedData = {
                ...formData,
                portfolio_links: formData.portfolio_links.filter(link => link.trim() !== '')
            };
            await axios.post(`${API}/creators/profile`, cleanedData);
            toast.success('Profile created successfully!');
            navigate('/dashboard/creator');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <p className="caption text-gray-500 mb-4">Step 1 of 1</p>
                    <h1 className="font-heading text-4xl font-bold tracking-tight mb-4">
                        BUILD YOUR<br />CREATOR PROFILE
                    </h1>
                    <p className="text-gray-600">
                        Showcase your work and attract brands looking for talent like you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <Label className="text-sm uppercase tracking-wider">Display Name *</Label>
                        <Input
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                            className="mt-2 input-minimal w-full"
                            placeholder="Your creative name"
                            required
                            data-testid="creator-name-input"
                        />
                    </div>

                    <div>
                        <Label className="text-sm uppercase tracking-wider">Category *</Label>
                        <Select 
                            value={formData.category} 
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger className="mt-2 w-full border-0 border-b border-black/20 rounded-none focus:ring-0" data-testid="creator-category-select">
                                <SelectValue placeholder="Select your main category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-sm uppercase tracking-wider">Bio *</Label>
                        <Textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="mt-2 border-0 border-b border-black/20 rounded-none focus:ring-0 min-h-[120px]"
                            placeholder="Tell brands about yourself, your style, and your experience..."
                            required
                            data-testid="creator-bio-input"
                        />
                    </div>

                    <div>
                        <Label className="text-sm uppercase tracking-wider mb-4 block">Niches * (Select all that apply)</Label>
                        <div className="flex flex-wrap gap-3">
                            {NICHES.map(niche => (
                                <button
                                    key={niche}
                                    type="button"
                                    onClick={() => handleNicheToggle(niche)}
                                    className={`px-4 py-2 border text-sm transition-colors ${
                                        formData.niches.includes(niche)
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-black border-gray-200 hover:border-black'
                                    }`}
                                    data-testid={`niche-${niche.toLowerCase()}-btn`}
                                >
                                    {niche}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm uppercase tracking-wider mb-4 block">Platforms * (Select all that apply)</Label>
                        <div className="flex flex-wrap gap-3">
                            {PLATFORMS.map(platform => (
                                <button
                                    key={platform}
                                    type="button"
                                    onClick={() => handlePlatformToggle(platform)}
                                    className={`px-4 py-2 border text-sm transition-colors ${
                                        formData.platforms.includes(platform)
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-black border-gray-200 hover:border-black'
                                    }`}
                                    data-testid={`platform-${platform.toLowerCase()}-btn`}
                                >
                                    {platform}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label className="text-sm uppercase tracking-wider">Instagram Handle</Label>
                            <Input
                                value={formData.instagram_handle}
                                onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                                className="mt-2 input-minimal w-full"
                                placeholder="@yourusername"
                                data-testid="creator-instagram-input"
                            />
                        </div>
                        <div>
                            <Label className="text-sm uppercase tracking-wider">YouTube Handle</Label>
                            <Input
                                value={formData.youtube_handle}
                                onChange={(e) => setFormData({ ...formData, youtube_handle: e.target.value })}
                                className="mt-2 input-minimal w-full"
                                placeholder="@yourchannel"
                                data-testid="creator-youtube-input"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label className="text-sm uppercase tracking-wider">Total Followers</Label>
                            <Input
                                type="number"
                                value={formData.followers_count}
                                onChange={(e) => setFormData({ ...formData, followers_count: parseInt(e.target.value) || 0 })}
                                className="mt-2 input-minimal w-full"
                                placeholder="10000"
                                data-testid="creator-followers-input"
                            />
                        </div>
                        <div>
                            <Label className="text-sm uppercase tracking-wider">Hourly Rate (₹)</Label>
                            <Input
                                type="number"
                                value={formData.hourly_rate}
                                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                                className="mt-2 input-minimal w-full"
                                placeholder="5000"
                                data-testid="creator-rate-input"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm uppercase tracking-wider mb-4 block">Portfolio Links</Label>
                        {formData.portfolio_links.map((link, index) => (
                            <div key={index} className="flex gap-2 mb-3">
                                <Input
                                    value={link}
                                    onChange={(e) => updatePortfolioLink(index, e.target.value)}
                                    className="input-minimal w-full"
                                    placeholder="https://example.com/your-work"
                                    type="url"
                                    data-testid={`portfolio-link-${index}-input`}
                                />
                                {formData.portfolio_links.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => removePortfolioLink(index)}
                                        className="px-3"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={addPortfolioLink}
                            className="text-sm flex items-center gap-2"
                            data-testid="add-portfolio-btn"
                        >
                            <Plus className="w-4 h-4" /> Add Link
                        </Button>
                    </div>

                    <div>
                        <Label className="text-sm uppercase tracking-wider">Profile Image URL</Label>
                        <Input
                            value={formData.profile_image_url}
                            onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                            className="mt-2 input-minimal w-full"
                            placeholder="https://example.com/your-photo.jpg"
                            type="url"
                            data-testid="creator-image-input"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white hover:bg-white hover:text-black border border-black uppercase tracking-widest text-sm py-4 flex items-center justify-center gap-2"
                        data-testid="creator-submit-btn"
                    >
                        {loading ? <span className="loader" /> : <>Complete Setup <ArrowRight className="w-4 h-4" /></>}
                    </Button>
                </form>
            </div>
        </div>
    );
};
