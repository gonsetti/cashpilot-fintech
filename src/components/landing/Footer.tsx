import { Link } from "react-router-dom";

export default function Footer() {
    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="bg-[#020202] border-t border-zinc-900 pt-16 pb-8 px-6 text-zinc-500">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <span className="material-icons text-emerald-500 text-sm">insights</span>
                        </div>
                        <span className="font-bold text-zinc-200 tracking-tight">CashPilot</span>
                    </div>
                    <p className="text-sm leading-relaxed max-w-sm text-zinc-400">
                        CashPilot es un servicio de implementación y acompañamiento en gestión financiera. El dashboard es una herramienta analítica incluida en el mandato.
                    </p>
                </div>

                <div>
                    <h4 className="text-zinc-100 font-semibold mb-4 text-sm">Servicio</h4>
                    <ul className="space-y-2 text-sm">
                        <li><button onClick={() => scrollTo('problema')} className="hover:text-zinc-300 transition-colors">El Problema</button></li>
                        <li><button onClick={() => scrollTo('solucion')} className="hover:text-zinc-300 transition-colors">Qué Incluye</button></li>
                        <li><button onClick={() => scrollTo('audiencia')} className="hover:text-zinc-300 transition-colors">Para Quién Es</button></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-zinc-100 font-semibold mb-4 text-sm">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/legal/privacidad" className="hover:text-zinc-300 transition-colors">Privacidad</Link></li>
                        <li><Link to="/legal/terminos" className="hover:text-zinc-300 transition-colors">Términos Legales</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-6xl mx-auto border-t border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
                <p>© {new Date().getFullYear()} CashPilot. Todos los derechos reservados.</p>
                <div className="flex items-center gap-4 text-zinc-600">
                    <a href="mailto:avino.contacto@gmail.com" className="hover:text-zinc-300 transition-colors flex items-center gap-1.5">
                        <span className="material-icons text-[1rem]">email</span>
                        avino.contacto@gmail.com
                    </a>
                    <div className="px-2 border-l border-zinc-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500/50"></span>
                        Sistemas en línea
                    </div>
                </div>
            </div>
        </footer>
    );
}
