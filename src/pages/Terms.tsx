import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Terms() {
    useEffect(() => {
        document.title = "CashPilot — Términos y Condiciones";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20 px-6 max-w-3xl mx-auto w-full">
                <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-8">
                    Términos y Condiciones
                </h1>

                <div className="space-y-8 text-sm text-zinc-400 leading-relaxed">
                    <section>
                        <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">1. Uso del Servicio</h2>
                        <p>
                            CashPilot provee un servicio de implementación y mantenimiento de dashboard financiero. La plataforma y la información allí provista se ofrece como una herramienta de toma de decisiones, pero no constituye asesoramiento contable ni financiero legal.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">2. Limitación de Responsabilidad</h2>
                        <p>
                            El usuario es responsable de la exactitud de los datos ingresados en la plataforma. CashPilot no se hace responsable por decisiones de negocio tomadas a partir del uso directo de la herramienta, ni por diferencias con la contabilidad oficial de la empresa.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">3. Disponibilidad y Mantenimiento</h2>
                        <p>
                            Haremos nuestro mejor esfuerzo por mantener la plataforma operativa 24/7. Sin embargo, pueden existir momentos de mantenimiento programado o fallas técnicas de proveedores en la nube que escapen a nuestro control.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">4. Contacto Legal</h2>
                        <p>
                            Para asuntos legales y comerciales, escríbenos a: <code>avino.contacto@gmail.com</code>
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
