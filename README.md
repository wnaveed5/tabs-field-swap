# Drag & Drop Form Builder with AI Image Analysis

A Next.js application that allows users to create dynamic forms with drag-and-drop functionality and AI-powered image analysis to automatically detect and create form tabs.

## Features

- 🎯 **Drag & Drop Interface** - Built with DnD Kit for smooth field reordering
- 🤖 **AI Image Analysis** - Upload images to automatically detect form tabs using OpenAI Vision
- 💾 **Save Functionality** - Export form data to JSON files and localStorage
- 📱 **Responsive Design** - Modern UI with shadcn/ui components
- 🔄 **Dynamic Tab Creation** - Automatically create tabs from uploaded images

## Environment Setup

Before running the application, you need to set up your environment variables:

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
