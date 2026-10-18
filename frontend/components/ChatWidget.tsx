"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Trash2, Bot, AlertCircle } from "lucide-react";
import { get, post, type ChatReply } from "@/lib/api";

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
  time: Date;
  error?: boolean;
}

let idCounter = 0;
const nextId = () => ++idCounter;

const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mode, setMode] = useState<"ai" | "mock" | null>(null);
  const [botName, setBotName] = useState("EduRise Admission Assistant");
  const [failed, setFailed] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  const ensureWelcome = async () => {
    if (messages.length > 0) return;
    try {
      const status = await get<{ mode: "ai" | "mock"; name: string; welcome: string }>(
        "/api/v1/chat/status"
      );
      setMode(status.mode);
      setBotName(status.name);
      setMessages([{ id: nextId(), role: "bot", text: status.welcome, time: new Date() }]);
      const sug = await get<{ questions: string[] }>("/api/v1/chat/suggested").catch(() => null);
      if (sug) setSuggestions(sug.questions);
    } catch {
      setMessages([
        {
          id: nextId(),
          role: "bot",
          text: "Hello! I'm the EduRise Admission Assistant. The server seems unreachable right now — please try again in a moment.",
          time: new Date(),
          error: true,
        },
      ]);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) ensureWelcome();
  };

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    setFailed(null);
    setInput("");
    setMessages((m) => [...m, { id: nextId(), role: "user", text: clean, time: new Date() }]);
    setTyping(true);
    try {
      const res = await post<ChatReply>("/api/v1/chat", { message: clean });
      setMode(res.source);
      setMessages((m) => [...m, { id: nextId(), role: "bot", text: res.reply, time: new Date() }]);
    } catch (e) {
      setFailed(clean);
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: "bot",
          text: "Sorry, I couldn't send that. Please check your connection and try again.",
          time: new Date(),
          error: true,
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const clear = () => {
    setMessages([]);
    setFailed(null);
    ensureWelcome();
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggle}
        aria-label={open ? "Close chat" : "Chat with EduRise Admission Assistant"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl transition hover:bg-brand-700 hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <section
          aria-label="Admission assistant chat"
          className="chat-pop fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl
            inset-x-3 bottom-24 top-24
            sm:inset-x-auto sm:right-5 sm:bottom-24 sm:top-auto sm:h-[540px] sm:w-[400px]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-navy-950 px-4 py-3.5 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600">
              <Bot className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{botName}</p>
              <p className="text-xs text-navy-200">
                {typing ? "typing…" : mode === "ai" ? "AI mode · Online" : mode === "mock" ? "Demo mode · Online" : "Online"}
              </p>
            </div>
            <button onClick={clear} aria-label="Clear chat" className="rounded-lg p-1.5 hover:bg-white/10">
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={toggle} aria-label="Close chat" className="rounded-lg p-1.5 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-brand-600 text-white rounded-br-md"
                      : m.error
                        ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-md"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm"
                  }`}
                >
                  {m.error && <AlertCircle className="mr-1 inline h-4 w-4" />}
                  {m.text}
                  <div className={`mt-1 text-[10px] ${m.role === "user" ? "text-brand-100" : "text-slate-400"}`}>
                    {fmtTime(m.time)}
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {suggestions.length > 0 && messages.length <= 2 && !typing && (
            <div className="border-t border-slate-200 bg-white px-3 py-2.5">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {suggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="shrink-0 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about courses, fees, batches…"
              aria-label="Type your message"
              maxLength={1000}
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          {failed && (
            <button
              onClick={() => send(failed)}
              className="border-t border-slate-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
            >
              Retry sending your last message
            </button>
          )}
        </section>
      )}
    </>
  );
}
