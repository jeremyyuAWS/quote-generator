import { ChatPageClient } from "@/components/chat-page-client";

export default function ChatPage({ params }: { params: { id: string } }) {
  return <ChatPageClient params={params} />;
}