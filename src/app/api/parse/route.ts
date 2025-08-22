import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import pdfParse from "pdf-parse"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { fileName } = await req.json()
    console.log("🔍 Parsing request for:", fileName)

    let fileBuffer: Buffer | null = null

    // 1. Try direct Supabase download
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("documents")
      .download(`contracts/${fileName}`)

    if (downloadError || !fileData) {
      console.warn("⚠️ Direct download failed, trying public URL:", downloadError)

      // 2. Retry using public URL
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/contracts/${fileName}`
      console.log("🌐 Fetching from public URL:", publicUrl)

      const res = await fetch(publicUrl)
      if (!res.ok) {
        throw new Error(`Failed to fetch from public URL: ${res.status} ${res.statusText}`)
      }

      const arrayBuffer = await res.arrayBuffer()
      console.log("📦 Fetched file size (public URL):", arrayBuffer.byteLength)
      fileBuffer = Buffer.from(arrayBuffer)
    } else {
      const arrayBuffer = await fileData.arrayBuffer()
      console.log("📦 Downloaded file size (direct):", arrayBuffer.byteLength)
      fileBuffer = Buffer.from(arrayBuffer)
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("Downloaded file is empty")
    }

    // 3. Extract text from PDF
    const pdfData = await pdfParse(fileBuffer)
    const extractedText = pdfData.text?.trim() || "⚠ No text found in PDF"
    console.log("📑 Extracted text length:", extractedText.length)

    // 4. Insert extracted text into Supabase DB
    const { error: dbError } = await supabaseAdmin.from("documents").insert({
      file_name: fileName,
      file_url: `contracts/${fileName}`,
      text: extractedText,
    })

    if (dbError) {
      console.error("❌ DB insert error:", dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    console.log("✅ Document inserted with text:", fileName)
    return NextResponse.json({ success: true, length: extractedText.length })
  } catch (err: any) {
    console.error("💥 Unexpected parse error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
