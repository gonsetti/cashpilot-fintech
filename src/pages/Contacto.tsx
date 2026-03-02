import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Contacto() {
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        organization: "",
        email: "",
        structureType: "Holding",
        sizeRange: "A",
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        document.title = "Contacto Confidencial | Sovereign Atlas";
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.organization) return;

        // Almacenaje local sin backend
        const forms = JSON.parse(localStorage.getItem("sa_contacts") || "[]");
        forms.push({ ...formData, timestamp: new Date().toISOString() });
        localStorage.setItem("sa_contacts", JSON.stringify(forms));

        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-900 selection:text-emerald-100 flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20 px-6 max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-12">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-4">
                        Solicitud de Evaluación Estructural Confidencial
                    </h1>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                        Las solicitudes son evaluadas según complejidad multientidad y madurez de gobernanza.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                <span className="material-icons text-zinc-500 text-sm">enhanced_encryption</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-zinc-200">Seguridad Aislada</h3>
                                <p className="text-xs text-zinc-500 mt-1">Sovereign Atlas no comparte metadatos con sub-procesadores en la nube. Operación blindada.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                <span className="material-icons text-zinc-500 text-sm">business</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-zinc-200">Enfoque Exclusivo</h3>
                                <p className="text-xs text-zinc-500 mt-1">Desarrollado específicamente para holdings multientidad, private equity firms y family offices.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    {!submitted ? (
                        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-8 shadow-2xl">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nombre Completo *</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#050505] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Organización *</label>
                                        <input required type="text" value={formData.organization} onChange={e => setFormData({ ...formData, organization: e.target.value })} className="w-full bg-[#050505] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cargo</label>
                                        <input type="text" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-[#050505] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Corporativo *</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#050505] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estructura</label>
                                        <select value={formData.structureType} onChange={e => setFormData({ ...formData, structureType: e.target.value })} className="w-full bg-[#050505] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none">
                                            <option value="Holding">Holding Group</option>
                                            <option value="Family Office">Family Office</option>
                                            <option value="Private Equity">Private Equity</option>
                                            <option value="Corporate">Corporativo B2B</option>
                                            <option value="Other">Otro</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Volumen (AUM)</label>
                                        <select value={formData.sizeRange} onChange={e => setFormData({ ...formData, sizeRange: e.target.value })} className="w-full bg-[#050505] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none">
                                            <option value="A">{"<"} $100MM</option>
                                            <option value="B">$100MM - $500MM</option>
                                            <option value="C">$500MM - $1B</option>
                                            <option value="D">{">"} $1B</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mensaje (Opcional)</label>
                                    <textarea rows={3} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full bg-[#050505] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none" />
                                </div>

                                <button type="submit" className="w-full bg-zinc-100 text-zinc-950 px-8 py-3 rounded-md font-bold text-sm hover:bg-white transition-colors mt-2">
                                    Enviar Solicitud
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-xl p-8 text-center h-full flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <span className="material-icons text-emerald-500 text-5xl mb-4">check_circle</span>
                            <h2 className="text-xl font-bold text-zinc-100 mb-2">Solicitud Recibida</h2>
                            <p className="text-sm text-zinc-400">Nuestro equipo evaluará la elegibilidad estructural y confirmará si procede una conversación preliminar.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
