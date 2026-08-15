/**
 * TripMandi - Posts & News Updates Management Engine
 * Handles Admin Post creation, editing, deleting, pinning, and public user feed rendering.
 */

export type PostCategory = 'Trip Update' | 'News' | 'Announcement' | 'Offers' | 'Fleet Alert';
export type PostStatus = 'Draft' | 'Published';

export interface PostMediaItem {
  id: string;
  mediaType: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  orderIndex: number;
}

export interface PostEntity {
  id: string;
  title: string;
  content: string; // Formatted markdown or rich text
  category: PostCategory;
  status: PostStatus;
  isPinned: boolean;
  authorId: string;
  authorName: string;
  authorRole: string;
  media: PostMediaItem[];
  createdAt: string;
  updatedAt: string;
}

export let postsStore: Record<string, PostEntity> = {
  post_1: {
    id: 'post_1',
    title: '🚀 Grand Launch of Connected Multi-Leg Chandigarh Transfer Hub Routes!',
    content: `We are thrilled to announce the official rollout of our revolutionary **Connected Multi-Leg Routing Engine** for group tours! 

Travelers booking Delhi to Manali can now seamlessly transfer at our dedicated **Chandigarh Tribune Chowk Transfer Hub** with 45-minute layover buffers, automatic luggage handling, and single-PNR ticket passes.

### Highlights:
- **Zero Double Booking**: Cross-leg seat sync locks across connecting buses.
- **24/7 Ground Escort**: Staff assistance at Chandigarh transfer node.
- **Complimentary Refreshments**: Free chai & snacks during transfer layover.`,
    category: 'Announcement',
    status: 'Published',
    isPinned: true,
    authorId: 'usr_admin_1',
    authorName: 'TripMandi Admin Team',
    authorRole: 'Super Admin',
    media: [
      {
        id: 'med_1',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
        orderIndex: 0,
      },
      {
        id: 'med_2',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400&q=80',
        orderIndex: 1,
      },
    ],
    createdAt: '2026-08-14T10:00:00.000Z',
    updatedAt: '2026-08-14T10:00:00.000Z',
  },
  post_2: {
    id: 'post_2',
    title: '🎉 Independence Day Group Special: Flat 15% Cashback & Free PDF Travel Itinerary',
    content: `Celebrate Independence Week with TripMandi! Use promo code **SUPERB60** or **FIRSTTRIP** at checkout to unlock instant wallet cashbacks and guaranteed seat reservations on all luxury Volvo AC Sleepers.

*Offer valid for all bookings made before August 20, 2026.*`,
    category: 'Offers',
    status: 'Published',
    isPinned: false,
    authorId: 'usr_admin_1',
    authorName: 'TripMandi Marketing',
    authorRole: 'Admin',
    media: [
      {
        id: 'med_3',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
        orderIndex: 0,
      },
    ],
    createdAt: '2026-08-12T14:30:00.000Z',
    updatedAt: '2026-08-12T14:30:00.000Z',
  },
  post_3: {
    id: 'post_3',
    title: '🛣️ Highway Advisory: Smooth Traffic Flow on Delhi-Manali National Highway NH-21',
    content: `Our live telemetry team reports clear weather and smooth highway traffic along the entire Delhi-Chandigarh-Mandi-Manali corridor. All Volvo buses are operating on scheduled departure times with live GPS satellite tracking active.`,
    category: 'Fleet Alert',
    status: 'Published',
    isPinned: false,
    authorId: 'usr_admin_1',
    authorName: 'TripMandi Dispatcher',
    authorRole: 'Fleet Manager',
    media: [
      {
        id: 'med_4',
        mediaType: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=400&q=80',
        orderIndex: 0,
      },
    ],
    createdAt: '2026-08-10T08:15:00.000Z',
    updatedAt: '2026-08-10T08:15:00.000Z',
  },
};

// CRUD FUNCTIONS
export function getPublicFeed(categoryFilter?: string): PostEntity[] {
  let posts = Object.values(postsStore).filter((p) => p.status === 'Published');
  if (categoryFilter && categoryFilter !== 'All') {
    posts = posts.filter((p) => p.category === categoryFilter);
  }
  // Sort: Pinned posts first, then newest first
  return posts.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getAllPostsForAdmin(): PostEntity[] {
  return Object.values(postsStore).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createPost(postData: Omit<PostEntity, 'id' | 'createdAt' | 'updatedAt'>): PostEntity {
  const id = `post_${Date.now()}`;
  const now = new Date().toISOString();
  const newPost: PostEntity = {
    ...postData,
    id,
    createdAt: now,
    updatedAt: now,
  };
  postsStore[id] = newPost;
  return newPost;
}

export function updatePost(id: string, updates: Partial<PostEntity>): PostEntity | null {
  if (!postsStore[id]) return null;
  postsStore[id] = {
    ...postsStore[id],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return postsStore[id];
}

export function deletePost(id: string): boolean {
  if (!postsStore[id]) return false;
  delete postsStore[id];
  return true;
}

export function togglePinPost(id: string): PostEntity | null {
  if (!postsStore[id]) return null;
  postsStore[id].isPinned = !postsStore[id].isPinned;
  postsStore[id].updatedAt = new Date().toISOString();
  return postsStore[id];
}
