import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
 MessageCircle,
 Send,
 Bot,
 User,
 Sparkles,
 Minimize2,
 Trash2,
 ChevronRight,
 ShieldCheck,
 WandSparkles,
 Headphones,
} from "lucide-react";
import { askAssistant } from "../services/aiService";

/* ─── Quick-action chips (shown at start) ────────────── */
const QUICK_ACTIONS = [
 { label: "Health Plans", message: "Tell me about health insurance" },
 { label: "Motor Cover", message: "Tell me about car insurance" },
 { label: "Life Cover", message: "Tell me about life insurance" },
 { label: "Claims Help", message: "How to file a claim?" },
 { label: "Compare Plans", message: "How to compare policies?" },
 { label: "Premium Guide", message: "How are premiums calculated?" },
];

/* ─── Typing indicator ───────────────────────────────── */
function TypingIndicator() {
 return (
 <div className="cb-msg cb-msg--bot">
 <div className="cb-avatar cb-avatar--bot">
 <Bot size={14} />
 </div>
 <div className="cb-bubble cb-bubble--bot">
 <div className="cb-typing">
 <span />
 <span />
 <span />
 </div>
 </div>
 </div>
 );
}

/* ─── Format markdown-lite text: **bold**, \n, bullet ── */
function FormattedText({ text }) {
 const lines = text.split("\n");

 return (
 <>
 {lines.map((line, i) => {
 // Blank line → spacer
 if (!line.trim()) return <div key={i} className="cb-spacer" />;

 // Table row — render as styled table snippet
 if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
 const cells = line
 .split("|")
 .filter(Boolean)
 .map((c) => c.trim());
 // Skip separator rows (e.g. |---|---|)
 if (cells.every((c) => /^[-:]+$/.test(c))) return null;
 const isHeader = lines[i + 1]?.trim().replace(/[|\-: ]/g, "") === "";
 return (
 <div
 key={i}
 className={`cb-table-row ${isHeader ? "cb-table-header" : ""}`}
 >
 {cells.map((cell, ci) => (
 <span key={ci} className="cb-table-cell">
 <InlineFormat text={cell} />
 </span>
 ))}
 </div>
 );
 }

 // Bullet point
 if (line.trim().startsWith("•") || line.trim().startsWith("- ")) {
 const content = line.trim().replace(/^[•-]\s*/, "");
 return (
 <div key={i} className="cb-bullet">
 <span className="cb-bullet-dot">•</span>
 <span>
 <InlineFormat text={content} />
 </span>
 </div>
 );
 }

 // Numbered list
 const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
 if (numMatch) {
 return (
 <div key={i} className="cb-bullet">
 <span className="cb-bullet-num">{numMatch[1]}.</span>
 <span>
 <InlineFormat text={numMatch[2]} />
 </span>
 </div>
 );
 }

 // Regular paragraph
 return (
 <p key={i} className="cb-para">
 <InlineFormat text={line} />
 </p>
 );
 })}
 </>
 );
}

/* ─── Inline: bold, emoji ────────────────────────────── */
function InlineFormat({ text }) {
 // Split by **bold** markers
 const parts = text.split(/(\*\*[^*]+\*\*)/g);
 return (
 <>
 {parts.map((part, i) => {
 if (part.startsWith("**") && part.endsWith("**")) {
 return (
 <strong key={i} className="cb-bold">
 {part.slice(2, -2)}
 </strong>
 );
 }
 return <span key={i}>{part}</span>;
 })}
 </>
 );
}

/* ─── Suggested questions chips ──────────────────────── */
function SuggestedChips({ questions, onSelect }) {
 if (!questions?.length) return null;
 return (
 <div className="cb-suggestions">
 {questions.map((q, i) => (
 <button
 key={i}
 type="button"
 className="cb-suggestion-chip"
 onClick={() => onSelect(q)}
 >
 {q}
 <ChevronRight size={12} />
 </button>
 ))}
 </div>
 );
}

function WelcomePanel({ onSelect }) {
 return (
 <div className="cb-welcome">
 <div className="cb-welcome-badge">
 <WandSparkles size={14} />
 <span>Smart insurance guidance</span>
 </div>
 <h3 className="cb-welcome-title">Ask clearer questions. Get practical policy answers.</h3>
 <p className="cb-welcome-text">
 I can help with coverage options, policy comparisons, premium basics, and claim guidance in a fast, professional format.
 </p>

 <div className="cb-welcome-highlights">
 <div className="cb-highlight-card">
 <ShieldCheck size={15} />
 <span>Coverage explained simply</span>
 </div>
 <div className="cb-highlight-card">
 <Sparkles size={15} />
 <span>Tailored recommendations</span>
 </div>
 <div className="cb-highlight-card">
 <Headphones size={15} />
 <span>Claims and support guidance</span>
 </div>
 </div>

 <div className="cb-quick-actions">
 <p className="cb-quick-label">Start with</p>
 <div className="cb-quick-grid">
 {QUICK_ACTIONS.map((action, i) => (
 <button
 key={i}
 type="button"
 className="cb-quick-chip"
 onClick={() => onSelect(action.message)}
 >
 {action.label}
 </button>
 ))}
 </div>
 </div>
 </div>
 );
}

/* ─── Policy recommendation card ─────────────────────── */
function PolicyCard({ policy }) {
 return (
 <div className="cb-policy-card">
 <div className="cb-policy-header">
 <span className="cb-policy-name">{policy.name}</span>
 <span className="cb-policy-badge">{policy.category}</span>
 </div>
 <div className="cb-policy-company">{policy.company}</div>
 <div className="cb-policy-stats">
 <span>₹{policy.price?.toLocaleString("en-IN")}/yr</span>
 <span className="cb-policy-divider">•</span>
 <span>Cover: ₹{policy.coverage?.toLocaleString("en-IN")}</span>
 </div>
 {policy.ratingAverage > 0 && (
 <div className="cb-policy-rating">
 {"★".repeat(Math.round(policy.ratingAverage))}
 {"☆".repeat(5 - Math.round(policy.ratingAverage))}{" "}
 <span>{policy.ratingAverage}</span>
 </div>
 )}
 </div>
 );
}

/* ═══════════════════════════════════════════════════════ */
export default function Chatbot() {
 const location = useLocation();
 const [open, setOpen] = useState(false);
 const [input, setInput] = useState("");
 const [loading, setLoading] = useState(false);
 const [messages, setMessages] = useState([
 {
 role: "bot",
 text: "Hi! 👋 I'm your **InsureAI Assistant**. I can help you with insurance policies, premiums, claims, and more.\n\nWhat would you like to know?",
 suggestedQuestions: [
 "What types of insurance are available?",
 "I need health insurance",
 "How to file a claim?",
 ],
 },
 ]);
 const [showQuickActions, setShowQuickActions] = useState(true);
 const messagesEndRef = useRef(null);
 const inputRef = useRef(null);
 const previousPathRef = useRef(location.pathname);

 /* Auto-scroll & focus */
 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages, loading]);

 useEffect(() => {
 if (open) setTimeout(() => inputRef.current?.focus(), 300);
 }, [open]);

 useEffect(() => {
 if (previousPathRef.current !== location.pathname) {
 setOpen(false);
 previousPathRef.current = location.pathname;
 }
 }, [location.pathname]);

 /* Send message */
 const onSend = useCallback(
 async (overrideText) => {
 const text = (overrideText || input).trim();
 if (!text || loading) return;

 setShowQuickActions(false);
 setMessages((prev) => [...prev, { role: "user", text }]);
 setInput("");
 setLoading(true);

 try {
 // Build history from recent messages
 const history = messages.slice(-6).map((m) => ({
 role: m.role === "bot" ? "assistant" : "user",
 content: m.text,
 }));

 const response = await askAssistant({ message: text, history });
 setMessages((prev) => [
 ...prev,
 {
 role: "bot",
 text: response.reply,
 recommendations: response.recommendations || [],
 suggestedQuestions: response.suggestedQuestions || [],
 },
 ]);
 } catch {
 setMessages((prev) => [
 ...prev,
 {
 role: "bot",
 text: "Sorry, I couldn't process that right now. Please try again later.",
 suggestedQuestions: [],
 },
 ]);
 } finally {
 setLoading(false);
 }
 },
 [input, loading, messages]
 );

 const handleKeyDown = (e) => {
 if (e.key === "Enter" && !e.shiftKey) {
 e.preventDefault();
 onSend();
 }
 };

 const clearChat = () => {
 setMessages([
 {
 role: "bot",
 text: "Chat cleared! 🧹 How can I help you with insurance?",
 suggestedQuestions: [
 "What types of insurance are available?",
 "I need health insurance",
 "How to file a claim?",
 ],
 },
 ]);
 setShowQuickActions(true);
 };

 return (
 <>
 {/* ── Inline Styles ── */}
 <style>{chatbotStyles}</style>

 <div className="cb-root">
 {open ? (
 <div className="cb-window">
 {/* ── Header ── */}
 <div className="cb-header">
 <div className="cb-header-left">
 <div className="cb-header-icon">
 <Sparkles size={16} />
 </div>
 <div>
 <p className="cb-header-title">InsureAI Assistant</p>
 <div className="cb-header-status">
 <span className="cb-status-dot" />
 <span>Online now</span>
 </div>
 </div>
 </div>
 <div className="cb-header-actions">
 <button
 type="button"
 onClick={clearChat}
 className="cb-header-btn"
 title="Clear chat"
 >
 <Trash2 size={14} />
 </button>
 <button
 type="button"
 onClick={() => setOpen(false)}
 className="cb-header-btn"
 title="Minimize"
 >
 <Minimize2 size={14} />
 </button>
 </div>
 </div>

 {/* ── Messages ── */}
 <div className="cb-messages">
 {showQuickActions && messages.length <= 1 && !loading && (
 <WelcomePanel onSelect={onSend} />
 )}

 {messages.map((item, idx) => (
 <div key={`msg-${idx}`}>
 <div
 className={`cb-msg ${item.role === "user" ? "cb-msg--user" : "cb-msg--bot"
 }`}
 >
 {/* Avatar */}
 <div
 className={`cb-avatar ${item.role === "user"
 ? "cb-avatar--user"
 : "cb-avatar--bot"
 }`}
 >
 {item.role === "user" ? (
 <User size={14} />
 ) : (
 <Bot size={14} />
 )}
 </div>
 {/* Bubble */}
 <div
 className={`cb-bubble ${item.role === "user"
 ? "cb-bubble--user"
 : "cb-bubble--bot"
 }`}
 >
 <FormattedText text={item.text} />
 </div>
 </div>

 {/* Policy recommendations */}
 {item.recommendations?.length > 0 && (
 <div className="cb-policies">
 {item.recommendations.map((policy, pi) => (
 <PolicyCard key={pi} policy={policy} />
 ))}
 </div>
 )}

 {/* Suggested questions */}
 {idx === messages.length - 1 &&
 item.role === "bot" &&
 !loading && (
 <SuggestedChips
 questions={item.suggestedQuestions}
 onSelect={(q) => onSend(q)}
 />
 )}
 </div>
 ))}

 {loading && <TypingIndicator />}

 <div ref={messagesEndRef} />
 </div>

 {/* ── Input ── */}
 <div className="cb-input-area">
 <div className="cb-input-wrapper">
 <textarea
 ref={inputRef}
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={handleKeyDown}
 className="cb-input"
 placeholder="Ask about plans, premiums, claims, or recommendations..."
 disabled={loading}
 rows={1}
 />
 <button
 type="button"
 onClick={() => onSend()}
 disabled={loading || !input.trim()}
 className="cb-send-btn"
 >
 <Send size={14} />
 </button>
 </div>
 <p className="cb-footer-text">
 Responses are for insurance guidance and product discovery.
 </p>
 </div>
 </div>
 ) : (
 <button
 type="button"
 onClick={() => setOpen(true)}
 className="cb-fab"
 >
 <MessageCircle size={24} />
 <span className="cb-fab-label">Need help?</span>
 <span className="cb-fab-pulse" />
 </button>
 )}
 </div>
 </>
 );
}

/* ═══════════════════════════════════════════════════════
 Component Styles (scoped via .cb- prefix)
 ═══════════════════════════════════════════════════════ */
const chatbotStyles = `
/* ── Root ── */
.cb-root {
 position: fixed;
 bottom: 20px;
 right: 20px;
 z-index: 9999;
 font-family: 'Manrope', 'Poppins', 'Segoe UI', system-ui, -apple-system, sans-serif;
}

/* ── FAB ── */
.cb-fab {
 position: relative;
 min-width: 62px;
 height: 62px;
 padding: 0 20px;
 border-radius: 999px;
 border: none;
 background:
 radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 42%),
 linear-gradient(135deg, #0f766e 0%, #0f172a 58%, #1d4ed8 100%);
 color: white;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 10px;
 cursor: pointer;
 box-shadow: 0 20px 45px rgba(15, 23, 42, 0.32), 0 8px 20px rgba(14, 165, 164, 0.22);
 transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.cb-fab:hover {
 transform: translateY(-2px) scale(1.02);
 box-shadow: 0 24px 48px rgba(15, 23, 42, 0.36), 0 12px 28px rgba(14, 165, 164, 0.22);
}
.cb-fab:active { transform: scale(0.95); }
.cb-fab-label {
 font-size: 13px;
 font-weight: 700;
 letter-spacing: 0.01em;
}

.cb-fab-pulse {
 position: absolute;
 inset: -4px;
 border-radius: 999px;
 border: 2px solid rgba(14, 165, 164, 0.28);
 animation: cb-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes cb-pulse {
 0%, 100% { opacity: 1; transform: scale(1); }
 50% { opacity: 0; transform: scale(1.3); }
}

/* ── Window ── */
.cb-window {
 width: 420px;
 height: 660px;
 border-radius: 28px;
 display: flex;
 flex-direction: column;
 overflow: hidden;
 background:
 linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%);
 border: 1px solid rgba(148, 163, 184, 0.18);
 box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22), 0 10px 28px rgba(15, 118, 110, 0.12);
 backdrop-filter: blur(18px);
 animation: cb-slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes cb-slideUp {
 from { opacity: 0; transform: translateY(20px) scale(0.95); }
 to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Header ── */
.cb-header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 padding: 18px 18px 16px;
 background:
 radial-gradient(circle at top left, rgba(45, 212, 191, 0.26), transparent 36%),
 linear-gradient(135deg, #0f172a 0%, #111827 42%, #134e4a 100%);
 position: relative;
 overflow: hidden;
}
.cb-header::before {
 content: '';
 position: absolute;
 inset: 0;
 background:
 radial-gradient(circle at 22% 35%, rgba(255,255,255,0.14) 0%, transparent 30%),
 radial-gradient(circle at 80% 20%, rgba(59,130,246,0.18) 0%, transparent 28%);
}
.cb-header-left {
 display: flex;
 align-items: center;
 gap: 10px;
 position: relative;
 z-index: 1;
}
.cb-header-icon {
 width: 42px;
 height: 42px;
 border-radius: 14px;
 background: linear-gradient(135deg, rgba(45,212,191,0.24), rgba(59,130,246,0.16));
 backdrop-filter: blur(10px);
 display: flex;
 align-items: center;
 justify-content: center;
 color: white;
 box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
}
.cb-header-title {
 margin: 0;
 font-size: 15px;
 font-weight: 800;
 letter-spacing: 0.01em;
 color: white;
}
.cb-header-status {
 display: flex;
 align-items: center;
 gap: 5px;
 font-size: 11px;
 color: rgba(226,232,240,0.78);
 margin-top: 3px;
}
.cb-status-dot {
 width: 6px;
 height: 6px;
 border-radius: 50%;
 background: #2dd4bf;
 box-shadow: 0 0 10px rgba(45, 212, 191, 0.7);
}
.cb-header-actions {
 display: flex;
 gap: 4px;
 position: relative;
 z-index: 1;
}
.cb-header-btn {
 background: rgba(255,255,255,0.08);
 border: none;
 color: rgba(255,255,255,0.82);
 width: 34px;
 height: 34px;
 border-radius: 10px;
 display: flex;
 align-items: center;
 justify-content: center;
 cursor: pointer;
 transition: all 0.2s;
 border: 1px solid rgba(255,255,255,0.08);
}
.cb-header-btn:hover {
 background: rgba(255,255,255,0.16);
 color: white;
}

/* ── Messages area ── */
.cb-messages {
 flex: 1;
 overflow-y: auto;
 padding: 18px;
 display: flex;
 flex-direction: column;
 gap: 14px;
 background:
 radial-gradient(circle at top right, rgba(45,212,191,0.08), transparent 22%),
 linear-gradient(180deg, #f8fafc 0%, #eef6f5 48%, #f8fafc 100%);
 scrollbar-width: thin;
 scrollbar-color: #cbd5e1 transparent;
}
.cb-messages::-webkit-scrollbar { width: 4px; }
.cb-messages::-webkit-scrollbar-track { background: transparent; }
.cb-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

/* ── Message layout ── */
.cb-msg {
 display: flex;
 align-items: flex-end;
 gap: 10px;
 animation: cb-msgIn 0.3s ease-out;
}
.cb-msg--user { flex-direction: row-reverse; }
@keyframes cb-msgIn {
 from { opacity: 0; transform: translateY(8px); }
 to { opacity: 1; transform: translateY(0); }
}

/* ── Avatar ── */
.cb-avatar {
 width: 34px;
 height: 34px;
 border-radius: 12px;
 display: flex;
 align-items: center;
 justify-content: center;
 flex-shrink: 0;
 color: white;
}
.cb-avatar--bot {
 background: linear-gradient(135deg, #0f766e, #1d4ed8);
 box-shadow: 0 6px 16px rgba(29,78,216,0.18);
}
.cb-avatar--user {
 background: linear-gradient(135deg, #1e293b, #475569);
 box-shadow: 0 6px 16px rgba(15,23,42,0.14);
}

/* ── Bubble ── */
.cb-bubble {
 max-width: 80%;
 padding: 13px 15px;
 font-size: 13px;
 line-height: 1.65;
 word-break: break-word;
}
.cb-bubble--bot {
 background: rgba(255,255,255,0.9);
 color: #334155;
 border-radius: 18px 18px 18px 8px;
 border: 1px solid rgba(148,163,184,0.18);
 box-shadow: 0 8px 22px rgba(15,23,42,0.05);
}
.cb-bubble--user {
 background: linear-gradient(135deg, #0f766e, #2563eb);
 color: white;
 border-radius: 18px 18px 8px 18px;
 box-shadow: 0 10px 24px rgba(37,99,235,0.22);
}

/* ── Formatted text ── */
.cb-spacer { height: 6px; }
.cb-para { margin: 2px 0; }
.cb-bold { font-weight: 800; color: #0f766e; }
.cb-bubble--user .cb-bold { color: #dbeafe; }

.cb-bullet {
 display: flex;
 gap: 6px;
 margin: 2px 0;
 align-items: flex-start;
}
.cb-bullet-dot {
 color: #0f766e;
 font-weight: 700;
 flex-shrink: 0;
 margin-top: 1px;
}
.cb-bullet-num {
 color: #0f766e;
 font-weight: 600;
 flex-shrink: 0;
 min-width: 16px;
}

/* ── Table rows ── */
.cb-table-row {
 display: flex;
 gap: 2px;
 margin: 2px 0;
 font-size: 11px;
}
.cb-table-header { font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
.cb-table-cell {
 flex: 1;
 padding: 4px 6px;
 background: #f8fafc;
 border-radius: 4px;
 overflow: hidden;
 text-overflow: ellipsis;
}
.cb-table-header .cb-table-cell { background: #ecfeff; }

/* ── Typing indicator ── */
.cb-typing {
 display: flex;
 gap: 4px;
 padding: 4px 0;
}
.cb-typing span {
 width: 6px;
 height: 6px;
 border-radius: 50%;
 background: #94a3b8;
 animation: cb-bounce 1.4s ease-in-out infinite;
}
.cb-typing span:nth-child(2) { animation-delay: 0.16s; }
.cb-typing span:nth-child(3) { animation-delay: 0.32s; }
@keyframes cb-bounce {
 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
 40% { transform: scale(1.2); opacity: 1; }
}

/* ── Quick actions ── */
.cb-quick-actions {
 padding: 2px 0 0;
}
.cb-quick-label {
 font-size: 11px;
 font-weight: 700;
 color: #64748b;
 text-transform: uppercase;
 letter-spacing: 0.08em;
 margin: 0 0 8px 0;
}
.cb-quick-grid {
 display: flex;
 flex-wrap: wrap;
 gap: 8px;
}
.cb-quick-chip {
 padding: 9px 13px;
 border-radius: 999px;
 border: 1px solid rgba(148,163,184,0.22);
 background: rgba(255,255,255,0.88);
 color: #0f172a;
 font-size: 12px;
 font-weight: 700;
 cursor: pointer;
 transition: all 0.2s;
}
.cb-quick-chip:hover {
 background: #ecfeff;
 border-color: #14b8a6;
 color: #0f766e;
 transform: translateY(-1px);
 box-shadow: 0 8px 18px rgba(20,184,166,0.12);
}

/* ── Suggested questions ── */
.cb-suggestions {
 display: flex;
 flex-wrap: wrap;
 gap: 8px;
 margin-top: 8px;
 padding-left: 44px;
 animation: cb-msgIn 0.3s ease-out;
}
.cb-suggestion-chip {
 display: flex;
 align-items: center;
 gap: 4px;
 padding: 7px 12px;
 border-radius: 999px;
 border: 1px dashed #99f6e4;
 background: #f0fdfa;
 color: #0f766e;
 font-size: 11px;
 font-weight: 700;
 cursor: pointer;
 transition: all 0.2s;
}
.cb-suggestion-chip:hover {
 background: #0f766e;
 color: white;
 border-color: #0f766e;
 transform: translateY(-1px);
}

/* ── Policy cards ── */
.cb-policies {
 display: flex;
 flex-direction: column;
 gap: 8px;
 margin-top: 8px;
 padding-left: 44px;
 animation: cb-msgIn 0.3s ease-out;
}
.cb-policy-card {
 background: rgba(255,255,255,0.92);
 border: 1px solid rgba(148,163,184,0.18);
 border-radius: 16px;
 padding: 12px 14px;
 transition: all 0.2s;
 cursor: default;
 box-shadow: 0 10px 24px rgba(15,23,42,0.05);
}
.cb-policy-card:hover {
 border-color: #14b8a6;
 box-shadow: 0 12px 28px rgba(20,184,166,0.12);
}
.cb-policy-header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 8px;
}
.cb-policy-name {
 font-size: 12px;
 font-weight: 600;
 color: #1e293b;
}
.cb-policy-badge {
 font-size: 9px;
 font-weight: 800;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 padding: 4px 8px;
 border-radius: 999px;
 background: linear-gradient(135deg, #ecfeff, #dbeafe);
 color: #0f766e;
}
.cb-policy-company {
 font-size: 11px;
 color: #64748b;
 margin-top: 2px;
}
.cb-policy-stats {
 font-size: 11px;
 color: #475569;
 margin-top: 4px;
 font-weight: 500;
}
.cb-policy-divider {
 margin: 0 4px;
 color: #cbd5e1;
}
.cb-policy-rating {
 font-size: 11px;
 color: #f59e0b;
 margin-top: 3px;
}
.cb-policy-rating span {
 color: #64748b;
 font-weight: 500;
 margin-left: 4px;
}

/* ── Input area ── */
.cb-input-area {
 padding: 14px;
 background: rgba(255, 255, 255, 0.72);
 border-top: 1px solid rgba(148,163,184,0.16);
 backdrop-filter: blur(14px);
}
.cb-input-wrapper {
 display: flex;
 align-items: flex-end;
 gap: 8px;
 background: rgba(255,255,255,0.94);
 border: 1px solid rgba(148,163,184,0.22);
 border-radius: 18px;
 padding: 8px 8px 8px 14px;
 transition: all 0.2s;
 box-shadow: 0 8px 20px rgba(15,23,42,0.04);
}
.cb-input-wrapper:focus-within {
 border-color: #14b8a6;
 box-shadow: 0 0 0 4px rgba(20,184,166,0.1);
}
.cb-input {
 flex: 1;
 border: none;
 outline: none;
 font-size: 13px;
 color: #1e293b;
 background: transparent;
 font-family: inherit;
 resize: none;
 min-height: 22px;
 max-height: 120px;
 line-height: 1.5;
 padding: 4px 0;
}
.cb-input::placeholder { color: #94a3b8; }
.cb-input:disabled { opacity: 0.5; }
.cb-send-btn {
 width: 42px;
 height: 42px;
 border-radius: 14px;
 border: none;
 background: linear-gradient(135deg, #0f766e, #2563eb);
 color: white;
 display: flex;
 align-items: center;
 justify-content: center;
 cursor: pointer;
 transition: all 0.2s;
 flex-shrink: 0;
}
.cb-send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 2px 8px rgba(99,102,241,0.3); }
.cb-send-btn:active:not(:disabled) { transform: scale(0.95); }
.cb-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.cb-footer-text {
 text-align: center;
 font-size: 10px;
 color: #64748b;
 margin: 8px 0 0;
 letter-spacing: 0.02em;
}

.cb-welcome {
 position: relative;
 overflow: hidden;
 padding: 18px;
 border-radius: 22px;
 border: 1px solid rgba(148,163,184,0.16);
 background:
 radial-gradient(circle at top right, rgba(45,212,191,0.16), transparent 30%),
 linear-gradient(135deg, rgba(255,255,255,0.96), rgba(240,249,255,0.92));
 box-shadow: 0 16px 40px rgba(15,23,42,0.06);
}
.cb-welcome-badge {
 display: inline-flex;
 align-items: center;
 gap: 6px;
 padding: 6px 10px;
 border-radius: 999px;
 background: rgba(15,118,110,0.08);
 color: #0f766e;
 font-size: 11px;
 font-weight: 800;
 letter-spacing: 0.06em;
 text-transform: uppercase;
}
.cb-welcome-title {
 margin: 14px 0 8px;
 font-size: 24px;
 line-height: 1.1;
 font-weight: 800;
 color: #0f172a;
}
.cb-welcome-text {
 margin: 0;
 font-size: 13px;
 line-height: 1.65;
 color: #475569;
}
.cb-welcome-highlights {
 display: grid;
 grid-template-columns: 1fr;
 gap: 8px;
 margin-top: 16px;
 margin-bottom: 16px;
}
.cb-highlight-card {
 display: flex;
 align-items: center;
 gap: 10px;
 padding: 10px 12px;
 border-radius: 16px;
 background: rgba(255,255,255,0.74);
 border: 1px solid rgba(148,163,184,0.16);
 color: #0f172a;
 font-size: 12px;
 font-weight: 700;
}

/* ── Dark mode ── */
@media (prefers-color-scheme: dark) {
 .cb-window {
 background: linear-gradient(180deg, rgba(2,6,23,0.98) 0%, rgba(15,23,42,0.96) 100%);
 border-color: rgba(51, 65, 85, 0.7);
 }
 .cb-messages {
 background:
 radial-gradient(circle at top right, rgba(20,184,166,0.12), transparent 24%),
 linear-gradient(180deg, #020617 0%, #0f172a 100%);
 }
 .cb-bubble--bot {
 background: rgba(15, 23, 42, 0.92);
 color: #e2e8f0;
 border-color: #334155;
 }
 .cb-bold { color: #5eead4; }
 .cb-bullet-dot, .cb-bullet-num { color: #5eead4; }
 .cb-quick-chip {
 background: rgba(15, 23, 42, 0.86);
 border-color: #334155;
 color: #cbd5e1;
 }
 .cb-quick-chip:hover {
 background: #0f766e;
 border-color: #14b8a6;
 color: white;
 }
 .cb-suggestion-chip {
 background: rgba(15,118,110,0.14);
 border-color: rgba(45,212,191,0.3);
 color: #99f6e4;
 }
 .cb-suggestion-chip:hover {
 background: #0f766e;
 color: white;
 }
 .cb-policy-card {
 background: rgba(15, 23, 42, 0.92);
 border-color: #334155;
 }
 .cb-policy-card:hover { border-color: #14b8a6; }
 .cb-policy-name { color: #e2e8f0; }
 .cb-policy-badge { background: rgba(15,118,110,0.16); color: #99f6e4; }
 .cb-policy-company { color: #94a3b8; }
 .cb-policy-stats { color: #cbd5e1; }
 .cb-input-area {
 background: rgba(2, 6, 23, 0.72);
 border-color: #1e293b;
 }
 .cb-input-wrapper {
 background: rgba(15, 23, 42, 0.9);
 border-color: #334155;
 }
 .cb-input-wrapper:focus-within {
 border-color: #14b8a6;
 box-shadow: 0 0 0 4px rgba(20,184,166,0.14);
 }
 .cb-input { color: #e2e8f0; }
 .cb-input::placeholder { color: #64748b; }
 .cb-table-cell { background: #1e293b; }
 .cb-table-header .cb-table-cell { background: #134e4a; }
 .cb-footer-text { color: #94a3b8; }
 .cb-welcome {
 background:
 radial-gradient(circle at top right, rgba(45,212,191,0.14), transparent 30%),
 linear-gradient(135deg, rgba(15,23,42,0.96), rgba(15,23,42,0.92));
 border-color: #334155;
 }
 .cb-welcome-badge {
 background: rgba(45,212,191,0.12);
 color: #99f6e4;
 }
 .cb-welcome-title { color: #f8fafc; }
 .cb-welcome-text { color: #94a3b8; }
 .cb-highlight-card {
 background: rgba(15, 23, 42, 0.72);
 border-color: #334155;
 color: #e2e8f0;
 }
}

/* ── Responsive ── */
@media (max-width: 640px) {
 .cb-root { bottom: 12px; right: 12px; }
 .cb-window {
 width: calc(100vw - 24px);
 height: calc(100vh - 88px);
 border-radius: 22px;
 }
 .cb-fab {
 height: 58px;
 padding: 0 16px;
 }
 .cb-fab-label {
 display: none;
 }
 .cb-welcome-title {
 font-size: 21px;
 }
}
`;
