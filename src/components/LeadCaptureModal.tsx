import { useState, useEffect } from "react";

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
    const [formData, setFormData] = useState({
        nombre: "",
        whatsapp: "",
        email: "",
        tipoNegocio: "Agencia",
        herramientaActual: "Excel",
        urgencia: "Este mes",
        mensaje: "",
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
WhatsApp: ${formData.whatsapp}
Email: ${formData.email || 'No provisto'}
Tipo de negocio: ${formData.tipoNegocio}
Herramienta actual: ${formData.herramientaActual}
Urgencia: ${formData.urgencia}
Mensaje adicional: ${formData.mensaje || 'Ninguno'}`;
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
                        <h2 className="text-xl font-bold text-zinc-100">Solicitar Implementación</h2>
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
                                Se ha abierto tu cliente de correo para enviar la solicitud. Si no se abrió correctamente, puedes copiar el mensaje y enviarlo manual a <b>avino.contacto@gmail.com</b>.
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
                                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">WhatsApp *</label>
                                    <input required name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors" placeholder="+54 9 11 1234-5678" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors" placeholder="nombre@empresa.com" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Tipo de negocio</label>
                                    <select name="tipoNegocio" value={formData.tipoNegocio} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors">
                                        <option value="Agencia">Agencia</option>
                                        <option value="Ecommerce">Ecommerce</option>
                                        <option value="Servicios Profesionales">Servicios Profesionales</option>
                                        <option value="Inmobiliaria">Inmobiliaria</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Urgencia</label>
                                    <select name="urgencia" value={formData.urgencia} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors">
                                        <option value="Esta semana">Esta semana</option>
                                        <option value="Este mes">Este mes</option>
                                        <option value="1-3 meses">1-3 meses</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">¿Dónde llevas tus números hoy?</label>
                                <select name="herramientaActual" value={formData.herramientaActual} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition-colors">
                                    <option value="Excel">Excel / Planillas Locales</option>
                                    <option value="Google Sheets">Google Sheets</option>
                                    <option value="Contador">Se encarga el contador</option>
                                    <option value="Nada ordenado">No tengo nada ordenado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Mensaje Adicional</label>
                                <textarea name="mensaje" value={formData.mensaje} onChange={handleChange} className="w-full bg-[#050505] border border-zinc-800 rounded p-2.5 text-zinc-200 text-sm min-h-[80px] focus:border-emerald-500 focus:outline-none transition-colors" placeholder="Cuéntanos brevemente tu mayor problema con el flujo de caja hoy..." />
                            </div>

                            <div className="pt-4 border-t border-zinc-800/50">
                                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-md hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">
                                    Enviar Solicitud
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
