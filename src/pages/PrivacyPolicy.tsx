import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import PublicNavbar from '../components/common/PublicNavbar';
import PublicFooter from '../components/common/PublicFooter';

const PrivacyPolicy: React.FC = () => {
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
              Política de Privacidad
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introducción</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  En Jubilalia, nos comprometemos a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información personal cuando utilizas nuestro servicio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Información que Recopilamos</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">2.1 Información Personal</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Recopilamos información que nos proporcionas directamente, incluyendo:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Nombre completo</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono</li>
                  <li>Información de perfil (foto, biografía, preferencias)</li>
                  <li>Información de propiedades que publicas</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">2.2 Información de Uso</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Recopilamos automáticamente información sobre cómo utilizas nuestro servicio, incluyendo:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de permanencia</li>
                  <li>Búsquedas realizadas</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cómo Usamos tu Información</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Utilizamos la información recopilada para:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Proporcionar, mantener y mejorar nuestros servicios</li>
                  <li>Procesar transacciones y enviar notificaciones</li>
                  <li>Personalizar tu experiencia</li>
                  <li>Comunicarnos contigo sobre el servicio</li>
                  <li>Detectar y prevenir fraudes</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compartir Información</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  No vendemos tu información personal. Podemos compartir tu información en las siguientes circunstancias:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Con otros usuarios cuando publicas contenido público</li>
                  <li>Con proveedores de servicios que nos ayudan a operar</li>
                  <li>Cuando sea requerido por ley o para proteger nuestros derechos</li>
                  <li>En caso de fusión, adquisición o venta de activos</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Seguridad de los Datos</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Tus Derechos</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Tienes derecho a:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Acceder a tu información personal</li>
                  <li>Rectificar información inexacta</li>
                  <li>Solicitar la eliminación de tus datos</li>
                  <li>Oponerte al procesamiento de tus datos</li>
                  <li>Portabilidad de datos</li>
                  <li>Retirar tu consentimiento en cualquier momento</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Utilizamos cookies y tecnologías similares. Para más información, consulta nuestra <Link to="/cookies" className="text-green-600 hover:text-green-700 underline">Política de Cookies</Link>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Retención de Datos</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Conservamos tu información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cambios a esta Política</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos de cualquier cambio publicando la nueva política en esta página y actualizando la fecha de "Última actualización".
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contacto</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos a través de nuestro formulario de contacto o por correo electrónico.
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

export default PrivacyPolicy;

