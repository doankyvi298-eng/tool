import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface ImageData {
  type: string;
  image_url: {
    url: string;
  };
}

interface ExtendedMessage {
  role: string;
  content: string | null;
  images?: ImageData[];
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002",
    "X-Title": "Nano Banana AI Editor",
  },
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt } = await request.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: 'Image URL and prompt are required' },
        { status: 400 }
      );
    }

    // Verify API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('Making request to OpenRouter API...');
    console.log('Model:', "google/gemini-2.5-flash-image-preview");
    console.log('Prompt length:', prompt.length);

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
    });

    // Log the full response to see what we're getting
    console.log('Full API Response:', JSON.stringify(completion, null, 2));
    console.log('Message content:', completion.choices[0].message);

    const message = completion.choices[0].message as ExtendedMessage;
    const responseText = message.content;
    const images = message.images || [];

    return NextResponse.json({
      success: true,
      result: responseText,
      images: images,
      hasImages: images.length > 0
    });
  } catch (error: any) {
    console.error('Error generating image:', error);

    // Handle OpenRouter specific errors
    if (error.response) {
      console.error('OpenRouter API Error:', error.response.status, error.response.data);
      return NextResponse.json(
        {
          error: error.response.data?.error?.message || 'OpenRouter API error',
          details: error.response.data
        },
        { status: error.response.status }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
