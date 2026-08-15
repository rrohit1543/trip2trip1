'use client';

import React, { useState } from 'react';
import {
  FileText,
  Pin,
  Tag,
  Clock,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  PlayCircle,
  Share2,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { postsStore, getPublicFeed, PostEntity, PostCategory } from '@/lib/postsManager';

export default function PublicPostsFeed() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [activeMediaModal, setActiveMediaModal] = useState<string | null>(null);

  const posts = getPublicFeed(selectedCategory);

  const toggleExpand = (postId: string) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 font-sans text-slate-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <FileText className="w-4 h-4" /> Live Announcements & Travel News
        </div>
        <h1 className="text-3xl font-black tracking-tight">TripMandi Posts & Highway Updates</h1>
        <p className="text-xs md:text-sm text-red-100 max-w-xl leading-relaxed">
          Stay updated with ground weather advisories, festival offers, new connected tour routes, and highway updates directly from our dispatchers.
        </p>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar">
          {['All', 'Trip Update', 'News', 'Announcement', 'Offers', 'Fleet Alert'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-red-600 shadow-md font-black'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed Grid */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-3xl space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-700">No Posts Found</h3>
            <p className="text-xs text-slate-400">No active announcements under category "{selectedCategory}".</p>
          </div>
        ) : (
          posts.map((post) => {
            const isExpanded = expandedPosts[post.id];
            const isLong = post.content.length > 280;
            const displayContent = isLong && !isExpanded ? `${post.content.slice(0, 280)}...` : post.content;

            return (
              <article
                key={post.id}
                className={`bg-white border-2 ${
                  post.isPinned ? 'border-red-600 shadow-xl' : 'border-slate-200 shadow-md'
                } rounded-3xl p-6 space-y-4 transition`}
              >
                {/* Pinned Badge & Category Metadata */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <span className="bg-red-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Pin className="w-3 h-3" /> Pinned Post
                      </span>
                    )}
                    <span className="bg-red-50 text-red-700 border border-rose-200 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Post Title & Author */}
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-snug">{post.title}</h2>
                  <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                    <span>By <strong className="text-slate-900 font-bold">{post.authorName}</strong></span>
                    <span>•</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold text-[10px]">{post.authorRole}</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="text-xs md:text-sm text-slate-700 leading-relaxed space-y-2 font-sans whitespace-pre-line">
                  {displayContent}
                  {isLong && (
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="text-red-600 font-bold hover:underline inline-flex items-center gap-1 text-xs ml-1 cursor-pointer block mt-2"
                    >
                      {isExpanded ? <>Show Less <ChevronUp className="w-3.5 h-3.5" /></> : <>Read More <ChevronDown className="w-3.5 h-3.5" /></>}
                    </button>
                  )}
                </div>

                {/* Interactive Media Carousel & Video Viewer */}
                {post.media && post.media.length > 0 && (
                  <div className="pt-2">
                    <div className={`grid ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                      {post.media.map((med, idx) => (
                        <div
                          key={med.id || idx}
                          onClick={() => setActiveMediaModal(med.url)}
                          className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-950 cursor-pointer shadow-sm"
                        >
                          {med.mediaType === 'image' ? (
                            <img
                              src={med.url}
                              alt={post.title}
                              className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="relative w-full h-56 bg-slate-900 flex items-center justify-center">
                              <video src={med.url} controls className="w-full h-56 object-cover" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Lightbox Modal */}
      {activeMediaModal && (
        <div
          onClick={() => setActiveMediaModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md font-sans cursor-pointer"
        >
          <div className="max-w-4xl w-full max-h-[90vh] flex items-center justify-center relative">
            <img src={activeMediaModal} alt="Preview" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
