"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Bot, Send, Sparkles, Trash2 } from "lucide-react";
import { get, post, type ChatReply } from "@/lib/api";
import { Container, PageHero, Spinner } from "@/components/ui";

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
  time: Date;
  error?: boolean;
}

let idCounter = 1000;
const nextId = () => ++idCounter;
const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mode, setMode] = useState<"ai" | "mock" | null>(null);
  const [botName, setBotName] = useState("EduRise Admission Assistant");
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const status = await get<{ mode: "ai" | "mock"; name: string; welcome: string }>("/api/v1/chat/status");
        setMode(status.mode);
        setBotName(status.name);
        setMessages([{ id: nextId(), role: "bot", text: status.welcome, time: new Date() }]);
        const sug = await get<{ questions: string[] }>("/api/v1/chat/suggested").catch(() => null);
        if (sug) setSuggestions(sug.questions);
      } catch {
        setMessages([
          { id: nextId(), role: "bot", text: "The chat server seems unreachable. Please make sure the backend is running and refresh.", time: new Date(), error: true },
        ]);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    setInput("");
    setMessages((m) => [...m, { id: nextId(), role: "user", text: clean, time: new Date() }]);
    setTyping(true);
    try {
      const res = await post<ChatReply>("/api/v1/chat", { message: clean });
      setMode(res.source);
      setMessages((m) => [...m, { id: nextId(), role: "bot", text: res.reply, time: new Date() }]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "bot", text: "Sorry, I couldn't send that. Please check your connection and try again.", time: new Date(), error: true },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="AI Assistant"
        title={botName}
        description="Ask about courses, fees, batch timings, scholarships, demo classes or admissions — I answer from our official institute information."
      />
      <section className="bg-slate-50">
        <Container className="grid gap-8 py-12 sm:py-16 lg:grid-cols-3">
          {/* Chat card */}
          <div className="lg:col-span-2 flex h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-3 border-b border-slate-200 bg-navy-950 px-5 py-4 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600">
                <Bot className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-bold">{botName}</p>
                <p className="text-xs text-navy-200">
                  {mode === "ai" ? "AI mode" : mode === "mock" ? "Demo mode (no API key needed)" : "Connecting…"}
                </p>
              </div>
              <button
                onClick={() => setMessages((m) => m.slice(0, 1))}
                aria-label="Clear chat"
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-5 py-5">
              {!ready ? (
                <Spinner label="Starting chat…" />
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
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
                ))
              )}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
                    <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-4"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                aria-label="Type your message"
                maxLength={1000}
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-40"
              >
                <Send className="h-4 w-4" /> <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-navy-900">
                <Sparkles className="h-4 w-4 text-accent-500" /> Try asking
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-brand-200 bg-brand-50 px-3.5 py-2 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-navy-950 p-6 text-white">
              <h2 className="font-bold">How this assistant works</h2>
              <ul className="mt-3 space-y-2 text-sm text-navy-200">
                <li>· Answers only from our official institute information.</li>
                <li>· Never invents fees, dates or guarantees.</li>
                <li>· If unsure, it asks you to contact a counsellor.</li>
                <li>· Demo mode works without any API key.</li>
              </ul>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
