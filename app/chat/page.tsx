import { ChatList } from '../../components/ChatList'

export default function ChatPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Seguro</h1>
      <ChatList />
    </div>
  )
}

