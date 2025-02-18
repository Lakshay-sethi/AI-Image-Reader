"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CameraButton } from "@/components/ui/camera-button"
import { 
  Document, 
  Paragraph, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle,
  AlignmentType,
  Packer
} from 'docx';


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

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInput(e.target.value);
  // };

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
        content: input || 'Extract the table'
     //   'Analyze this image'
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

  // Convert the content to CSV format
  // Assuming the content might have commas or new lines, we'll escape them
  const csvContent = latestAIMessage.content
    .split('\n')
    .map(row => 
      row.split(',')
        .map(cell => `"${cell.replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  
  // Create blob with CSV mime type
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create temporary link element
  const element = document.createElement('a');
  element.href = URL.createObjectURL(blob);
  element.download = 'ai-response.csv';
  
  // Simulate click to trigger download
  document.body.appendChild(element);
  element.click();
  
  // Clean up
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
};

const formatCSVToLabels = (csvContent: string) => {
    const lines = csvContent.trim().split(/\r?\n/);
    const dataRows = lines.slice(1);
    
    return dataRows.map(row => {
      const values = row.split(',');
      if (values.length >= 5) {
        const name = values[0].trim();
        const measurements = `${values[1]}/${values[2]}/${values[3]}/${values[4]}`;
        return `${name}\n${measurements}`;
      }
      return '';
    }).filter(label => label !== '');
  };

  const createLabelDocument = async (content: string) => {
    const labels = formatCSVToLabels(content);
    
    const rows = [];
    let labelIndex = 0;
    
    for (let i = 0; i < 7; i++) {
      const cells = [];
      for (let j = 0; j < 3; j++) {
        const labelContent = labelIndex < labels.length ? labels[labelIndex] : '';
        labelIndex++;
        
        cells.push(
          new TableCell({
            width: {
              size: 2500,
              type: WidthType.DXA,
            },
            margins: {
              top: 150,
              bottom: 150,
              left: 150,
              right: 150,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
            children: [
              new Paragraph({
                text: labelContent,
                spacing: {
                  line: 300,
                },
                alignment: AlignmentType.CENTER,
              }),
            ],
          })
        );
      }
      rows.push(new TableRow({ children: cells }));
    }

    const table = new Table({
      rows: rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 500,
              right: 500,
              bottom: 500,
              left: 500,
            },
          },
        },
        children: [table],
      }],
    });

    return await Packer.toBuffer(doc);
  };

  const downloadLabels = async () => {
    const latestAIMessage = messages.findLast(message => message.role === 'assistant');
    
    if (!latestAIMessage) {
      return;
    }

    try {
      const buffer = await createLabelDocument(latestAIMessage.content);
      
      // Convert buffer to blob
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'labels.docx';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error creating labels:', error);
    }
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
            {/* <Input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question about the image"
              className="w-full"
            /> */}
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
                      <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadLatestResponse()}
                      className="ml-2"
                    >
                      Download CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadLabels}
                      className="ml-2"
                    >
                      Create Labels
                    </Button>
                  </div>
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
