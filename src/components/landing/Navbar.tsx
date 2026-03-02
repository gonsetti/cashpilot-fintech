import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
    const { pathname } = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800/50">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
                        <span className="material-icons text-zinc-300 text-lg">account_tree</span>
                    </div>
                    <span className="font-bold text-zinc-100 tracking-tight text-lg">
                        Sovereign Atlas
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}>
                        Home
                    </Link>
                    <Link to="/metodologia" className={`text-sm font-medium transition-colors ${isActive('/metodologia') ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}>
                        Metodología
                    </Link>
                    <Link to="/documento" className={`text-sm font-medium transition-colors ${isActive('/documento') ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}>
                        Documento
                    </Link>
                    <Link to="/contacto" className="bg-zinc-100 text-zinc-950 px-4 py-1.5 rounded text-sm font-semibold hover:bg-white transition-colors">
                        Solicitar Evaluación
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-zinc-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <span className="material-icons">{mobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0a0a0a] border-b border-zinc-800/50 px-6 py-4 flex flex-col gap-4">
                    <Link to="/" className="text-sm font-medium text-zinc-300">Home</Link>
                    <Link to="/metodologia" className="text-sm font-medium text-zinc-300">Metodología</Link>
                    <Link to="/documento" className="text-sm font-medium text-zinc-300">Documento</Link>
                    <Link to="/contacto" className="text-sm font-medium text-zinc-300">Contacto</Link>
                </div>
            )}
        </nav>
    );
}
