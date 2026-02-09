export default function Hero() {
    return (
        <section id="hero" className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
            <h1 className="text-4xl font-bold mb-4">AI Resume Builder</h1>
            <p className="text-xl mb-8">Create your professional resume in minutes with AI assistance.</p>
            <button className="bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-all duration-300 px-8 py-4 cursor-pointer">
                <a href="#builder">Get Started</a>
            </button>
        </section>
    );
}
