import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, context } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const response = await AIService.generateUserResponse(question, context);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error generating answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

