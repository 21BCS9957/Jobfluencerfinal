'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { ArrowRight, MapPin, Check, Instagram, Youtube, DollarSign, Calendar, Users, Star, Shield, Clock, Eye, MessageCircle, Bookmark, Briefcase, Search, Zap, Sparkles } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Swipe hook for carousels
const useSwipe = (totalSlides, setSlide, pauseRef) => {
    const startX = useRef(0);
    const currentX = useRef(0);
    const isDragging = useRef(false);

    const onStart = (clientX) => {
        isDragging.current = true;
        startX.current = clientX;
        currentX.current = clientX;
        if (pauseRef) pauseRef.current = true;
    };

    const onMove = (clientX) => {
        if (!isDragging.current) return;
        currentX.current = clientX;
    };

    const onEnd = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const diff = startX.current - currentX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                setSlide(prev => (prev + 1) % totalSlides);
            } else {
                setSlide(prev => (prev - 1 + totalSlides) % totalSlides);
            }
        }
        if (pauseRef) setTimeout(() => { pauseRef.current = false; }, 2000);
    };

    const handlers = {
        onTouchStart: (e) => onStart(e.touches[0].clientX),
        onTouchMove: (e) => onMove(e.touches[0].clientX),
        onTouchEnd: onEnd,
        onMouseDown: (e) => { e.preventDefault(); onStart(e.clientX); },
        onMouseMove: (e) => onMove(e.clientX),
        onMouseUp: onEnd,
        onMouseLeave: () => { if (isDragging.current) onEnd(); if (pauseRef) pauseRef.current = false; },
    };

    return handlers;
};

const COVER_GRADIENTS = [
    'from-gray-800 to-gray-600',
    'from-gray-900 to-gray-700',
    'from-zinc-800 to-zinc-600',
    'from-neutral-800 to-neutral-600',
    'from-stone-800 to-stone-600',
    'from-gray-700 to-gray-500',
];

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total_creators: 0, total_brands: 0, open_campaigns: 0 });
    const [featuredJobs, setFeaturedJobs] = useState([]);
    const [featuredInfluencers, setFeaturedInfluencers] = useState([]);
    const [jobSlide, setJobSlide] = useState(0);
    const [infSlide, setInfSlide] = useState(0);
    const [citySearch, setCitySearch] = useState('');
    const jobPaused = useRef(false);
    const infPaused = useRef(false);

    // Auto-slide jobs
    useEffect(() => {
        if (featuredJobs.length <= 1) return;
        const timer = setInterval(() => {
            if (!jobPaused.current) {
                setJobSlide(prev => (prev + 1) % featuredJobs.length);
            }
        }, 4000);
        return () => clearInterval(timer);
    }, [featuredJobs.length]);

    // Auto-slide influencers
    useEffect(() => {
        if (featuredInfluencers.length <= 1) return;
        const timer = setInterval(() => {
            if (!infPaused.current) {
                setInfSlide(prev => (prev + 1) % featuredInfluencers.length);
            }
        }, 4000);
        return () => clearInterval(timer);
    }, [featuredInfluencers.length]);

    const jobSwipe = useSwipe(featuredJobs.length, setJobSlide, jobPaused);
    const infSwipe = useSwipe(featuredInfluencers.length, setInfSlide, infPaused);

    async function fetchStats() {
        try {
            const response = await axios.get(`${API}/stats`);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    async function fetchFeaturedJobs() {
        try {
            const response = await axios.get(`${API}/jobs?limit=4`);
            setFeaturedJobs(response.data.campaigns?.slice(0, 4) || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    }

    async function fetchFeaturedInfluencers() {
        try {
            const response = await axios.get(`${API}/creators?limit=6`);
            setFeaturedInfluencers(response.data.creators?.slice(0, 6) || []);
        } catch (error) {
            console.error('Error fetching influencers:', error);
        }
    }

    useEffect(() => {
        fetchStats();
        fetchFeaturedJobs();
        fetchFeaturedInfluencers();
    }, []);

    const formatBudget = (min, max) => {
        if (!min) return 'Budget TBD';
        if (min === max) return `Rs.${min?.toLocaleString('en-IN')}`;
        return `Rs.${min?.toLocaleString('en-IN')} - Rs.${max?.toLocaleString('en-IN')}`;
    };

    const formatFollowers = (count) => {
        if (!count) return '0';
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <div className="min-h-screen bg-white">

            {/* ======== 1. HERO SECTION (unchanged) ======== */}
            <section className="bg-black text-white relative overflow-hidden min-h-[90vh] flex items-center">
                <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <span className="text-sm font-bold text-white">JOBFLUENCER</span>
                        <nav className="flex items-center gap-6">
                            <Link to="/login" className="text-white/80 hover:text-white text-sm font-medium">Log In</Link>
                            <Link to="/register" className="text-white/80 hover:text-white text-sm font-medium">Sign Up or Sign In</Link>
                        </nav>
                    </div>
                </header>
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                    <div className="max-w-2xl mx-auto text-center">
                        <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-8 uppercase tracking-tight">
                            FIND. HIRE. INFLUENCERS IN YOUR CITY.
                        </h1>
                        <ul className="space-y-4 mb-10 text-sm inline-block text-left">
                            {[
                                "Influencers, photographers, SMMs, UGC creators, and editors in your city",
                                'Get multiple proposals, compare, and hire',
                                'Escrow-secured payments after approval'
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Check className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <Button
                                onClick={() => navigate('/post-job')}
                                className="flex-1 bg-white text-black hover:bg-gray-100 text-sm font-semibold py-6 rounded-md"
                                data-testid="hire-influencer-btn"
                            >
                                Hire an Influencer
                            </Button>
                            <Button
                                onClick={() => navigate('/register?role=creator')}
                                variant="outline"
                                className="flex-1 border-2 border-white text-white hover:bg-white hover:text-black text-sm font-semibold py-6 rounded-md bg-transparent"
                                data-testid="earn-money-btn"
                            >
                                Get Hired & Earn Money
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <Header />

            {/* ======== 2. BROWSE BY CATEGORIES ======== */}
            <section className="py-16 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight uppercase">CATEGORIES</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { id: 'Photographer', label: 'Photographer', desc: 'Products, branding, events', img: 'https://images.pexels.com/photos/35888640/pexels-photo-35888640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
                            { id: 'Videographer', label: 'Videographer', desc: 'Reels, films, campaigns', img: 'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
                            { id: 'Social Media Manager', label: 'SMM', desc: 'Planning, posting, growth', img: 'https://images.pexels.com/photos/577210/pexels-photo-577210.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
                            { id: 'UGC Creator', label: 'UGC Creator', desc: 'Ad-ready native content', img: 'https://images.pexels.com/photos/4620868/pexels-photo-4620868.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
                            { id: 'Editor', label: 'Editor', desc: 'Post-production, retouching', img: 'https://images.pexels.com/photos/695730/pexels-photo-695730.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
                            { id: 'Influencer', label: 'Influencer', desc: 'Campaigns and reach', img: 'https://images.pexels.com/photos/6964858/pexels-photo-6964858.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
                        ].map((cat) => (
                            <div
                                key={cat.id}
                                className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group"
                                onClick={() => navigate(`/influencers?category=${cat.id}`)}
                                data-testid={`category-${cat.id.toLowerCase().replace(/\s/g, '-')}-card`}
                            >
                                <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                                <div className="absolute bottom-0 left-0 p-5 md:p-6">
                                    <h3 className="text-sm font-bold text-white mb-0.5 tracking-tight">{cat.label}</h3>
                                    <p className="text-sm text-white/70 mb-1.5">{cat.desc}</p>
                                    <span className="text-sm font-semibold text-white flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                                        Explore <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======== 3. FEATURED JOBS (carousel) ======== */}
            <section className="py-16 px-6 bg-black" data-testid="featured-jobs-section">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2">Latest Opportunities</p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white uppercase">FEATURED JOBS</h2>
                    </div>

                    {featuredJobs.length > 0 ? (
                        <div
                            className="relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
                            onMouseEnter={() => { jobPaused.current = true; }}
                            onMouseLeave={(e) => { jobPaused.current = false; jobSwipe.onMouseLeave(e); }}
                            onTouchStart={jobSwipe.onTouchStart}
                            onTouchMove={jobSwipe.onTouchMove}
                            onTouchEnd={jobSwipe.onTouchEnd}
                            onMouseDown={jobSwipe.onMouseDown}
                            onMouseMove={jobSwipe.onMouseMove}
                            onMouseUp={jobSwipe.onMouseUp}
                        >
                            <div
                                className="flex transition-transform duration-[400ms] ease-out"
                                style={{ transform: `translateX(-${jobSlide * 100}%)` }}
                            >
                                {featuredJobs.map((job) => (
                                    <div key={job.id} className="w-full flex-shrink-0 px-1">
                                        <div
                                            className="bg-white text-black rounded-2xl p-7 flex flex-col justify-between cursor-pointer hover:shadow-xl transition-shadow group"
                                            onClick={() => navigate(`/jobs/${job.id}`)}
                                            data-testid={`featured-job-${job.id}`}
                                        >
                                            <div>
                                                <span className="inline-block text-sm font-medium bg-gray-100 text-gray-700 rounded px-3 py-1 mb-5">
                                                    {job.niche || job.category}
                                                </span>
                                                <p className="text-sm text-gray-400 mb-1">{job.brand_name}</p>
                                                <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-3 leading-tight group-hover:underline decoration-black/20 underline-offset-4">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">{job.description}</p>
                                                <div className="flex flex-wrap gap-x-8 gap-y-2 mb-6">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                                        <span className="text-black font-medium">{formatBudget(job.budget_min, job.budget_max)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-500">{job.deadline}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-500">{job.applicants_count || 0} applicants</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="w-full bg-black text-white text-sm font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors" data-testid={`featured-job-view-${job.id}`}>
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Dots */}
                            {featuredJobs.length > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {featuredJobs.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setJobSlide(i)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === jobSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}
                                            data-testid={`job-dot-${i}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 border border-dashed border-white/20 rounded-2xl">
                            <Briefcase className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">No jobs posted yet. Be the first!</p>
                            <Button onClick={() => navigate('/post-job')} className="mt-4 bg-white text-black rounded-full px-6 text-sm">Post a Job</Button>
                        </div>
                    )}
                </div>
            </section>

            {/* ======== 4. FEATURED INFLUENCERS (grid) ======== */}
            <section className="py-16 px-6 bg-white" data-testid="featured-influencers-section">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">Top Talent</p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black uppercase">FEATURED INFLUENCERS</h2>
                    </div>

                    {featuredInfluencers.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                {featuredInfluencers.map((inf, index) => (
                                    <div
                                        key={inf.id}
                                        className="rounded-2xl overflow-hidden bg-white shadow-lg group cursor-pointer"
                                        onClick={() => navigate(`/influencers/${inf.user_id}`)}
                                        data-testid={`featured-influencer-${inf.id}`}
                                    >
                                        {/* Image - top half */}
                                        <div className="relative aspect-square overflow-hidden">
                                            {inf.profile_image_url ? (
                                                <img src={inf.profile_image_url} alt={inf.display_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className={`w-full h-full bg-gradient-to-br ${COVER_GRADIENTS[index % COVER_GRADIENTS.length]} flex items-center justify-center`}>
                                                    <span className="text-5xl font-bold text-white/30">{inf.display_name?.charAt(0) || '?'}</span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl">
                                                <Check className="w-5 h-5 text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-sm font-bold tracking-tight mb-1">{inf.display_name}</h3>
                                            <p className="text-sm text-gray-500 mb-5">{inf.city}</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/influencers/${inf.user_id}`); }}
                                                    className="flex-1 text-sm font-semibold py-3 rounded-lg border-2 border-black text-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                                                    data-testid={`featured-inf-view-${inf.id}`}
                                                >
                                                    <Eye className="w-4 h-4" /> View
                                                </button>
                                                <button
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 text-sm font-semibold py-3 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors flex items-center justify-center gap-2"
                                                    data-testid={`featured-inf-chat-${inf.id}`}
                                                >
                                                    <MessageCircle className="w-4 h-4" /> Chat
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => navigate('/influencers')}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-black border border-black/30 rounded-full px-6 py-3 hover:bg-black hover:text-white transition-all"
                                    data-testid="view-all-creators-btn"
                                >
                                    View All Creators <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                            <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Influencers coming soon.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ======== 5. TRUST BAND ======== */}
            <section className="py-14 px-6 bg-black" data-testid="trust-band-section">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">{stats.total_creators || '5K'}+</p>
                            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-medium">INFLUENCERS</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">{stats.total_brands || '500'}+</p>
                            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-medium">BRANDS HIRING</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">15+</p>
                            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-medium">CITIES</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">{stats.open_campaigns || '200'}+</p>
                            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-medium">OPEN JOBS</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======== 6. WHY CHOOSE JOBFLUENCER ======== */}
            <section className="py-20 px-6 bg-white" data-testid="why-jobfluencer-section">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">WHY CHOOSE JOBFLUENCER</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: <MapPin className="w-10 h-10 stroke-[1.5]" />, title: 'HIRE IN\nYOUR CITY' },
                            { icon: <Zap className="w-10 h-10 stroke-[1.5]" />, title: 'QUICK\n& FAST' },
                            { icon: <Shield className="w-10 h-10 stroke-[1.5]" />, title: 'SECURE\nPAYMENTS' },
                            { icon: <Sparkles className="w-10 h-10 stroke-[1.5]" />, title: 'AI POWERED\nMATCHING' },
                        ].map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-3xl p-10 md:p-14 flex flex-col items-center justify-center text-center" data-testid={`why-card-${index}`}>
                                <div className="mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-sm font-bold tracking-wider leading-snug whitespace-pre-line">{item.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======== 7. HOW JOBFLUENCER WORKS ======== */}
            <section className="bg-black pt-16 pb-20 px-6" data-testid="how-it-works-section">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Dark header */}
                    <div className="mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">HOW JOBFLUENCER WORKS?</h2>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mx-auto">
                            Jobfluencer is a local-first influencer marketplace, trusted by brands to find exceptional creative talent faster, more reliably and at the lowest cost.
                        </p>
                    </div>

                    {/* White card carousel */}
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {[
                            { step: 1, icon: <Briefcase className="w-5 h-5 text-white" />, title: 'POST OR BROWSE CAMPAIGNS', desc: 'Brands post campaigns in their city. Boost with Featured Campaigns for maximum reach. Creators browse opportunities.' },
                            { step: 2, icon: <Users className="w-5 h-5 text-white" />, title: 'APPLY OR INVITE', desc: 'Creators apply with proposals. Premium & Verified profiles get priority visibility. Brands can run Contest Mode — pay only for winning submissions.' },
                            { step: 3, icon: <MessageCircle className="w-5 h-5 text-white" />, title: 'CHAT & COLLABORATE', desc: 'Discuss deliverables, timelines, and expectations. Access Advanced Analytics to track campaign performance in real-time.' },
                            { step: 4, icon: <Shield className="w-5 h-5 text-white" />, title: 'HIRE & SECURE PAYMENT', desc: 'Hire creators with escrow-protected payments. Platform commission of 10–20% ensures trust and quality for both parties.' },
                        ].map((item) => (
                            <div key={item.step} className="flex-shrink-0 w-[300px] md:w-[340px] bg-white rounded-3xl p-7 snap-start text-left" data-testid={`how-step-${item.step}`}>
                                <div className="flex items-center gap-2.5 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-sm font-bold text-gray-500">{item.step}</span>
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold tracking-wider mb-3">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======== 8. INDIA MAP ======== */}
            <section className="py-20 px-6 bg-white" data-testid="india-map-section">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-3">HIRE & GET HIRED<br />IN YOUR CITY</h2>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto mb-12 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                        <input
                            type="text"
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            placeholder="Search city..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-11 pr-4 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                            data-testid="city-search-input"
                        />
                        {citySearch && (() => {
                            const ALL_CITIES = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Jaipur','Ahmedabad','Lucknow','Chandigarh','Goa','Kochi','Indore','Surat','Nagpur','Bhopal','Patna','Coimbatore','Visakhapatnam','Thiruvananthapuram','Guwahati','Bhubaneswar','Dehradun','Amritsar','Varanasi','Jodhpur','Udaipur','Mysuru','Mangalore'];
                            const filtered = ALL_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));
                            return filtered.length > 0 ? (
                                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl overflow-hidden z-10 shadow-xl">
                                    {filtered.slice(0, 6).map(city => (
                                        <button
                                            key={city}
                                            onClick={() => { setCitySearch(''); navigate(`/influencers?city=${city}`); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors text-left"
                                            data-testid={`search-result-${city.toLowerCase()}`}
                                        >
                                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            ) : null;
                        })()}
                    </div>

                    {/* India Map */}
                    <div className="relative max-w-2xl mx-auto aspect-square">
                        <img
                            src="https://static.prod-images.emergentagent.com/jobs/549a0006-f088-40c2-9198-f13a0d2d0db6/images/a4d374b175416bbc60716cbc258b188688367b0c3591ef95d891ed1552f4935e.png"
                            alt="India Map"
                            className="w-full h-full object-contain opacity-20"
                            style={{ filter: 'invert(1)' }}
                        />
                        {[
                            { name: 'Delhi', x: 42, y: 28, size: 'lg' },
                            { name: 'Chandigarh', x: 38, y: 22, size: 'sm' },
                            { name: 'Jaipur', x: 34, y: 33, size: 'md' },
                            { name: 'Lucknow', x: 50, y: 31, size: 'md' },
                            { name: 'Patna', x: 60, y: 32, size: 'sm' },
                            { name: 'Guwahati', x: 74, y: 28, size: 'sm' },
                            { name: 'Kolkata', x: 64, y: 40, size: 'lg' },
                            { name: 'Bhopal', x: 40, y: 40, size: 'sm' },
                            { name: 'Indore', x: 36, y: 39, size: 'sm' },
                            { name: 'Ahmedabad', x: 27, y: 37, size: 'md' },
                            { name: 'Mumbai', x: 26, y: 48, size: 'lg' },
                            { name: 'Pune', x: 30, y: 52, size: 'md' },
                            { name: 'Surat', x: 26, y: 42, size: 'sm' },
                            { name: 'Nagpur', x: 44, y: 43, size: 'sm' },
                            { name: 'Hyderabad', x: 40, y: 54, size: 'lg' },
                            { name: 'Visakhapatnam', x: 52, y: 52, size: 'sm' },
                            { name: 'Bhubaneswar', x: 57, y: 45, size: 'sm' },
                            { name: 'Goa', x: 27, y: 57, size: 'sm' },
                            { name: 'Bangalore', x: 36, y: 65, size: 'lg' },
                            { name: 'Chennai', x: 46, y: 64, size: 'lg' },
                            { name: 'Mysuru', x: 34, y: 68, size: 'sm' },
                            { name: 'Coimbatore', x: 38, y: 72, size: 'sm' },
                            { name: 'Kochi', x: 33, y: 75, size: 'md' },
                            { name: 'Mangalore', x: 29, y: 66, size: 'sm' },
                            { name: 'Thiruvananthapuram', x: 34, y: 80, size: 'sm' },
                            { name: 'Amritsar', x: 36, y: 20, size: 'sm' },
                            { name: 'Varanasi', x: 54, y: 33, size: 'sm' },
                            { name: 'Dehradun', x: 40, y: 20, size: 'sm' },
                            { name: 'Udaipur', x: 30, y: 34, size: 'sm' },
                            { name: 'Jodhpur', x: 28, y: 30, size: 'sm' },
                        ].map((city) => {
                            const dotSize = city.size === 'lg' ? 'w-3 h-3' : city.size === 'md' ? 'w-2.5 h-2.5' : 'w-2 h-2';
                            const pulseSize = city.size === 'lg' ? 'w-6 h-6' : city.size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
                            const showLabel = city.size === 'lg' || city.size === 'md';
                            return (
                                <button
                                    key={city.name}
                                    onClick={() => navigate(`/influencers?city=${city.name}`)}
                                    className="absolute group"
                                    style={{ left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%, -50%)' }}
                                    data-testid={`map-city-${city.name.toLowerCase()}`}
                                >
                                    {/* eslint-disable-next-line react-hooks/purity */}
                                    <span className={`absolute ${pulseSize} rounded-full bg-black/10 animate-ping`} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animationDuration: `${2 + Math.random() * 2}s` }} />
                                    <span className={`relative block ${dotSize} rounded-full bg-black group-hover:bg-black group-hover:scale-150 transition-transform`} />
                                    {showLabel && (
                                        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 text-sm font-medium text-gray-500 group-hover:text-black whitespace-nowrap transition-colors">
                                            {city.name}
                                        </span>
                                    )}
                                    {!showLabel && (
                                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 text-sm font-medium text-black bg-black/10 backdrop-blur-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                                            {city.name}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mt-10">
                        {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Jaipur', 'Kochi', 'Goa'].map(city => (
                            <button
                                key={city}
                                onClick={() => navigate(`/influencers?city=${city}`)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all text-sm font-medium text-black"
                                data-testid={`map-pill-${city.toLowerCase()}`}
                            >
                                <MapPin className="w-3 h-3" />{city}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======== FOOTER ======== */}
            <footer className="bg-black text-white py-16 px-6 border-t border-gray-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <h3 className="text-sm font-bold mb-4">JOBFLUENCER</h3>
                            <p className="text-sm text-gray-400">Jobs for influencers. Find paid collaborations with brands in your city.</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">For Brands</p>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/post-job" className="text-gray-400 hover:text-white">Post a Job</Link></li>
                                <li><Link to="/influencers" className="text-gray-400 hover:text-white">Find Influencers</Link></li>
                                <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                                <li><Link to="/register?role=brand" className="text-gray-400 hover:text-white">Sign Up or Sign In</Link></li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">For Influencers</p>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/jobs" className="text-gray-400 hover:text-white">Browse Jobs</Link></li>
                                <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                                <li><Link to="/register?role=creator" className="text-gray-400 hover:text-white">Join as Influencer</Link></li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Top Cities</p>
                            <ul className="space-y-3 text-sm">
                                {['Mumbai', 'Delhi', 'Bangalore', 'Chennai'].map(city => (
                                    <li key={city}><Link to={`/jobs?city=${city}`} className="text-gray-400 hover:text-white">{city}</Link></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500">&copy; 2026 Jobfluencer. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-gray-400 hover:text-white"><Instagram className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white"><Youtube className="w-5 h-5" /></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
