import Link from 'next/link';
import { Presentation, LogIn, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-shade-5 text-white overflow-hidden relative">
      {/* Decorative background elements with float animations */}
      <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] bg-note-blue/10 rounded-full blur-[100px] pointer-events-none animate-float-delayed" />
      
      <div className="glass-panel p-16 max-w-3xl text-center space-y-10 animate-in relative z-10 border-white/10">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary shadow-lg shadow-primary/20 ring-1 ring-primary/30 relative">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
            <Presentation size={48} strokeWidth={1.5} className="relative z-10" />
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            Infinite Board
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-xl mx-auto leading-relaxed font-normal">
            A premium, infinite canvas for collaborative reviews, moodboards, and team synchronization.
          </p>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/admin" className="btn-primary py-4 px-8 text-lg flex items-center justify-center gap-3">
            <Sparkles size={20} className="text-white/80" /> 
            <span>Host Dashboard</span>
          </Link>
        </div>

        <div className="pt-8 border-t border-white/5">
          <p className="text-sm text-gray-500 font-medium tracking-wide">
            Are you a viewer? Ask your host for the shared board link.
          </p>
        </div>
      </div>
    </div>
  );
}
