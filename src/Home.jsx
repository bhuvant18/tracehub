import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { MessageCircle, Trash2, Phone, User } from 'lucide-react'
import Chat from './Chat'

export default function Home() {
    const [items, setItems] = useState([])
    const [filter, setFilter] = useState('all')
    const [session, setSession] = useState(null)
    const [activeChat, setActiveChat] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
        fetchItems()
    }, [])

    const fetchItems = async () => {
        const { data } = await supabase.from('items').select('*').order('created_at', { ascending: false })
        setItems(data || [])
    }

    const handleDelete = async (itemId) => {
        const confirmDelete = window.confirm("Has this item been resolved? This will remove the post.")
        if (!confirmDelete) return
        const { error } = await supabase.from('items').delete().eq('id', itemId)
        if (!error) setItems(items.filter(i => i.id !== itemId))
    }

    const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter)

    return (
        <div className="pb-20">
            {/* Filters */}
            <div className="flex justify-center gap-4 mb-6 sticky top-20 z-40 bg-gray-50 py-2">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}>All</button>
                <button onClick={() => setFilter('lost')} className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${filter === 'lost' ? 'bg-red-500 text-white' : 'bg-white text-gray-700'}`}>Lost</button>
                <button onClick={() => setFilter('found')} className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${filter === 'found' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'}`}>Found</button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                    <div key={item.id} className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 flex flex-col ${item.type === 'lost' ? 'border-red-500' : 'border-green-500'}`}>

                        {item.image_url && (
                            <div className="h-48 w-full bg-gray-200 relative">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] rounded uppercase font-bold tracking-wider shadow-sm ${item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                    {item.type}
                                </div>
                            </div>
                        )}

                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-black leading-tight">{item.title}</h3>
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{item.description}</p>
                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-2">📍 {item.location}</p>

                            {/* --- CONTACT SECTION --- */}
                            <div className="mt-4 pt-3 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                        <User size={14} className="text-gray-400" />
                                        {item.contact_name || 'Anonymous'}
                                    </div>
                                    {item.contact_phone && (
                                        <a href={`tel:${item.contact_phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">
                                            <Phone size={14} /> Call
                                        </a>
                                    )}
                                </div>

                                <div className="flex justify-between items-center gap-2">
                                    <button onClick={() => setActiveChat(item.id)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-sm">
                                        <MessageCircle size={16} /> Chat
                                    </button>

                                    {session && session.user.id === item.user_id && (
                                        <button onClick={() => handleDelete(item.id)} className="flex items-center justify-center gap-1 text-sm bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {/* ----------------------- */}
                        </div>
                    </div>
                ))}
            </div>

            {activeChat && session && (
                <Chat itemId={activeChat} session={session} onClose={() => setActiveChat(null)} />
            )}
        </div>
    )
}