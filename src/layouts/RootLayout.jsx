import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const RootLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 font-sans text-slate-900">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default RootLayout;
