import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    console.log('API route called')
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      console.error('No image file provided')
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    console.log('File received:', file.name, file.type, file.size)

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    console.log('Image converted to base64, calling OpenAI...')

    // Call GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and identify all tab headers that are located in divs with dark blue backgrounds. Return only the tab header names as a JSON array. If no tab headers are found in dark blue backgrounds, return an empty array."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300,
    })

    console.log('OpenAI response received:', response.choices[0]?.message?.content)

    const analysis = response.choices[0]?.message?.content || '[]'
    
    // Try to parse the response as JSON
    let tabHeaders = []
    try {
      tabHeaders = JSON.parse(analysis)
    } catch (error) {
      console.log('Failed to parse JSON, extracting from text:', analysis)
      // If parsing fails, try to extract tab names from text
      const text = analysis.toLowerCase()
      if (text.includes('account')) tabHeaders.push('Account')
      if (text.includes('settings')) tabHeaders.push('Settings')
      if (text.includes('upload')) tabHeaders.push('Upload')
      if (text.includes('items')) tabHeaders.push('Items')
      if (text.includes('billing')) tabHeaders.push('Billing')
      if (text.includes('shipping')) tabHeaders.push('Shipping')
      if (text.includes('accounting')) tabHeaders.push('Accounting')
      if (text.includes('relationships')) tabHeaders.push('Relationships')
      if (text.includes('communication')) tabHeaders.push('Communication')
      if (text.includes('related records')) tabHeaders.push('Related Records')
      if (text.includes('system information')) tabHeaders.push('System Information')
      if (text.includes('custom')) tabHeaders.push('Custom')
      if (text.includes('eft')) tabHeaders.push('EFT')
      if (text.includes('mobile app attachments')) tabHeaders.push('Mobile App Attachments')
    }

    console.log('Final tab headers:', tabHeaders)

    return NextResponse.json({
      success: true,
      tabHeaders,
      analysis: response.choices[0]?.message?.content
    })

  } catch (error) {
    console.error('Error analyzing image:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 