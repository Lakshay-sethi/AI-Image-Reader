import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received request');

    if (!body.messages || !body.messages.length) {
      throw new Error('No messages provided');
    }

    const lastMessage = body.messages[body.messages.length - 1];
    
    if (!lastMessage.imageData) {
      throw new Error('No image data provided');
    }

    // Initialize the Gemini model
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Extract base64 data
    const base64String = lastMessage.imageData.split(',')[1];
    const mimeType = lastMessage.imageData.split(';')[0].split(':')[1];

    // Create the message for Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: lastMessage.content },
            {
              inlineData: {
                data: base64String,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
    });

    // Get the response text
    const response = await result.response;
    const text = response.text();

    // Return regular JSON response
    return new Response(JSON.stringify({ text }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: unknown) {
    console.error('Error in route:', error);
    
    // Type guard to check if error is an Error object
    if (error instanceof Error) {
        return new Response(
            JSON.stringify({ error: error.message }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
    
    // Fallback for non-Error objects
    return new Response(
        JSON.stringify({ error: 'An unexpected error occurred' }), 
        { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}
}
