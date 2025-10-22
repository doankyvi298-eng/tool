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
    "HTTP-Referer": "https://nanobanana.ai",
    "X-Title": "Nano Banana",
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
  } catch (error) {
    console.error('Error generating image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
