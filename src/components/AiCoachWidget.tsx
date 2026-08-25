"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaXmark, FaPaperPlane, FaWandMagicSparkles } from "react-icons/fa6";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How can I increase my wrist shot speed?",
  "What hockey stick flex should I pick?",
  "Tell me about the Junior Development Camp",
  "How often should I sharpen ice skates?",
];

export default function AiCoachWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "🏒 **Welcome to Apex Hockey!** I'm Coach Wayne, your AI Hockey Specialist. Ask me anything about hockey drills, stick curves, skate maintenance, training programs, or match tactics!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "Always keep your knees bent and eyes up on the ice! What else can I assist with?",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Let's focus on fundamental edge control and puck security. Try asking another question!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-circle btn-lg bg-[#FF4240] hover:bg-[#e03735] text-white shadow-2xl border-none relative group transition-all duration-300 hover:scale-105"
          aria-label="Open AI Hockey Coach"
        >
          {isOpen ? <FaXmark className="text-2xl" /> : <FaRobot className="text-2xl" />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[600px] h-[75vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF4240] flex items-center justify-center text-white shadow-md">
                <FaWandMagicSparkles />
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  Coach Wayne <span className="badge badge-xs bg-emerald-500 border-none text-[9px] text-white">AI ONLINE</span>
                </h3>
                <p className="text-[11px] text-gray-300">Apex Hockey Gear & Skills Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-xs btn-circle text-gray-300 hover:text-white"
            >
              <FaXmark className="text-base" />
            </button>
          </div>

          {/* Messages Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#FF4240] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    <FaRobot />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#FF4240] text-white rounded-br-none shadow-sm"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-gray-400 text-xs py-1">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
                  <FaRobot className="text-gray-500 text-[10px]" />
                </div>
                <span>Coach is formulating tactical advice...</span>
              </div>
            )}
          </div>

          {/* Prompt Suggestions */}
          <div className="p-2 bg-white border-t border-gray-100 overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="btn btn-xs btn-outline border-gray-200 hover:border-[#FF4240] hover:bg-red-50 hover:text-[#FF4240] text-gray-600 text-[10px] whitespace-nowrap rounded-full font-medium"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Coach Wayne a question..."
              className="input input-sm flex-1 bg-gray-100 border-none rounded-xl text-xs focus:ring-2 focus:ring-[#FF4240]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn btn-sm bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-xl px-3"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
