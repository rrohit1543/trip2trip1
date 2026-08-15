import { NextResponse } from 'next/server';
import {
  getPublicFeed,
  getAllPostsForAdmin,
  createPost,
} from '@/lib/postsManager';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const adminView = searchParams.get('admin') === 'true';

  if (adminView) {
    const posts = getAllPostsForAdmin();
    return NextResponse.json({ success: true, posts });
  }

  const posts = getPublicFeed(category);
  return NextResponse.json({ success: true, posts });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.content) {
      return NextResponse.json({ success: false, error: 'Title and content are required fields' }, { status: 400 });
    }

    const newPost = createPost({
      title: body.title,
      content: body.content,
      category: body.category || 'Trip Update',
      status: body.status || 'Published',
      isPinned: Boolean(body.isPinned),
      authorId: body.authorId || 'usr_admin_1',
      authorName: body.authorName || 'TripMandi Admin',
      authorRole: body.authorRole || 'Super Admin',
      media: body.media || [],
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
