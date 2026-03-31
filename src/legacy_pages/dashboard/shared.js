'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import axios from 'axios';
import {
    Home, Briefcase, MessageSquare, User, Plus, Bookmark, Zap, Crown,
    ChevronRight, BarChart3, Trophy, Users, Bell, Check
} from 'lucide-react';

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CATEGORIES = ["Influencer", "Photographer", "Videographer", "UGC Creator", "Social Media Manager", "Editor"];
export const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Twitter", "LinkedIn", "Facebook"];
export const NICHES = ["Fashion", "Beauty", "Tech", "Food", "Travel", "Fitness", "Lifestyle", "Gaming", "Business", "Education", "Entertainment"];
export const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Goa"];

const PLAN_COLORS = { free: 'bg-gray-100 text-gray-600', pro: 'bg-yellow-100 text-yellow-800', premium: 'bg-black text-white' };
const PLAN_ICONS = { free: null, pro: <Zap className="w-3 h-3" />, premium: <Crown className="w-3 h-3" /> };

export const SubscriptionBadge = ({ plan }) => {
    const p = (plan || 'free').toLowerCase();
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${PLAN_COLORS[p] || PLAN_COLORS.free}`} style={{ fontSize: '12px' }} data-testid="subscription-badge">
            {PLAN_ICONS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
        </span>
    );
};

// Feature Gating: wraps premium features with a lock overlay for free users
export const FeatureGate = ({ plan, requiredPlan = 'pro', children, featureName = 'This feature' }) => {
    const navigate = useNavigate();
    const userPlan = (plan || 'free').toLowerCase();
    const planOrder = { free: 0, pro: 1, premium: 2 };
    const hasAccess = (planOrder[userPlan] || 0) >= (planOrder[requiredPlan] || 1);

    if (hasAccess) return children;

    return (
        <div className="relative" data-testid={`feature-gate-${featureName.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="pointer-events-none opacity-40 select-none">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
                <div className="text-center px-4">
                    <Crown className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-700">{featureName}</p>
                    <p className="text-xs text-gray-400 mb-2">Upgrade to {requiredPlan} plan</p>
                    <Button onClick={() => navigate('/buy-credits')} className="text-xs bg-black text-white rounded-full px-4 py-1.5 h-auto" data-testid={`upgrade-btn-${featureName.toLowerCase().replace(/\s+/g, '-')}`}>
                        Upgrade
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const WalletSection = ({ wallet, subscription }) => {
    const navigate = useNavigate();
    const [showTxns, setShowTxns] = useState(false);
    const txns = wallet?.transactions || [];

    return (
        <div className="mb-6" data-testid="wallet-section">
            <div className="bg-gray-50 rounded-2xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-lg font-bold">Wallet</span>
                    </div>
                    <SubscriptionBadge plan={subscription?.plan} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3">
                        <p className="text-gray-400 text-sm">Credits</p>
                        <p className="text-lg font-bold">{wallet?.invite_credits || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3">
                        <p className="text-gray-400 text-sm">Balance</p>
                        <p className="text-lg font-bold">₹{(wallet?.balance || 0).toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <div className="flex gap-2 mt-3">
                    <Button onClick={() => navigate('/buy-credits')} className="flex-1 bg-black text-white hover:bg-gray-800 rounded-full py-2 text-sm" data-testid="wallet-buy-credits">
                        <Zap className="w-3 h-3 mr-1" /> Buy Credits
                    </Button>
                    {subscription?.plan === 'free' && (
                        <Button onClick={() => navigate('/pricing')} variant="outline" className="flex-1 border-black rounded-full py-2 text-sm" data-testid="wallet-upgrade">
                            <Crown className="w-3 h-3 mr-1" /> Upgrade
                        </Button>
                    )}
                </div>
            </div>
            {txns.length > 0 && (
                <div>
                    <button onClick={() => setShowTxns(!showTxns)} className="flex items-center justify-between w-full py-2" data-testid="toggle-transactions">
                        <span className="text-lg font-bold">Transactions ({txns.length})</span>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showTxns ? 'rotate-90' : ''}`} />
                    </button>
                    {showTxns && (
                        <div className="space-y-2 mt-1 max-h-[300px] overflow-y-auto">
                            {txns.slice().reverse().map((txn, i) => (
                                <div key={txn.id || i} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl" data-testid={`txn-${i}`}>
                                    <div>
                                        <p className="text-lg font-semibold capitalize">{(txn.type || '').replace('_', ' ')}</p>
                                        <p className="text-gray-400" style={{ fontSize: '10px' }}>{new Date(txn.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`text-lg font-bold ${(txn.credits || txn.amount || 0) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {(txn.credits || txn.amount || 0) > 0 ? '+' : ''}{txn.credits || txn.amount || 0} {txn.credits !== undefined ? 'cr' : '₹'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const BottomNav = ({ role }) => {
    const location = useLocation();
    const { subscription } = useAuth();
    const plan = (subscription?.plan || 'free').toLowerCase();
    const isFree = plan === 'free';

    const brandLinks = [
        { path: '/dashboard/brand', icon: Home, label: 'Home', exact: true },
        { path: '/dashboard/brand/influencers', icon: Users, label: 'Influencers' },
        { path: '/dashboard/brand/contests', icon: Trophy, label: 'Contests', locked: isFree },
        { path: '/dashboard/brand/messages', icon: MessageSquare, label: 'Messages' },
        { path: '/dashboard/brand/profile', icon: User, label: 'Profile' },
    ];
    const influencerLinks = [
        { path: '/dashboard/influencer', icon: Home, label: 'Home', exact: true },
        { path: '/dashboard/influencer/my-jobs', icon: Bookmark, label: 'My Jobs' },
        { path: '/dashboard/influencer/portfolio', icon: Briefcase, label: 'Portfolio' },
        { path: '/dashboard/influencer/messages', icon: MessageSquare, label: 'Messages' },
        { path: '/dashboard/influencer/profile', icon: User, label: 'Profile' },
    ];
    const links = role === 'brand' ? brandLinks : influencerLinks;
    const isActive = (link) => link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path);

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" data-testid="bottom-nav">
            <div className="flex justify-around py-2 pb-[env(safe-area-inset-bottom)] max-w-lg mx-auto">
                {links.map((link) => (
                    <Link key={link.path} to={link.path} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-0 relative ${isActive(link) ? 'text-black' : 'text-gray-400'}`}>
                        <link.icon className={`w-5 h-5 ${isActive(link) ? 'fill-current' : ''}`} />
                        <span className="text-[10px] font-semibold truncate">{link.label}</span>
                        {isActive(link) && <div className="w-4 h-0.5 bg-black rounded-full" />}
                        {link.locked && <Crown className="w-3 h-3 text-yellow-500 absolute -top-0.5 -right-0.5" />}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export const DashboardHeader = ({ user, role }) => {
    const navigate = useNavigate();
    const profilePath = role === 'brand' ? '/dashboard/brand/profile' : '/dashboard/influencer/profile';
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    async function fetchNotifications() {
        try {
            const res = await axios.get(`${API}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unread_count || 0);
        } catch {}
    }

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    

    const markAllRead = async () => {
        try {
            await axios.put(`${API}/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {}
    };

    const handleNotifClick = (notif) => {
        if (notif.link) navigate(notif.link);
        setShowDropdown(false);
        if (!notif.read) {
            axios.put(`${API}/notifications/${notif.id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const timeAgo = (date) => {
        // eslint-disable-next-line react-hooks/purity
        const diff = (Date.now() - new Date(date).getTime()) / 1000;
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 px-4 py-3 flex items-center justify-between" data-testid="dashboard-header">
            <Link to="/" className="text-lg font-bold tracking-tight">JOBFLUENCER</Link>
            <div className="flex items-center gap-3">
                <Button onClick={() => navigate('/buy-credits')} variant="outline" className="text-sm font-medium px-4 py-2 rounded-full border-gray-300" data-testid="dashboard-buy-btn">
                    Buy
                </Button>
                {role === 'brand' && (
                    <Button onClick={() => navigate('/post-job')} className="bg-black text-white hover:bg-gray-800 text-sm font-medium px-4 py-2 rounded-full gap-1.5 hidden sm:flex" data-testid="header-post-job-btn">
                        <Plus className="w-3.5 h-3.5" /> Post a Job
                    </Button>
                )}

                {/* Notification Bell */}
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setShowDropdown(!showDropdown)} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" data-testid="notifications-bell">
                        <Bell className="w-5 h-5 text-gray-700" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" data-testid="unread-count">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] max-h-[400px] overflow-hidden" data-testid="notifications-dropdown">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <h4 className="text-sm font-bold">Notifications</h4>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-black flex items-center gap-1" data-testid="mark-all-read">
                                        <Check className="w-3 h-3" /> Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="overflow-y-auto max-h-[340px]">
                                {notifications.length > 0 ? notifications.slice(0, 20).map(notif => (
                                    <button key={notif.id} onClick={() => handleNotifClick(notif)}
                                        className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                                        data-testid={`notification-${notif.id}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{notif.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                                                <p className="text-[10px] text-gray-300 mt-1">{timeAgo(notif.created_at)}</p>
                                            </div>
                                        </div>
                                    </button>
                                )) : (
                                    <div className="px-4 py-8 text-center">
                                        <Bell className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400">No notifications yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={() => navigate(profilePath)} className="w-9 h-9 bg-black rounded-full flex items-center justify-center" data-testid="header-profile-btn">
                    <span className="text-xs font-bold text-white">{user?.name?.charAt(0) || '?'}</span>
                </button>
            </div>
        </header>
    );
};
