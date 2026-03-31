'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { Search, MapPin, DollarSign, Calendar, Users } from 'lucide-react';
import { API, CITIES } from '../shared';

export const InfluencerDashboardHome = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [jobsRes, invitesRes] = await Promise.all([
                axios.get(`${API}/jobs`),
                axios.get(`${API}/invites/received`, { headers }),
            ]);
            setJobs(jobsRes.data.campaigns || jobsRes.data);
            setInvites(invitesRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleInviteResponse = async (inviteId, response) => {
        try {
            await axios.put(`${API}/invites/${inviteId}/respond`, { response }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(response === 'accepted' ? 'Invite accepted! Application created.' : 'Invite declined.');
            setInvites(prev => prev.map(i => i.id === inviteId ? {...i, status: response} : i));
        } catch (err) { toast.error('Failed to respond'); }
    };

    const filteredJobs = jobs.filter(job => {
        const matchSearch = !searchQuery || job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || job.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCity = !cityFilter || job.city === cityFilter;
        return matchSearch && matchCity && (job.status === 'active' || job.status === 'open');
    });

    const urgencyLabels = ['Urgently hiring', 'New', 'Featured', 'Hot'];

    return (
        <div>
            <div className="flex gap-2 mb-6" data-testid="influencer-search">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search jobs..." className="pl-10 rounded-full border-gray-200" data-testid="search-jobs-input" />
                </div>
                <Select value={cityFilter || 'all'} onValueChange={(v) => setCityFilter(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-[130px] rounded-full border-gray-200" data-testid="city-filter">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name?.split(' ')[0]}</h1>

            {invites.filter(i => i.status === 'pending').length > 0 && (
                <div className="mt-4 mb-4">
                    <h2 className="text-lg font-bold mb-3">Campaign Invites</h2>
                    <div className="space-y-3">
                        {invites.filter(i => i.status === 'pending').map(invite => (
                            <div key={invite.id} className="border-2 border-black rounded-xl p-4" data-testid={`invite-${invite.id}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-bold">{invite.campaign_title}</p>
                                        <p className="text-xs text-gray-500">from {invite.brand_name}</p>
                                    </div>
                                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">Invite</Badge>
                                </div>
                                {invite.message && <p className="text-sm text-gray-600 mb-3">&quot;{invite.message}&quot;</p>}
                                <div className="flex gap-2">
                                    <Button onClick={() => handleInviteResponse(invite.id, 'accepted')} className="flex-1 bg-black text-white hover:bg-gray-800 rounded-full text-sm" data-testid={`accept-invite-${invite.id}`}>Accept</Button>
                                    <Button variant="outline" onClick={() => handleInviteResponse(invite.id, 'declined')} className="flex-1 rounded-full text-sm" data-testid={`decline-invite-${invite.id}`}>Decline</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h2 className="text-lg font-bold mb-4 mt-4">Jobs for you</h2>

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>
            ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-400 mb-3">No jobs found</p>
                    <Button onClick={() => navigate('/jobs')} className="bg-black text-white rounded-full">Browse All Jobs</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="bg-[#0a0a0a] text-white rounded-2xl p-7 flex flex-col justify-between cursor-pointer hover:bg-[#111] transition-colors group" onClick={() => navigate(`/jobs/${job.id}`)} data-testid={`job-card-${job.id}`}>
                            <div>
                                <span className="inline-block text-sm font-medium text-white border border-white/30 rounded px-3 py-1 mb-5">
                                    {job.niche || job.category}
                                </span>
                                <p className="text-sm text-gray-400 mb-1">{job.brand_name}</p>
                                <h3 className="text-sm font-bold tracking-tight mb-3 leading-tight underline decoration-white/40 underline-offset-4">
                                    {job.title}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-6 leading-relaxed">{job.description}</p>
                                <div className="space-y-2.5 mb-6">
                                    <div className="flex items-center gap-3 text-base">
                                        <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-white font-medium">Rs.{job.budget_min?.toLocaleString('en-IN')}{job.budget_max ? ` - Rs.${job.budget_max.toLocaleString('en-IN')}` : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-gray-400">Deadline: {job.deadline}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-base">
                                        <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-gray-400">{job.applicants_count || 0} applicants</span>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full bg-white text-black text-sm font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }} data-testid={`view-job-${job.id}`}>
                                Easy Apply
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
