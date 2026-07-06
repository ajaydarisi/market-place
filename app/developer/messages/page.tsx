"use client";

import { EmptyState } from "@/components/empty-state";
import { Navigation } from "@/components/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  useConversations,
  useProjectMessages,
  useSendMessage,
  useMessagesRealtime,
  useMarkMessagesRead,
  type Conversation,
} from "@/hooks/use-messages";
import { MessageSquare, Send, Loader2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useRef, Suspense } from "react";

export default function Messages() {
  return (
    <Suspense fallback={
      <div className="page-shell min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { user } = useAuth();

  const { data: conversations, isLoading: convsLoading } = useConversations(user?.id || "");
  useMessagesRealtime(user?.id || "");

  const [selected, setSelected] = useState<{ projectId: number; clientId: string } | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Auto-select first conversation if nothing selected
  useEffect(() => {
    if (!initializedRef.current && !selected && conversations && conversations.length > 0) {
      setSelected({ projectId: conversations[0].projectId, clientId: conversations[0].otherUserId });
      initializedRef.current = true;
    }
  }, [conversations, selected]);

  // Fetch messages for the selected conversation
  const { data: messages, isLoading: msgsLoading } = useProjectMessages(selected?.projectId || 0);
  const { mutate: sendMessage, isPending: sendPending } = useSendMessage();
  const { mutate: markMessagesRead } = useMarkMessagesRead();

  // Filter messages for the selected client
  const filteredMessages = messages?.filter(
    m => m.senderId === selected?.clientId || (m as any).receiverId === selected?.clientId
  )?.reverse() || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages.length]);

  useEffect(() => {
    if (!selected) return;
    markMessagesRead(selected.projectId);
  }, [markMessagesRead, selected]);

  const handleSend = () => {
    if (!messageText.trim() || !selected) return;
    sendMessage(
      { projectId: selected.projectId, receiverId: selected.clientId, content: messageText.trim() },
      { onSuccess: () => setMessageText("") }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const allConversations: Conversation[] = conversations || [];

  return (
    <div className="page-shell min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto flex h-[calc(100dvh-4.5rem-var(--safe-area-top)-var(--mobile-nav-height)-var(--safe-area-bottom)-1rem)] flex-col px-4 py-4 md:h-[calc(100vh-80px)] md:py-8">
        <PageHeader
          className="mb-4 md:mb-6"
          title="Messages"
          description="Stay close to client context, keep active threads readable, and move delivery forward without losing signal."
        />

        <div className="grid min-h-0 flex-1 grid-rows-1 gap-4 md:grid-cols-3 md:gap-6">
          {/* Conversation List */}
          <Card className={`surface-glass flex min-h-0 flex-col overflow-hidden md:col-span-1 ${mobileShowChat ? "hidden md:flex" : ""}`}>
            <CardHeader className="border-b border-border/50 bg-transparent px-4 py-4">
              <CardTitle className="text-base font-semibold">Conversations</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              {convsLoading ? (
                <CardContent className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
              ) : allConversations.length === 0 ? (
                <CardContent className="p-4">
                  <EmptyState
                    icon={MessageSquare}
                    title="No conversations yet"
                    description="When clients reply to your proposals, those threads will appear here."
                    className="border-0 shadow-none"
                  />
                </CardContent>
              ) : (
                <div className="p-2">
                  {allConversations.map((conv) => {
                    const isActive = selected?.projectId === conv.projectId && selected?.clientId === conv.otherUserId;
                    return (
                      <Button
                        key={`${conv.projectId}-${conv.otherUserId}`}
                        variant="ghost"
                        type="button"
                        className={`w-full text-left p-3 h-auto rounded-2xl transition-all flex items-start gap-3 ${
                          isActive
                            ? "bg-primary/[0.08] shadow-sm ring-1 ring-primary/10"
                            : "hover:bg-secondary/45"
                        }`}
                        onClick={() => {
                          setSelected({ projectId: conv.projectId, clientId: conv.otherUserId });
                          setMobileShowChat(true);
                        }}
                      >
                        <ProfileAvatar name={conv.otherUserName} imageUrl={conv.otherUserAvatar} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-baseline gap-2">
                            <p className="text-sm font-medium truncate">{conv.otherUserName}</p>
                            {conv.lastMessageAt && (
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{conv.projectTitle}</p>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                          )}
                          {conv.unreadCount > 0 ? (
                            <span className="mt-2 inline-flex rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                              {conv.unreadCount} new
                            </span>
                          ) : null}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Thread */}
          <Card className={`surface-glass flex min-h-0 flex-col overflow-hidden md:col-span-2 ${mobileShowChat ? "" : "hidden md:flex"}`}>
            {!selected ? (
              <CardContent className="flex-1 bg-secondary/10 p-4">
                <EmptyState
                  icon={MessageSquare}
                  title="Select a conversation"
                  description="Choose a thread from the list to pick up the latest client context."
                  className="border-0 bg-transparent shadow-none"
                />
              </CardContent>
            ) : (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b border-border/50 bg-transparent py-3 px-4 flex-row items-center gap-3 space-y-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 md:hidden"
                    aria-label="Back to conversations"
                    onClick={() => setMobileShowChat(false)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <ProfileAvatar
                    name={allConversations.find(c => c.projectId === selected.projectId && c.otherUserId === selected.clientId)?.otherUserName || "User"}
                    imageUrl={allConversations.find(c => c.projectId === selected.projectId && c.otherUserId === selected.clientId)?.otherUserAvatar}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold truncate">
                      {allConversations.find(c => c.projectId === selected.projectId && c.otherUserId === selected.clientId)?.otherUserName || "User"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground truncate">
                      {allConversations.find(c => c.projectId === selected.projectId && c.otherUserId === selected.clientId)?.projectTitle || ""}
                    </p>
                  </div>
                </CardHeader>
                <Separator />

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {msgsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <EmptyState
                      icon={MessageSquare}
                      title="No messages yet"
                      description="Send the first message to start the conversation."
                      className="border-0 bg-transparent shadow-none"
                    />
                  ) : (
                    <div className="space-y-3">
                      {filteredMessages.map((msg) => {
                        const isOwn = msg.senderId === user?.id;
                        const conv = allConversations.find(c => c.projectId === selected.projectId && c.otherUserId === selected.clientId);
                        return (
                          <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                            {!isOwn && (
                              <ProfileAvatar name={conv?.otherUserName || "?"} imageUrl={conv?.otherUserAvatar} size="xs" />
                            )}
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-md shadow-lg shadow-primary/15"
                                : "surface-subtle border border-border/50 rounded-bl-md"
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              <p className={`text-[10px] mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <Separator className="bg-border/50" />
                <div className="safe-bottom bg-background/35 p-3">
                  <div className="flex gap-2">
                    <Input
                      aria-label="Type a message"
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      aria-label="Send message"
                      onClick={handleSend}
                      disabled={!messageText.trim() || sendPending}
                    >
                      {sendPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Keep contact details in the platform — emails and phone numbers are hidden automatically.
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
