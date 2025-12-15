import React from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ShieldCheckIcon,
  HeartIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ColivingHowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/40 to-blue-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-green-700">Jubilalia.com</p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                  Tres formas de vivir acompañado, con tranquilidad y libertad
                </h1>
                <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl">
                  En Jubilalia creemos que jubilarse no significa estar solo, sino elegir cómo y con quién vivir.
                  Por eso hemos creado una plataforma pensada para personas mayores que quieren compartir, alquilar o
                  invertir juntas en nuevas formas de vivienda, con seguridad y acompañamiento.
                </p>
              </div>

              <div className="flex gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Seguridad
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <UsersIcon className="w-4 h-4" />
                  Comunidad
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  <HeartIcon className="w-4 h-4" />
                  Acompañamiento
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/dashboard/rooms"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
                Buscar habitaciones
              </Link>
              <Link
                to="/dashboard/rooms/create"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-gray-900 font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <ArrowRightIcon className="w-5 h-5" />
                Publicar habitación
              </Link>
            </div>
          </div>
        </div>

        {/* 3 formas */}
        <div className="mt-8 grid grid-cols-1 gap-6">
          {/* 1 */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <HomeIcon className="w-6 h-6 text-green-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  1) Compartir vivienda: una habitación, una compañía
                </h2>
                <p className="mt-3 text-gray-700">
                  Si tienes una habitación libre o un espacio habitable y te gustaría compartir tu hogar con otra persona
                  compatible, Jubilalia se encarga de buscarte el compañero o compañera ideal.
                </p>
                <p className="mt-3 text-gray-700">
                  Y al revés: si buscas una habitación en un hogar tranquilo, con personas afines a ti, la aplicación te
                  ayuda a encontrarla.
                </p>
                <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4">
                  <p className="text-green-900 font-medium">
                    Compartir no es solo ahorrar gastos: es ganar compañía, seguridad y bienestar.
                  </p>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/dashboard/rooms"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                  >
                    Ver habitaciones
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/dashboard/rooms/create"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-900 font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Publicar habitación
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 2 */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  2) Alquiler colaborativo: vivir mejor, sin comprar
                </h2>
                <p className="mt-3 text-gray-700">Aquí entran distintas opciones de alquiler adaptadas a cada necesidad:</p>

                <ul className="mt-4 space-y-3">
                  <li className="flex gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <p className="text-gray-700">
                      <span className="font-semibold">Coliving ya existente:</span> por ejemplo, una plaza en un coliving
                      con 40 o 50 personas, con gastos incluidos y servicios comunes.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <p className="text-gray-700">
                      <span className="font-semibold">Residencias o viviendas compartidas</span> con precio mensual claro
                      y sin complicaciones.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <p className="text-gray-700">
                      <span className="font-semibold">Alquiler en grupo:</span> como alquilar entre varias personas una
                      casa grande o un chalet (por ejemplo, una vivienda de 7 habitaciones durante varios años),
                      reduciendo costes y creando una pequeña comunidad estable.
                    </p>
                  </li>
                </ul>

                <p className="mt-4 text-gray-700 font-medium">
                  Todo con transparencia, acompañamiento y pensando en el largo plazo.
                </p>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/dashboard/properties/rental"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Ver alquileres
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/dashboard/properties/rental/create"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-900 font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Publicar alquiler
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <UsersIcon className="w-6 h-6 text-purple-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  3) Compra compartida: invertir juntos para vivir juntos
                </h2>
                <p className="mt-3 text-gray-700">Para quienes quieren ir un paso más allá, Jubilalia también facilita la compra colaborativa:</p>

                <ul className="mt-4 space-y-3">
                  <li className="flex gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                    <p className="text-gray-700">Comprar un terreno y construir un proyecto de coliving.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                    <p className="text-gray-700">Comprar un edificio entero entre varios socios.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                    <p className="text-gray-700">Crear una comunidad estable donde cada persona es copropietaria.</p>
                  </li>
                </ul>

                <p className="mt-4 text-gray-700 font-medium">
                  Una forma de invertir con sentido, pensando en el futuro, la convivencia y la tranquilidad.
                </p>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/dashboard/properties/sale"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Ver oportunidades de compra
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/dashboard/properties/sale/create"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-900 font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Publicar venta
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Cierre */}
        <div className="mt-8 bg-gray-900 text-white rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Jubilalia no es solo vivienda</h2>
              <p className="mt-2 text-white/90">
                Es comunidad, acompañamiento y una nueva forma de vivir la jubilación: más humana, más justa y más
                compartida.
              </p>
              <p className="mt-4 text-white/90 font-medium">¿Empezamos?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColivingHowItWorks;
