# AI-Powered Image Analysis App with Real-Time Camera Integration

This Next.js application enables users to analyze images using Google's Generative AI, providing instant AI-powered responses to questions about uploaded or captured images. The app combines modern UI components with advanced image processing capabilities to deliver a seamless user experience.

The application leverages the Gemini-1.5-flash model to provide detailed analysis of images through a conversational interface. Users can either upload images from their device or capture them in real-time using the device's camera. The app features a clean, responsive design built with Tailwind CSS and supports both light and dark modes. Each analysis response can be downloaded for future reference, making it perfect for research, documentation, or sharing insights.

## Repository Structure
```
my-app/
├── app/                      # Next.js app directory containing core application logic
│   ├── api/                 # API routes for backend functionality
│   │   └── chat/           # Image analysis endpoint using Google Generative AI
│   ├── layout.tsx          # Root layout with font configuration
│   └── page.tsx            # Main application page with image analysis interface
├── components/             # Reusable UI components
│   └── ui/                # Core UI components (buttons, inputs, cards, camera)
├── lib/                   # Utility functions and shared code
└── config files          # Application configuration (TypeScript, Tailwind, Next.js)
```

## Usage Instructions
### Prerequisites
- Node.js 16.x or later
- Google API key with access to Generative AI services
- Modern web browser with camera access capabilities
- Environment variable setup:
  - `GOOGLE_API_KEY`: Your Google Generative AI API key

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd my-app

# Install dependencies
npm install

# Set up environment variables
echo "GOOGLE_API_KEY=your_api_key_here" > .env.local

# Start development server
npm run dev
```

### Quick Start
1. Access the application at `http://localhost:3000`
2. Upload an image:
   - Click "Choose File" to select an image from your device
   - Or use "Open Camera" to capture a new image
3. Enter a question about the image in the text input
4. Click "Analyze Image" to receive AI-powered analysis
5. View the conversation history below
6. Download responses using the "Download" button

### More Detailed Examples
```typescript
// Upload an image programmatically
const fileInput = document.querySelector('input[type="file"]');
const file = new File([''], 'example.jpg', { type: 'image/jpeg' });
Object.defineProperty(fileInput, 'files', { value: [file] });

// Capture image from camera
const cameraButton = document.querySelector('.camera-button');
cameraButton.click();
// Wait for camera access and take photo
```

### Troubleshooting
1. Camera Access Issues
   - Error: "Permission denied"
   - Solution: Grant camera permissions in browser settings
   - Path: Settings > Privacy > Camera

2. Image Upload Failures
   - Check file size (max 10MB recommended)
   - Verify supported formats (JPEG, PNG)
   - Enable console logging: `localStorage.setItem('debug', 'true')`

3. API Response Errors
   - Verify GOOGLE_API_KEY is set correctly
   - Check network tab for response status
   - Enable verbose logging in development:
     ```bash
     NODE_ENV=development npm run dev
     ```

## Data Flow
The application processes images and generates analysis through a streamlined pipeline.

```ascii
User Input       API Processing          Response
[Image] -----> [Gemini AI Model] -----> [Analysis]
   |              |                         |
   |              |                         |
[Question] --> [Context] --------------> [Display]
```

Key component interactions:
1. User uploads image or captures via camera
2. Image is converted to base64 format
3. User question combined with image data
4. Request sent to /api/chat endpoint
5. Gemini AI processes the request
6. Response streamed back to frontend
7. UI updates with analysis results
