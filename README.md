# YouTube Downloader

A clean, minimal YouTube video and audio downloader built with Next.js 16, TypeScript, shadcn/ui, yt-dlp, and FFmpeg.

![License](https://img.shields.io/badge/license-Personal%20Use-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- 🎬 **Video Downloader** - Download YouTube videos in multiple qualities (360p to 4K)
- 🎵 **Audio Downloader** - Extract audio in MP3 or M4A format
- 🎨 **Clean UI** - Minimal, distraction-free design using shadcn/ui
- 🔒 **Secure** - Rate limiting, input sanitization, no data storage
- ⚡ **Fast** - Direct streaming downloads, no server-side storage

## Prerequisites

Before running this project, you need to install:

### 1. yt-dlp

**Windows:**

```powershell
winget install yt-dlp
# Or download from: https://github.com/yt-dlp/yt-dlp/releases
```

**macOS:**

```bash
brew install yt-dlp
```

**Linux:**

```bash
pip install yt-dlp
# Or: apt install yt-dlp
```

### 2. FFmpeg

**Windows:**

```powershell
winget install ffmpeg
# Or download from: https://ffmpeg.org/download.html
```

**macOS:**

```bash
brew install ffmpeg
```

**Linux:**

```bash
apt install ffmpeg
```

### Verify Installation

```bash
yt-dlp --version
ffmpeg -version
```

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd youtube-v2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🐳 Docker Deployment (Recommended)

The easiest way to run this application is using Docker. No need to install yt-dlp or FFmpeg manually!

### Quick Start with Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t youtube-downloader .
docker run -d -p 3000:3000 --name youtube-downloader youtube-downloader
```

### Access the Application

Open http://localhost:3000 in your browser.

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop the container
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# Check container status
docker ps
```

### Deploy to Cloud

You can deploy this Docker image to any cloud platform:

- **Railway**: Connect your repo and deploy automatically
- **Render**: Use the Dockerfile for deployment
- **DigitalOcean App Platform**: Deploy from container registry
- **AWS ECS / Google Cloud Run**: Push image and deploy

## Project Structure

```
youtube-v2/
├── app/
│   ├── api/
│   │   ├── video/
│   │   │   ├── info/route.ts      # Video metadata endpoint
│   │   │   └── download/route.ts  # Video download endpoint
│   │   └── audio/
│   │       ├── info/route.ts      # Audio metadata endpoint
│   │       └── download/route.ts  # Audio download endpoint
│   ├── video/page.tsx             # Video downloader page
│   ├── audio/page.tsx             # Audio downloader page
│   ├── layout.tsx                 # Root layout with navbar
│   └── page.tsx                   # Home page
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── navbar.tsx                 # Navigation bar
│   ├── url-input.tsx              # YouTube URL input
│   ├── video-info-card.tsx        # Video metadata display
│   ├── video-quality-selector.tsx # Video quality picker
│   ├── audio-quality-selector.tsx # Audio format/quality picker
│   └── disclaimer.tsx             # Legal disclaimer
└── lib/
    ├── youtube.ts                 # URL validation, types
    ├── ytdlp.ts                   # yt-dlp wrapper
    ├── rate-limit.ts              # Rate limiting
    └── utils.ts                   # General utilities
```

## yt-dlp Command Examples

### 1. List Available Formats

```bash
yt-dlp -F "https://www.youtube.com/watch?v=VIDEO_ID"
```

### 2. Download Video with Specific Quality

```bash
# Download 1080p video with best audio
yt-dlp -f "137+bestaudio" --merge-output-format mp4 -o "video.mp4" "URL"

# Download best quality up to 1080p
yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" --merge-output-format mp4 -o "video.mp4" "URL"
```

### 3. Extract Audio Only

```bash
# Extract as MP3 (best quality)
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "audio.mp3" "URL"

# Extract as M4A (medium quality)
yt-dlp -x --audio-format m4a --audio-quality 5 -o "audio.m4a" "URL"
```

### 4. Get Video Metadata as JSON

```bash
yt-dlp -j --no-download "URL"
```

## FFmpeg Audio Conversion Example

```bash
# Convert WebM to MP3
ffmpeg -i input.webm -vn -acodec libmp3lame -q:a 2 output.mp3

# Convert to M4A with AAC
ffmpeg -i input.webm -vn -acodec aac -b:a 192k output.m4a
```

## API Reference

### POST /api/video/info

Fetch video metadata.

**Request:**

```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**

```json
{
  "id": "VIDEO_ID",
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 240,
  "durationFormatted": "4:00",
  "channel": "Channel Name",
  "formats": [
    {
      "formatId": "137",
      "resolution": "1080p",
      "filesize": 100000000
    }
  ]
}
```

### GET /api/video/download

Download video file.

**Query Parameters:**

- `url` - YouTube URL
- `formatId` - Format ID from metadata
- `needsAudioMerge` - Whether to merge audio (true/false)
- `title` - Video title for filename

### POST /api/audio/info

Fetch audio metadata (same as video info, returns audio-relevant data).

### GET /api/audio/download

Download audio file.

**Query Parameters:**

- `url` - YouTube URL
- `format` - Audio format (mp3/m4a)
- `quality` - Quality level (best/medium/low)
- `title` - Title for filename

## Security Features

- **Rate Limiting**: 10 requests per minute per IP
- **Concurrent Download Limit**: Max 3 simultaneous downloads per IP
- **Input Sanitization**: URLs are sanitized to prevent command injection
- **No Permanent Storage**: Files are streamed directly, no server storage

## UI/UX Design

The interface follows a **clean, minimal, and elegant design**:

- **Colors**: Neutral palette (white, soft gray, slate)
- **Typography**: Inter font for clean readability
- **Layout**: Card-based with calm spacing
- **Shadows**: Subtle for depth without distraction
- **Navigation**: Simple top navbar with clear sections

## Tech Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Framework        | Next.js 16 (App Router) |
| Language         | TypeScript              |
| Styling          | Tailwind CSS            |
| UI Components    | shadcn/ui               |
| Media Processing | yt-dlp + FFmpeg         |
| Rate Limiting    | LRU Cache               |

## Environment Variables (Optional)

```env
# Custom paths for yt-dlp and FFmpeg (if not in PATH)
YTDLP_PATH=/path/to/yt-dlp
FFMPEG_PATH=/path/to/ffmpeg
```

## Disclaimer

⚠️ **This tool is for personal use only.** Users are responsible for complying with YouTube's Terms of Service. Do not use this tool to download copyrighted content without permission.

## License

This project is for personal use only. Not for commercial distribution.
