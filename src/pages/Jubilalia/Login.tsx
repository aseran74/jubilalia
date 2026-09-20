import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Mail, 
  Lock, 
  ArrowLeft,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isMobileApp } from '../../utils/mobileDetection';
import Modal from '../../components/common/Modal';

const JubilaliaLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, loading, user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestUserModalOpen, setIsTestUserModalOpen] = useState(false);

  // Limpiar errores cuando cambie el formulario
  useEffect(() => {
    if (formError) {
      setFormError('');
    }
  }, [formData]);

  useEffect(() => {
    if (user) {
      navigate(isMobileApp() ? '/' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setFormError('Por favor, completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      setFormError('');
      
      console.log('🔧 Iniciando login con email:', formData.email);
      await signIn(formData.email, formData.password);
      
      console.log('✅ Login exitoso');
      
      // Redirigir según el tipo de app
      if (isMobileApp()) {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      setFormError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestUser = (email: string, password: string) => {
    setFormData({ email, password });
    setIsTestUserModalOpen(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setFormError('');
      await signInWithGoogle();
      // En web, Google redirige solo. En la app nativa se abre el navegador y vuelve por deep link.
    } catch (error: any) {
      console.error('❌ Error en login con Google:', error);
      setFormError('Error al iniciar sesión con Google: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8 app-safe-header">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
                     <Link
             to="/"
             className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 mb-4"
           >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">Jubilalia</h1>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            ¡Bienvenido de vuelta!
          </h2>
          <p className="text-base text-gray-600">
            Inicia sesión para acceder a tu cuenta
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-600">Recordarme</span>
              </label>
                             <Link
                 to="/forgot-password"
                 className="text-sm text-green-600 hover:text-green-700 font-medium"
               >
                 ¿Olvidaste tu contraseña?
               </Link>
            </div>

            {/* Error Display */}
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <div className="w-5 h-5 text-red-500 flex-shrink-0">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white text-lg font-bold rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsTestUserModalOpen(true)}
              className="min-h-12 text-base font-semibold text-emerald-700 underline-offset-2 hover:underline"
            >
              Usuario de prueba
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
                             <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || loading}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Iniciar sesión con Google</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link to="/terms" className="text-green-600 hover:text-green-700">
              términos de servicio
            </Link>{' '}
            y{' '}
            <Link to="/privacy" className="text-green-600 hover:text-green-700">
              política de privacidad
            </Link>
          </p>
        </div>
      </div>

      <Modal
        isOpen={isTestUserModalOpen}
        onClose={() => setIsTestUserModalOpen(false)}
        title="Usuario de prueba"
        size="sm"
      >
        <p className="mb-5 text-base leading-relaxed text-slate-600">
          Usa estas cuentas para entrar sin registrarte. También valen en la app de Android.
        </p>
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-base font-bold text-slate-900">Usuario</h4>
            <p className="mt-2 text-sm text-slate-600"><strong>Email:</strong> test@example.com</p>
            <p className="text-sm text-slate-600"><strong>Contraseña:</strong> password</p>
            <button
              type="button"
              onClick={() => fillTestUser('test@example.com', 'password')}
              className="mt-4 w-full rounded-full bg-emerald-700 px-4 py-3 text-base font-bold text-white transition-colors hover:bg-emerald-800"
            >
              Usar este usuario
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-base font-bold text-slate-900">Administrador</h4>
            <p className="mt-2 text-sm text-slate-600"><strong>Email:</strong> admin@test.com</p>
            <p className="text-sm text-slate-600"><strong>Contraseña:</strong> admin123</p>
            <button
              type="button"
              onClick={() => fillTestUser('admin@test.com', 'admin123')}
              className="mt-4 w-full rounded-full bg-slate-800 px-4 py-3 text-base font-bold text-white transition-colors hover:bg-slate-900"
            >
              Usar administrador
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JubilaliaLogin;
