import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import PublicNavbar from '../components/common/PublicNavbar';
import PublicFooter from '../components/common/PublicFooter';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar isTransparent={false} />
      
      <div className="pt-20 lg:pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver al inicio
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 lg:p-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Términos de Servicio
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Al acceder y utilizar Jubilalia, aceptas cumplir con estos Términos de Servicio y todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, no debes usar nuestro servicio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Jubilalia es una plataforma diseñada para conectar personas mayores y facilitar la búsqueda de viviendas compartidas (coliving), habitaciones, actividades y grupos de interés. Proporcionamos un espacio donde los usuarios pueden publicar y buscar propiedades, actividades y crear comunidades.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Registro de Usuario</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Para utilizar ciertas funciones de Jubilalia, debes registrarte y crear una cuenta. Te comprometes a:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Proporcionar información precisa, actual y completa</li>
                  <li>Mantener y actualizar tu información de cuenta</li>
                  <li>Mantener la confidencialidad de tu contraseña</li>
                  <li>Ser responsable de todas las actividades bajo tu cuenta</li>
                  <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Uso Aceptable</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Al usar Jubilalia, te comprometes a no:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Publicar contenido falso, engañoso o fraudulento</li>
                  <li>Violar cualquier ley o regulación local, estatal o nacional</li>
                  <li>Infringir derechos de propiedad intelectual</li>
                  <li>Acosar, abusar o dañar a otros usuarios</li>
                  <li>Usar el servicio para actividades ilegales</li>
                  <li>Intentar acceder no autorizado a sistemas o datos</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contenido del Usuario</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Eres responsable del contenido que publicas en Jubilalia. Conservas todos los derechos sobre tu contenido, pero nos otorgas una licencia mundial, no exclusiva y gratuita para usar, reproducir, modificar y distribuir tu contenido en relación con el servicio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Propiedades y Transacciones</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Jubilalia actúa únicamente como plataforma de conexión. No somos parte de ninguna transacción entre usuarios. No garantizamos la exactitud de los listados ni la calidad de las propiedades. Los usuarios son responsables de verificar toda la información y realizar sus propias investigaciones antes de tomar decisiones.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  En la máxima medida permitida por la ley, Jubilalia no será responsable de daños indirectos, incidentales, especiales o consecuentes resultantes del uso o la imposibilidad de usar nuestro servicio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Modificaciones del Servicio</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en cualquier momento, con o sin previo aviso.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Terminación</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Podemos terminar o suspender tu cuenta y acceso al servicio inmediatamente, sin previo aviso, por cualquier motivo, incluyendo el incumplimiento de estos términos.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Ley Aplicable</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Estos términos se rigen por las leyes de España. Cualquier disputa será resuelta en los tribunales competentes de España.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contacto</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos a través de nuestro formulario de contacto o por correo electrónico.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default TermsOfService;

