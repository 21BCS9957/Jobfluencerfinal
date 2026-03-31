'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, Check, MapPin, X, Briefcase } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
    { id: 'Influencer', label: 'Social Media Influencer', desc: 'Promote products on Instagram, YouTube, TikTok' },
    { id: 'Photographer', label: 'Photographer', desc: 'Product shoots, events, lifestyle photography' },
    { id: 'Videographer', label: 'Videographer', desc: 'Video content, reels, commercials' },
    { id: 'UGC Creator', label: 'UGC Creator', desc: 'User-generated content for ads' },
    { id: 'Social Media Manager', label: 'Social Media Manager', desc: 'Manage your brand\'s social presence' },
    { id: 'Editor', label: 'Video/Photo Editor', desc: 'Edit and enhance your content' },
];

const PLATFORMS = [
    { id: 'Instagram', label: 'Instagram', desc: 'Reels, Stories, Posts' },
    { id: 'YouTube', label: 'YouTube', desc: 'Videos, Shorts' },
    { id: 'TikTok', label: 'TikTok', desc: 'Short-form videos' },
    { id: 'Twitter', label: 'Twitter/X', desc: 'Tweets, Threads' },
    { id: 'LinkedIn', label: 'LinkedIn', desc: 'Professional content' },
    { id: 'Multiple', label: 'Multiple Platforms', desc: 'Cross-platform campaign' },
];

const CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
    'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Lucknow'
];

const NICHES = [
    'Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness',
    'Lifestyle', 'Gaming', 'Business', 'Education', 'Entertainment'
];

const PostJobWizard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [formData, setFormData] = useState({
        brief: '',
        category: '',
        platforms: [],
        city: '',
        niche: '',
        title: '',
        description: '',
        budget_min: '',
        budget_max: '',
        creators_needed: 1,
        deadline: '',
        deliverables: []
    });

    const totalSteps = 6;

    const generateJobDescription = () => {
        const category = formData.category;
        const platform = formData.platforms.length > 0 ? formData.platforms[0] : 'social media';
        const city = formData.city;
        const niche = formData.niche;

        const title = `${niche} ${category} Needed in ${city}`;

        let description = formData.brief ? formData.brief + '\n\n' : '';
        description += `We're looking for a talented ${category.toLowerCase()} based in ${city} for our ${niche.toLowerCase()} brand.\n\n`;
        description += `Platform: ${formData.platforms.join(', ')}\n\n`;
        description += `Requirements:\n`;
        description += `- Based in or able to travel to ${city}\n`;
        description += `- Experience with ${niche.toLowerCase()} content\n`;
        description += `- Active presence on ${platform}\n`;
        description += `- Creative and reliable\n\n`;
        description += `What we offer:\n`;
        description += `- Competitive pay\n`;
        description += `- Long-term collaboration potential\n`;
        description += `- Creative freedom within brand guidelines`;

        return { title, description };
    };

    const handleNext = () => {
        if (step === 1 && !formData.brief.trim()) {
            toast.error('Please describe what you need');
            return;
        }
        if (step === 2 && !formData.category) {
            toast.error('Please select a category');
            return;
        }
        if (step === 3 && formData.platforms.length === 0) {
            toast.error('Please select at least one platform');
            return;
        }
        if (step === 4 && !formData.city) {
            toast.error('Please select a city');
            return;
        }

        if (step === 4) {
            setGenerating(true);
            setTimeout(() => {
                const { title, description } = generateJobDescription();
                setFormData(prev => ({ ...prev, title, description }));
                setGenerating(false);
                setStep(5);
            }, 1200);
        } else {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handlePlatformToggle = (platform) => {
        if (platform === 'Multiple') {
            setFormData(prev => ({
                ...prev,
                platforms: prev.platforms.includes('Multiple') ? [] : ['Multiple']
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                platforms: prev.platforms.includes(platform)
                    ? prev.platforms.filter(p => p !== platform)
                    : [...prev.platforms.filter(p => p !== 'Multiple'), platform]
            }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.budget_min) {
            toast.error('Please enter a budget');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                platforms: formData.platforms.includes('Multiple')
                    ? ['Instagram', 'YouTube', 'TikTok']
                    : formData.platforms,
                budget_type: 'fixed',
                budget_min: parseFloat(formData.budget_min),
                budget_max: parseFloat(formData.budget_max || formData.budget_min),
                creators_needed: parseInt(formData.creators_needed) || 1,
                deadline: formData.deadline || '2 weeks',
                deliverables: formData.deliverables.filter(d => d.trim()),
                niche: formData.niche || 'Lifestyle'
            };

            const token = localStorage.getItem('token');
            await axios.post(`${API}/jobs`, payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            toast.success('Job posted successfully!');
            navigate('/dashboard/brand/jobs');
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error('Please login as a brand to post a job');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.detail || 'Failed to post job');
            }
        } finally {
            setLoading(false);
        }
    };

    if (generating) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 relative">
                        <div className="absolute inset-0 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <Briefcase className="w-7 h-7 text-black absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-sm font-bold tracking-tight">Crafting your job description...</p>
                    <p className="text-sm text-gray-500 mt-2">Just a moment</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white" data-testid="post-job-wizard">
            {/* Minimal Header */}
            <header className="border-b border-gray-200 px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <span className="text-sm font-bold tracking-tight">JOBFLUENCER</span>
                    <button
                        onClick={() => navigate('/')}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        data-testid="close-wizard-btn"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-0.5 bg-gray-100">
                <div
                    className="h-full bg-black transition-all duration-500 ease-out"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>

            <div className="max-w-2xl mx-auto px-6 py-10">
                {/* Step 1: Brief */}
                {step === 1 && (
                    <div className="animate-fade-in" data-testid="step-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                            Tell us what you need <span className="text-gray-400">done.</span>
                        </h1>
                        <p className="text-gray-500 mb-8">
                            We&apos;ll guide you to create the perfect job brief. The more detail the better.
                        </p>

                        <Textarea
                            value={formData.brief}
                            onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                            className="w-full min-h-[150px] text-sm border-gray-200 focus:border-black focus:ring-black"
                            placeholder="Enter a few bullet points or a full description..."
                            data-testid="brief-input"
                        />

                        <div className="mt-8 p-6 bg-gray-50 border border-gray-100">
                            <p className="font-semibold text-sm uppercase tracking-wider mb-4">Why Jobfluencer</p>
                            <ul className="space-y-3">
                                {[
                                    'Get proposals from your city — Influencers, photographers, SMMs, and more',
                                    'Invite influencers to apply — Reach the talent you want',
                                    'Negotiate & review — Check portfolios, ratings, and pricing',
                                    'Pay only when happy — Escrow-secured for peace of mind'
                                ].map((text, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600 text-sm">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Step 2: Category */}
                {step === 2 && (
                    <div className="animate-fade-in" data-testid="step-2">
                        <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">Step 1 of 3</p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">What type of influencer do you need?</h2>
                        <p className="text-gray-500 text-sm mb-8">Select the category that best fits your project.</p>

                        <div className="space-y-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={`w-full p-4 text-left border transition-all ${
                                        formData.category === cat.id
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                    data-testid={`category-${cat.id}-btn`}
                                >
                                    <p className="font-medium text-sm">{cat.label}</p>
                                    <p className={`text-sm mt-0.5 ${formData.category === cat.id ? 'text-gray-300' : 'text-gray-500'}`}>{cat.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Platforms */}
                {step === 3 && (
                    <div className="animate-fade-in" data-testid="step-3">
                        <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">Step 2 of 3</p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">Which platform(s) do you need?</h2>
                        <p className="text-gray-500 text-sm mb-8">Select all that apply.</p>

                        <div className="space-y-2">
                            {PLATFORMS.map((platform) => (
                                <button
                                    key={platform.id}
                                    onClick={() => handlePlatformToggle(platform.id)}
                                    className={`w-full p-4 text-left border transition-all ${
                                        formData.platforms.includes(platform.id)
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                    data-testid={`platform-${platform.id}-btn`}
                                >
                                    <p className="font-medium text-sm">{platform.label}</p>
                                    <p className={`text-sm mt-0.5 ${formData.platforms.includes(platform.id) ? 'text-gray-300' : 'text-gray-500'}`}>{platform.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: City & Niche */}
                {step === 4 && (
                    <div className="animate-fade-in" data-testid="step-4">
                        <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">Step 3 of 3</p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">Where do you need the influencer?</h2>
                        <p className="text-gray-500 text-sm mb-8">Select your city and niche.</p>

                        <div className="mb-8">
                            <Label className="text-sm font-semibold uppercase tracking-wider mb-3 block">City</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {CITIES.map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => setFormData({ ...formData, city })}
                                        className={`p-3 text-left border transition-all flex items-center gap-2 text-sm ${
                                            formData.city === city
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                        data-testid={`city-${city}-btn`}
                                    >
                                        <MapPin className="w-3.5 h-3.5" />
                                        {city}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Niche (Optional)</Label>
                            <div className="flex flex-wrap gap-2">
                                {NICHES.map((niche) => (
                                    <button
                                        key={niche}
                                        onClick={() => setFormData({ ...formData, niche })}
                                        className={`px-4 py-2 text-sm font-medium border transition-all ${
                                            formData.niche === niche
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                        data-testid={`niche-${niche}-btn`}
                                    >
                                        {niche}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Review Generated Description */}
                {step === 5 && (
                    <div className="animate-fade-in" data-testid="step-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="w-5 h-5" />
                            <span className="text-sm font-semibold uppercase tracking-wider">Here&apos;s your job!</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-8">
                            We&apos;ve put together a job title and description from your answers. Feel free to personalize it.
                        </p>

                        <div className="space-y-6">
                            <div>
                                <Label className="text-sm font-semibold uppercase tracking-wider mb-2 block">Job Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full text-sm font-medium border-gray-200 focus:border-black focus:ring-black"
                                    data-testid="title-input"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-semibold uppercase tracking-wider mb-2 block">Job Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full min-h-[220px] border-gray-200 focus:border-black focus:ring-black"
                                    data-testid="description-input"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Budget & Final */}
                {step === 6 && (
                    <div className="animate-fade-in" data-testid="step-6">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">Almost done!</h2>
                        <p className="text-gray-500 text-sm mb-8">Set your budget and finalize the job.</p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-semibold uppercase tracking-wider mb-2 block">Min Budget (Rs.) *</Label>
                                    <Input
                                        type="number"
                                        value={formData.budget_min}
                                        onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                                        placeholder="10000"
                                        className="border-gray-200 focus:border-black focus:ring-black"
                                        data-testid="budget-min-input"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold uppercase tracking-wider mb-2 block">Max Budget (Rs.)</Label>
                                    <Input
                                        type="number"
                                        value={formData.budget_max}
                                        onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                                        placeholder="50000"
                                        className="border-gray-200 focus:border-black focus:ring-black"
                                        data-testid="budget-max-input"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-semibold uppercase tracking-wider mb-2 block">Influencers Needed</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.creators_needed}
                                        onChange={(e) => setFormData({ ...formData, creators_needed: e.target.value })}
                                        className="border-gray-200 focus:border-black focus:ring-black"
                                        data-testid="spots-input"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold uppercase tracking-wider mb-2 block">Deadline</Label>
                                    <Input
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        placeholder="e.g., 2 weeks"
                                        className="border-gray-200 focus:border-black focus:ring-black"
                                        data-testid="deadline-input"
                                    />
                                </div>
                            </div>

                            <div className="p-5 bg-gray-50 border border-gray-100">
                                <p className="text-sm font-semibold uppercase tracking-wider mb-3">Job Summary</p>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600"><span className="font-medium text-black">Title:</span> {formData.title}</p>
                                    <p className="text-gray-600"><span className="font-medium text-black">City:</span> {formData.city}</p>
                                    <p className="text-gray-600"><span className="font-medium text-black">Category:</span> {formData.category}</p>
                                    <p className="text-gray-600"><span className="font-medium text-black">Platforms:</span> {formData.platforms.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-10 flex items-center justify-between">
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
                            data-testid="back-btn"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 6 ? (
                        <Button
                            onClick={handleNext}
                            className="bg-black hover:bg-gray-800 text-white px-10 py-6 text-sm font-medium tracking-wide"
                            data-testid="next-btn"
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-black hover:bg-gray-800 text-white px-10 py-6 text-sm font-medium tracking-wide"
                            data-testid="post-job-btn"
                        >
                            {loading ? 'Posting...' : 'Post Job'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostJobWizard;
