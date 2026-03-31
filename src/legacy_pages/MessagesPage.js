'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import axios from 'axios';
import { Send, ArrowLeft } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MessagesPage = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const initialPartnerId = searchParams.get('to');

    const [conversations, setConversations] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => { fetchConversations(); }, []);

    useEffect(() => {
        if (initialPartnerId && conversations.length > 0) {
            const partner = conversations.find(c => c.partner.id === initialPartnerId);
            if (partner) setSelectedPartner(partner.partner);
            else fetchPartnerInfo(initialPartnerId);
        }
    }, [initialPartnerId, conversations]);

    useEffect(() => {
        if (selectedPartner) {
            fetchMessages(selectedPartner.id);
            const interval = setInterval(() => fetchMessages(selectedPartner.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedPartner]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    const fetchConversations = async () => {
        try {
            const response = await axios.get(`${API}/messages/conversations`);
            const data = response.data;
            const list = Array.isArray(data) ? data : (data?.conversations ?? []);
            setConversations(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally { setLoading(false); }
    };

    const fetchPartnerInfo = async (partnerId) => {
        try {
            const response = await axios.get(`${API}/creators/${partnerId}`);
            setSelectedPartner({ id: partnerId, name: response.data.display_name, role: 'creator' });
        } catch (error) {
            try {
                const brandResponse = await axios.get(`${API}/brands/${partnerId}`);
                setSelectedPartner({ id: partnerId, name: brandResponse.data.company_name, role: 'brand' });
            } catch (err) { console.error('Error fetching partner info:', err); }
        }
    };

    const fetchMessages = async (partnerId) => {
        try {
            const response = await axios.get(`${API}/messages/${partnerId}`);
            const data = response.data;
            const list = Array.isArray(data) ? data : (data?.messages ?? []);
            setMessages(Array.isArray(list) ? list : []);
        } catch (error) { console.error('Error fetching messages:', error); }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedPartner) return;
        setSending(true);
        try {
            await axios.post(`${API}/messages`, { receiver_id: selectedPartner.id, content: newMessage });
            setNewMessage('');
            fetchMessages(selectedPartner.id);
            fetchConversations();
        } catch (error) { console.error('Error sending message:', error); }
        finally { setSending(false); }
    };

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatConvDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) return formatTime(dateStr);
        const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Colors for avatars
    const avatarColors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
    const getAvatarColor = (name) => avatarColors[Math.abs((name || '').charCodeAt(0)) % avatarColors.length];

    // Chat View
    const ChatView = () => (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => setSelectedPartner(null)} className="md:hidden p-1" data-testid="back-to-conversations">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className={`w-10 h-10 rounded-full ${getAvatarColor(selectedPartner.name)} flex items-center justify-center flex-shrink-0`}>
                    <span className="font-bold text-white text-sm">{selectedPartner.name?.charAt(0) || '?'}</span>
                </div>
                <div>
                    <p className="font-bold text-sm">{selectedPartner.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{selectedPartner.role}</p>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {messages.map((msg, index) => {
                        const showDate = index === 0 || formatDate(msg.created_at) !== formatDate(messages[index - 1].created_at);
                        const isSent = msg.sender_id === user.id;
                        return (
                            <div key={msg.id}>
                                {showDate && (
                                    <div className="text-center my-4">
                                        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{formatDate(msg.created_at)}</span>
                                    </div>
                                )}
                                <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${isSent ? 'bg-black text-white rounded-br-sm' : 'bg-gray-100 text-black rounded-bl-sm'}`}>
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${isSent ? 'text-gray-400' : 'text-gray-500'}`}>{formatTime(msg.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-gray-100">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border-gray-200"
                        data-testid="message-input"
                    />
                    <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="bg-black text-white hover:bg-gray-800 rounded-full w-10 h-10 p-0" data-testid="send-message-btn">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    // Conversation List
    const ConversationList = () => (
        <div className="flex flex-col h-full">
            <div className="mb-4 md:mb-0 md:p-0">
                <h1 className="text-2xl font-bold mb-1">Messages</h1>
                <p className="text-sm text-gray-500">Chat with brands and creators</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>
            ) : conversations.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">No conversations yet</p>
                </div>
            ) : (
                <div className="mt-4 md:mt-0">
                    {conversations.map((conv) => (
                        <button
                            key={conv.partner.id}
                            onClick={() => setSelectedPartner(conv.partner)}
                            className={`w-full flex items-center gap-3 px-2 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left ${selectedPartner?.id === conv.partner.id ? 'bg-gray-50' : ''}`}
                            data-testid={`conversation-${conv.partner.id}`}
                        >
                            <div className={`w-12 h-12 rounded-full ${getAvatarColor(conv.partner.name)} flex items-center justify-center flex-shrink-0`}>
                                <span className="font-bold text-white">{conv.partner.name?.charAt(0) || '?'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className="font-semibold text-sm truncate">{conv.partner.name}</p>
                                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatConvDate(conv.last_message?.created_at)}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{conv.last_message?.content || 'No messages'}</p>
                            </div>
                            {conv.unread_count > 0 && (
                                <span className="w-5 h-5 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                                    {conv.unread_count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
            {/* Mobile: show either list or chat */}
            <div className="md:hidden h-full">
                {selectedPartner ? <ChatView /> : <ConversationList />}
            </div>

            {/* Desktop: split panel */}
            <div className="hidden md:flex h-full border border-gray-200 rounded-xl overflow-hidden">
                <div className="w-80 border-r border-gray-100 overflow-y-auto p-4">
                    <ConversationList />
                </div>
                <div className="flex-1">
                    {selectedPartner ? <ChatView /> : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
