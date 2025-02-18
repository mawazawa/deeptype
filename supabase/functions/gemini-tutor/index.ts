
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables')
    }

    const { text, target, wpm, accuracy } = await req.json()

    console.log('Received request:', { text, target, wpm, accuracy })

    // Call Google Gemini API with proper error logging
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `As a typing tutor, analyze this typing performance and give constructive feedback:
              Target text: "${target}"
              User typed: "${text}"
              Speed: ${wpm} WPM
              Accuracy: ${accuracy}%
              
              Give specific, encouraging feedback about their performance and tips for improvement.
              Keep the response under 3 sentences.`
          }]
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Gemini API error: ${response.statusText} - ${errorData}`)
    }

    const data = await response.json()
    console.log('Gemini API response:', data)

    const feedback = data.candidates[0].content.parts[0].text

    return new Response(
      JSON.stringify({ feedback }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in gemini-tutor function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
