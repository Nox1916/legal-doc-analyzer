"use client"
import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Search, AlertTriangle, FileCheck, GitCompare, MessageSquare, Loader2 } from "lucide-react"

export default function LegalDocumentAnalyzer() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [question, setQuestion] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string>("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      const limitedFiles = [...uploadedFiles, ...files].slice(0, 2)
  
      // Update UI immediately
      setUploadedFiles(limitedFiles)
  
      // Upload each new file to Supabase
      for (const file of files) {
        const url = await uploadToSupabase(file)
        if (url) {
          console.log(`✅ ${file.name} saved at:`, url)
          console.log("Calling parse API...")
          const parseRes = await fetch("/api/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: file.name }),
          })
          if (!parseRes.ok) {
            const parseErr = await parseRes.json()
            console.error("Parse failed:", parseErr?.error || parseRes.statusText)
          } else {
            console.log("Parse API call completed")
          }
        }
      }
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const pdfFiles = files.filter((file) => file.type === "application/pdf")
    if (pdfFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...pdfFiles].slice(0, 2))
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }
  async function uploadToSupabase(file: File) {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    })
    if (!res.ok) {
      try {
        const err = await res.json()
        console.error("Upload failed:", err?.error || res.statusText)
      } catch {
        console.error("Upload failed:", res.statusText)
      }
      return null
    }
    const json = await res.json()
    return json.url as string
  }
  

  const handleAnalysis = async (type: string) => {
    if (uploadedFiles.length === 0) return
  
    setIsAnalyzing(true)
    setActiveTab(type.toLowerCase())
  
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadedFiles[0].name,
          secondFileName: type === "compare" ? uploadedFiles[1]?.name : undefined,
          type,
          question,
        }),
      })
  
      const data = await res.json()
  
      if (data.success) {
        setAnalysisResult(data.result)
      } else {
        setAnalysisResult(`❌ Error: ${data.error || "Unknown error"}`)
      }
    } catch (err: any) {
      setAnalysisResult(`❌ Failed: ${err.message}`)
    }
  
    setIsAnalyzing(false)
  }
  
  

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-foreground font-serif">Legal Document Analyzer</h1>
          <p className="text-muted-foreground mt-2">Professional contract analysis and legal document review</p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Upload className="h-5 w-5" />
                  Upload Documents
                </CardTitle>
                <CardDescription>Upload up to 2 PDF contracts for analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="group border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer transition-all hover:border-primary/60 hover:bg-card/40 focus-within:ring-2 focus-within:ring-ring"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <FileText className="h-12 w-12 text-primary mx-auto mb-4 transition-transform group-hover:scale-110" />
                  <p className="text-foreground font-medium mb-2">Drop PDF files here or click to browse</p>
                  <p className="text-muted-foreground text-sm">Supports PDF files up to 10MB</p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">Uploaded Files:</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg transition-colors hover:bg-muted/70">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium truncate">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Question Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <MessageSquare className="h-5 w-5" />
                  Ask Legal Questions
                </CardTitle>
                <CardDescription>Ask specific questions about your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="e.g., What are the termination clauses in this contract?"
                    value={question}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestion(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button
                    onClick={() => handleAnalysis("qa")}
                    disabled={!question.trim() || uploadedFiles.length === 0}
                    className="w-full group"
                  >
                    <Search className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                    Ask Question
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Analysis Tools</CardTitle>
                <CardDescription>Choose an analysis type for your documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleAnalysis("summary")}
                  disabled={uploadedFiles.length === 0}
                  variant="outline"
                  className="w-full justify-start group"
                >
                  <FileCheck className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                  Summarize Documents
                </Button>
                <Button
                  onClick={() => handleAnalysis("clauses")}
                  disabled={uploadedFiles.length === 0}
                  variant="outline"
                  className="w-full justify-start group"
                >
                  <FileText className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                  Extract Key Clauses
                </Button>
                <Button
                  onClick={() => handleAnalysis("risk")}
                  disabled={uploadedFiles.length === 0}
                  variant="outline"
                  className="w-full justify-start group"
                >
                  <AlertTriangle className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                  Generate Risk Report
                </Button>
                <Button
                  onClick={() => handleAnalysis("compare")}
                  disabled={uploadedFiles.length < 2}
                  variant="outline"
                  className="w-full justify-start group"
                >
                  <GitCompare className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                  Compare Documents
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-serif">Analysis Results</CardTitle>
                <CardDescription>View detailed analysis of your legal documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="clauses">Clauses</TabsTrigger>
                    <TabsTrigger value="risk">Risk</TabsTrigger>
                    <TabsTrigger value="qa">Q&A</TabsTrigger>
                    <TabsTrigger value="compare">Compare</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-6">
                    <div className="text-center py-12">
                      <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 font-serif">Ready to Analyze</h3>
                      <p className="text-muted-foreground">
                        Upload your PDF documents and select an analysis tool to get started.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="mt-6">
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                        <span>Generating document summary...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold font-serif">Document Summary</h3>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
  {analysisResult}
</pre>

                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="clauses" className="mt-6">
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                        <span>Extracting key clauses...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold font-serif">Extracted Clauses</h3>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
  {analysisResult}
</pre>

                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="risk" className="mt-6">
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                        <span>Analyzing potential risks...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold font-serif">Risk Analysis</h3>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
  {analysisResult}
</pre>

                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="qa" className="mt-6">
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                        <span>Processing your question...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold font-serif">Question & Answer</h3>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
  {analysisResult}
</pre>

                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="compare" className="mt-6">
  {uploadedFiles.length < 2 ? (
    <div className="text-center py-12">
      <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2 font-serif">Compare Documents</h3>
      <p className="text-muted-foreground">
        Upload at least 2 documents to enable comparison analysis.
      </p>
    </div>
  ) : isAnalyzing ? (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
      <span>Comparing documents...</span>
    </div>
  ) : (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold font-serif">Comparison Results</h3>
      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
  {analysisResult}
</pre>

    </div>
  )}
</TabsContent>

                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
