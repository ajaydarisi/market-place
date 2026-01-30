"use client";

import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

export default function Messages() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)]">
        <h1 className="text-3xl font-display font-bold mb-6">Messages</h1>

        <div className="grid md:grid-cols-3 gap-6 h-[calc(100%-80px)]">
          <Card className="col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="bg-secondary/20 py-4 px-4">
              <CardTitle className="text-base font-semibold">Recent Conversations</CardTitle>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-1">
              <CardContent className="flex items-center justify-center text-muted-foreground p-8 text-center min-h-[200px]">
                <div className="space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto opacity-50" />
                  <p>No conversations yet</p>
                </div>
              </CardContent>
            </ScrollArea>
          </Card>

          <Card className="col-span-2 flex flex-col overflow-hidden">
            <CardContent className="flex-1 flex items-center justify-center text-muted-foreground bg-secondary/10">
              <p>Select a conversation to start chatting</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
