import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare, X, Send, Bot, User, Sparkles, Copy, Check,
  Minimize2, Maximize2, RefreshCw, ArrowUpRight, ShieldAlert,
  Flame, Database, Cpu, Terminal, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import chatService from '../../services/chatService';
import ForeSafeLogo from '../common/ForeSafeLogo';

// Custom lightweight Markdown & Code block renderer
const MarkdownMessage = ({ content, onActionClick }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks ```lang ... ```
  const parts = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let codeIdx = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      code: match[2].trim(),
      index: codeIdx++,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  // Helper to render text with tables, headers, and lists
  const renderFormattedText = (textBlock) => {
    const lines = textBlock.split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(2); // Skip separator row
        elements.push(
          <div key={`table-${elements.length}`} style={{ overflowX: 'auto', margin: '10px 0' }}>
            <table style={{
              width: '100%',
              fontSize: '0.8rem',
              borderCollapse: 'collapse',
              background: 'rgba(5, 13, 24, 0.6)',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 245, 212, 0.15)'
            }}>
              <thead>
                <tr style={{ background: 'rgba(0, 245, 212, 0.1)', color: '#00f5d4', textAlign: 'left' }}>
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx} style={{ padding: '6px 10px', borderBottom: '1px solid rgba(0, 245, 212, 0.2)' }}>
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '6px 10px', color: 'var(--text-main)' }}>
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, lIdx) => {
      const trimmed = line.trim();

      // Table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        const cells = trimmed.split('|').slice(1, -1);
        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable();
      }

      if (!trimmed) {
        elements.push(<div key={`br-${lIdx}`} style={{ height: '6px' }} />);
        return;
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={lIdx} style={{
            fontSize: '0.98rem',
            color: '#00f5d4',
            margin: '10px 0 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700
          }}>
            {trimmed.replace('### ', '')}
          </h4>
        );
        return;
      }

      // Heading 4
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h5 key={lIdx} style={{
            fontSize: '0.88rem',
            color: '#38bdf8',
            margin: '8px 0 4px',
            fontWeight: 600
          }}>
            {trimmed.replace('#### ', '')}
          </h5>
        );
        return;
      }

      // Bullet item
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.substring(2);
        elements.push(
          <div key={lIdx} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            fontSize: '0.84rem',
            margin: '3px 0',
            lineHeight: 1.45,
            color: 'var(--text-main)'
          }}>
            <span style={{ color: '#00f5d4', marginTop: '2px' }}>•</span>
            <div>{renderInlineFormats(itemText)}</div>
          </div>
        );
        return;
      }

      // Numbered list item
      if (/^\d+\.\s/.test(trimmed)) {
        const num = trimmed.match(/^\d+/)[0];
        const itemText = trimmed.replace(/^\d+\.\s/, '');
        elements.push(
          <div key={lIdx} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            fontSize: '0.84rem',
            margin: '4px 0',
            lineHeight: 1.45,
            color: 'var(--text-main)'
          }}>
            <span style={{
              fontWeight: 700,
              color: '#38bdf8',
              minWidth: '16px',
              fontSize: '0.78rem',
            }}>{num}.</span>
            <div>{renderInlineFormats(itemText)}</div>
          </div>
        );
        return;
      }

      // Regular Paragraph
      elements.push(
        <p key={lIdx} style={{
          fontSize: '0.84rem',
          margin: '4px 0',
          lineHeight: 1.45,
          color: 'var(--text-main)'
        }}>
          {renderInlineFormats(line)}
        </p>
      );
    });

    if (inTable) {
      flushTable();
    }

    return elements;
  };

  // Formats bold, backticks, badges inline
  const renderInlineFormats = (str) => {
    const tokens = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return tokens.map((tok, i) => {
      if (tok.startsWith('**') && tok.endsWith('**')) {
        return <strong key={i} style={{ color: '#ffffff', fontWeight: 600 }}>{tok.slice(2, -2)}</strong>;
      }
      if (tok.startsWith('`') && tok.endsWith('`')) {
        return (
          <code key={i} style={{
            background: 'rgba(0, 245, 212, 0.12)',
            color: '#00f5d4',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)'
          }}>
            {tok.slice(1, -1)}
          </code>
        );
      }
      return tok;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {parts.map((part, pIdx) => {
        if (part.type === 'text') {
          return <div key={pIdx}>{renderFormattedText(part.content)}</div>;
        }

        if (part.type === 'code') {
          const isCopied = copiedIndex === part.index;
          return (
            <div
              key={pIdx}
              style={{
                margin: '8px 0',
                borderRadius: '8px',
                background: '#040b14',
                border: '1px solid rgba(0, 245, 212, 0.2)',
                overflow: 'hidden',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 10px',
                background: 'rgba(8, 20, 38, 0.95)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.72rem',
                color: 'var(--text-dim)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={12} color="#00f5d4" />
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: '#00f5d4', fontWeight: 600 }}>
                    {part.language}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(part.code, part.index)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isCopied ? '#10b981' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {isCopied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre style={{
                padding: '10px 12px',
                margin: 0,
                fontSize: '0.76rem',
                fontFamily: 'var(--font-mono)',
                color: '#e2e8f0',
                overflowX: 'auto',
                lineHeight: 1.45,
                background: '#030811',
              }}>
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `### 🤖 ForeSafe AI Reliability Copilot\nI am your autonomous software quality & risk intelligence assistant.\n\nAsk me anything about defect hotspots, refactoring McCabe complexity $v(g)$, Halstead cognitive effort, CI/CD quality gates, or testing strategies!`,
      suggested_prompts: [
        'Open the Developer Decision Matrix',
        'What are the critical hotspots in this dataset?',
        'How do I refactor McCabe cyclomatic complexity > 10?',
        'Generate a CI/CD quality gate for this codebase',
        'What is our estimated technical debt?'
      ],
      action_type: null,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve active dataset context from session storage if available
  const getActiveContext = () => {
    try {
      const cached = sessionStorage.getItem('current_analysis');
      if (cached) {
        const parsed = JSON.parse(cached);
        const topHotspots = (parsed.predictions || [])
          .filter((p) => p.risk_level === 'Critical' || p.risk_level === 'High')
          .slice(0, 5)
          .map((p) => ({
            module_name: p.module_name,
            final_risk_score: p.final_risk_score,
            risk_level: p.risk_level,
            primary_cause: p.primary_cause || 'McCabe complexity',
          }));

        return {
          dataset_name: parsed.filename || 'Uploaded Dataset',
          total_modules: parsed.total_modules || (parsed.predictions ? parsed.predictions.length : 0),
          risk_distribution: parsed.risk_distribution || {},
          top_hotspots: topHotspots,
          model_comparison: parsed.model_comparison || {},
        };
      }
    } catch (e) {
      console.warn('Failed to retrieve active dataset context for chat:', e);
    }
    return null;
  };

  const activeContext = getActiveContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, messages]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query || !query.trim() || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const context = getActiveContext();
      const response = await chatService.sendMessage(query.trim(), messages, context);

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.response,
        action_type: response.action_type,
        suggested_prompts: response.suggested_prompts || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (error) {
      const errorMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ **Error processing request**: ${error.response?.data?.detail || 'Unable to connect to ForeSafe AI intelligence engine. Please verify the backend is running.'}`,
        suggested_prompts: ['Try again', 'What is McCabe Cyclomatic Complexity?'],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: `### 🤖 Conversation Reset\nHow can I help you analyze software risk and refactor code today?`,
        suggested_prompts: [
          'Open the Developer Decision Matrix',
          'What are the critical hotspots in this dataset?',
          'How do I refactor McCabe cyclomatic complexity > 10?',
          'Generate a CI/CD quality gate for this codebase'
        ],
        timestamp: new Date(),
      }
    ]);
  };

  const handleActionClick = (actionType) => {
    if (actionType === 'view_decision_matrix' || actionType === 'view_recommendations') {
      navigate('/decisions');
    } else if (actionType === 'view_hotspots' || actionType === 'view_metrics' || actionType === 'view_models' || actionType === 'view_testing') {
      navigate('/results');
    } else if (actionType === 'upload_prompt') {
      navigate('/upload');
    } else if (actionType === 'download_ci_gate') {
      navigate('/decisions');
    }
  };

  return (
    <>
      {/* Floating Launcher Action Button */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open ForeSafe AI Copilot"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 18px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #00f5d4 0%, #00b4d8 100%)',
              color: '#050d18',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0, 245, 212, 0.4), 0 0 20px rgba(0, 245, 212, 0.25)',
              transition: 'all var(--transition-normal)',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 245, 212, 0.55), 0 0 30px rgba(0, 245, 212, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 245, 212, 0.4), 0 0 20px rgba(0, 245, 212, 0.25)';
            }}
          >
            <ForeSafeLogo size={22} withText={false} />
            <span>ForeSafe Copilot</span>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef476f',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-dark)',
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div
          className="glass-card animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: isMinimized ? '320px' : '420px',
            height: isMinimized ? '60px' : '620px',
            maxHeight: 'calc(100vh - 48px)',
            maxWidth: 'calc(100vw - 32px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(6, 15, 29, 0.94)',
            border: '1px solid rgba(0, 245, 212, 0.35)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 245, 212, 0.2)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'linear-gradient(90deg, rgba(8, 24, 46, 0.95) 0%, rgba(5, 14, 28, 0.95) 100%)',
            borderBottom: isMinimized ? 'none' : '1px solid rgba(0, 245, 212, 0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ForeSafeLogo size={30} withText={false} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '0.92rem', margin: 0, color: '#ffffff' }}>ForeSafe Copilot</h4>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#00f5d4',
                    boxShadow: '0 0 8px #00f5d4'
                  }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {activeContext ? `Context: ${activeContext.dataset_name}` : 'Ready to diagnose'}
                </div>
              </div>
            </div>

            {/* Header controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {!isMinimized && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#00f5d4')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                >
                  <RefreshCw size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#00f5d4')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef476f')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          {!isMinimized && activeContext && (
            <div style={{
              padding: '6px 14px',
              background: 'rgba(0, 245, 212, 0.06)',
              borderBottom: '1px solid rgba(0, 245, 212, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.73rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                <Database size={12} />
                <span>Active: <b>{activeContext.dataset_name}</b> ({activeContext.total_modules} modules)</span>
              </div>
              <span className="badge badge-low" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                Synced
              </span>
            </div>
          )}

          {/* Body: Messages Stream */}
          {!isMinimized && (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isBot ? 'flex-start' : 'flex-end',
                      maxWidth: '100%',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      maxWidth: '92%',
                      flexDirection: isBot ? 'row' : 'row-reverse',
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isBot ? 'rgba(0, 245, 212, 0.15)' : 'rgba(56, 189, 248, 0.2)',
                        border: isBot ? '1px solid rgba(0, 245, 212, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}>
                        {isBot ? <Bot size={14} color="#00f5d4" /> : <User size={14} color="#38bdf8" />}
                      </div>

                      {/* Bubble */}
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                        background: isBot ? 'rgba(11, 27, 48, 0.9)' : 'linear-gradient(135deg, rgba(0, 245, 212, 0.22) 0%, rgba(56, 189, 248, 0.18) 100%)',
                        border: isBot ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 245, 212, 0.35)',
                        color: 'var(--text-main)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                        fontSize: '0.85rem',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}>
                        {isBot ? (
                          <MarkdownMessage
                            content={msg.text}
                            onActionClick={handleActionClick}
                          />
                        ) : (
                          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                        )}

                        {/* Action Link Button if provided */}
                        {isBot && msg.action_type && (
                          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <button
                              type="button"
                              onClick={() => handleActionClick(msg.action_type)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                background: 'rgba(0, 245, 212, 0.15)',
                                border: '1px solid rgba(0, 245, 212, 0.4)',
                                color: '#00f5d4',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 245, 212, 0.25)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 245, 212, 0.15)';
                              }}
                            >
                              <span>
                                {msg.action_type === 'view_decision_matrix' ? 'Open Decision Matrix' :
                                  msg.action_type === 'view_hotspots' ? 'View Critical Hotspots' :
                                  msg.action_type === 'download_ci_gate' ? 'Configure CI/CD Gate' :
                                  msg.action_type === 'upload_prompt' ? 'Go to Upload' : 'View Details'}
                              </span>
                              <ArrowUpRight size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Suggested follow-up prompt chips for the latest bot message */}
                    {isBot && msg.suggested_prompts && msg.suggested_prompts.length > 0 && msg.id === messages[messages.length - 1]?.id && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginTop: '8px',
                        marginLeft: '34px',
                      }}>
                        {msg.suggested_prompts.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleSendMessage(prompt)}
                            style={{
                              background: 'rgba(8, 20, 38, 0.85)',
                              border: '1px solid rgba(0, 245, 212, 0.25)',
                              borderRadius: 'var(--radius-full)',
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all var(--transition-fast)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#00f5d4';
                              e.currentTarget.style.color = '#00f5d4';
                              e.currentTarget.style.background = 'rgba(0, 245, 212, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(0, 245, 212, 0.25)';
                              e.currentTarget.style.color = 'var(--text-muted)';
                              e.currentTarget.style.background = 'rgba(8, 20, 38, 0.85)';
                            }}
                          >
                            <Sparkles size={10} color="#00f5d4" />
                            <span>{prompt}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(0, 245, 212, 0.15)',
                    border: '1px solid rgba(0, 245, 212, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Bot size={14} color="#00f5d4" />
                  </div>
                  <div style={{
                    padding: '8px 14px',
                    borderRadius: '4px 14px 14px 14px',
                    background: 'rgba(11, 27, 48, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f5d4', animation: 'pulse 1.2s infinite ease-in-out' }} />
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', animation: 'pulse 1.2s infinite ease-in-out 0.2s' }} />
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', animation: 'pulse 1.2s infinite ease-in-out 0.4s' }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginLeft: '4px' }}>ForeSafe AI analyzing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Footer Input Bar */}
          {!isMinimized && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(5, 13, 24, 0.98)',
              borderTop: '1px solid rgba(0, 245, 212, 0.18)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(8, 20, 38, 0.9)',
                border: '1px solid rgba(0, 245, 212, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 10px',
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about hotspots, McCabe refactoring, CI/CD gates..."
                  rows={1}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontFamily: 'var(--font-sans)',
                    resize: 'none',
                    outline: 'none',
                    maxHeight: '80px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isTyping}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: input.trim() && !isTyping ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                    color: input.trim() && !isTyping ? '#050d18' : 'var(--text-dim)',
                    border: 'none',
                    cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.66rem',
                color: 'var(--text-dim)',
                marginTop: '4px',
                padding: '0 4px',
              }}>
                <span>Press <b>Enter</b> to send</span>
                <span>Powered by ForeSafe Multi-Agent AI</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
