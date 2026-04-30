"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Send, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";

interface Participant {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Conversation {
  id: string;
  subject: string;
  student: { id: string; firstName: string; lastName: string } | null;
  participants: Participant[];
  lastMessage: { body: string; senderName: string; createdAt: string } | null;
  totalMessages: number;
  unreadCount: number;
  updatedAt: string;
}

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; role: string };
}

interface StudentWithParent {
  id: string;
  firstName: string;
  lastName: string;
  parent?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return date.toLocaleDateString();
}

function roleBadgeClass(role: string): string {
  switch (role) {
    case "TEACHER":
      return "bg-blue-100 text-blue-700";
    case "PARENT":
      return "bg-green-100 text-green-700";
    case "DIRECTOR":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function TeacherMessages() {
  const t = useTranslations("TeacherMessages");
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id ?? "";
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [showMobileMessages, setShowMobileMessages] = useState(false);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: conversationsRes,
    isLoading: loadingConversations,
    mutate: mutateConversations,
  } = useSWR<{ conversations: Conversation[] }>(
    "/api/conversations",
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: messagesRes, mutate: mutateMessages } = useSWR<{
    messages: Message[];
  }>(
    selectedConversationId
      ? `/api/conversations/${selectedConversationId}/messages`
      : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: studentsData } = useSWR<StudentWithParent[]>(
    newDialogOpen ? "/api/teachers/students" : null,
    fetcher
  );

  const conversations = conversationsRes?.conversations ?? [];
  const messages = messagesRes?.messages ?? [];
  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    if (isMobile) setShowMobileMessages(true);
  };

  const handleBackToList = () => {
    setShowMobileMessages(false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversationId || sending) return;
    setSending(true);
    try {
      await fetch(
        `/api/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: messageText.trim() }),
        }
      );
      setMessageText("");
      await mutateMessages();
      await mutateConversations();
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!newSubject.trim() || !selectedParentId || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject.trim(),
          participantIds: [selectedParentId],
        }),
      });
      const data = await res.json();
      await mutateConversations();
      if (data.conversation?.id) {
        setSelectedConversationId(data.conversation.id);
        if (isMobile) setShowMobileMessages(true);
      }
      setNewDialogOpen(false);
      setNewSubject("");
      setSelectedParentId("");
    } finally {
      setCreating(false);
    }
  };

  const parentsFromStudents =
    studentsData
      ?.filter((s) => s.parent)
      .map((s) => ({
        id: s.parent!.id,
        name: `${s.parent!.firstName} ${s.parent!.lastName}`,
        studentName: `${s.firstName} ${s.lastName}`,
      })) ?? [];

  const uniqueParents = parentsFromStudents.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
  );

  if (loadingConversations) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
        </div>
        <SectionSkeleton variant="list" rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-220px)] min-h-[400px] overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Left panel - Conversation list */}
        <div
          className={`w-full flex-shrink-0 border-r border-gray-200 md:w-[300px] ${
            isMobile && showMobileMessages ? "hidden" : "flex"
          } ${!isMobile ? "flex" : ""} flex-col`}
        >
          <div className="border-b border-gray-200 p-3">
            <Button
              onClick={() => setNewDialogOpen(true)}
              className="w-full"
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" />
              {t("newConversation")}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-gray-500">
                {t("noConversations")}
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full border-b border-gray-100 p-3 text-left transition-colors hover:bg-gray-50 ${
                    selectedConversationId === conv.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {conv.subject}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {conv.unreadCount > 0 && (
                        <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                      )}
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {relativeTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400 truncate">
                    {conv.participants
                      .filter((p) => p.userId !== currentUserId)
                      .map((p) => `${p.firstName} ${p.lastName}`)
                      .join(", ")}
                  </p>
                  {conv.lastMessage && (
                    <p className="mt-1 text-xs text-gray-500 truncate">
                      {conv.lastMessage.senderName}: {conv.lastMessage.body}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel - Messages */}
        <div
          className={`flex-1 flex-col ${
            isMobile && !showMobileMessages ? "hidden" : "flex"
          } ${!isMobile ? "flex" : ""}`}
        >
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
                <button
                  onClick={handleBackToList}
                  className="md:hidden text-gray-500 hover:text-gray-700"
                  aria-label={t("back")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-gray-900 truncate">
                    {selectedConversation.subject}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">
                    {selectedConversation.participants
                      .filter((p) => p.userId !== currentUserId)
                      .map((p) => `${p.firstName} ${p.lastName}`)
                      .join(", ")}
                  </p>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-gray-500">
                    {t("noMessages")}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isCurrentUser = msg.sender.id === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isCurrentUser && (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                            {getInitials(
                              msg.sender.firstName,
                              msg.sender.lastName
                            )}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            isCurrentUser
                              ? "bg-[#2563EB] text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {!isCurrentUser && (
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-medium">
                                {msg.sender.firstName} {msg.sender.lastName}
                              </span>
                              <span
                                className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium leading-none ${roleBadgeClass(
                                  msg.sender.role
                                )}`}
                              >
                                {msg.sender.role.toLowerCase()}
                              </span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.body}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isCurrentUser
                                ? "text-white/70"
                                : "text-gray-400"
                            }`}
                          >
                            {relativeTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-gray-200 p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={t("typeMessage")}
                    rows={1}
                    className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sending}
                    size="icon"
                    aria-label={t("send")}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
              {t("selectConversation")}
            </div>
          )}
        </div>
      </div>

      {/* New conversation dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("newConversation")}</DialogTitle>
            <DialogDescription>{t("newConversationDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("selectParent")}</Label>
              <Select
                value={selectedParentId}
                onValueChange={setSelectedParentId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectParent")} />
                </SelectTrigger>
                <SelectContent>
                  {uniqueParents.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.studentName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("subject")}</Label>
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder={t("subject")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewDialogOpen(false)}
            >
              {t("back")}
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!newSubject.trim() || !selectedParentId || creating}
            >
              {t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
