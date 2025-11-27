import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function PostItem({ session }) {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'lost',
    contact_name: '',
    contact_phone: '',
    image: null
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    // 1. Upload Image
    let publicUrl = null
    if (formData.image) {
      const file = formData.image
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, file)

      if (uploadError) {
        alert('Error uploading image: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data } = supabase.storage.from('item-images').getPublicUrl(filePath)
      publicUrl = data.publicUrl
    }

    // 2. Save to Database
    const { error: dbError } = await supabase.from('items').insert([{
      title: formData.title,
      description: formData.description,
      location: formData.location,
      type: formData.type,
      contact_name: formData.contact_name,
      contact_phone: formData.contact_phone,
      image_url: publicUrl,
      user_id: session.user.id
    }])

    if (dbError) alert(dbError.message)
    else navigate('/')

    setUploading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-lg mx-auto pb-24">
      <h2 className="text-xl font-bold text-black">Post an Item</h2>

      <div className="flex gap-4 p-2 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-2 text-black cursor-pointer w-1/2 justify-center">
          <input type="radio" name="type" checked={formData.type === 'lost'} onChange={() => setFormData({ ...formData, type: 'lost' })} />
          Lost
        </label>
        <label className="flex items-center gap-2 text-black cursor-pointer w-1/2 justify-center">
          <input type="radio" name="type" checked={formData.type === 'found'} onChange={() => setFormData({ ...formData, type: 'found' })} />
          Found
        </label>
      </div>

      <div className="space-y-3">
        <input className="w-full p-3 border rounded-lg bg-white text-black" placeholder="Item Name (e.g. Blue Backpack)" required
          onChange={e => setFormData({ ...formData, title: e.target.value })} />

        <textarea className="w-full p-3 border rounded-lg bg-white text-black h-24" placeholder="Description..." required
          onChange={e => setFormData({ ...formData, description: e.target.value })} />

        <input className="w-full p-3 border rounded-lg bg-white text-black" placeholder="Location (e.g. Library)" required
          onChange={e => setFormData({ ...formData, location: e.target.value })} />

        {/* --- NEW CONTACT FIELDS --- */}
        <div className="grid grid-cols-2 gap-3">
          <input className="w-full p-3 border rounded-lg bg-white text-black" placeholder="Your Name" required
            onChange={e => setFormData({ ...formData, contact_name: e.target.value })} />

          <input className="w-full p-3 border rounded-lg bg-white text-black" placeholder="Phone Number" required type="tel"
            onChange={e => setFormData({ ...formData, contact_phone: e.target.value })} />
        </div>
        {/* -------------------------- */}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input type="file" accept="image/*" className="w-full text-black"
            onChange={e => setFormData({ ...formData, image: e.target.files[0] })} />
        </div>
      </div>

      <button disabled={uploading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg">
        {uploading ? 'Uploading...' : 'Post Item'}
      </button>
    </form>
  )
}