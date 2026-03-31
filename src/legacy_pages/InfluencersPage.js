'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';
import { MapPin, Star, Users, X, ArrowRight, Check, Eye, MessageCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CITIES = ["All Cities", "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Lucknow"];
const CATEGORIES = ["All Categories", "Influencer", "Photographer", "Videographer", "UGC Creator", "Social Media Manager", "Editor"];

const COVER_GRADIENTS = [
    'from-gray-800 to-gray-600',
    'from-gray-900 to-gray-700',
    'from-zinc-800 to-zinc-600',
    'from-neutral-800 to-neutral-600',
    'from-stone-800 to-stone-600',
    'from-gray-700 to-gray-500',
];

const InfluencersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        category: searchParams.get('category') || ''
    });

    useEffect(() => { fetchInfluencers(); }, [filters]);

    const fetchInfluencers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.city && filters.city !== 'All Cities') params.append('city', filters.city);
            if (filters.category && filters.category !== 'All Categories') params.append('category', filters.category);

            const response = await axios.get(`${API}/creators?${params.toString()}`);
            setInfluencers(response.data.creators);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching influencers:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({ city: '', category: '' });
        setSearchParams({});
    };

    const hasActiveFilters = filters.city || filters.category;

    const formatFollowers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const getGradient = (index) => COVER_GRADIENTS[index % COVER_GRADIENTS.length];

    return (
        <div className="min-h-screen bg-black">
            <Header />

            {/* Header */}
            <section className="pt-28 pb-8 px-6 border-b border-white/10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 text-white">Find Influencers</h1>
                            <p className="text-sm text-gray-400">Discover talented influencers in your city</p>
                        </div>
                        <p className="text-sm text-gray-500" data-testid="influencers-count">
                            <span className="font-semibold text-white">{total}</span> influencers found
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <Select
                            value={filters.city || "All Cities"}
                            onValueChange={(value) => setFilters({ ...filters, city: value === "All Cities" ? "" : value })}
                        >
                            <SelectTrigger className="w-[150px] text-sm border-white/20 bg-white/5 text-white" data-testid="filter-city-select">
                                <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                <SelectValue placeholder="City" />
                            </SelectTrigger>
                            <SelectContent>
                                {CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.category || "All Categories"}
                            onValueChange={(value) => setFilters({ ...filters, category: value === "All Categories" ? "" : value })}
                        >
                            <SelectTrigger className="w-[160px] text-sm border-white/20 bg-white/5 text-white" data-testid="filter-category-select">
                                <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors" data-testid="clear-filters-btn">
                                <X className="w-3.5 h-3.5" /> Clear
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Influencer Cards */}
            <section className="py-8 px-6">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : influencers.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400 mb-4">No influencers found</p>
                            {!user && (
                                <Button onClick={() => navigate('/register?role=creator')} className="bg-white text-black hover:bg-gray-100 rounded-full px-6" data-testid="join-influencer-btn">
                                    Join as Influencer
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                            {influencers.map((influencer, index) => (
                                <div
                                    key={influencer.id}
                                    className="rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all group cursor-pointer"
                                    onClick={() => navigate(`/influencers/${influencer.user_id}`)}
                                    data-testid={`influencer-card-${influencer.id}`}
                                >
                                    {/* Image - top half */}
                                    <div className="relative aspect-square overflow-hidden">
                                        {influencer.profile_image_url ? (
                                            <img
                                                src={influencer.profile_image_url}
                                                alt={influencer.display_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className={`w-full h-full bg-gradient-to-br ${getGradient(index)} flex items-center justify-center`}>
                                                <span className="text-5xl font-bold text-white/30">{influencer.display_name?.charAt(0) || '?'}</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl" data-testid={`verified-badge-${influencer.id}`}>
                                            <Check className="w-5 h-5 text-black" />
                                        </div>
                                    </div>
                                    {/* Info - bottom half */}
                                    <div className="p-5">
                                        <h3 className="text-sm font-bold tracking-tight mb-1" data-testid={`influencer-name-${influencer.id}`}>{influencer.display_name}</h3>
                                        <p className="text-sm text-gray-500 mb-5">{influencer.city}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/messages?to=${influencer.user_id}`); }}
                                                className="flex-1 text-sm font-semibold py-3 rounded-lg border-2 border-black text-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                                                data-testid={`chat-${influencer.id}-btn`}
                                            >
                                                <MessageCircle className="w-4 h-4" /> Chat
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/influencers/${influencer.user_id}`); }}
                                                className="flex-1 text-sm font-semibold py-3 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors flex items-center justify-center gap-2"
                                                data-testid={`hire-${influencer.id}-btn`}
                                            >
                                                Hire
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            {user?.role === 'brand' && (
                <section className="py-16 px-6 bg-black text-white">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Found The Right Influencers?</h2>
                        <p className="text-gray-400 mb-6 text-sm">Post a job to receive applications from influencers</p>
                        <Button onClick={() => navigate('/post-job')} className="bg-white text-black hover:bg-gray-100 rounded-full px-6" data-testid="post-job-cta-btn">
                            Post a Job
                        </Button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default InfluencersPage;
