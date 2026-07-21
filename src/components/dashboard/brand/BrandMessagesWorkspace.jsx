'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, MessageSquareText, Search, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/legacy_pages/dashboard/shared';
import styles from './BrandWorkspace.module.css';

const AVATAR_COLORS = ['#d83f87', '#176b5a', '#b06a16', '#4d5ea9', '#63514f', '#24778a'];

function unwrapList(payload, key) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.[key]) ? payload[key] : [];
}

function partnerId(partner) {
  return String(partner?.id || partner?.user_id || '');
}

function getAvatarColor(name) {
  const code = Array.from(name || '?').reduce((total, character) => total + character.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function formatClock(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatConversationTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return formatClock(value);
  const days = Math.floor((today.getTime() - date.getTime()) / 86_400_000);
  if (days < 7) return date.toLocaleDateString('en-IN', { weekday: 'short' });
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function BrandMessagesWorkspace() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const requestedPartnerId = searchParams.get('to');
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [requestHandled, setRequestHandled] = useState(false);
  const messagesEndRef = useRef(null);

  const headers = useMemo(() => token ? { Authorization: `Bearer ${token}` } : undefined, [token]);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/messages/conversations`, { headers });
      setConversations(unwrapList(response.data, 'conversations').filter((conversation) => conversation?.partner));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  const fetchPartner = useCallback(async (id) => {
    try {
      const response = await axios.get(`${API}/creators/${id}`, { headers });
      const data = response.data?.creator || response.data;
      return {
        id,
        name: data.display_name || data.name || 'Creator',
        role: 'creator',
        profile_image_url: data.profile_image_url,
      };
    } catch {
      try {
        const response = await axios.get(`${API}/brands/${id}`, { headers });
        const data = response.data?.brand || response.data;
        return { id, name: data.company_name || data.name || 'Brand', role: 'brand', logo_url: data.logo_url };
      } catch (error) {
        console.error('Error fetching message partner:', error);
        return null;
      }
    }
  }, [headers]);

  const fetchMessages = useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await axios.get(`${API}/messages/${id}`, { headers });
      setMessages(unwrapList(response.data, 'messages'));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [headers]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!requestedPartnerId || requestHandled || loading) return;
    const matchingConversation = conversations.find((conversation) => partnerId(conversation.partner) === String(requestedPartnerId));
    if (matchingConversation) {
      setSelectedPartner(matchingConversation.partner);
      setRequestHandled(true);
      return;
    }

    let active = true;
    fetchPartner(requestedPartnerId).then((partner) => {
      if (active && partner) setSelectedPartner(partner);
      if (active) setRequestHandled(true);
    });
    return () => { active = false; };
  }, [conversations, fetchPartner, loading, requestHandled, requestedPartnerId]);

  useEffect(() => {
    const id = partnerId(selectedPartner);
    if (!id) {
      setMessages([]);
      return undefined;
    }
    fetchMessages(id);
    const interval = window.setInterval(() => fetchMessages(id), 8000);
    return () => window.clearInterval(interval);
  }, [fetchMessages, selectedPartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const visibleConversations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((conversation) => {
      const partner = conversation.partner || {};
      const copy = `${partner.name || partner.display_name || ''} ${conversation.last_message?.content || ''}`;
      return copy.toLowerCase().includes(needle);
    });
  }, [conversations, query]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const id = partnerId(selectedPartner);
    const content = draft.trim();
    if (!id || !content || sending) return;

    setSending(true);
    try {
      await axios.post(`${API}/messages`, { receiver_id: id, content }, { headers });
      setDraft('');
      await Promise.all([fetchMessages(id), fetchConversations()]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (partner) => {
    setSelectedPartner(partner);
    setMessages([]);
  };

  return (
    <div className={styles.page} data-testid="brand-messages-workspace">
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <div className={styles.kicker}>Conversation desk</div>
          <h1 className={styles.title}>Keep the work moving.</h1>
          <p className={styles.lead}>Campaign conversations, creator details, and the next decision in one quiet workspace.</p>
        </div>
      </header>

      <section className={styles.messageShell} aria-label="Messages">
        <aside className={`${styles.conversationPane} ${selectedPartner ? styles.mobileHidden : ''}`}>
          <div className={styles.conversationPaneHeader}>
            <h2>Active threads</h2>
            <p>{conversations.length} conversations in your desk</p>
            <label className={styles.conversationSearch}>
              <Search />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
              />
            </label>
          </div>

          {loading ? (
            <div className={styles.conversationEmpty}><div className={styles.spinner} aria-label="Loading conversations" /></div>
          ) : visibleConversations.length === 0 ? (
            <div className={styles.conversationEmpty}>
              <div>
                <p>{query ? 'No thread matches that search.' : 'No conversations yet. Start from the creator index.'}</p>
              </div>
            </div>
          ) : (
            <div className={styles.conversationList}>
              {visibleConversations.map((conversation) => {
                const partner = conversation.partner;
                const id = partnerId(partner);
                const name = partner.name || partner.display_name || 'Creator';
                const active = partnerId(selectedPartner) === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => selectConversation(partner)}
                    className={`${styles.conversationItem} ${active ? styles.conversationActive : ''}`}
                    data-testid={`conversation-${id}`}
                  >
                    <span className={styles.avatar} style={{ '--avatar': getAvatarColor(name) }}>{name.charAt(0).toUpperCase()}</span>
                    <span className={styles.conversationCopy}>
                      <span className={styles.conversationNameRow}>
                        <span className={styles.conversationName}>{name}</span>
                        <time className={styles.conversationTime}>{formatConversationTime(conversation.last_message?.created_at)}</time>
                      </span>
                      <span className={styles.conversationPreview}>{conversation.last_message?.content || 'Conversation ready'}</span>
                    </span>
                    {Number(conversation.unread_count || 0) > 0 && <span className={styles.unread}>{conversation.unread_count}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div className={`${styles.threadPane} ${!selectedPartner ? styles.mobileHidden : ''}`}>
          {selectedPartner ? (
            <>
              <header className={styles.threadHeader}>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.mobileBack}`}
                  onClick={() => setSelectedPartner(null)}
                  aria-label="Back to conversations"
                  data-testid="back-to-conversations"
                >
                  <ArrowLeft />
                </button>
                <span
                  className={styles.avatar}
                  style={{ '--avatar': getAvatarColor(selectedPartner.name || selectedPartner.display_name) }}
                >
                  {(selectedPartner.name || selectedPartner.display_name || '?').charAt(0).toUpperCase()}
                </span>
                <div className={styles.threadHeaderCopy}>
                  <strong>{selectedPartner.name || selectedPartner.display_name || 'Creator'}</strong>
                  <span>{selectedPartner.role || 'creator'} conversation</span>
                </div>
              </header>

              <div className={styles.threadBody}>
                {messages.length === 0 ? (
                  <div className={styles.threadEmpty}>
                    <div>
                      <div className={styles.threadEmptyMark}><MessageSquareText /></div>
                      <h2>Start with a clear hello.</h2>
                      <p>Share the brief, confirm the fit, or pick up the next campaign detail.</p>
                    </div>
                  </div>
                ) : messages.map((message, index) => {
                  const previous = messages[index - 1];
                  const showDay = !previous || formatDay(previous.created_at) !== formatDay(message.created_at);
                  const sent = String(message.sender_id) === String(user?.id);
                  return (
                    <div key={message.id || `${message.created_at}-${index}`}>
                      {showDay && <div className={styles.dateDivider}>{formatDay(message.created_at)}</div>}
                      <div className={`${styles.bubbleRow} ${sent ? styles.bubbleRowSent : ''}`}>
                        <div className={styles.bubble}>
                          <p>{message.content}</p>
                          <time>{formatClock(message.created_at)}</time>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form className={styles.compose} onSubmit={sendMessage}>
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message"
                  aria-label="Message"
                  data-testid="message-input"
                />
                <button
                  type="submit"
                  className={styles.sendButton}
                  disabled={!draft.trim() || sending}
                  aria-label="Send message"
                  data-testid="send-message-btn"
                >
                  <Send />
                </button>
              </form>
            </>
          ) : (
            <div className={styles.threadEmpty}>
              <div>
                <div className={styles.threadEmptyMark}><MessageSquareText /></div>
                <h2>Your conversation desk</h2>
                <p>Select a thread to read the context and move the collaboration forward.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
