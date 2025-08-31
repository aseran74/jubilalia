import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Calendar,
  MapPin,
  Phone,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const JubilaliaRegister: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loading, profile } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    city: '',
    gender: '',
    smoking: '',
    hobbies: [] as string[],
    bio: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formError, setFormError] = useState<string>('');

  // Limpiar errores cuando cambie el formulario
  useEffect(() => {
    setFormError('');
  }, [formData]);

  const hobbiesOptions = [
    'Lectura', 'Jardinería', 'Cocina', 'Paseos', 'Música', 'Pintura',
    'Bricolaje', 'Viajes', 'Cartas', 'Ajedrez', 'Gimnasia', 'Yoga',
    'Fotografía', 'Manualidades', 'Voluntariado', 'Museos', 'Teatro'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHobbyToggle = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return false;
    }
    
    if (formData.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (!formData.fullName.trim()) {
      setFormError('El nombre completo es obligatorio');
      return false;
    }
    
    if (!formData.email.trim()) {
      setFormError('El email es obligatorio');
      return false;
    }
    
    if (!formData.dateOfBirth) {
      setFormError('La fecha de nacimiento es obligatoria');
      return false;
    }
    
    if (!formData.city.trim()) {
      setFormError('La ciudad es obligatoria');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await signUp(formData.email, formData.password, formData.fullName);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en registro:', error);
      setFormError('Error al crear la cuenta. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
                     <Link
             to="/"
             className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 mb-4"
           >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Jubilalia</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Únete a nuestra comunidad
          </h2>
          <p className="text-lg text-gray-600">
            Crea tu perfil y encuentra compañeros perfectos
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                <User className="w-6 h-6 text-green-500" />
                <span>Información Personal</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Profile Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Foto de perfil
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                      {selectedImage ? (
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Preview"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image"
                    />
                    <label
                      htmlFor="profile-image"
                      className="px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600 transition-colors"
                    >
                      Elegir foto
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de nacimiento *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    placeholder="Madrid, Barcelona..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  >
                    <option value="">Seleccionar</option>
                    <option value="male">Hombre</option>
                    <option value="female">Mujer</option>
                    <option value="other">Otro</option>
                    <option value="prefer_not_to_say">Prefiero no decirlo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Preferencias y Aficiones
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Fumas?
                  </label>
                  <select
                    name="smoking"
                    value={formData.smoking}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  >
                    <option value="">Seleccionar</option>
                    <option value="no">No fumo</option>
                    <option value="yes">Sí fumo</option>
                    <option value="occasionally">Ocasionalmente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aficiones (selecciona las que te gusten)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {hobbiesOptions.map((hobby) => (
                      <label key={hobby} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.hobbies.includes(hobby)}
                          onChange={() => handleHobbyToggle(hobby)}
                          className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{hobby}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuéntanos sobre ti
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  placeholder="Describe tu personalidad, intereses, lo que buscas en un compañero de habitación..."
                />
              </div>
            </div>

            {/* Security */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                <Lock className="w-6 h-6 text-green-500" />
                <span>Seguridad</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                      placeholder="Repite tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

                         {/* Error Display */}
             {formError && (
               <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                 <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                 <p className="text-red-700 text-sm">{formError}</p>
               </div>
             )}

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xl font-bold rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando perfil...</span>
                  </div>
                ) : (
                  'Crear mi perfil'
                )}
              </button>
              
              <p className="mt-4 text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JubilaliaRegister;
