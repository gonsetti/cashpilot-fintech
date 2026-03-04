import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import LeadCaptureModal from "@/components/LeadCaptureModal";

export const CALENDLY_URL = "https://calendly.com/"; // Reemplazar con el link real

export default function Index() {
  const { pathname } = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "CashPilot — Control total de tu flujo de caja";
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-900 selection:text-emerald-100 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="pt-40 pb-32 px-6 max-w-5xl mx-auto text-center border-b border-zinc-900/50">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-zinc-100 tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto">
            Tomá decisiones grandes sin poner en riesgo tu caja.
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Diseño e implemento dashboards financieros personalizados para dueños que ya facturan y necesitan claridad real antes de crecer.
          </p>
          <div className="flex flex-col gap-4 justify-center items-center">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full sm:w-auto">
              <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto min-h-[44px] flex items-center justify-center bg-[#EA580C] text-white px-8 py-4 rounded-md font-bold text-base hover:bg-orange-500 transition-all shadow-lg shadow-orange-900/20">
                  Agendar llamada de diagnóstico
                </a>
                <span className="text-zinc-400 text-sm">15 minutos. Sin compromiso. Te muestro cómo quedaría tu dashboard.</span>
              </div>
              <a href="#solucion" className="w-full sm:w-auto min-h-[44px] flex items-center justify-center bg-transparent border border-zinc-700 text-zinc-300 px-8 py-4 rounded-md font-semibold text-base hover:bg-zinc-800 transition-colors">
                Ver cómo funciona
              </a>
            </div>
          </div>
        </section>

        {/* PROBLEMA */}
        <section id="problema" className="py-32 px-6 bg-[#030303] border-b border-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-12 text-center">
              Tu negocio crece, pero tus finanzas son un caos.
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#080808] p-8 rounded-xl border border-zinc-800/50">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-icons text-red-500">visibility_off</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-3">No sabés tu cash real</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Entre cuentas dispersas, facturas pendientes y gastos en tarjeta, el número que ves en el banco nunca es el número real.
                </p>
              </div>
              <div className="bg-[#080808] p-8 rounded-xl border border-zinc-800/50">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-icons text-orange-500">account_balance_wallet</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-3">No sabés cuánto podés gastar</h3>
                <p className="text-zinc-400 leading-relaxed">
                  ¿Podés contratar a alguien más? ¿Podés pagar ese equipo? Sin claridad de tu runway, tomar decisiones da miedo.
                </p>
              </div>
              <div className="bg-[#080808] p-8 rounded-xl border border-zinc-800/50">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-icons text-red-500">warning</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-3">Te enterás tarde de los agujeros</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Cuando llega el momento de pagar impuestos o sueldos, te das cuenta de que falta dinero y tenés que salir a buscarlo de urgencia.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUCIÓN / QUÉ INCLUYE */}
        <section id="solucion" className="py-32 px-6 border-b border-zinc-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight mb-6">
                El servicio de implementación
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                No te vendemos una suscripción vacía. Te armamos la estructura y te entregamos tu negocio digitalizado y bajo control.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="material-icons text-emerald-500">check_circle</span>
                  <p className="text-lg text-zinc-300 font-medium">Dashboard financiero hecho a medida.</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-icons text-emerald-500">check_circle</span>
                  <p className="text-lg text-zinc-300 font-medium">Proyección clara de caja.</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-icons text-emerald-500">check_circle</span>
                  <p className="text-lg text-zinc-300 font-medium">Escenarios de contratación o inversión.</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-icons text-emerald-500">check_circle</span>
                  <p className="text-lg text-zinc-300 font-medium">Revisión estratégica mensual opcional.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent blur-3xl rounded-full"></div>
                <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-2 relative shadow-2xl">
                  {/* Mockup estilizado del Dashboard */}
                  <div className="bg-[#050505] rounded-lg overflow-hidden border border-zinc-800/50 h-[400px] flex flex-col">
                    <div className="h-10 border-b border-zinc-800/50 flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                      <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                      <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col gap-6">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-zinc-500">Caja Total</div>
                          <div className="text-3xl font-bold text-zinc-100">$84,250.00</div>
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded text-xs font-bold">+12.5%</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0a0a0a] border border-zinc-800 p-4 rounded-lg">
                          <div className="text-xs text-zinc-500 mb-1">Burn Rate</div>
                          <div className="text-lg font-bold text-red-400">-$12,400</div>
                        </div>
                        <div className="bg-[#0a0a0a] border border-zinc-800 p-4 rounded-lg">
                          <div className="text-xs text-zinc-500 mb-1">Runway</div>
                          <div className="text-lg font-bold text-zinc-200">6.8 Meses</div>
                        </div>
                      </div>
                      <div className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-lg p-4 flex items-end gap-2">
                        {/* Fake chart bars */}
                        {[20, 35, 25, 45, 60, 50, 75, 65, 80, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="py-24 px-6 bg-[#030303] border-b border-zinc-900/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-16 text-center">
              Cómo funciona
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border border-zinc-800 bg-[#0a0a0a] flex items-center justify-center mb-6 text-zinc-400 font-bold text-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-zinc-200 mb-3">Analizamos tu situación actual</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">Entendemos tu estructura de ingresos, gastos y flujos actuales para mapear tu realidad financiera.</p>
              </div>
              <div className="flex flex-col items-center text-center relative">
                <div className="hidden md:block absolute top-6 -left-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent -z-10"></div>
                <div className="w-12 h-12 rounded-full border border-zinc-800 bg-[#0a0a0a] flex items-center justify-center mb-6 text-zinc-400 font-bold text-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-zinc-200 mb-3">Construimos tu dashboard personalizado</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">Integramos y ordenamos tus números en una única pantalla clara, sin planillas que se rompen.</p>
              </div>
              <div className="flex flex-col items-center text-center relative">
                <div className="hidden md:block absolute top-6 -left-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent -z-10"></div>
                <div className="w-12 h-12 rounded-full border border-zinc-800 bg-[#0a0a0a] flex items-center justify-center mb-6 text-zinc-400 font-bold text-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-zinc-200 mb-3">Definimos juntos las decisiones correctas</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">Te acompañamos a interpretar la información para que crezcas con rentabilidad y sin sorpresas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CASOS DE USO TÍPICOS */}
        <section className="py-24 px-6 bg-[#0a0a0a] border-b border-zinc-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-12">
              Preguntas que vas a poder responder al instante
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-[#050505] border border-zinc-800 p-6 rounded-xl flex gap-4 items-start">
                <span className="material-icons text-emerald-500 mt-1">check_circle</span>
                <p className="text-zinc-300 font-medium text-lg leading-relaxed">¿Cuánto puedo gastar en marketing o equipos este mes sin ahogar la caja?</p>
              </div>
              <div className="bg-[#050505] border border-zinc-800 p-6 rounded-xl flex gap-4 items-start">
                <span className="material-icons text-emerald-500 mt-1">check_circle</span>
                <p className="text-zinc-300 font-medium text-lg leading-relaxed">¿Cuántos meses de vida (runway) tiene mi negocio si bajan las ventas?</p>
              </div>
              <div className="bg-[#050505] border border-zinc-800 p-6 rounded-xl flex gap-4 items-start">
                <span className="material-icons text-emerald-500 mt-1">check_circle</span>
                <p className="text-zinc-300 font-medium text-lg leading-relaxed">¿Qué clientes, proyectos o costos fijos me están matando el margen?</p>
              </div>
              <div className="bg-[#050505] border border-zinc-800 p-6 rounded-xl flex gap-4 items-start">
                <span className="material-icons text-emerald-500 mt-1">check_circle</span>
                <p className="text-zinc-300 font-medium text-lg leading-relaxed">¿Cuál es el impacto real en la caja de contratar a una persona más hoy?</p>
              </div>
            </div>
          </div>
        </section>

        {/* PARA QUIÉN ES */}
        <section id="audiencia" className="py-32 px-6 bg-[#030303] border-b border-zinc-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-8">
              ¿Para quién es CashPilot?
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-12 max-w-2xl mx-auto">
              Está pensado para negocios que ya tienen movimiento, facturación y gastos recurrentes, pero que aún dependen de planillas manuales que nadie actualiza.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-[#111] border border-zinc-800 text-zinc-300 px-6 py-3 rounded-full font-medium">Dueños de negocio</span>
              <span className="bg-[#111] border border-zinc-800 text-zinc-300 px-6 py-3 rounded-full font-medium">Agencias de servicios</span>
              <span className="bg-[#111] border border-zinc-800 text-zinc-300 px-6 py-3 rounded-full font-medium">Freelancers avanzados</span>
              <span className="bg-[#111] border border-zinc-800 text-zinc-300 px-6 py-3 rounded-full font-medium">Inmobiliarias chicas</span>
              <span className="bg-[#111] border border-zinc-800 text-zinc-300 px-6 py-3 rounded-full font-medium">Pymes en crecimiento</span>
            </div>
          </div>
        </section>

        {/* IMPLEMENTACIONES RECIENTES */}
        <section className="py-32 px-6 bg-[#0a0a0a] border-b border-zinc-900/50 text-center">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-4">
              Implementaciones recientes
            </h2>
            <p className="text-lg text-zinc-400 mb-12">
              Trabajando actualmente con negocios en etapa de crecimiento.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-left">
              {/* Card 1 */}
              <div className="bg-[#F9FAFB] p-8 rounded-2xl flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl" role="img" aria-label="marketing">📊</span>
                  <h3 className="text-lg font-bold text-zinc-900">Agencia de marketing</h3>
                </div>
                <div className="space-y-1 mb-2 text-sm border-b border-zinc-200 pb-4">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 font-medium">Facturación anual:</span>
                    <span className="font-bold text-zinc-900">$850k</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 font-medium">Estatus:</span>
                    <span className="font-bold text-[#EA580C]">Implementación en curso</span>
                  </div>
                </div>
                <p className="text-zinc-700 font-medium leading-relaxed italic">
                  "Centralizando reportes financieros para tomar decisiones de contratación con datos reales."
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#F9FAFB] p-8 rounded-2xl flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl" role="img" aria-label="ecommerce">🛒</span>
                  <h3 className="text-lg font-bold text-zinc-900">E-commerce de moda</h3>
                </div>
                <div className="space-y-1 mb-2 text-sm border-b border-zinc-200 pb-4">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 font-medium">Facturación anual:</span>
                    <span className="font-bold text-zinc-900">$1.2M</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 font-medium">Estatus:</span>
                    <span className="font-bold text-[#EA580C]">Implementación en curso</span>
                  </div>
                </div>
                <p className="text-zinc-700 font-medium leading-relaxed italic">
                  "Identificando fugas de caja y proyectando runway a 12 meses."
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#F9FAFB] p-8 rounded-2xl flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl" role="img" aria-label="tech">💻</span>
                  <h3 className="text-lg font-bold text-zinc-900">Consultora tecnológica</h3>
                </div>
                <div className="space-y-1 mb-2 text-sm border-b border-zinc-200 pb-4">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 font-medium">Facturación anual:</span>
                    <span className="font-bold text-zinc-900">$600k</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 font-medium">Estatus:</span>
                    <span className="font-bold text-[#EA580C]">Implementación en curso</span>
                  </div>
                </div>
                <p className="text-zinc-700 font-medium leading-relaxed italic">
                  "Unificando 3 herramientas financieras en un solo dashboard."
                </p>
              </div>
            </div>

            <p className="text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Los casos de éxito documentados estarán disponibles próximamente. Mientras tanto, agendá una llamada y te mostramos resultados en vivo.
            </p>

            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center justify-center bg-white text-[#0A7B3C] border-2 border-[#0A7B3C] px-8 py-3 rounded-md font-bold text-base hover:bg-zinc-50 transition-colors shadow-sm">
              Agendar llamada
            </a>
          </div>
        </section>

        {/* CTA FINAL */}
        <section id="contacto" className="py-32 px-6 bg-[#020202] text-center border-t border-zinc-900">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-100 tracking-tight leading-snug mb-8">
              Dejá de tomar decisiones a ciegas.
            </h2>
            <p className="text-xl text-zinc-400 mb-12">
              Agenda una llamada conmigo y te mostramos cómo organizamos las finanzas de tu negocio en días.
            </p>
            <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center bg-[#EA580C] text-white px-10 py-5 rounded-md font-bold text-lg hover:bg-orange-500 transition-colors tracking-wide shadow-xl shadow-orange-900/20">
                Quiero mi diagnóstico gratuito
              </a>
              <span className="text-zinc-500 text-sm">Sin compromiso. 15 minutos. Te muestro cómo sería tu dashboard.</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <LeadCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
