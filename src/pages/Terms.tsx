import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Terms() {
    useEffect(() => {
        document.title = "Términos y Condiciones | Sovereign Atlas";
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
                            Sovereign Atlas provee infraestructura de modelamiento analítico para arquitectura topológica de capital. Nuestros algoritmos están diseñados exclusively para evaluación de riesgo y backtesting determinista corporativo, B2B. Ni la plataforma ni el acceso web constituyen asesoramiento financiero certificado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">2. Limitación de Responsabilidad</h2>
                        <p>
                            El uso del simulador, incluyendo la provisión del Evidence Pack y los algoritmos Monte Carlo, se ofrecen "TAL CUAL" ("AS IS"). Sovereign Atlas no garantiza infalibilidad predicativa ni emite opiniones auditoras certificadas por reguladores gubernamentales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">3. Propiedad Intelectual</h2>
                        <p>
                            Toda matemática analítica expuesta mediante los scripts UI, interfaces visuales, heurísticas y reportes automáticos generados permanecen como propiedad intelectual de Sovereign Atlas, a excepción de los input topológicos privados proveídos por el usuario, los cuales mantienen su título matriz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">4. Contacto Legal</h2>
                        <p>
                            Para correspondencia oficial corporativa: <code>legal@sovereignatlas.example.com</code>
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
