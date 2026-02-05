"use client";

import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useAuth } from "@/hooks/use-auth";
import { useConversations, useProjectMessages, useSendMessage, useMessagesRealtime, type Conversation } from "@/hooks/use-messages";
import { MessageSquare, Send, Loader2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useRef, Suspense } from "react";

export default function Messages() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
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

  // Filter messages for the selected client
  const filteredMessages = messages?.filter(
    m => m.senderId === selected?.clientId || (m as any).receiverId === selected?.clientId
  )?.reverse() || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages.length]);

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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)]">
        <h1 className="text-3xl font-display font-bold mb-6">Messages</h1>

        <div className="grid grid-rows-1 md:grid-cols-3 gap-6 h-[calc(100%-80px)]">
          {/* Conversation List */}
          <Card className={`flex flex-col overflow-hidden md:col-span-1 ${mobileShowChat ? "hidden md:flex" : ""}`}>
            <CardHeader className="bg-secondary/20 py-4 px-4">
              <CardTitle className="text-base font-semibold">Conversations</CardTitle>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-1">
              {convsLoading ? (
                <CardContent className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
              ) : allConversations.length === 0 ? (
                <CardContent className="flex items-center justify-center text-muted-foreground p-8 text-center min-h-[200px]">
                  <div className="space-y-2">
                    <MessageSquare className="h-8 w-8 mx-auto opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                </CardContent>
              ) : (
                <div className="p-2">
                  {allConversations.map((conv) => {
                    const isActive = selected?.projectId === conv.projectId && selected?.clientId === conv.otherUserId;
                    return (
                      <button
                        key={`${conv.projectId}-${conv.otherUserId}`}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                          isActive ? "bg-primary/10" : "hover:bg-secondary/50"
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
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Thread */}
          <Card className={`flex flex-col overflow-hidden md:col-span-2 ${mobileShowChat ? "" : "hidden md:flex"}`}>
            {!selected ? (
              <CardContent className="flex-1 flex items-center justify-center text-muted-foreground bg-secondary/10">
                <div className="text-center space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </CardContent>
            ) : (
              <>
                {/* Chat Header */}
                <CardHeader className="bg-secondary/20 py-3 px-4 flex-row items-center gap-3 space-y-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden shrink-0"
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
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      <p>No messages yet. Send one to start the conversation!</p>
                    </div>
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
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-secondary rounded-bl-md"
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
                <Separator />
                <div className="p-3 flex gap-2">
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
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
