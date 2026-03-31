'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';
import { MapPin, Calendar, Users, X, DollarSign } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CITIES = ["All Cities", "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Lucknow"];
const CATEGORIES = ["All Categories", "Influencer", "Photographer", "Videographer", "UGC Creator", "Social Media Manager", "Editor"];

const JobsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        category: searchParams.get('category') || ''
    });

    useEffect(() => { fetchJobs(); }, [filters]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.city && filters.city !== 'All Cities') params.append('city', filters.city);
            if (filters.category && filters.category !== 'All Categories') params.append('category', filters.category);

            const response = await axios.get(`${API}/jobs?${params.toString()}`);
            setJobs(response.data.campaigns);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({ city: '', category: '' });
        setSearchParams({});
    };

    const hasActiveFilters = filters.city || filters.category;

    const formatBudget = (min, max) => {
        if (min === max) return `Rs.${min.toLocaleString('en-IN')}`;
        return `Rs.${min.toLocaleString('en-IN')} - Rs.${max.toLocaleString('en-IN')}`;
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Header Section */}
            <section className="pt-28 pb-8 px-6 border-b border-gray-100">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">Influencer Jobs</h1>
                            <p className="text-sm text-gray-500">Find paid collaborations with brands in your city</p>
                        </div>
                        <p className="text-sm text-gray-400" data-testid="jobs-count">
                            <span className="font-semibold text-black">{total}</span> jobs found
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <Select
                            value={filters.city || "All Cities"}
                            onValueChange={(value) => setFilters({ ...filters, city: value === "All Cities" ? "" : value })}
                        >
                            <SelectTrigger className="w-[150px] text-sm border-gray-300" data-testid="filter-city-select">
                                <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
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
                            <SelectTrigger className="w-[160px] text-sm border-gray-300" data-testid="filter-category-select">
                                <Users className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-black flex items-center gap-1 transition-colors" data-testid="clear-filters-btn">
                                <X className="w-3.5 h-3.5" /> Clear
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Job Cards */}
            <section className="py-8 px-6">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 mb-4">No jobs found</p>
                            {user?.role === 'brand' && (
                                <Button onClick={() => navigate('/post-job')} className="bg-black text-white rounded-full px-6" data-testid="post-job-btn">
                                    Post a Job
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-5">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="bg-[#0a0a0a] text-white rounded-2xl p-7 flex flex-col justify-between cursor-pointer hover:bg-[#111] transition-colors group"
                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                    data-testid={`job-card-${job.id}`}
                                >
                                    {/* Category Tag */}
                                    <div>
                                        <span className="inline-block text-sm font-medium text-white border border-white/30 rounded px-3 py-1 mb-5">
                                            {job.niche || job.category}
                                        </span>

                                        {/* Brand Name */}
                                        <p className="text-sm text-gray-400 mb-1">{job.brand_name}</p>

                                        {/* Job Title */}
                                        <h3 className="text-sm font-bold tracking-tight mb-3 leading-tight underline decoration-white/40 underline-offset-4">
                                            {job.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sm text-gray-400 line-clamp-2 mb-6 leading-relaxed">
                                            {job.description}
                                        </p>

                                        {/* Details */}
                                        <div className="space-y-2.5 mb-6">
                                            <div className="flex items-center gap-3 text-base">
                                                <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="text-white font-medium">{formatBudget(job.budget_min, job.budget_max)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="text-gray-400">Deadline: {job.deadline}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-base">
                                                <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="text-gray-400">{job.applicants_count} applicants</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* View Details Button */}
                                    <button
                                        className="w-full bg-white text-black text-sm font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors"
                                        data-testid={`view-job-${job.id}-btn`}
                                    >
                                        Easy Apply
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            {!user && (
                <section className="py-16 px-6 bg-black text-white">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Ready To Find Your Next Job?</h2>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button onClick={() => navigate('/register?role=creator')} className="bg-white text-black hover:bg-gray-100 rounded-full px-6" data-testid="join-influencer-cta-btn">
                                Join as Influencer
                            </Button>
                            <Button onClick={() => navigate('/register?role=brand')} variant="outline" className="border-white text-white hover:bg-white hover:text-black rounded-full px-6" data-testid="post-job-cta-btn">
                                Post a Job
                            </Button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default JobsPage;
