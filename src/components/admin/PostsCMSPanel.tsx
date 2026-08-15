'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  X,
  Pin,
  Image as ImageIcon,
  Video as VideoIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Tag,
  Upload,
} from 'lucide-react';
import {
  postsStore,
  createPost,
  updatePost,
  deletePost,
  togglePinPost,
  PostEntity,
  PostCategory,
  PostStatus,
  PostMediaItem,
} from '@/lib/postsManager';

export default function PostsCMSPanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostEntity | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Trip Update' as PostCategory,
    status: 'Published' as PostStatus,
    isPinned: false,
    media: [] as PostMediaItem[],
  });

  const [deletingPost, setDeletingPost] = useState<PostEntity | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const allPosts = Object.values(postsStore).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredPosts = allPosts.filter((p) => {
    const matchCategory = activeFilterCategory === 'All' || p.category === activeFilterCategory;
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      updatePost(editingPost.id, {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        status: formData.status,
        isPinned: formData.isPinned,
        media: formData.media,
      });
      setToast(`Post "${formData.title}" updated successfully.`);
    } else {
      createPost({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        status: formData.status,
        isPinned: formData.isPinned,
        authorId: 'usr_admin_1',
        authorName: 'TripMandi Admin',
        authorRole: 'Super Admin',
        media: formData.media,
      });
      setToast(`New Post "${formData.title}" published!`);
    }
    setModalOpen(false);
    setEditingPost(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleConfirmDelete = () => {
    if (!deletingPost) return;
    deletePost(deletingPost.id);
    setToast(`Post "${deletingPost.title}" deleted.`);
    setDeletingPost(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleTogglePin = (postId: string) => {
    const res = togglePinPost(postId);
    if (res) {
      setToast(`Post pin status updated to: ${res.isPinned ? 'Pinned to Top' : 'Standard'}`);
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl text-slate-900 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-between shadow-sm">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-600" /> Posts & News CMS Management
          </h2>
          <p className="text-xs text-slate-500">Create, edit, pin, and manage public announcements, trip updates, and news posts.</p>
        </div>

        <button
          onClick={() => {
            setEditingPost(null);
            setFormData({
              title: '',
              content: '',
              category: 'Trip Update',
              status: 'Published',
              isPinned: false,
              media: [],
            });
            setModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> + Create New Post
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1.5 rounded-2xl">
          {['All', 'Trip Update', 'News', 'Announcement', 'Offers', 'Fleet Alert'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilterCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilterCategory === cat ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">Title & Category</th>
              <th className="p-3">Media Attachments</th>
              <th className="p-3">Status</th>
              <th className="p-3">Pinned</th>
              <th className="p-3">Published Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {filteredPosts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition">
                <td className="p-3 max-w-sm">
                  <div className="font-extrabold text-slate-900 line-clamp-1">{p.title}</div>
                  <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 mt-1 inline-block">
                    {p.category}
                  </span>
                </td>
                <td className="p-3">
                  <span className="font-mono text-slate-600 font-bold">
                    {p.media?.length || 0} media file(s)
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    p.status === 'Published' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleTogglePin(p.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer ${
                      p.isPinned ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Pin className="w-3 h-3" /> {p.isPinned ? 'Pinned' : 'Pin'}
                  </button>
                </td>
                <td className="p-3 font-mono text-slate-600 text-[11px]">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-right space-x-1">
                  <button
                    onClick={() => {
                      setEditingPost(p);
                      setFormData({
                        title: p.title,
                        content: p.content,
                        category: p.category,
                        status: p.status,
                        isPinned: p.isPinned,
                        media: p.media || [],
                      });
                      setModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingPost(p)}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-[11px]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POST CREATION & EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-2xl w-full bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingPost ? 'Edit Announcement Post' : 'Create New Announcement / News Post'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Post Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🎉 Special Independence Day Group Tour Discount"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                  >
                    <option value="Trip Update">Trip Update</option>
                    <option value="News">News</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Offers">Offers</option>
                    <option value="Fleet Alert">Fleet Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span>📌 Pin to Top</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Content / Description (Markdown & Formatted Text) *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write post details, itinerary notes, promo codes, highway advisory..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed font-sans"
                />
              </div>

              {/* MEDIA ATTACHMENTS SECTION */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Media Attachments (Photos & Videos)</label>
                  <label className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold cursor-pointer inline-flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload File
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach((file) => {
                          const reader = new FileReader();
                          const isVideo = file.type.startsWith('video/');
                          reader.onloadend = () => {
                            if (reader.result) {
                              setFormData((prev) => ({
                                ...prev,
                                media: [
                                  ...prev.media,
                                  {
                                    id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                                    mediaType: isVideo ? 'video' : 'image',
                                    url: reader.result as string,
                                    orderIndex: prev.media.length,
                                  },
                                ],
                              }));
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                  </label>
                </div>

                {/* Direct URL Input for Media */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 p-1.5 rounded-xl">
                  <input
                    type="text"
                    id="cmsMediaUrlInput"
                    placeholder="Or paste photo/video URL..."
                    className="flex-1 bg-transparent px-2 text-xs text-slate-900 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('cmsMediaUrlInput') as HTMLInputElement;
                      if (el && el.value.trim()) {
                        const url = el.value.trim();
                        const isVideo = url.endsWith('.mp4') || url.endsWith('.mov') || url.includes('video') || url.includes('youtube');
                        setFormData((prev) => ({
                          ...prev,
                          media: [
                            ...prev.media,
                            {
                              id: `med_${Date.now()}`,
                              mediaType: isVideo ? 'video' : 'image',
                              url,
                              orderIndex: prev.media.length,
                            },
                          ],
                        }));
                        el.value = '';
                      }
                    }}
                    className="px-2.5 py-1 bg-slate-900 text-white font-bold text-[11px] rounded-lg"
                  >
                    Add URL
                  </button>
                </div>

                {/* Media Preview Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {formData.media.map((item, idx) => (
                    <div key={item.id || idx} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                      {item.mediaType === 'image' ? (
                        <img src={item.url} alt="Media" className="w-full h-24 object-cover" />
                      ) : (
                        <video src={item.url} className="w-full h-24 object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            media: prev.media.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 cursor-pointer"
              >
                {editingPost ? 'Save Post Changes' : 'Publish Announcement Post'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md font-sans">
          <div className="max-w-md w-full bg-white border-2 border-red-600 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Delete Post Entry?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-900">"{deletingPost.title}"</strong>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingPost(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-extrabold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
