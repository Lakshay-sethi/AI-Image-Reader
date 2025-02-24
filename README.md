# Image Analysis App with AI-Powered Table Extraction

## Project Description

The Image Analysis App is a web-based tool that leverages artificial intelligence to analyze images and extract tabular data. It provides a user-friendly interface for uploading images from a local file system or capturing them using a device's camera. The app then uses Google's Gemini Generative AI model to process the image and extract any tables present in a format that can be easily copied to a spreadsheet.

Key features of the application include:

- Image upload from local files
- Image capture using device camera
- AI-powered table extraction from images
- Downloadable results in CSV format
- Responsive design using Tailwind CSS

This tool is particularly useful for quickly digitizing printed tables, charts, or structured data from images, saving time on manual data entry and reducing errors.

## Repository Structure

```
my-app/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── camera-button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib/
│   └── utils.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### Key Files:

- `app/page.tsx`: Main application component
- `app/api/chat/route.ts`: API route for image analysis
- `components/ui/camera-button.tsx`: Camera capture component
- `tailwind.config.js` and `tailwind.config.ts`: Tailwind CSS configuration

## Usage Instructions

### Installation

Prerequisites:

- Node.js (v14 or later)
- npm (v6 or later)

Steps:

1. Clone the repository
2. Navigate to the project directory
3. Run `npm install` to install dependencies

### Getting Started

1. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Google API key:

   ```
   GOOGLE_API_KEY=your_api_key_here
   ```

2. Start the development server:

   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Using the Application

1. Upload an image:

   - Click "Choose File" to select an image from your device, or
   - Click "Open Camera" to capture an image using your device's camera

2. Analyze the image:

   - Once an image is uploaded or captured, click "Analyze Image"

3. View and download results:
   - The extracted table data will be displayed on the screen
   - Click "Download" to save the results as a CSV file

### Troubleshooting

Common issues and solutions:

1. Image upload fails

   - Ensure the image file is in a supported format (JPEG, PNG)
   - Check that the file size is within acceptable limits

2. Camera not working

   - Grant necessary permissions for camera access in your browser
   - Try using a different browser if the issue persists

3. Analysis returns unexpected results
   - Ensure the image contains clear, legible tabular data
   - Try adjusting the image quality or lighting conditions

For debugging:

- Check the browser console for any error messages
- Review server logs for API-related issues

## Data Flow

1. User uploads or captures an image
2. Frontend sends image data to `/api/chat` endpoint
3. Backend initializes Google Generative AI model
4. Image is processed by the AI model to extract tabular data
5. Extracted data is sent back to the frontend
6. Frontend displays the results and offers download option

```
[User] -> [Image Upload/Capture] -> [Frontend]
                                        |
                                        v
[AI Model] <- [Backend API] <- [Image Data]
     |
     v
[Extracted Data] -> [Backend API] -> [Frontend]
                                        |
                                        v
                                  [Display Results]
                                        |
                                        v
                                [CSV Download]
```

## Infrastructure

The application uses Next.js with TypeScript and is styled using Tailwind CSS. It leverages the Edge runtime for API routes to ensure fast, scalable performance. The main infrastructure components include:

- Next.js framework for server-side rendering and API routes
- Google Generative AI for image analysis and table extraction
- Tailwind CSS for responsive design and styling
- Edge runtime for API performance optimization

Note: This project does not include a dedicated infrastructure stack (e.g., CloudFormation, CDK, or Terraform). Deployment would typically involve hosting on a platform that supports Next.js applications, such as Vercel or similar services.
