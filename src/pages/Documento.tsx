import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Documento() {
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        organization: "",
        email: ""
    });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        document.title = "Marco Metodológico | Sovereign Atlas";
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.organization) return;

        // Almacenaje local sin backend
        const leads = JSON.parse(localStorage.getItem("sa_leads") || "[]");
        leads.push({ ...formData, timestamp: new Date().toISOString() });
        localStorage.setItem("sa_leads", JSON.stringify(leads));

        setSubmitted(true);
        triggerDownload();
    };

    const triggerDownload = () => {
        // Generamos un PDF en blanco placeholder con jsPDF o Blob nativo
        const blob = new Blob(["%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n188\n%%EOF"], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Sovereign_Atlas_Marco_Metodologico_v1.0.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-900 selection:text-emerald-100 flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20 px-6 max-w-3xl mx-auto w-full">
                <div className="mb-10 text-center">
                    <span className="material-icons text-emerald-500 text-4xl mb-4 block">picture_as_pdf</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight mb-4">
                        Marco Metodológico v1.0
                    </h1>
                    <p className="text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto">
                        Documento técnico institucional detallando las matemáticas topológicas y distribuciones estocásticas subyacentes del motor de Sovereign Atlas.
                    </p>
                </div>

                {!submitted ? (
                    <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-8 shadow-2xl">
                        <h2 className="text-lg font-bold text-zinc-200 mb-6 border-b border-zinc-800 pb-3">
                            Descarga Segura
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nombre Completo</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#050505] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cargo</label>
                                    <input type="text" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-[#050505] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Organización</label>
                                    <input required type="text" value={formData.organization} onChange={e => setFormData({ ...formData, organization: e.target.value })} className="w-full bg-[#050505] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Corporativo</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#050505] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col items-center gap-4">
                                <button type="submit" className="w-full md:w-auto bg-zinc-100 text-zinc-950 px-8 py-3 rounded-md font-bold text-sm hover:bg-white transition-colors">
                                    Descargar PDF
                                </button>
                                <p className="text-[0.65rem] text-zinc-600 max-w-md text-center">
                                    CONFIDENCIALIDAD GARANTIZADA. NO COMPARTIMOS SUS DATOS PERSONALES NI ENTRENAMOS MODELOS DE IA CON LA INFORMACIÓN PROPORCIONADA.
                                </p>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="material-icons text-emerald-500 text-5xl mb-4">check_circle</span>
                        <h2 className="text-xl font-bold text-zinc-100 mb-2">Descarga Iniciada</h2>
                        <p className="text-sm text-zinc-400 mb-6">El documento técnico se está descargando en su dispositivo de manera segura.</p>
                        <button onClick={triggerDownload} className="text-xs font-bold tracking-widest text-emerald-500 hover:text-emerald-400 uppercase flex items-center justify-center gap-1 mx-auto">
                            <span className="material-icons text-[0.9rem]">refresh</span> VOLVER A DESCARGAR
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
