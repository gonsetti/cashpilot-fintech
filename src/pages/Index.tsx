import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Index() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = "Sovereign Atlas | Systemic Capital Intelligence Infrastructure";
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-900 selection:text-emerald-100 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* IMPACT HERO */}
        <section className="pt-48 pb-32 px-6 max-w-5xl mx-auto text-center border-b border-zinc-900/50">
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-zinc-100 tracking-tight leading-[1.2] mb-8 max-w-3xl mx-auto">
            Su estructura puede parecer estable.<br />
            Eso no significa que sea resiliente.
          </h1>
          <p className="text-lg text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Sovereign Atlas identifica fragilidad estructural, exposición cruzada y puntos de ruptura sistémica en arquitecturas multientidad antes de que el mercado los revele.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/contacto" className="w-full sm:w-auto bg-zinc-100 text-zinc-950 px-8 py-3.5 rounded-sm font-semibold text-sm hover:bg-white transition-colors">
              Solicitar Evaluación Confidencial
            </Link>
            <Link to="/documento" className="w-full sm:w-auto bg-transparent border border-zinc-700 text-zinc-300 px-8 py-3.5 rounded-sm font-semibold text-sm hover:bg-zinc-800 transition-colors">
              Descargar Marco Metodológico
            </Link>
          </div>
        </section>

        {/* ILUSIÓN DE ESTABILIDAD */}
        <section className="py-32 px-6 bg-[#030303] border-b border-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-12">
              La estabilidad agregada oculta vulnerabilidad local.
            </h2>
            <ul className="space-y-6 text-zinc-400 mb-12 text-lg">
              <li className="flex items-start gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0 opacity-80"></span>
                <span>La liquidez consolidada no refleja exposición cruzada.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0 opacity-80"></span>
                <span>Las subsidiarias críticas amplifican shocks.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0 opacity-80"></span>
                <span>La concentración estructural no aparece en balances tradicionales.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0 opacity-80"></span>
                <span>El contagio interno es invisible hasta que es irreversible.</span>
              </li>
            </ul>
            <p className="text-xl font-medium text-zinc-200">
              Sovereign Atlas modela la arquitectura completa, no solo estados financieros aislados.
            </p>
          </div>
        </section>

        {/* METODOLOGÍA MINIMALISTA */}
        <section className="py-32 px-6 border-b border-zinc-900/50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div>
              <h3 className="text-base font-bold text-zinc-100 mb-3 border-b border-zinc-800 pb-2">Simulación Monte Carlo determinista</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Evaluación reproducible bajo escenarios extremos.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 mb-3 border-b border-zinc-800 pb-2">Modelo topológico de red de capital</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Identificación de nodos críticos y exposición cruzada.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 mb-3 border-b border-zinc-800 pb-2">Índice de fragilidad estructural</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Cuantificación normalizada del riesgo sistémico.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 mb-3 border-b border-zinc-800 pb-2">Simulación de contagio</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Proyección de cascadas ante eventos adversos.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 mb-3 border-b border-zinc-800 pb-2">Gobernanza trazable</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Evidence Pack verificable y reproducible.
              </p>
            </div>
          </div>
        </section>

        {/* FILTRO DE CLIENTE STRIC CULLING */}
        <section className="py-32 px-6 bg-[#030303] border-b border-zinc-900/50 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight mb-6">No es para estructuras simples.</h2>
            <p className="text-base text-zinc-400 leading-relaxed mb-6">
              Sovereign Atlas está diseñado para holdings, family offices, private equity y corporativos con múltiples entidades interdependientes.
            </p>
            <p className="text-base text-zinc-500 italic">
              Si su organización opera como una única entidad sin arquitectura compleja, este marco no es adecuado.
            </p>
          </div>
        </section>

        {/* PHASES & AUTHORITY */}
        <section className="py-32 px-6 border-b border-zinc-900/50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20">
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 tracking-tight mb-8">Mandato estructural en tres fases.</h2>
              <ol className="space-y-6 text-zinc-400 text-base list-decimal list-inside marker:text-zinc-600 marker:font-bold">
                <li>Evaluación preliminar de elegibilidad.</li>
                <li>Modelado sistémico confidencial.</li>
                <li>Informe ejecutivo y recomendaciones estratégicas.</li>
              </ol>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 p-10 rounded-sm">
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight leading-snug mb-8">
                Cada simulación es reproducible.<br />
                Cada conclusión es auditada.
              </h2>
              <ul className="space-y-3 text-sm text-zinc-400 mb-10">
                <li className="flex gap-3 items-center"><span className="material-icons text-xs text-zinc-600">stop</span> Seed determinista.</li>
                <li className="flex gap-3 items-center"><span className="material-icons text-xs text-zinc-600">stop</span> Fingerprint estructural.</li>
                <li className="flex gap-3 items-center"><span className="material-icons text-xs text-zinc-600">stop</span> Registro encadenado.</li>
                <li className="flex gap-3 items-center"><span className="material-icons text-xs text-zinc-600">stop</span> Versionado de engine.</li>
              </ul>
              <p className="text-base font-semibold text-zinc-300">
                No entregamos visualizaciones.<br />
                Entregamos arquitectura cuantitativa verificable.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM EXACT CLOSING */}
        <section className="py-32 px-6 bg-[#020202] text-center border-t border-zinc-900">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight leading-snug mb-12">
              La resiliencia no es una suposición.<br />
              Es una disciplina estructural.
            </h2>
            <Link to="/contacto" className="bg-zinc-100 text-zinc-950 px-10 py-4 rounded-sm font-bold hover:bg-white transition-colors inline-block tracking-wide">
              Iniciar conversación confidencial
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
