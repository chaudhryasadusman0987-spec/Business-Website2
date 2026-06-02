import { GoogleGenerativeAI } from "@google/generative-ai"
import { buildSystemPrompt } from "@/lib/agent-prompt"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    if (messages.length > 40) {
      return NextResponse.json({
        reply: "This chat session has ended. Please call us or email us directly.",
        leadCollected: false,
      })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: buildSystemPrompt(),
    })

    // Convert messages to Gemini format (Gemini uses "model" instead of "assistant").
    // The last message is the current user input.
    const history = messages
      .slice(0, -1)
      .map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }))

    // Gemini requires history to start with a "user" turn — drop the leading
    // assistant greeting (and any other leading model turns) so it's valid.
    while (history.length && history[0].role === "model") history.shift()

    const chat = model.startChat({ history })
    const lastMessage = messages[messages.length - 1].content
    const result = await chat.sendMessage(lastMessage)
    const reply = result.response.text()

    const leadCollected = reply.includes("[LEAD_COLLECTED]")
    const cleanReply = reply.replace("[LEAD_COLLECTED]", "").trim()

    return NextResponse.json({ reply: cleanReply, leadCollected })
  } catch (err) {
    const e = err as {
      message?: string
      status?: number
      statusText?: string
      errorDetails?: unknown
    }
    console.error("Gemini chat error FULL:", {
      message: e?.message,
      status: e?.status,
      statusText: e?.statusText,
      errorDetails: e?.errorDetails,
    })
    return NextResponse.json(
      {
        reply: "Sorry, I am having trouble right now. Please call us directly.",
        leadCollected: false,
      },
      { status: 500 }
    )
  }
}
