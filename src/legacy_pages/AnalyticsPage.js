'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, BarChart3, TrendingUp, Users, Briefcase, Target, Star, Zap, Lock } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const s14 = { fontSize: '14px', lineHeight: '1.4' };
const s12 = { fontSize: '12px', lineHeight: '1.4' };

const StatCard = ({ icon, label, value, sub }) => (
    <div className="bg-gray-50 rounded-xl p-4" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-gray-500" style={s12}>{label}</span>
        </div>
        <p className="font-bold" style={{ fontSize: '20px' }}>{value}</p>
        {sub && <p className="text-gray-400 mt-0.5" style={s12}>{sub}</p>}
    </div>
);

const AnalyticsPage = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [activating, setActivating] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const profileCol = user?.role === 'creator' ? 'creators' : 'brands';
            const [analyticsRes, profileRes] = await Promise.all([
                axios.get(`${API}/analytics/dashboard`, { headers }),
                axios.get(`${API}/${profileCol}/profile`, { headers }),
            ]);
            setData(analyticsRes.data);
            setHasAccess(profileRes.data?.analytics_active || false);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const activateAnalytics = async () => {
        setActivating(true);
        try {
            await axios.post(`${API}/analytics/subscribe`, { credits: 10 }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Analytics activated!');
            setHasAccess(true);
        } catch (err) { toast.error(err.response?.data?.detail || 'Not enough credits'); }
        finally { setActivating(false); }
    };

    if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>;

    if (!hasAccess) {
        return (
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-black" data-testid="back-btn"><ArrowLeft className="w-5 h-5" /></button>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                </div>
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl" data-testid="analytics-locked">
                    <Lock className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-2xl font-bold mb-1">Unlock Advanced Analytics</p>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto" style={s12}>Track campaign performance, hire rates, and more. Starting at 10 credits/month.</p>
                    <Button onClick={activateAnalytics} disabled={activating} className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-4" data-testid="activate-analytics-btn">
                        <BarChart3 className="w-4 h-4 mr-2" /> {activating ? 'Activating...' : 'Activate (10 credits)'}
                    </Button>
                </div>
            </div>
        );
    }

    // Brand Analytics
    if (user?.role === 'brand' && data) {
        return (
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-black" data-testid="back-btn"><ArrowLeft className="w-5 h-5" /></button>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <StatCard icon={<Briefcase className="w-4 h-4 text-gray-400" />} label="Campaigns" value={data.total_campaigns} />
                    <StatCard icon={<Users className="w-4 h-4 text-gray-400" />} label="Applicants" value={data.total_applicants} />
                    <StatCard icon={<Target className="w-4 h-4 text-gray-400" />} label="Hired" value={data.total_hired} />
                    <StatCard icon={<TrendingUp className="w-4 h-4 text-gray-400" />} label="Conversion" value={`${data.conversion_rate}%`} />
                    <StatCard icon={<Zap className="w-4 h-4 text-yellow-500" />} label="Boosted" value={data.boosted_campaigns} />
                    <StatCard icon={<Star className="w-4 h-4 text-yellow-500" />} label="Contests" value={data.contests} />
                </div>

                {data.campaigns?.length > 0 && (
                    <div>
                        <p className="font-bold mb-3" style={s14}>Campaign Performance</p>
                        <div className="space-y-2">
                            {data.campaigns.map(c => (
                                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100"
                                    onClick={() => navigate(`/dashboard/brand/jobs/${c.id}`)} data-testid={`campaign-stat-${c.id}`}>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate" style={s12}>{c.title}</p>
                                        <p className="text-gray-400" style={{ fontSize: '10px' }}>
                                            {c.applicants} applicants · {c.hired} hired
                                            {c.is_boosted && ' · Boosted'}
                                            {c.is_contest && ' · Contest'}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${c.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`} style={s12}>
                                        {c.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Creator Analytics
    if (user?.role === 'creator' && data) {
        return (
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-black" data-testid="back-btn"><ArrowLeft className="w-5 h-5" /></button>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <StatCard icon={<Briefcase className="w-4 h-4 text-gray-400" />} label="Applied" value={data.total_applied} />
                    <StatCard icon={<Target className="w-4 h-4 text-gray-400" />} label="Hired" value={data.total_hired} />
                    <StatCard icon={<Users className="w-4 h-4 text-gray-400" />} label="Shortlisted" value={data.total_shortlisted} />
                    <StatCard icon={<TrendingUp className="w-4 h-4 text-gray-400" />} label="Hire Rate" value={`${data.hire_rate}%`} />
                    <StatCard icon={<Star className="w-4 h-4 text-yellow-500" />} label="Avg Rating" value={data.avg_rating} sub={`${data.total_reviews} reviews`} />
                </div>
            </div>
        );
    }

    return null;
};

export default AnalyticsPage;
