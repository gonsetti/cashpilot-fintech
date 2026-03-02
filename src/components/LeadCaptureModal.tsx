import { useState, useEffect } from "react";

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
    const [formData, setFormData] = useState({
        nombre: "",
        empresa: "",
        facturacion: "",
        empleados: "",
        decision: "",
        presupuesto: "2k – 5k",
    });

    const [enviado, setEnviado] = useState(false);
    const [copiado, setCopiado] = useState(false);

    // Prevent scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateMailBody = () => {
        return `Nombre: ${formData.nombre}
Empresa: ${formData.empresa}
Facturación mensual aproximada: ${formData.facturacion}
Cantidad de empleados: ${formData.empleados}
Decisión a evaluar: ${formData.decision}
Presupuesto estimado: ${formData.presupuesto}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Guardar en localStorage
        const savedLeads = JSON.parse(localStorage.getItem('cashpilot_leads') || '[]');
        savedLeads.push({ ...formData, fecha: new Date().toISOString() });
        localStorage.setItem('cashpilot_leads', JSON.stringify(savedLeads));

        // 2. Ejecutar mailto
        const subject = encodeURIComponent("Solicitud Implementación CashPilot");
        const body = encodeURIComponent(generateMailBody());
        window.location.href = `mailto:avino.contacto@gmail.com?subject=${subject}&body=${body}`;

        setEnviado(true);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateMailBody());
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-zinc-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100">Solicitar Evaluación</h2>
                        <p className="text-sm text-zinc-400 mt-1">Completa tus datos y nos pondremos en contacto.</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 -mr-2">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {enviado ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-icons text-3xl">check_circle</span>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-2">¡Solicitud generada!</h3>
                            <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                                Tu solicitud será revisada manualmente. Te responderemos en menos de 48 horas. Si la app de correo no se abrió automáticamente, envíalo a <b>avino.contacto@gmail.com</b>.
                            </p>
                            <button
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-zinc-800 text-zinc-200 font-semibold hover:bg-zinc-700 transition-colors"
                            >
                                <span className="material-icons text-sm">{copiado ? "check" : "content_copy"}</span>
                                {copiado ? "Copiado al portapapeles" : "Copiar mensaje completo"}
                            </button>
                            <button onClick={onClose} className="mt-4 text-sm text-zinc-500 hover:text-zinc-300">
                                Cerrar ventana
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Nombre y Apellido *</label>
                                    <input required name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors" placeholder="Ej. Juan Pérez" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Empresa *</label>
                                    <input required name="empresa" value={formData.empresa} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors" placeholder="Nombre de tu empresa" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Facturación Mensual (USD) *</label>
                                    <input required name="facturacion" value={formData.facturacion} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors" placeholder="Ej. 50.000" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Cantidad de Empleados *</label>
                                    <input required name="empleados" value={formData.empleados} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors" placeholder="Ej. 15" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">¿Qué decisión importante estás evaluando? *</label>
                                <textarea required name="decision" value={formData.decision} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm min-h-[80px] focus:border-emerald-500 focus:outline-none transition-colors" placeholder="Contratar un nuevo rol clave, invertir en tecnología, abrir una sucursal..." />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Presupuesto Estimado</label>
                                <select name="presupuesto" value={formData.presupuesto} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors">
                                    <option value="2k – 5k">USD 2K – 5K</option>
                                    <option value="5k – 10k">USD 5K – 10K</option>
                                    <option value="10k+">USD 10K+</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-zinc-800/50">
                                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-md hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">
                                    Solicitar evaluación
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
