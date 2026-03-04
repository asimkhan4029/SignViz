import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1000px] flex rounded-3xl overflow-hidden shadow-2xl bg-white min-h-[600px]">
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center p-12">
          {/* Background Patterns */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-[80px]"></div>
             <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary blur-[120px]"></div>
          </div>
          
          <div className="relative z-10 text-center text-white space-y-8 max-w-sm">
             <div className="flex justify-center mb-6">
               <div className="w-32 h-32 bg-slate-50 rounded-3xl flex items-center justify-center border border-white/20 shadow-xl">
                 <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
               </div>
             </div>
             <h1 className="text-4xl font-bold tracking-tight">SignViz</h1>
             <p className="text-lg text-white/80 font-light leading-relaxed">
               Visualizing communication through sign language.
             </p>
             <p className="text-sm text-white/50 pt-4">
               AI-Powered Academic Platform
             </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white">
           <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-primary tracking-tight mb-2">{title}</h2>
                {subtitle && <p className="text-gray-500">{subtitle}</p>}
              </div>
              
              {children}
              
              <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                 &copy; {new Date().getFullYear()} SignViz. All rights reserved.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
