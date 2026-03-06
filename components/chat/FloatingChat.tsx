"use client";

import { MessageCircle, Send, X, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChatStore, type ChatMessage } from "@/lib/store/chatStore";

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getInitials(name: string) {
    return name.slice(0, 2).toUpperCase();
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
    const isMe = msg.senderId === "me";

    return (
        <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar for others */}
            {!isMe && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface2 text-xs font-bold text-text-secondary select-none">
                    {getInitials(msg.senderName)}
                </span>
            )}

            <div
                className={`flex flex-col max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isMe
                        ? "rounded-br-sm bg-brand-primary text-white"
                        : "rounded-bl-sm bg-surface2 text-text-primary"
                    }`}
            >
                {!isMe && (
                    <span className="mb-0.5 text-[10px] font-bold text-brand-secondary opacity-80">
                        {msg.senderName}
                    </span>
                )}
                <p>{msg.content}</p>
                <p className={`mt-1 text-right text-[10px] opacity-60 ${isMe ? "text-white" : "text-text-secondary"}`}>
                    {formatTime(msg.timestamp)}
                </p>
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface2 text-text-secondary">
                ...
            </span>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-surface2 px-4 py-3">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted"
                        style={{ animationDelay: `${i * 150}ms` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function FloatingChat() {
    const isOpen = useChatStore((s) => s.isOpen);
    const messages = useChatStore((s) => s.messages);
    const unread = useChatStore((s) => s.unread);
    const toggle = useChatStore((s) => s.toggle);
    const close = useChatStore((s) => s.close);
    const send = useChatStore((s) => s.send);
    const hydrate = useChatStore((s) => s.hydrate);

    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Load chat history from localStorage
    useEffect(() => {
        hydrate();
    }, [hydrate]);

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) close();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, close]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    // Simulate typing delay before teammate responds
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.senderId === "me") {
            // Show typing for a bit if the last message was ours
            setTyping(true);
            const timer = setTimeout(() => setTyping(false), 1500 + Math.random() * 1500);
            return () => clearTimeout(timer);
        } else {
            setTyping(false);
        }
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSend = useCallback(() => {
        const trimmed = input.trim();
        if (!trimmed) return;
        send(trimmed);
        setInput("");
    }, [input, send]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    return (
        <>
            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="fixed bottom-20 right-4 z-50 flex h-[520px] w-[360px] animate-slide-right flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
                    role="dialog"
                    aria-label="Chat del equipo"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 shadow-sm">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-soft">
                            <Users size={20} />
                        </span>
                        <div className="flex-1">
                            <p className="text-base font-bold text-text-primary">Chat Conjunto</p>
                            <p className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                                <span className="h-2 w-2 rounded-full animate-pulse bg-state-success" />
                                4 miembros activos
                            </p>
                        </div>
                        <button
                            type="button"
                            aria-label="Cerrar chat"
                            onClick={toggle}
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface2 hover:text-text-primary active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 bg-surface/50">
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} msg={msg} />
                        ))}
                        {typing && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-line bg-surface px-4 py-3">
                        <div className="flex items-end gap-2 rounded-xl border border-line bg-surface2 px-3 py-2 focus-within:border-brand-primary/50 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Escribe un mensaje al equipo..."
                                rows={1}
                                aria-label="Escribe un mensaje al equipo"
                                className="max-h-24 flex-1 resize-none bg-transparent py-1 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                                style={{ minHeight: "28px" }}
                            />
                            <button
                                type="button"
                                aria-label="Enviar mensaje"
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-white transition-all hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                            >
                                <Send size={15} />
                            </button>
                        </div>
                        <p className="mt-2 text-center text-[10px] text-text-muted font-medium uppercase tracking-wider">
                            Canal general de la empresa
                        </p>
                    </div>
                </div>
            )}

            {/* FAB */}
            <button
                type="button"
                aria-label={isOpen ? "Cerrar chat" : "Abrir chat de equipo"}
                onClick={toggle}
                className="fixed bottom-4 right-4 z-50 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-brand-primary text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all hover:scale-105 hover:shadow-[0_8px_40px_rgb(0,0,0,0.3)] active:scale-95"
            >
                {isOpen ? <X size={26} strokeWidth={2.5} /> : <MessageCircle size={26} strokeWidth={2.5} />}
                {!isOpen && unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-state-error text-xs font-bold text-white shadow-sm">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>
        </>
    );
}
