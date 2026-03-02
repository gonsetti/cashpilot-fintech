import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Privacy() {
  useEffect(() => {
    document.title = "Política de Privacidad | Sovereign Atlas";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-6 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-8">
          Política de Privacidad
        </h1>

        <div className="space-y-8 text-sm text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">1. Información Recopilada</h2>
            <p>
              Sovereign Atlas, en su provisión de infraestructura analítica corporativa, almacena metadatos estrictamente volcados en los formularios de ingesta institucionales (nombre, rol, organización, contacto corporativo). No empleamos cookies de rastreo invasivas ni integramos sustratos de advertising third-party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">2. Naturaleza del Tratamiento</h2>
            <p>
              La ingesta topológica (grafos, matrices paramétricas) ejecutada en instancias de simulación opera in-memory a menos que el directorio autorice de manera explícita la retención de Evidence Packs en servidores seguros. Sus datos no son cruzados con datasets globales ni se utilizan para entrenar Algoritmos Predictivos de IA Abiertos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">3. Seguridad Arquitectónica</h2>
            <p>
              Toda comunicación inter-nodal durante la ingesta de escenarios se encuentra securizada bajo estrictos cifrados de capa de transporte (TLS &gt; 1.2). Las exportaciones de evidencia están sometidas a hashing criptográfico y sellado offline irrepudiable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">4. Canales de Privacidad</h2>
            <p>
              Cualquier consulta relacionada a la rectificación, purga en caliente o supresión definitiva de telemetría e historiales cruzados debe dirigirse al oficial DPO a través de: <code>privacy@sovereignatlas.example.com</code>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
