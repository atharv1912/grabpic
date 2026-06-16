import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGroupById } from '../../services/groups'
import { getMyPhotosInGroup, uploadPhoto } from '../../services/photos'
import { ChevronLeft, UploadCloud, Camera, Image as ImageIcon, Trash2, Download, ExternalLink, Share2, Check } from 'lucide-react'

// Helper for member avatar gradients
const GRADIENTS = [
  'linear-gradient(135deg, #FF6B6B, #FF8E53)',
  'linear-gradient(135deg, #4E65FF, #92EFFD)',
  'linear-gradient(135deg, #5B4AF7, #8B6CF6)',
  'linear-gradient(135deg, #11998e, #38ef7d)',
  'linear-gradient(135deg, #FC466B, #3F5EFB)',
]

function Group() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [myPhotos, setMyPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [backHovered, setBackHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShareCode = async () => {
    const shareText = `Join my event group "${group?.name}" on GrabPic using code: ${group?.joinCode}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: group?.name,
          text: shareText,
          url: window.location.origin
        })
        return
      } catch (err) {
        console.log('Web Share failed or cancelled, falling back to clipboard copy:', err)
      }
    }

    try {
      await navigator.clipboard.writeText(group?.joinCode || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy group code:', err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const [groupData, photosData] = await Promise.all([
        getGroupById(id),
        getMyPhotosInGroup(id),
      ])
      setGroup(groupData)
      setMyPhotos(photosData)
      setLoading(false)
    }
    fetchData()
  }, [id])

  // Handle selected file and preview
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [selectedFile])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setSelectedFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    const result = await uploadPhoto(id, selectedFile)
    alert(result.message)
    const photosData = await getMyPhotosInGroup(id)
    setMyPhotos(photosData)
    setSelectedFile(null)
    setUploading(false)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-57px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 rounded-full border-[3px] border-t-transparent animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading group details…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6 min-h-[calc(100vh-57px)]">

      {/* Back navigation */}
      <button
        onClick={() => navigate('/dashboard')}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
        className="self-start flex items-center gap-1 text-sm font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ChevronLeft
          size={16}
          className="transition-transform duration-200"
          style={{ transform: backHovered ? 'translateX(-3px)' : 'translateX(0)' }}
        />
        <span>Back to Dashboard</span>
      </button>

      {/* Group Header Card */}
      <div
        className="relative p-6 rounded-2xl overflow-hidden"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Subtle accent vertical ribbon */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ background: 'linear-gradient(to bottom, var(--accent), #8B6CF6)' }}
        />

        <div className="flex items-center justify-between gap-6 flex-wrap pl-2">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {group.name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Event Photo Group • {group.members.length} members
              </p>
              <span className="w-1 h-1 rounded-full bg-stone-300 hidden sm:inline-block" />
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  Code: {group.joinCode}
                </span>
                <button
                  onClick={handleShareCode}
                  className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all duration-150 cursor-pointer active:scale-[0.98]"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Share2 size={11} />}
                  <span>{copied ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Member avatars list */}
          <div className="flex items-center gap-2 flex-wrap">
            {group.members.map((member, i) => (
              <div
                key={member}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-xs transition-transform duration-200 hover:scale-[1.03]"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                }}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-extrabold text-white"
                  style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                >
                  {getInitials(member)}
                </span>
                <span>{member}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <Camera size={16} />
          </div>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Upload a Photo</h2>
        </div>

        {/* Upload drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className="rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 relative"
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
            background: dragOver ? 'var(--accent-soft)' : 'var(--bg)',
          }}
        >
          {previewUrl && selectedFile ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-[280px]">
              <div className="relative group rounded-lg overflow-hidden border shadow-sm h-32 w-full bg-stone-100">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full text-white bg-black/60 hover:bg-red-600 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="text-xs font-semibold truncate max-w-full" style={{ color: 'var(--text-secondary)' }}>
                {selectedFile.name}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-transform duration-300"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  transform: dragOver ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <UploadCloud size={20} />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Drag & drop your event photo here
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Supports JPG, PNG or WEBP
              </p>

              <label
                className="mt-3 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer shadow-xs"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--surface-alt)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--surface)'
                }}
              >
                Browse Files
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          )}

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-2 px-6 py-2.5 text-xs font-bold text-white rounded-lg transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 2px 8px var(--accent-ring)',
              }}
              onMouseEnter={e => { if (!uploading) e.currentTarget.style.background = 'var(--accent-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)' }}
            >
              {uploading ? 'Uploading…' : 'Start Processing'}
            </button>
          )}
        </div>
      </div>

      {/* Photo Grid Section */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <ImageIcon size={16} />
            </div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Your Photos in this Group
            </h2>
          </div>

          {myPhotos.length > 0 && (
            <span
              className="px-2.5 py-1 text-xs font-bold rounded-full"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              {myPhotos.length} moments
            </span>
          )}
        </div>

        {myPhotos.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center p-12 rounded-xl"
            style={{ border: '2px dashed var(--border)', background: 'var(--bg)' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3"
              style={{ background: 'var(--surface)' }}
            >
              🔍
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              No photos of you found yet
            </p>
            <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
              Upload your photos from this event. If our AI finds matches of your face, they will automatically appear here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {myPhotos.map(photo => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PhotoCard({ photo }) {
  const [hovered, setHovered] = useState(false)

  const handleDownload = (url) => {
    // Basic download trigger
    const link = document.createElement('a')
    link.href = url
    link.download = `grabpic-${photo.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative overflow-hidden rounded-xl transition-all duration-300"
      style={{
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        background: 'var(--surface)',
      }}
    >
      <div className="overflow-hidden h-52 bg-[var(--surface-alt)] relative">
        <img
          src={photo.url}
          alt="Your photo"
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
        />

        {/* Elegant overlay panel showing actions on hover */}
        <div
          className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => handleDownload(photo.url)}
              className="p-2 rounded-lg bg-white/95 text-stone-850 hover:bg-white hover:text-indigo-600 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm"
              title="Download photo"
            >
              <Download size={14} />
            </button>
            <a
              href={photo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/95 text-stone-850 hover:bg-white hover:text-indigo-600 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm"
              title="Open full size"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          borderTop: '1px solid var(--border-light)',
          background: 'var(--surface)',
        }}
      >
        <span className="text-[11px] font-semibold text-stone-400">
          Uploaded by
        </span>
        <span className="text-xs font-bold truncate" style={{ color: 'var(--text-secondary)' }}>
          {photo.uploadedBy}
        </span>
      </div>
    </div>
  )
}

export default Group