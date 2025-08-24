# 📑 Legal Doc Analyzer (Prototype)

An AI-powered tool to **upload, parse, and analyze legal contracts**.  
Built with **Next.js 15 + Supabase + Groq (Llama3)**.  

---

## 🚀 Features
- 📂 **Upload PDFs** → stored in Supabase Storage  
- 🔍 **Parse documents** → extracts text using `pdf-parse`  
- 🤖 **AI Analysis** → run summaries, Q&A, and risk analysis using Groq’s Llama3 model  
- 🔄 **Compare contracts** → highlights differences in two legal documents  

---

## 🛠 Tech Stack
- **Frontend/Backend**: Next.js 15 (App Router, API Routes)  
- **Database & Storage**: Supabase  
- **AI Model**: Groq API (`llama3-8b-8192`)  
- **File Parsing**: `pdf-parse`  

---

## 📂 Project Structure
src/
├─ app/
│ ├─ api/
│ │ ├─ upload/route.ts # Upload files to Supabase
│ │ ├─ parse/route.ts # Extract text from PDF + save in DB
│ │ ├─ analyze/route.ts # Run AI Q&A, summary, risk, compare
│ ├─ page.tsx # Main UI
│ ├─ layout.tsx # Layout wrapper
├─ lib/
│ ├─ supabaseAdmin.ts # Server-side Supabase client
│ ├─ supabaseClient.ts # Client-side Supabase client


---

## ⚡ Getting Started

### 1. Clone repo
```bash
git clone https://github.com/<your-org>/legal-doc-analyzer.git
cd legal-doc-analyzer
```
### 2. Install dependencies
```bash
npm install
```
### 3. Set up environment variables
Create a .env.local file:
```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GROQ_API_KEY=<your-groq-api-key>
```
### 5. Run locally
```bash
npm run dev
```
### ✅ Current Status
Works locally: Upload → Parse → Analyze → Compare

Produces structured summaries & risk analysis

Deployed version requires fixing deployment setup (Vercel fails due to pdf-parse)

🚧 Next Steps (for engineering team)
Deployment
Move from Vercel → deploy on AWS/GCP/Azure (Dockerize app)

Ensure pdf-parse works in production

Security
Add authentication (Supabase Auth / SSO)

Restrict document access per user

Scalability
Add background workers for large documents

Handle rate limits of Groq API

Legal AI Enhancements
Optionally replace general Llama3 with legal-domain LLMs (e.g., Claude 3.5 Sonnet, Llama3.1 fine-tuned for contracts)

Add clause extraction & compliance checks
