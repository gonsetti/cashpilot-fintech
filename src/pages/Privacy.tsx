import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Privacy() {
  useEffect(() => {
    document.title = "CashPilot — Privacidad";
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
              CashPilot recopila la información necesaria para brindarte el servicio de plataforma y tablero financiero. Esto incluye datos de contacto y la información financiera que conectes o cargues en la herramienta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">2. Uso de los Datos</h2>
            <p>
              Tus datos financieros son estrictamente confidenciales y se utilizan únicamente para generar tus propios reportes y métricas dentro de tu dashboard. No compartimos, vendemos, ni alquilamos tus datos a terceros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">3. Seguridad</h2>
            <p>
              Implementamos medidas de seguridad estándar de la industria para proteger tus credenciales y datos almacenados en nuestras bases de datos en la nube.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">4. Contacto</h2>
            <p>
              Para cualquier consulta sobre tus datos o para solicitar su eliminación, puedes escribirnos a: <code>avino.contacto@gmail.com</code>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
