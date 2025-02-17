"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CameraButton } from "@/components/ui/camera-button"

export default function ImageAnalysisApp() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const convertBlobToBase64 = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64String = await convertBlobToBase64(file);
        setImageUrl(base64String);
      } catch (error) {
        console.error('Error converting image:', error);
      }
    }
  }

  const handleCameraCapture = (imageData: string) => {
    setImageUrl(imageData);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleAnalyzeImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!imageUrl) {
      console.error('No image selected')
      return
    }

    setIsLoading(true)

    try {
      const userMessage = {
        role: 'user',
        content: input || 'Analyze this image'
      };

      // Add user message to messages
      setMessages(prev => [...prev, userMessage]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              ...userMessage,
              imageData: imageUrl
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();

      // Add AI response to messages
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.text
      }]);

      // Clear input
      setInput('');

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const downloadLatestResponse = () => {
  const latestAIMessage = messages.findLast(message => message.role === 'assistant');
  
  if (!latestAIMessage) {
    return; // No AI messages to download
  }

  // Create blob from the content
  const blob = new Blob([latestAIMessage.content], { type: 'text/plain' });
  
  // Create temporary link element
  const element = document.createElement('a');
  element.href = URL.createObjectURL(blob);
  element.download = 'ai-response.txt';
  
  // Simulate click to trigger download
  document.body.appendChild(element);
  element.click();
  
  // Clean up
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
};

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Image Analysis App</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="mb-2" 
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <CameraButton onCapture={handleCameraCapture} />
              </div>
            </div>
            {imageUrl && (
              <div className="relative w-[300px] h-[300px]">
                <Image
                  src={imageUrl}
                  alt="Uploaded image"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            )}
          </div>
          <form onSubmit={handleAnalyzeImage} className="space-y-2">
            <Input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question about the image"
              className="w-full"
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !imageUrl}
            >
              {isLoading ? "Analyzing..." : "Analyze Image"}
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            {messages.map((message, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <p>
                      <strong>{message.role === "user" ? "You: " : "AI: "}</strong>
                      {message.content}
                    </p>
                    {message.role === "assistant" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadLatestResponse()}
                        className="ml-2"
                      >
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
