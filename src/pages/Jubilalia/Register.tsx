import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  CheckCircle,
  XCircle,
  Upload,
  Phone,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { isMobileApp } from '../../utils/mobileDetection';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    city: '',
    phone: '',
    gender: '',
    smoking: '',
    bio: '',
    interests: [] as string[],
    acceptTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpPhone, setHelpPhone] = useState('');
  const [helpName, setHelpName] = useState('');
  const [helpSubmitted, setHelpSubmitted] = useState(false);

  const hobbiesOptions = [
    'Lectura', 'Jardinería', 'Cocina', 'Paseos', 'Música', 'Pintura',
    'Bricolaje', 'Viajes', 'Cartas', 'Ajedrez', 'Gimnasia', 'Yoga',
    'Fotografía', 'Manualidades', 'Voluntariado', 'Museos', 'Teatro'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setFormError(''); // Limpiar el error cuando el usuario empieza a escribir
  };

  const handleHobbyToggle = (hobby: string) => {
    setFormData(prev => {
      const isSelected = prev.interests.includes(hobby);
      return {
        ...prev,
        interests: isSelected
          ? prev.interests.filter(h => h !== hobby)
          : [...prev.interests, hobby]
      };
    });
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
    
    if (formData.dateOfBirth && formData.dateOfBirth.trim() !== '') {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        setFormError('La fecha de nacimiento no es válida');
        return false;
      }
      
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const exactAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 
        : age;
      
      if (exactAge < 18) {
        setFormError('Debes tener al menos 18 años para registrarte');
        return false;
      }
      
      if (birthDate > today) {
        setFormError('La fecha de nacimiento no puede ser futura');
        return false;
      }
    }
    
    return true;
  };

  const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
  
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Si ya existe, la reemplaza
      });
  
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error('Error al subir la imagen.');
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!publicUrlData) {
        throw new Error('No se pudo obtener la URL pública de la imagen.');
    }

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setFormError('');

      console.log('🔧 Iniciando registro...');

      // Primero registrar el usuario sin datos adicionales
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      console.log('🔧 Respuesta de signUp:', { data, error });

      if (error) {
        console.error('❌ Error en signUp:', error);
        setFormError(error.message);
        return;
      }

      if (data.user) {
        console.log('✅ Usuario registrado exitosamente:', data.user.id);
        const userId = data.user.id;

        // Ahora crear el perfil con los datos del formulario
        try {
          let profileImageUrl = null;
          
          // Subir imagen si se seleccionó una
          if (selectedImage) {
            console.log('🔧 Subiendo imagen de perfil...');
            profileImageUrl = await uploadProfileImage(selectedImage, userId);
            console.log('✅ Imagen subida:', profileImageUrl);
          }

          console.log('🔧 Creando perfil...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              auth_user_id: userId,
              email: formData.email,
              full_name: formData.fullName,
              phone: formData.phone || null,
              date_of_birth: formData.dateOfBirth || null,
              city: formData.city || null,
              gender: formData.gender || null,
              bio: formData.bio || null,
              interests: formData.interests,
              country: 'España',
              avatar_url: profileImageUrl
            });

          if (profileError) {
            console.error('❌ Error creando perfil:', profileError);
            setFormError('Error al crear el perfil: ' + profileError.message);
            return;
          }

          console.log('✅ Perfil creado exitosamente');
          
          // Redirigir según el tipo de app
          if (isMobileApp()) {
            navigate('/landing');
          } else {
            navigate('/dashboard');
          }
        } catch (profileError) {
          console.error('❌ Error en creación de perfil:', profileError);
          setFormError('Error al crear el perfil. Inténtalo de nuevo.');
        }
      } else {
        console.warn('⚠️ No se recibió usuario en la respuesta');
        setFormError('Error inesperado en el registro');
      }
    } catch (error: any) {
      console.error('❌ Error during registration:', error);
      setFormError(error.message || 'Error al registrarse. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setFormError('');
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Error signing up with Google:', error);
      setFormError('Error al registrarse con Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!helpName.trim() || !helpPhone.trim()) {
      setFormError('Por favor, completa tu nombre y teléfono');
      return;
    }

    try {
      // Aquí podrías enviar la solicitud de ayuda a tu backend
      // Por ahora, simularemos el envío
      console.log('Solicitud de ayuda:', { name: helpName, phone: helpPhone });
      
      // Simular envío exitoso
      setHelpSubmitted(true);
      
      // Opcional: enviar a Supabase o tu sistema de gestión
      // await supabase.from('help_requests').insert({
      //   name: helpName,
      //   phone: helpPhone,
      //   type: 'registration_help',
      //   created_at: new Date().toISOString()
      // });
      
    } catch (error) {
      console.error('Error enviando solicitud de ayuda:', error);
      setFormError('Error al enviar la solicitud. Inténtalo de nuevo.');
    }
  };

  const resetHelpModal = () => {
    setShowHelpModal(false);
    setHelpPhone('');
    setHelpName('');
    setHelpSubmitted(false);
    setFormError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowRight className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">Jubilalia</h1>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Únete a nuestra comunidad
          </h2>
          <p className="text-base text-gray-600">
            Crea tu perfil y encuentra compañeros perfectos
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                <User className="w-5 h-5 text-green-500" />
                <span>Información Personal</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
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
                        <Upload className="w-8 h-8 text-gray-400" />
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de nacimiento <span className="text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Si proporcionas tu fecha de nacimiento, debes tener al menos 18 años
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
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

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
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
                          checked={formData.interests.includes(hobby)}
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  placeholder="Describe tu personalidad, intereses, lo que buscas en un compañero de habitación..."
                />
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-green-500" />
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
                      className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                      placeholder="Mínimo 6 caracteres"
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
                      className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
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
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-12 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white text-lg font-bold rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">o</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full md:w-auto px-8 py-2.5 bg-white border-2 border-gray-300 text-gray-700 text-base font-semibold rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Registrarse con Google</span>
              </button>

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">o</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Te Ayudamos Button */}
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-base font-semibold rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
              >
                <Phone className="w-5 h-5" />
                <span>Te ayudamos</span>
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

        {/* Modal de Ayuda */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              <button
                onClick={resetHelpModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {!helpSubmitted ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      ¿Te ayudamos?
                    </h3>
                    <p className="text-gray-600">
                      Si tienes dificultades para registrarte, déjanos tu teléfono y te llamaremos para ayudarte paso a paso.
                    </p>
                  </div>

                  <form onSubmit={handleHelpRequest} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tu nombre
                      </label>
                      <input
                        type="text"
                        value={helpName}
                        onChange={(e) => setHelpName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tu teléfono
                      </label>
                      <input
                        type="tel"
                        value={helpPhone}
                        onChange={(e) => setHelpPhone(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                        placeholder="+34 600 000 000"
                      />
                    </div>

                    {formError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-sm">{formError}</p>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={resetHelpModal}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold"
                      >
                        Solicitar ayuda
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    ¡Solicitud enviada!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Gracias {helpName}. Te llamaremos al <strong>{helpPhone}</strong> en las próximas 24 horas para ayudarte con el registro.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      <strong>Horario de llamadas:</strong><br />
                      Lunes a Viernes: 9:00 - 18:00<br />
                      Sábados: 10:00 - 14:00
                    </p>
                  </div>
                  <button
                    onClick={resetHelpModal}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold"
                  >
                    Entendido
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;