"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Send, Users, Edit2, Trash2, Smile, Check, X } from "lucide-react";
import { useLiveMessages } from "@/hooks/useLiveMessages";
import { formatRelativeTime } from "@/lib/time";
import type { MessageRecord } from "@/lib/messages";

const EMOJIS = [
  "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃",
  "😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😚",
  "😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔",
  "🦅","🐦","🦆","🦉","🦜","🐧","🕊️","🦢","🦤","🐤",
  "🌲","🌳","🌴","🌿","☘️","🍀","🍁","🍂","🍃","🌱",
  "👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉",
  "☕","🍵","🍺","🍻","🥂","🍽️","🎉","✨","💫","⭐",
];

interface MessageThreadProps {
  url: string;
  enabled?: boolean;
  currentUserId: string | null;
  heightClass?: string;
  placeholder?: string;
}

export function MessageThread({
  url,
  enabled = true,
  currentUserId,
  heightClass = "h-[320px]",
  placeholder = "Type a message...",
}: MessageThreadProps) {
  const { messages, setMessages } = useLiveMessages(url, enabled);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const isDm = url.includes("/api/messages/") && !url.includes("/chat") && !url.includes("/board");

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottom) el.scrollTop = el.scrollHeight;
  }, [messages, atBottom]);

  useEffect(() => {
    if (isDm && enabled && currentUserId) {
      const readUrl = `${url.replace("/api/messages/", "/api/messages/")}/read`;
      fetch(readUrl, { method: "POST" }).catch(() => {});
    }
  }, [url, enabled, currentUserId, isDm]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !currentUserId || sending || editingId !== null) return;

    const tempId = `temp-${Date.now()}`;
    const temp: MessageRecord = {
      id: tempId,
      content,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
      sender: { id: currentUserId, name: "You", avatarUrl: null },
    };

    setMessages((prev) => [...prev, temp]);
    setDraft("");
    setErrorMsg(null);
    setSending(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (data.message as MessageRecord) : m))
        );
      } else {
        const err = await res.json().catch(() => null);
        setErrorMsg(err?.error || "Failed to send message");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch {
      setErrorMsg("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleEdit = async (message: MessageRecord) => {
    if (!editDraft.trim()) return;
    setErrorMsg(null);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id, content: editDraft.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? data.message : m))
        );
      } else {
        const err = await res.json().catch(() => null);
        setErrorMsg(err?.error || "Failed to edit message");
      }
    } catch {
      setErrorMsg("Failed to edit message");
    }
    setEditingId(null);
    setEditDraft("");
  };

  const handleDelete = async (message: MessageRecord) => {
    if (!confirm("Delete this message?")) return;
    setErrorMsg(null);
    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id ? { ...m, content: "", deletedAt: new Date().toISOString() } : m
          )
        );
      } else {
        const err = await res.json().catch(() => null);
        setErrorMsg(err?.error || "Failed to delete message");
      }
    } catch {
      setErrorMsg("Failed to delete message");
    }
  };

  const insertEmoji = (emoji: string) => {
    setDraft((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col relative">
      <div ref={scrollRef} onScroll={handleScroll} className={`${heightClass} space-y-3 overflow-y-auto pr-1`}>
        {messages.length === 0 ? (
          <p className="mt-4 text-center text-sm text-gray-400 dark:text-gray-500">
            No messages yet.
          </p>
        ) : (
          messages.map((message) => {
            const own = message.sender.id === currentUserId;
            const isDeleted = message.content === "" && message.deletedAt;
            return (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${own ? "flex-row-reverse" : ""}`}
              >
                {message.sender.avatarUrl ? (
                  <Image
                    src={message.sender.avatarUrl}
                    alt={message.sender.name}
                    width={32}
                    height={32}
                    unoptimized
                    className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Users className="h-4 w-4 text-teal-400" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                    own
                      ? "bg-forest text-sandstone rounded-br-sm"
                      : "border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                  } relative`}
                >
                  {!own && !isDeleted && (
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      {message.sender.name}
                    </p>
                  )}
                  {editingId === message.id && own ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        autoFocus
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        maxLength={2000}
                      />
                      <button
                        onClick={() => handleEdit(message)}
                        className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditDraft(""); }}
                        className="flex items-center gap-1 rounded-lg bg-gray-200 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      {!isDeleted ? (
                        <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                      ) : (
                        <p className="whitespace-pre-wrap break-words text-sm italic text-gray-400 dark:text-gray-500">
                          Message deleted
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-[10px] ${own ? "text-sandstone/60" : "text-gray-400 dark:text-gray-500"}`}>
                          {formatRelativeTime(message.createdAt)}
                          {message.editedAt && " (edited)"}
                        </p>
                        {own && !isDeleted && (
                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              onClick={() => { setEditingId(message.id); setEditDraft(message.content); }}
                              className="p-1 rounded hover:bg-white/20 dark:hover:bg-black/20 text-[11px] text-sandstone/70 dark:text-sandstone/70"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(message)}
                              className="p-1 rounded hover:bg-white/20 dark:hover:bg-black/20 text-[11px] text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {errorMsg && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {errorMsg}
        </p>
      )}

      {!currentUserId ? (
        <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
          <Link href="/auth" className="font-medium text-teal-700 hover:underline dark:text-teal-300">
            Sign in
          </Link>{" "}
          to join the conversation.
        </div>
      ) : (
        <form onSubmit={handleSend} className="mt-3 flex gap-2 relative">
        <div className="flex-1 flex items-center gap-2 relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            aria-label="Emoji picker"
          >
            <Smile className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
            disabled={!currentUserId || editingId !== null}
            maxLength={2000}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={!currentUserId || !draft.trim() || sending || editingId !== null}
          className="flex items-center gap-1 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-sandstone hover:bg-forest/90 disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </button>

        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-3 grid grid-cols-8 gap-1 max-h-48 overflow-y-auto z-10"
            role="listbox"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-2xl"
                role="option"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        </form>
      )}
    </div>
  );
}