import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <div className="w-full max-w-[1000px] flex rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 bg-surface/80 backdrop-blur-md min-h-[600px]">

      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative items-center justify-center p-12 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 text-center text-white space-y-6 max-w-sm">
          <div className="flex justify-center">
            <div className="w-28 h-28 bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/25 shadow-xl">
              <img src="/logo.png" alt="SignViz" className="w-20 h-20 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">SignViz</h1>
          <p className="text-lg text-white/80 font-light leading-relaxed">
            Visualising communication through sign language.
          </p>
          <p className="text-sm text-white/50 pt-2">AI-Powered Academic Platform</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-surface">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-bold gradient-text tracking-tight mb-2">{title}</h2>
            {subtitle && <p className="text-text-secondary text-sm">{subtitle}</p>}
          </div>

          {children}

          <div className="mt-8 pt-6 border-t border-accent/20 text-center text-xs text-muted">
            © {new Date().getFullYear()} SignViz. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
