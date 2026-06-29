import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const RootLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden font-sans text-text-primary">
            {/* Soft, abstract organic wave shapes (Global Background) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Top Right Waves */}
                <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-50/50 blur-3xl opacity-80" />
                <div className="absolute -top-[10%] -right-[20%] w-[45vw] h-[45vw] rounded-full bg-slate-100/50 blur-3xl opacity-70" />
                
                {/* Bottom Left Waves */}
                <div className="absolute top-[40%] -left-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-50/40 blur-3xl opacity-80" />
                <div className="absolute top-[60%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-slate-100/40 blur-3xl opacity-60" />
            </div>

            <Navbar />
            <main className="flex-grow relative z-10">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default RootLayout;