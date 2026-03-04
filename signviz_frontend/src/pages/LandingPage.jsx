import React from 'react';
import Home from './Home';
import UploadPage from './Upload';
import Features from './Features';
import HowItWorks from './HowItWorks';
import About from './About';
import Contact from './Contact';

const LandingPage = () => {
    return (
        <div className="flex flex-col w-full">
            <section id="home" className="w-full">
                <Home />
            </section>
            
            <section id="upload" className="w-full bg-background/50 py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <UploadPage />
                </div>
            </section>

            <section id="features" className="w-full py-16 sm:py-24 scroll-mt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <Features />
                </div>
            </section>

            <section id="process" className="w-full bg-background/50 py-16 sm:py-24 scroll-mt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <HowItWorks />
                </div>
            </section>

            <section id="about" className="w-full py-16 sm:py-24 scroll-mt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <About />
                </div>
            </section>

            <section id="contact" className="w-full bg-background/50 py-16 sm:py-24 scroll-mt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <Contact />
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
