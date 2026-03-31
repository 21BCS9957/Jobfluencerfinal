'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, MapPin, MessageSquare, XCircle, ExternalLink, Users, Rocket } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Brand - My Jobs List
export const BrandJobsList = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchJobs(); }, []);

    const fetchJobs = async () => {
        try {
            const response = await axios.get(`${API}/jobs/my`);
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatBudget = (min, max) => {
        if (min === max) return `₹${min.toLocaleString()}`;
        return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-1">My Jobs</h1>
                    <p className="text-gray-500 text-sm">Manage your posted jobs</p>
                </div>
                <Button onClick={() => navigate('/dashboard/brand/post-job')} className="bg-black text-white rounded-full px-6" data-testid="new-job-btn">
                    + Post New Job
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl">
                    <p className="text-gray-500 mb-4">No jobs yet</p>
                    <Button onClick={() => navigate('/dashboard/brand/post-job')} className="bg-black text-white rounded-full px-6" data-testid="create-job-btn">
                        Post Your First Job
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="border border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/brand/jobs/${job.id}`)} data-testid={`job-${job.id}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-black text-white text-xs px-2 py-1 rounded-full"><MapPin className="w-3 h-3 mr-1" />{job.city}</Badge>
                                        <Badge variant="secondary" className="text-xs">{job.category}</Badge>
                                        <Badge variant="outline" className={`text-xs capitalize ${job.status === 'open' ? 'border-green-500 text-green-600' : ''}`}>{job.status}</Badge>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-1 mb-3">{job.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{formatBudget(job.budget_min, job.budget_max)}</span>
                                        <span>{job.applicants_count} applicants</span>
                                        <span>{job.hired_count}/{job.creators_needed} hired</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Brand - Job Detail with Applicants
export const BrandJobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBoost, setShowBoost] = useState(false);
    const [boosting, setBoosting] = useState(false);

    useEffect(() => { fetchData(); }, [id]);

    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [jobRes, applicationsRes] = await Promise.all([
                axios.get(`${API}/jobs/${id}`),
                axios.get(`${API}/applications/campaign/${id}`, { headers })
            ]);
            setJob(jobRes.data);
            setApplications(applicationsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load job');
        } finally {
            setLoading(false);
        }
    };

    const handleBoost = async (level) => {
        setBoosting(true);
        try {
            await axios.post(`${API}/campaigns/${id}/boost`, { level }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Campaign boosted to ${level}!`);
            setShowBoost(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Boost failed');
        } finally { setBoosting(false); }
    };

    const updateApplicationStatus = async (applicationId, status) => {
        try {
            await axios.put(`${API}/applications/${applicationId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Application ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const formatBudget = (min, max) => {
        if (min === max) return `₹${min.toLocaleString()}`;
        return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>;
    if (!job) return <div>Job not found</div>;

    return (
        <div>
            <button onClick={() => navigate('/dashboard/brand/jobs')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6" data-testid="back-btn">
                <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </button>

            {/* Job Header */}
            <div className="border border-gray-200 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-black text-white text-xs px-2 py-1 rounded-full"><MapPin className="w-3 h-3 mr-1" />{job.city}</Badge>
                    <Badge variant="secondary" className="text-xs">{job.category}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{job.status}</Badge>
                </div>
                <h1 className="text-2xl font-bold mb-3">{job.title}</h1>
                <p className="text-gray-600 mb-6">{job.description}</p>
                
                <div className="grid md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Pay</p>
                        <p className="text-xl font-bold">{formatBudget(job.budget_min, job.budget_max)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Hired</p>
                        <p className="text-xl font-bold">{job.hired_count}/{job.creators_needed}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Applicants</p>
                        <p className="text-xl font-bold">{job.applicants_count}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Deadline</p>
                        <p className="text-xl font-bold">{job.deadline}</p>
                    </div>
                </div>

                {/* Boost Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    {job.is_boosted ? (
                        <div className="flex items-center gap-2 text-sm" data-testid="boost-status">
                            <Rocket className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold capitalize">{job.boost_level} Boost Active</span>
                        </div>
                    ) : (
                        <div>
                            <Button onClick={() => setShowBoost(!showBoost)} variant="outline" className="rounded-full text-sm gap-2" data-testid="boost-btn">
                                <Rocket className="w-4 h-4" /> Boost This Campaign
                            </Button>
                            {showBoost && (
                                <div className="mt-3 grid grid-cols-3 gap-2" data-testid="boost-options">
                                    {[
                                        { level: 'basic', credits: 10, price: '₹299', days: '7 days' },
                                        { level: 'premium', credits: 25, price: '₹699', days: '14 days' },
                                        { level: 'top', credits: 35, price: '₹999', days: '30 days' },
                                    ].map(b => (
                                        <button key={b.level} onClick={() => handleBoost(b.level)} disabled={boosting}
                                            className="border border-gray-200 rounded-xl p-3 text-left hover:border-black transition-colors disabled:opacity-50" data-testid={`boost-${b.level}`}>
                                            <p className="text-sm font-bold capitalize">{b.level}</p>
                                            <p className="text-sm font-semibold">{b.credits} credits</p>
                                            <p className="text-sm text-gray-400">{b.days}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Applications */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold">Applications ({applications.length})</h2>
                    {applications.length > 0 && (
                        <Button onClick={() => navigate(`/dashboard/brand/jobs/${id}/applicants`)} variant="outline" className="rounded-full text-sm px-4" data-testid="review-applicants-btn">
                            <Users className="w-4 h-4 mr-1" /> Review Board
                        </Button>
                    )}
                </div>
                
                {applications.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
                        <p className="text-gray-500">No applications yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app.id} className="border border-gray-200 rounded-xl p-6" data-testid={`application-${app.id}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-lg font-bold">{app.creator_name?.charAt(0) || '?'}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{app.creator_name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>{app.creator_category}</span>
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.creator_city}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className={`text-xs capitalize ${app.status === 'hired' ? 'bg-black text-white' : app.status === 'rejected' ? 'bg-gray-200' : ''}`}>
                                        {app.status}
                                    </Badge>
                                </div>

                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Pitch</p>
                                    <p className="text-sm text-gray-700">{app.proposal}</p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-xs text-gray-500">Rate</p>
                                            <p className="text-xl font-bold">₹{app.price.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Timeline</p>
                                            <p className="font-medium">{app.timeline || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    {app.status === 'pending' && (
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" onClick={() => updateApplicationStatus(app.id, 'shortlisted')} className="rounded-full text-sm" data-testid={`shortlist-${app.id}-btn`}>Shortlist</Button>
                                            <Button onClick={() => updateApplicationStatus(app.id, 'hired')} className="bg-black text-white rounded-full text-sm" data-testid={`hire-${app.id}-btn`}>Hire</Button>
                                            <Button variant="ghost" onClick={() => updateApplicationStatus(app.id, 'rejected')} className="text-gray-500" data-testid={`reject-${app.id}-btn`}><XCircle className="w-5 h-5" /></Button>
                                        </div>
                                    )}

                                    {app.status === 'shortlisted' && (
                                        <div className="flex items-center gap-2">
                                            <Button onClick={() => updateApplicationStatus(app.id, 'hired')} className="bg-black text-white rounded-full text-sm" data-testid={`hire-${app.id}-btn`}>Hire</Button>
                                            <Button variant="ghost" onClick={() => updateApplicationStatus(app.id, 'rejected')} className="text-gray-500"><XCircle className="w-5 h-5" /></Button>
                                        </div>
                                    )}

                                    {app.status === 'hired' && (
                                        <Button variant="outline" onClick={() => navigate(`/dashboard/brand/messages?to=${app.creator_id}`)} className="rounded-full text-sm" data-testid={`message-${app.id}-btn`}>
                                            <MessageSquare className="w-4 h-4 mr-2" /> Message
                                        </Button>
                                    )}
                                </div>

                                {app.creator_profile && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button onClick={() => navigate(`/influencers/${app.creator_id}`)} className="text-sm text-gray-500 hover:text-black flex items-center gap-1" data-testid={`view-profile-${app.id}-btn`}>
                                            <ExternalLink className="w-4 h-4" /> View Profile
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Influencer - My Applications
export const InfluencerApplicationsList = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchApplications(); }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get(`${API}/applications/my`);
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1">My Applications</h1>
                <p className="text-gray-500 text-sm">Track your job applications</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>
            ) : applications.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl">
                    <p className="text-gray-500 mb-4">No applications yet</p>
                    <Button onClick={() => navigate('/jobs')} className="bg-black text-white rounded-full px-6" data-testid="find-jobs-btn">
                        Find Jobs
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div key={app.id} className="border border-gray-200 rounded-xl p-6" data-testid={`application-${app.id}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-black text-white text-xs px-2 py-1 rounded-full"><MapPin className="w-3 h-3 mr-1" />{app.campaign?.city}</Badge>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">{app.campaign?.title || 'Job'}</h3>
                                    <p className="text-sm text-gray-500">{app.campaign?.brand_name}</p>
                                </div>
                                <Badge className={`text-xs capitalize ${app.status === 'hired' ? 'bg-black text-white' : app.status === 'rejected' ? 'bg-gray-200' : app.status === 'shortlisted' ? 'border-green-500 text-green-600' : ''}`}>
                                    {app.status}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500">Your Bid</p>
                                        <p className="text-xl font-bold">₹{app.price.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Job Budget</p>
                                        <p className="font-medium">₹{app.campaign?.budget_min?.toLocaleString()} - ₹{app.campaign?.budget_max?.toLocaleString()}</p>
                                    </div>
                                </div>

                                {app.status === 'hired' && (
                                    <Button variant="outline" onClick={() => navigate(`/dashboard/influencer/messages?to=${app.campaign?.brand_id}`)} className="rounded-full text-sm" data-testid={`message-brand-${app.id}-btn`}>
                                        <MessageSquare className="w-4 h-4 mr-2" /> Message Brand
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
