import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketDescription, conversationHistory, count, ticketContext } = body;

    if (!ticketDescription) {
      return NextResponse.json(
        { error: 'Ticket description is required' },
        { status: 400 }
      );
    }

    const options = await AIService.generateResponseOptions(
      ticketDescription,
      conversationHistory || [],
      count || 3,
      ticketContext
    );

    return NextResponse.json({ options });
  } catch (error) {
    console.error('Error generating responses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

