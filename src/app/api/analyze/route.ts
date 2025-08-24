import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { fileName, type, question, secondFileName } = await req.json()
    console.log("📩 Analyze request:", { fileName, type, question, secondFileName })

    // Compare needs two docs
    let text = ""
    if (type === "compare") {
      if (!secondFileName) {
        return NextResponse.json({ success: false, error: "Need two documents for comparison" }, { status: 400 })
      }

      // fetch both docs
      const { data: doc1, error: err1 } = await supabase
        .from("documents")
        .select("text")
        .eq("file_name", fileName)
        .limit(1)
        .maybeSingle()

      const { data: doc2, error: err2 } = await supabase
        .from("documents")
        .select("text")
        .eq("file_name", secondFileName)
        .limit(1)
        .maybeSingle()

      if (err1 || err2 || !doc1?.text || !doc2?.text) {
        console.error("❌ Missing text for comparison", err1, err2)
        return NextResponse.json({ success: false, error: "One or both documents not found" }, { status: 400 })
      }

      text = `Document A:\n${doc1.text}\n\n---\n\nDocument B:\n${doc2.text}`
    } else {
      // Single doc case
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
      text = doc.text
    }

    // 2. Call Groq
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a precise legal contract analyzer." },
          {
            role: "user",
            content:
              type === "qa"
                ? `${question}\n\nDocument:\n${text}`
                : type === "compare"
                ? `Compare these two legal documents. Highlight differences in clauses, risks, obligations, fees, and termination terms:\n\n${text}`
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

    return NextResponse.json({ success: true, result: result.choices[0].message.content })
  } catch (err: any) {
    console.error("💥 Analyze API error:", err)
    return NextResponse.json({ success: false, error: err.message || "Unexpected error" }, { status: 500 })
  }
}
