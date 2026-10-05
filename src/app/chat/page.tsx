import { MessageSquare } from 'lucide-react'
import { ChatPanel } from '@/components/chat/ChatPanel'

export default function ChatPage() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-3xl flex-col p-4 pb-20 sm:h-[calc(100dvh-4rem)] sm:p-6 sm:pb-6">
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <MessageSquare size={18} className="text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Chat Financeiro</h2>
      </div>
      <ChatPanel />
    </div>
  )
}
