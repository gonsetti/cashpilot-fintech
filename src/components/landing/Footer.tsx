import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-[#020202] border-t border-zinc-900 py-8 px-6 text-zinc-500 text-sm">
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center">
                <div className="flex flex-wrap items-center justify-center gap-2 text-zinc-400">
                    <span>© 2025 CashPilot</span>
                    <span>—</span>
                    <a href="https://instagram.com/cashpilot.io" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Instagram</a>
                    <span>—</span>
                    <Link to="/legal/privacidad" className="hover:text-zinc-300 transition-colors">Política de Privacidad</Link>
                    <span>—</span>
                    <Link to="/legal/terminos" className="hover:text-zinc-300 transition-colors">Términos</Link>
                </div>
            </div>
        </footer>
    );
}
