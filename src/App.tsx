import React, { useState } from "react";
import { 
  PenLine, 
  FileText, 
  Languages, 
  Lightbulb, 
  Code2, 
  Mail, 
  Image as ImageIcon,
  Loader2,
  Sparkles,
  ArrowRight,
  LogOut,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { useAuthState } from "react-firebase-hooks/auth";
import { runAITask, ToolType } from "./lib/gemini";
import { cn } from "./lib/utils";
import { auth, logout } from "./lib/firebase";
import Login from "./components/Login";

const TOOLS = [
  { id: "writer" as ToolType, name: "Writer", icon: PenLine, desc: "Long-form, polished writing" },
  { id: "summarizer" as ToolType, name: "Summarizer", icon: FileText, desc: "TL;DR + key points" },
  { id: "translator" as ToolType, name: "Translator", icon: Languages, desc: "Auto-detect source" },
  { id: "ideas" as ToolType, name: "Idea Studio", icon: Lightbulb, desc: "8 brainstorms in one go" },
  { id: "code" as ToolType, name: "Code Assist", icon: Code2, desc: "Snippets that run" },
  { id: "email" as ToolType, name: "Email Drafter", icon: Mail, desc: "Professional & concise" },
  { id: "image" as ToolType, name: "Image Studio", icon: ImageIcon, desc: "Text → image" },
];

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [activeTool, setActiveTool] = useState<ToolType>("writer");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await runAITask(activeTool, input, { targetLanguage });
      setOutput(res);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-brand-bg)]">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const currentTool = TOOLS.find(t => t.id === activeTool)!;

  return (
    <div className="flex h-screen bg-[var(--color-brand-bg)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-black/5 bg-white/50 backdrop-blur-xl flex flex-col">
        <div className="p-8 border-b border-black/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Nexus AI</h1>
          </div>
          <p className="text-xs text-[var(--color-brand-secondary)] font-medium uppercase tracking-widest">
            Creative Suite
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  setOutput(null);
                  setError(null);
                  setInput("");
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                  isActive 
                    ? "bg-black text-white shadow-lg shadow-black/10" 
                    : "hover:bg-black/5 text-[var(--color-brand-primary)]"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-white" : "text-black/40 group-hover:text-black"
                )} />
                <div>
                  <div className="text-sm font-semibold">{tool.name}</div>
                  <div className={cn(
                    "text-[10px] leading-tight mt-0.5",
                    isActive ? "text-white/60" : "text-black/30"
                  )}>
                    {tool.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-black/5 space-y-4">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-sm font-semibold group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Sign Out
          </button>
          <div className="p-4 rounded-xl bg-black/5 text-[10px] text-black/50 leading-relaxed font-medium">
            Project: {user.email}<br/>
            Powered by Gemini 3.1 & 2.5 Flash
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        <header className="px-12 py-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <currentTool.icon className="w-5 h-5 text-black/40" />
              <h2 className="text-sm font-semibold text-black/40 uppercase tracking-widest">
                {currentTool.name}
              </h2>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {activeTool === "writer" && "Draft your masterpiece."}
              {activeTool === "summarizer" && "Distill the essence."}
              {activeTool === "translator" && "Bridge the language gap."}
              {activeTool === "ideas" && "Ignite your creativity."}
              {activeTool === "code" && "Build the future."}
              {activeTool === "email" && "Communicate with precision."}
              {activeTool === "image" && "Visualize your thoughts."}
            </p>
          </div>

          {activeTool === "translator" && (
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-black/5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">To</span>
              <select 
                value={targetLanguage} 
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="text-sm font-bold bg-transparent outline-none cursor-pointer"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Chinese</option>
                <option>Japanese</option>
                <option>Hindi</option>
              </select>
            </div>
          )}
        </header>

        <div className="flex-1 px-12 pb-12 flex flex-col gap-8 overflow-hidden">
          {/* Input Area */}
          <div className="flex-shrink-0">
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeTool === "image" 
                    ? "Describe the image you want to generate..." 
                    : activeTool === "code"
                    ? "Describe the function or logic you need..."
                    : "Enter your prompt or text here..."
                }
                className="w-full h-48 bg-white border border-black/5 rounded-2xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none shadow-sm placeholder:text-black/20"
              />
              <div className="absolute bottom-6 right-6">
                <button
                  onClick={handleRun}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                    isLoading || !input.trim()
                      ? "bg-black/10 text-black/30 cursor-not-allowed"
                      : "bg-black text-white hover:scale-105 active:scale-95 shadow-xl shadow-black/20"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      Run Task
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 min-h-0 bg-white/40 border border-black/5 rounded-2xl backdrop-blur-sm overflow-hidden flex flex-col shadow-sm">
            <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-black/30">AI Output</span>
                {output && activeTool !== "image" && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Result
                      </>
                    )}
                  </button>
                )}
              </div>
              {isLoading && (
                <div className="flex items-center gap-2 text-[10px] text-black/40 font-bold uppercase animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                  Generating Response...
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <AnimatePresence mode="wait">
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium"
                  >
                    Error: {error}
                  </motion.div>
                ) : output ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="markdown-body"
                  >
                    {activeTool === "image" ? (
                      <div className="space-y-6">
                        <img 
                          src={output} 
                          alt="AI Generated" 
                          className="w-full max-w-2xl mx-auto rounded-xl shadow-2xl bg-black/5 aspect-square object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
                            Generated from prompt: "{input}"
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ReactMarkdown>{output}</ReactMarkdown>
                    )}
                  </motion.div>
                ) : !isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <currentTool.icon className="w-12 h-12 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">
                      Output will appear here
                    </p>
                  </div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
