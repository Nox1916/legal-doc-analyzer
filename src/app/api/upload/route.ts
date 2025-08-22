import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    console.log("Upload API called")
    const contentType = req.headers.get("content-type") || ""

    let fileName: string | undefined
    let buffer: Buffer | undefined

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      const file = form.get("file") as File | null
      if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })
      fileName = file.name
      buffer = Buffer.from(await file.arrayBuffer())
    } else {
      const { fileBase64, fileName: jsonName } = await req.json()
      if (!jsonName || !fileBase64) {
        return NextResponse.json({ error: "Missing fileName or fileBase64" }, { status: 400 })
      }
      fileName = jsonName
      buffer = Buffer.from(fileBase64, "base64")
    }

    const { error } = await supabaseAdmin.storage
      .from("documents")
      .upload(`contracts/${fileName}`, buffer!, {
        upsert: true,
        contentType: "application/pdf",
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/contracts/${fileName}`
    return NextResponse.json({ success: true, url: publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
