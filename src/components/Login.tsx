import React from 'react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Logged in successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to login');
    }
  };

  return (
    <div className="max-w-md mx-auto py-20">
      <div className="bg-white p-12 rounded-3xl border border-stone-200 shadow-sm text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif italic">Admin Access</h1>
          <p className="text-stone-500 text-sm">Please sign in to manage Diary Samudera</p>
        </div>
        
        <button 
          onClick={handleLogin}
          className="w-full bg-stone-900 text-white py-4 rounded-full font-medium flex items-center justify-center gap-3 hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>
        
        <p className="text-[10px] text-stone-400 uppercase tracking-widest">
          Authorized users only
        </p>
      </div>
    </div>
  );
}
