import React, { useState } from 'react';
import { Cpu, Send, Sparkles, Code, CheckCircle, AlertCircle } from 'lucide-react';

export const AiAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [modelUsed, setModelUsed] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse('');
    setModelUsed('');

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: "You are the Senior Software Engineer for a MERN stack + Firebase application."
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.result);
        setModelUsed(data.modelUsed || 'Mock AI Engine');
      } else {
        setResponse(data.error || 'Failed to generate AI response');
      }
    } catch (err: any) {
      setResponse("Error connecting to Gemini AI server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Gemini AI Code Architect & Advisor</h2>
        <p className="text-xs text-stone-500 mt-1">Server-side Google GenAI SDK integration with resilient fallback model ladder.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prompt Input Panel */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Architecture Prompt</h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-2">What would you like Gemini to design or review?</label>
              <textarea
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Design a MongoDB schema for user notifications and write the Express middleware..."
                required
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              <span>{loading ? 'Synthesizing Architecture...' : 'Generate AI Response'}</span>
            </button>
          </form>

          <div className="p-4 bg-stone-50 rounded-xl space-y-2">
            <h4 className="text-[11px] font-bold text-stone-800 uppercase">Resilient Model Ladder:</h4>
            <ul className="text-[11px] text-stone-500 space-y-1">
              <li>• Primary: <code className="text-indigo-600 font-mono">gemini-3.6-flash</code></li>
              <li>• Fallback 1: <code className="text-indigo-600 font-mono">gemini-3.1-flash-lite</code></li>
              <li>• Fallback 2: <code className="text-indigo-600 font-mono">gemini-flash-latest</code></li>
            </ul>
          </div>
        </div>

        {/* AI Output Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Generated Technical Specification</h3>
              </div>
              {modelUsed && (
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  Model: {modelUsed}
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-24 text-center text-stone-400 text-xs space-y-3">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p>Querying Gemini server-side model with automated fallback...</p>
              </div>
            ) : response ? (
              <div className="prose prose-sm max-w-none text-stone-800 text-xs leading-relaxed whitespace-pre-wrap font-sans bg-stone-50 p-6 rounded-xl border border-stone-200">
                {response}
              </div>
            ) : (
              <div className="py-24 text-center text-stone-400 text-xs">
                Enter an architectural prompt on the left to receive expert engineering guidance from Gemini.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-center text-xs text-stone-400">
            <span>Secure Server-Side API Proxy</span>
            <span>Zero API Key Exposure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
