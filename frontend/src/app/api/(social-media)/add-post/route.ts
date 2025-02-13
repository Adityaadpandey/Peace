import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db as prisma, } from '@/lib/db';
import { PostCategory } from '@prisma/client';

// type PostCategory = 'GENERAL' | 'QUESTION' | 'EXPERIENCE' | 'ADVICE_REQUEST' | 'SUCCESS_STORY' | 'MEDICAL_INFO';

export async function POST(req: Request) {
  // try {
    // Authenticate request
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse JSON data
    // console.log(JSON.parse(await req.text()));


    const { title, content, category, isPrivate } = await req.json();
    // console.log(title, content, category as PostCategory, isPrivate, user.id);
    

    // Validate required fields
    if (!title || !category || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create post with media
    console.log("start");
    const post = await prisma.post.create({
      data: {
        title,
        content,
        category: category,
        isPrivate: isPrivate as boolean,
        userId: user.id,
        // media: media ? media:[]
      },
    });
    console.log("end");
    

    return NextResponse.json(post, { status: 201 });

  // } catch (error) {
  //   console.error('Error creating post:', error);
  //   return NextResponse.json(
  //     { error: 'Failed to create post' },
  //     { status: 500 }
  //   );
  // }
}

// Configure the API route to handle larger file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};