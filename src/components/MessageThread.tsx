"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Send, Users } from "lucide-react";
import { useLiveMessages } from "@/hooks/useLiveMessages";
import { formatRelativeTime } from "@/lib/time";
import type { MessageRecord } from "@/lib/messages";

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
  const { messages, append } = useLiveMessages(url, enabled);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !currentUserId || sending) return;
    setSending(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        append(data.message as MessageRecord);
        setDraft("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send message");
      }
    } catch {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div ref={scrollRef} className={`${heightClass} space-y-3 overflow-y-auto pr-1`}>
        {messages.length === 0 ? (
          <p className="mt-4 text-center text-sm text-gray-400 dark:text-gray-500">
            No messages yet.
          </p>
        ) : (
          messages.map((message) => {
            const own = message.sender.id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${own ? "flex-row-reverse" : ""}`}
              >
                {message.sender.avatarUrl ? (
                  <img
                    src={message.sender.avatarUrl}
                    alt={message.sender.name}
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
                  }`}
                >
                  {!own && (
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {message.sender.name}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  <p
                    className={`mt-0.5 text-[10px] ${
                      own ? "text-sandstone/60" : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {formatRelativeTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          disabled={!currentUserId}
          maxLength={2000}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!currentUserId || !draft.trim() || sending}
          className="flex items-center gap-1 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-sandstone hover:bg-forest/90 disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </button>
      </form>
    </div>
  );
}