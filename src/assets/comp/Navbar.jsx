export default function Navbar() {
    return (
        <nav className="flex justify-between items-center p-6 sticky top-0 z-50 mb-4">
            <h1 className="font-bold "><a href="#">Home</a></h1>
            <ul className="flex gap-6">
                <li><a href="#hero" className="hover:text-white-300">Home</a></li>
                <li><a href="#about" className="hover:text-white-300">About</a></li>
                <li><a href="#pricing" className="hover:text-white-300">Pricing</a></li>
                <li><a href="#contact" className="hover:text-white-300">Contact</a></li>
            </ul>
        </nav>
    );
}