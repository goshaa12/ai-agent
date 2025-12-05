import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const summary = await AIService.summarizeConversation(messages);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

