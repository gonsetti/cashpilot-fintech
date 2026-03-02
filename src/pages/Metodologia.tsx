import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Metodologia() {
    useEffect(() => {
        document.title = "Metodología | Sovereign Atlas";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-900 selection:text-emerald-100 flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
                <h1 className="text-3xl md:text-5xl font-bold text-zinc-100 tracking-tight mb-6">
                    Marco Metodológico
                </h1>
                <p className="text-lg text-zinc-400 leading-relaxed mb-12 max-w-3xl">
                    Sovereign Atlas no predice el futuro; evalúa la robustez estructural ante escenarios de estrés extremo. Nuestra metodología transforma redes de capital opacas en topologías matemáticamente trazables.
                </p>

                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">
                        1. Qué modela y qué NO modela
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div className="bg-emerald-900/10 border border-emerald-900/30 p-5 rounded-lg">
                            <h3 className="font-bold text-emerald-500 mb-2 flex items-center gap-2">
                                <span className="material-icons text-sm">check_circle</span>
                                ALCANCE DEL MODELO
                            </h3>
                            <ul className="space-y-2 text-zinc-400">
                                <li>• Topología de deuda y garantías cruzadas.</li>
                                <li>• Contagio sistémico por insolvencia en cascada.</li>
                                <li>• Impacto de shocks macroeconómicos (tasas, ingresos).</li>
                                <li>• Concentración de riesgo estructural.</li>
                            </ul>
                        </div>
                        <div className="bg-rose-900/10 border border-rose-900/30 p-5 rounded-lg">
                            <h3 className="font-bold text-rose-500 mb-2 flex items-center gap-2">
                                <span className="material-icons text-sm">cancel</span>
                                LIMITACIONES ESTRUCTURALES
                            </h3>
                            <ul className="space-y-2 text-zinc-400">
                                <li>• No modela fraude interno o dolo ejecutivo.</li>
                                <li>• No predice la duración exacta de recesiones globales.</li>
                                <li>• No contempla rescates gubernamentales exógenos (bailouts).</li>
                                <li>• Asume linealidad en la liquidación de activos.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">
                        2. Inputs Requeridos
                    </h2>
                    <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                        El motor de Sovereign Atlas requiere la ingesta de un grafo de dependencias para calcular la fragilidad sistémica.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm text-zinc-400 ml-2">
                        <li><strong className="text-zinc-300">Nodos (Entidades):</strong> Liquidez estática, Burn-rate operativo, Deuda bruta, Patrimonio.</li>
                        <li><strong className="text-zinc-300">Aristas (Exposiciones):</strong> Préstamos inter-company, avales, flujo de caja cruzado.</li>
                        <li><strong className="text-zinc-300">Escenarios Macroeconómicos:</strong> Incremento de tasas (bps), compresión de márgenes, shocks de revenue.</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">
                        3. Outputs y Métricas Core
                    </h2>
                    <div className="space-y-4 text-sm text-zinc-400">
                        <p>
                            <strong className="text-zinc-300 block mb-1">Systemic Fragility Index:</strong> Un índice compuesto que penaliza la concentración de riesgo en nodos centrales sin suficientes buffers de liquidez.
                        </p>
                        <p>
                            <strong className="text-zinc-300 block mb-1">Value at Risk (VaR 95% / CVaR):</strong> Pérdida de capital esperada en el 5% de los peores escenarios estocásticos.
                        </p>
                        <p>
                            <strong className="text-zinc-300 block mb-1">Network Collapse Probability:</strong> Frecuencia matemática de iteraciones donde el colapso en cascada destruye más del 60% del equity total de la red.
                        </p>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">
                        4. Determinismo y Trazabilidad (Evidence Pattern)
                    </h2>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                        Cada ejecución de nuestro motor Monte Carlo utiliza generadores pseudoaleatorios deterministas (PRNG) con semillas inyectadas. Esto garantiza que cualquier simulación, sin importar su complejidad, pueda ser reproducida exactamente bit-a-bit para fines de auditoría del directorio o revisión regulatoria. Cada corrida emite un <strong>Evidence Pack</strong> JSON firmado criptográficamente, inmutable.
                    </p>
                </section>

                <div className="mt-16 bg-zinc-900 border border-zinc-800 p-8 rounded-xl text-center">
                    <h2 className="text-xl font-bold text-zinc-100 mb-4">Inicie el proceso de evaluación</h2>
                    <p className="text-sm text-zinc-400 mb-6 max-w-xl mx-auto">
                        Discuta de manera confidencial la topología de capital de su holding con nuestros ingenieros de riesgo.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/contacto" className="bg-zinc-100 text-zinc-950 px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-white transition-colors">
                            Solicitar Evaluación
                        </a>
                        <a href="/documento" className="bg-transparent border border-zinc-700 text-zinc-300 px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-zinc-800 transition-colors">
                            Descargar PDF
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
