import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import PublicNavbar from '../components/common/PublicNavbar';
import PublicFooter from '../components/common/PublicFooter';

const CookiePolicy: React.FC = () => {
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
              Política de Cookies
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. ¿Qué son las Cookies?</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Estas cookies permiten que el sitio web recuerde tus acciones y preferencias durante un período de tiempo, por lo que no tienes que volver a configurarlas cada vez que regresas al sitio o navegas de una página a otra.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cómo Usamos las Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Jubilalia utiliza cookies para:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Mantener tu sesión activa cuando inicias sesión</li>
                  <li>Recordar tus preferencias y configuraciones</li>
                  <li>Mejorar la funcionalidad y el rendimiento del sitio</li>
                  <li>Analizar cómo los usuarios utilizan nuestro servicio</li>
                  <li>Personalizar tu experiencia</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Tipos de Cookies que Utilizamos</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">3.1 Cookies Esenciales</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Estas cookies son necesarias para el funcionamiento del sitio web y no se pueden desactivar. Incluyen cookies de autenticación y seguridad.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">3.2 Cookies de Funcionalidad</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Estas cookies permiten que el sitio web recuerde las elecciones que haces (como tu idioma o región) y proporcionan características mejoradas y más personales.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">3.3 Cookies Analíticas</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web recopilando y reportando información de forma anónima.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">3.4 Cookies de Marketing</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Estas cookies se utilizan para hacer seguimiento de los visitantes a través de diferentes sitios web con la intención de mostrar anuncios relevantes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies de Terceros</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Algunas cookies son colocadas por servicios de terceros que aparecen en nuestras páginas. Estos incluyen:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Google Analytics:</strong> Para analizar el uso del sitio web</li>
                  <li><strong>Google Maps:</strong> Para mostrar mapas interactivos</li>
                  <li><strong>Redes sociales:</strong> Para compartir contenido en redes sociales</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Gestión de Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Puedes controlar y/o eliminar las cookies como desees. Puedes eliminar todas las cookies que ya están en tu dispositivo y puedes configurar la mayoría de los navegadores para evitar que se coloquen. Sin embargo, si haces esto, es posible que tengas que ajustar manualmente algunas preferencias cada vez que visites un sitio y que algunos servicios y funcionalidades no funcionen.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Para gestionar las cookies en tu navegador:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                  <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio</li>
                  <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies y datos de sitios web</li>
                  <li><strong>Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Duración de las Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Utilizamos tanto cookies de sesión (que se eliminan cuando cierras el navegador) como cookies persistentes (que permanecen en tu dispositivo hasta que expiran o las eliminas).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cambios a esta Política</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Podemos actualizar esta Política de Cookies ocasionalmente. Te notificaremos de cualquier cambio publicando la nueva política en esta página.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contacto</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Si tienes preguntas sobre nuestra Política de Cookies, puedes contactarnos a través de nuestro formulario de contacto o por correo electrónico.
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

export default CookiePolicy;

