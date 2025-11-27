import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { Send, X } from 'lucide-react'

export default function Chat({ itemId, onClose, session }) {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')

    useEffect(() => {
        fetchMessages()

        // Real-time subscription (Auto-update when new message comes)
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `item_id=eq.${itemId}` },
                (payload) => {
                    setMessages(prev => [...prev, payload.new])
                })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [itemId])

    const fetchMessages = async () => {
        const { data } = await supabase.from('messages').select('*').eq('item_id', itemId).order('created_at', { ascending: true })
        if (data) setMessages(data)
    }

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const { error } = await supabase.from('messages').insert([{
            item_id: itemId,
            user_id: session.user.id,
            user_email: session.user.email, // Storing email so we know who sent it
            text: newMessage
        }])

        if (!error) setNewMessage('')
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md h-[80vh] md:h-[600px] rounded-t-xl md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Discussion</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-black">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm mt-10">No messages yet. Start the chat!</p>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.user_id === session.user.id ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.user_id === session.user.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-500 mt-1 px-1">
                                    {msg.user_email.split('@')[0]}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2">
                    <input
                        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-black bg-white"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                    />
                    <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    )
}