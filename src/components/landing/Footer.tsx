import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-[#020202] border-t border-zinc-900 pt-16 pb-8 px-6 text-zinc-500">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-sm bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                            <span className="material-icons text-zinc-400 text-sm">account_tree</span>
                        </div>
                        <span className="font-bold text-zinc-200 tracking-tight">Sovereign Atlas</span>
                    </div>
                    <p className="text-xs leading-relaxed max-w-sm">
                        Systemic Capital Intelligence Infrastructure. Transformando redes topológicas de capital multientidad en analítica predictiva de estrés estructural, operada in-memory con trazabilidad cristalizada criptográficamente.
                    </p>
                </div>

                <div>
                    <h4 className="text-zinc-100 font-semibold mb-4 text-sm">Framework</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/metodologia" className="hover:text-zinc-300 transition-colors">Marco Metodológico</Link></li>
                        <li><Link to="/documento" className="hover:text-zinc-300 transition-colors">Evidence Pack Auth</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-zinc-100 font-semibold mb-4 text-sm">Sovereign</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/contacto" className="hover:text-zinc-300 transition-colors">Contacto</Link></li>
                        <li><Link to="/legal/privacidad" className="hover:text-zinc-300 transition-colors">Privacidad</Link></li>
                        <li><Link to="/legal/terminos" className="hover:text-zinc-300 transition-colors">Términos Legales</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-6xl mx-auto border-t border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
                <p>© {new Date().getFullYear()} Sovereign Atlas. Reservados los derechos estructurales.</p>
                <div className="flex items-center gap-1.5 text-zinc-600 font-mono tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-900/50 border border-emerald-500/30"></span>
                    Engine Core v2.4 Online
                </div>
            </div>
        </footer>
    );
}
