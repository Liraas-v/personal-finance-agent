import { MessageSquare } from 'lucide-react'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatPanel } from '@/components/chat/ChatPanel'

export default function ChatPage() {
  return (
    <div className="p-4 sm:p-6 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] flex flex-col pb-20 sm:pb-6">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <MessageSquare size={18} className="text-primary" />
        <h2 className="text-base font-semibold text-foreground">Chat Financeiro</h2>
      </div>
      <div className="flex gap-5 flex-1 min-h-0">
        <ChatSidebar />
        <ChatPanel />
      </div>
    </div>
  )
}
