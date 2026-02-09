import Navbar from "./assets/comp/Navbar";
import Hero from "./assets/comp/Hero";
import Contact from "./assets/comp/Contact";
import Footer from "./assets/comp/Footer";
import CvBuilder from "./assets/comp/CvBuilder";
import LetterBuilder from "./assets/comp/LetterBuilder";
import "./index.css";

export default function App() {
  return (
    <div className="bg-gray-900 text-white flex flex-col min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <div id="builder" className="w-full px-4 py-8 scroll-mt-20">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/2">
            <CvBuilder />
          </div>
          <div className="w-full md:w-1/2">
            <LetterBuilder />
          </div>
        </div>
      </div>
      <Contact />
      <Footer />
    </div>
  );
}