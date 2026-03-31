'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { MapPin, ArrowLeft, Building2, Clock } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const JobDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applyDialogOpen, setApplyDialogOpen] = useState(false);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    
    const [applicationData, setApplicationData] = useState({
        proposal: '',
        price: '',
        timeline: '',
        portfolio_links: ['']
    });

    useEffect(() => {
        fetchJob();
        if (user?.role === 'creator') {
            checkIfApplied();
        }
    }, [id, user]);

    const fetchJob = async () => {
        try {
            const response = await axios.get(`${API}/jobs/${id}`);
            setJob(response.data);
        } catch (error) {
            toast.error('Job not found');
            navigate('/jobs');
        } finally {
            setLoading(false);
        }
    };

    const checkIfApplied = async () => {
        try {
            const response = await axios.get(`${API}/applications/my`);
            const applied = response.data.some(app => app.campaign_id === id);
            setHasApplied(applied);
        } catch (error) {
            console.error('Error checking application status:', error);
        }
    };

    const handleApply = async () => {
        if (!applicationData.proposal.trim()) {
            toast.error('Please write a proposal');
            return;
        }
        if (!applicationData.price) {
            toast.error('Please enter your price');
            return;
        }

        setApplying(true);
        try {
            await axios.post(`${API}/applications`, {
                campaign_id: id,
                proposal: applicationData.proposal,
                price: parseFloat(applicationData.price),
                timeline: applicationData.timeline,
                portfolio_links: applicationData.portfolio_links.filter(l => l.trim())
            });
            toast.success('Application submitted successfully!');
            setApplyDialogOpen(false);
            setHasApplied(true);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    const formatBudget = (min, max) => {
        if (min === max) return `₹${min.toLocaleString()}`;
        return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    };

    const getTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return `${Math.floor(diffDays / 7)} weeks ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="pt-28 flex justify-center">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!job) return null;

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="pt-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <button 
                        onClick={() => navigate('/jobs')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6"
                        data-testid="back-btn"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Jobs
                    </button>
                </div>
            </div>

            <section className="pb-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-10">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Badge className="bg-black text-white text-sm font-medium px-3 py-1 rounded-full">
                                    <MapPin className="w-3 h-3 mr-1" /> {job.city}
                                </Badge>
                                <Badge variant="secondary" className="text-sm font-medium">{job.category}</Badge>
                                <Badge variant="outline" className="text-sm font-medium">{job.niche}</Badge>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{job.title}</h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
                                <span className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> {job.brand_name}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Posted {getTimeAgo(job.created_at)}
                                </span>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-sm font-bold mb-3">Job Description</h3>
                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                            </div>

                            {job.deliverables?.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold mb-3">Deliverables</h3>
                                    <ul className="space-y-2">
                                        {job.deliverables.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <span className="w-6 h-6 flex items-center justify-center bg-black text-white text-sm font-medium rounded">{index + 1}</span>
                                                <span className="text-gray-600">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-bold mb-3">Platforms</h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.platforms.map(platform => (
                                        <span key={platform} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">{platform}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="border border-gray-200 rounded-xl p-6 sticky top-28">
                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 mb-1">Pay</p>
                                    <p className="text-3xl font-bold">{formatBudget(job.budget_min, job.budget_max)}</p>
                                    <p className="text-sm text-gray-500 capitalize">{job.budget_type}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6 py-6 border-y border-gray-200">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Spots</p>
                                        <p className="text-2xl font-bold">{job.creators_needed}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Applied</p>
                                        <p className="text-2xl font-bold">{job.applicants_count}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 mb-1">Deadline</p>
                                    <p className="font-medium">{job.deadline}</p>
                                </div>

                                {user?.role === 'creator' && job.status === 'open' && (
                                    hasApplied ? (
                                        <div className="text-center py-4 bg-gray-100 rounded-lg">
                                            <p className="text-sm font-medium">You&apos;ve applied to this job</p>
                                        </div>
                                    ) : (
                                        <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-6" data-testid="apply-btn">
                                                    Apply Now
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle className="text-xl font-bold">Apply for this Job</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-5 mt-4">
                                                    <div>
                                                        <Label className="text-sm font-medium">Your Pitch *</Label>
                                                        <Textarea
                                                            value={applicationData.proposal}
                                                            onChange={(e) => setApplicationData({ ...applicationData, proposal: e.target.value })}
                                                            className="mt-2 min-h-[100px]"
                                                            placeholder="Tell the brand why you're perfect for this job..."
                                                            data-testid="proposal-input"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium">Your Rate (₹) *</Label>
                                                            <Input
                                                                type="number"
                                                                value={applicationData.price}
                                                                onChange={(e) => setApplicationData({ ...applicationData, price: e.target.value })}
                                                                className="mt-2"
                                                                placeholder="25000"
                                                                data-testid="price-input"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium">Timeline</Label>
                                                            <Input
                                                                value={applicationData.timeline}
                                                                onChange={(e) => setApplicationData({ ...applicationData, timeline: e.target.value })}
                                                                className="mt-2"
                                                                placeholder="2 weeks"
                                                                data-testid="timeline-input"
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={handleApply}
                                                        disabled={applying}
                                                        className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-6"
                                                        data-testid="submit-application-btn"
                                                    >
                                                        {applying ? 'Submitting...' : 'Submit Application'}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )
                                )}

                                {!user && (
                                    <Button 
                                        onClick={() => navigate('/register?role=creator')}
                                        className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-6"
                                        data-testid="join-to-apply-btn"
                                    >
                                        Join to Apply
                                    </Button>
                                )}

                                {user?.role === 'brand' && user.id === job.brand_id && (
                                    <Button 
                                        onClick={() => navigate(`/dashboard/brand/jobs/${job.id}`)}
                                        className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-6"
                                        data-testid="manage-job-btn"
                                    >
                                        Manage Job
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default JobDetailPage;
