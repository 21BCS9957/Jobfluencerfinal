'use client';

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Zap } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const Header = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [credits, setCredits] = useState(null);

    useEffect(() => {
        if (token) {
            axios.get(`${API}/wallet`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setCredits(res.data.invite_credits))
                .catch(() => {});
        }
    }, [token, location.pathname]);

    const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    const profilePath = user?.role === 'brand' ? '/dashboard/brand/profile' : '/dashboard/influencer/profile';

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/jobs', label: 'Jobs' },
        { path: '/influencers', label: 'Influencers' },
        { path: '/pricing', label: 'Pricing' },
        ...(user ? [{ path: profilePath, label: 'Profile' }] : []),
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200" data-testid="main-header">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
                <Link to="/" className="text-sm font-bold tracking-tight" data-testid="header-logo">
                    JOBFLUENCER
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-sm font-medium transition-colors ${isActive(link.path) ? 'text-black' : 'text-gray-500 hover:text-black'}`}
                            data-testid={`nav-${link.label.toLowerCase()}-link`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    {/* Buy button - always visible */}
                    <Button
                        onClick={() => navigate('/buy-credits')}
                        variant="outline"
                        className="text-sm font-medium px-4 py-2 rounded-full border-gray-300"
                        data-testid="header-buy-btn"
                    >
                        Buy
                    </Button>

                    {user ? (
                        <>
                            {credits !== null && (
                                <Link to="/buy-credits" className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors" data-testid="header-credits">
                                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                                    <span className="text-xs font-bold">{credits}</span>
                                </Link>
                            )}
                            <button
                                onClick={() => navigate(user.role === 'brand' ? '/dashboard/brand' : '/dashboard/influencer')}
                                className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold"
                                data-testid="user-avatar-btn"
                            >
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </button>
                        </>
                    ) : (
                        <Button
                            onClick={() => navigate('/login')}
                            className="bg-black text-white hover:bg-gray-800 text-sm font-medium px-5 py-2 rounded-full"
                            data-testid="header-login-btn"
                        >
                            Login
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
