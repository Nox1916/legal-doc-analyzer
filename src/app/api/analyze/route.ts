import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { fileName, type, question } = await req.json()
    console.log("📩 Analyze request:", { fileName, type, question })

    const { data: doc, error } = await supabase
      .from("documents")
      .select("text")
      .eq("file_name", fileName)
      .limit(1)
      .maybeSingle()

    if (error || !doc?.text) {
      console.error("❌ No document text found for:", fileName, error)
      return NextResponse.json({ success: false, error: "Document text not found" }, { status: 400 })
    }

    const text = doc.text
    console.log("📑 Loaded text length:", text.length)

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a legal contract analyzer. Be precise and clear." },
          {
            role: "user",
            content:
              type === "qa"
                ? `${question}\n\nDocument:\n${text}`
                : `Analyze this document for ${type}:\n${text}`,
          },
        ],
      }),
    })

    const result = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: result.error?.message || "Groq API failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, result: result.choices?.[0]?.message?.content || "" })
  } catch (err: any) {
    console.error("💥 Analyze API error:", err)
    return NextResponse.json({ success: false, error: err.message || "Unexpected error" }, { status: 500 })
  }
}
