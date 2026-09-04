import React from 'react';
import { Layers, Database, Server, Code2, ShieldCheck, Terminal, CheckCircle2, FileText, Cpu } from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">MERN + Firebase Technical Architecture & Deployment Guide</h2>
        <p className="text-xs text-stone-500 mt-1">Comprehensive overview of system design, file structure, library inventory, and production deployment steps.</p>
      </div>

      {/* Architecture Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">1. MongoDB Database</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Managed via Mongoose ODM schemas (`Task`, `Project`) for structured, scalable document storage with automated indexing and robust in-memory fallback for zero-config preview resilience.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">2. Express.js Backend</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            RESTful API routing (`/api/tasks`, `/api/projects`, `/api/ai/generate`), middleware parsing, CORS handling, and server-side integration with the Google GenAI SDK.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">3. React 19 Frontend & Firebase</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Modular React components styled with Tailwind CSS, combined with Firebase Authentication (Google Sign-In) and Firestore real-time listeners for instant collaborative syncing.
          </p>
        </div>
      </div>

      {/* Library Inventory Table */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Project Library Inventory & Purpose</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase">
                <th className="pb-3">Library / Package</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Purpose & Implementation Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-3 font-mono font-bold text-indigo-600">express</td>
                <td className="py-3">Backend</td>
                <td className="py-3">Core web server framework handling REST API endpoints and middleware.</td>
              </tr>
              <tr>
                <td className="py-3 font-mono font-bold text-indigo-600">mongoose</td>
                <td className="py-3">Database</td>
                <td className="py-3">MongoDB object data modeling (ODM) library for schema validation and queries.</td>
              </tr>
              <tr>
                <td className="py-3 font-mono font-bold text-indigo-600">firebase</td>
                <td className="py-3">Auth & Sync</td>
                <td className="py-3">Client-side SDK for Google Authentication and Firestore real-time database listeners.</td>
              </tr>
              <tr>
                <td className="py-3 font-mono font-bold text-indigo-600">firebase-admin</td>
                <td className="py-3">Backend Auth</td>
                <td className="py-3">Server-side SDK for verifying authentication tokens and managing server records.</td>
              </tr>
              <tr>
                <td className="py-3 font-mono font-bold text-indigo-600">@google/genai</td>
                <td className="py-3">AI Engine</td>
                <td className="py-3">Official Google GenAI SDK powering server-side Gemini AI code generation and fallback ladder.</td>
              </tr>
              <tr>
                <td className="py-3 font-mono font-bold text-indigo-600">react / react-dom</td>
                <td className="py-3">Frontend</td>
                <td className="py-3">React 19 library for component-driven user interface development.</td>
              </tr>
              <tr>
                <td className="py-3 font-mono font-bold text-indigo-600">tailwindcss / @tailwindcss/vite</td>
                <td className="py-3">Styling</td>
                <td className="py-3">Utility-first CSS framework for responsive, modern UI design.</td>
              </tr>
              <tr>
                <td className="py-3 font-mono font-bold text-indigo-600">lucide-react</td>
                <td className="py-3">Icons</td>
                <td className="py-3">Clean vector icons for dashboard navigation and action buttons.</td>
              </tr>
              <tr>
                <td className="py-3 font-mono font-bold text-indigo-600">esbuild / tsx</td>
                <td className="py-3">Build Tools</td>
                <td className="py-3">TypeScript execution in development and bundling for production deployment.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deployment & Setup Guide */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Detailed Setup & Deployment Guide</h3>
        </div>

        <div className="space-y-6 text-xs text-stone-700 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm">1. Environment Variables Configuration</h4>
            <p className="text-stone-500">Configure your <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-stone-800">.env</code> file in the project root with your credentials:</p>
            <pre className="bg-stone-900 text-stone-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
{`GEMINI_API_KEY="your-gemini-api-key"
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/database?retryWrites=true&w=majority"
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"`}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm">2. Local Development Execution</h4>
            <p className="text-stone-500">Install dependencies and boot the development server:</p>
            <pre className="bg-stone-900 text-stone-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
{`npm install
npm run dev`}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm">3. Production Build & Deployment to Google Cloud Run</h4>
            <p className="text-stone-500">Bundle the full-stack application and deploy as a self-contained container service:</p>
            <pre className="bg-stone-900 text-stone-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
{`# 1. Build client bundle and server bundle (dist/server.cjs)
npm run build

# 2. Deploy via Google Cloud SDK / Cloud Run
gcloud run deploy mern-firebase-workspace \\
  --source . \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars MONGODB_URI="your-uri",GEMINI_API_KEY="your-key"`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
