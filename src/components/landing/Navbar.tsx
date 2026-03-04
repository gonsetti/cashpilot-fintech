import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { CALENDLY_URL } from "@/pages/Index";

export default function Navbar() {
    const { pathname } = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isHome = pathname === '/';

    const scrollTo = (id: string) => {
        if (!isHome) {
            window.location.href = `/#${id}`;
            return;
        }
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-zinc-800/50">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <span className="material-icons text-emerald-500 text-lg">insights</span>
                    </div>
                    <span className="font-bold text-zinc-100 tracking-tight text-lg">
                        CashPilot
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <button onClick={() => scrollTo('problema')} className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
                        El Problema
                    </button>
                    <button onClick={() => scrollTo('solucion')} className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
                        Qué Incluye
                    </button>
                    <button onClick={() => scrollTo('audiencia')} className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
                        Para Quién Es
                    </button>
                    <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="bg-[#EA580C] text-white px-4 py-1.5 rounded-md text-sm font-bold hover:bg-orange-500 transition-all shadow-lg shadow-orange-900/20">
                        Agendar llamada de diagnóstico
                    </a>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-zinc-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <span className="material-icons">{mobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0a0a0a] border-b border-zinc-800/50 px-6 py-4 flex flex-col gap-4">
                    <button onClick={() => scrollTo('problema')} className="text-left text-sm font-medium text-zinc-300">El Problema</button>
                    <button onClick={() => scrollTo('solucion')} className="text-left text-sm font-medium text-zinc-300">Qué Incluye</button>
                    <button onClick={() => scrollTo('audiencia')} className="text-left text-sm font-medium text-zinc-300">Para Quién Es</button>
                    <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="text-left text-sm font-bold text-orange-500">Agendar llamada de diagnóstico</a>
                </div>
            )}
        </nav>
    );
}
