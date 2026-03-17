import Link from 'next/link';
import { Presentation, LogIn } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-shade-5 text-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-note-blue/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="glass-panel p-12 max-w-2xl text-center space-y-8 animate-in relative z-10">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30">
            <Presentation size={40} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Infinite Board</h1>
          <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
            A premium, infinite canvas for collaborative reviews, moodboards, and team synchronization.
          </p>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/admin" className="btn-primary py-3 px-6 text-lg flex items-center justify-center gap-2">
            <LogIn size={20} /> Host Dashboard
          </Link>
        </div>

        <p className="text-sm text-gray-500 pt-8">
          Are you a viewer? Ask your host for the shared board link.
        </p>
      </div>
    </div>
  );
}
