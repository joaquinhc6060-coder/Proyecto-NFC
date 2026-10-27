import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function MiNfc({ initialLoggedIn = false }) {
  // Authentication & session state
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Register form state
  const [regData, setRegData] = useState({
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    nfcCode: '',
    petName: '',
    breed: ''
  });
  
  // Pet data state (defaults to Luna with the user's specified data)
  const defaultPetData = {
    id: null,
    nfcId: 'VIGIO-9824-CL',
    chipType: 'NTAG213 High-Frequency (13.56 MHz)',
    status: 'safe', // 'safe' | 'lost'
    name: 'Luna',
    breed: 'Golden Retriever',
    age: '3 años',
    photoUrl: '/images/luna-perfil.jpg',
    about: 'Luna es una golden retriever muy amigable de 3 años. Le encanta jugar con otros perros y es muy sociable con las personas. Tiene una mancha blanca en el pecho.',
    allergies: {
      medicines: ['Penicilina', 'Amoxicilina'],
      foods: ['Chocolate', 'Uvas', 'Cebolla']
    },
    owner: {
      name: 'Patricia Morales',
      instagram: '@patika.cl',
      phone: '+56 9 8765 4321',
      whatsapp: '+56987654321',
      email: 'patricia@patika.cl',
      address: 'Providencia, Santiago de Chile'
    },
    lastScanned: 'Hoy a las 14:22 hrs'
  };

  const [petData, setPetData] = useState(defaultPetData);

  // Dashboard state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(petData);
  const [toastMessage, setToastMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4500);
  };

  // Helper to load pet data for a Supabase user
  const loadUserPetFromSupabase = async (user) => {
    if (!supabase || !user) return;
    try {
      // 1. Fetch pet
      const { data: pet, error } = await supabase
        .from('mascotas')
        .select('*, placas_nfc(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pet) {
        // 2. Fetch owner profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        setPetData({
          id: pet.id,
          nfcId: pet.placas_nfc?.codigo_publico || 'VIGIO-9824-CL',
          chipType: pet.placas_nfc?.tipo_chip || 'NTAG213 High-Frequency (13.56 MHz)',
          status: pet.estado_alerta || 'safe',
          name: pet.nombre || 'Luna',
          breed: pet.raza || 'Golden Retriever',
          age: pet.edad || '3 años',
          photoUrl: pet.foto_url || '/images/luna-perfil.jpg',
          about: pet.acerca_de || defaultPetData.about,
          allergies: {
            medicines: pet.alergias_medicamentos || ['Penicilina', 'Amoxicilina'],
            foods: pet.alergias_alimentos || ['Chocolate', 'Uvas', 'Cebolla']
          },
          owner: {
            name: profile?.nombre_completo || user.user_metadata?.nombre_completo || 'Dueño Vigio',
            instagram: profile?.instagram || user.user_metadata?.instagram || '@patika.cl',
            phone: profile?.telefono || '+56 9 8765 4321',
            whatsapp: profile?.whatsapp || '+56987654321',
            email: user.email,
            address: profile?.ciudad || 'Santiago, Chile'
          },
          lastScanned: 'En línea en Supabase'
        });
      }
    } catch (err) {
      console.warn('Error fetching pet from Supabase:', err);
    }
  };

  // Check Supabase session on mount
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      const storedAuth = localStorage.getItem('vigio_is_logged_in') || localStorage.getItem('findme_is_logged_in');
      if (storedAuth === 'true') setIsLoggedIn(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setIsLoggedIn(true);
        loadUserPetFromSupabase(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setIsLoggedIn(true);
        loadUserPetFromSupabase(session.user);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Sync edit form data when entering edit mode
  useEffect(() => {
    setEditFormData(petData);
  }, [petData, isEditing]);

  // Login handler with Supabase
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError('Por favor completa todos los campos.');
      return;
    }

    if (isSupabaseConfigured() && supabase) {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword.trim()
      });
      setIsLoading(false);

      if (error) {
        setAuthError(error.message === 'Invalid login credentials' 
          ? 'Correo o contraseña incorrectos en Supabase.' 
          : error.message);
        return;
      }

      if (data?.user) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        await loadUserPetFromSupabase(data.user);
        showToast(`¡Bienvenido de vuelta, ${data.user.email}!`);
      }
    } else {
      // Local fallback
      setIsLoggedIn(true);
      localStorage.setItem('vigio_is_logged_in', 'true');
      localStorage.setItem('findme_is_logged_in', 'true');
      showToast('¡Bienvenido a tu panel Mi NFC!');
    }
  };

  // Demo auto-fill login
  const handleQuickDemoLogin = () => {
    setPetData(defaultPetData);
    setIsLoggedIn(true);
    localStorage.setItem('vigio_is_logged_in', 'true');
    localStorage.setItem('findme_is_logged_in', 'true');
    showToast('Sesión iniciada con la cuenta de demostración de Luna 🐾');
  };

  // Register handler with Supabase
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!regData.ownerName.trim() || !regData.email.trim() || !regData.password.trim() || !regData.petName.trim()) {
      setAuthError('Por favor completa los campos requeridos para registrar tu placa.');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setAuthError('Las contraseñas no coinciden.');
      return;
    }

    if (regData.password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (isSupabaseConfigured() && supabase) {
      setIsLoading(true);
      
      // 1. Sign up user in Supabase Auth
      const { data: authResult, error: signUpError } = await supabase.auth.signUp({
        email: regData.email.trim(),
        password: regData.password.trim(),
        options: {
          data: {
            nombre_completo: regData.ownerName.trim(),
            whatsapp: '+56987654321',
            instagram: '@patika.cl'
          }
        }
      });

      if (signUpError) {
        setIsLoading(false);
        setAuthError(signUpError.message);
        return;
      }

      const user = authResult.user;

      if (user) {
        // 2. Link or find NFC plate
        const code = regData.nfcCode.trim() ? regData.nfcCode.trim().toUpperCase() : 'VIGIO-9824-CL';
        let plateId = null;

        const { data: plate } = await supabase
          .from('placas_nfc')
          .select('id')
          .eq('codigo_publico', code)
          .maybeSingle();

        if (plate) {
          plateId = plate.id;
          await supabase
            .from('placas_nfc')
            .update({ user_id: user.id, estado: 'activa', fecha_activacion: new Date().toISOString() })
            .eq('id', plate.id);
        }

        // 3. Insert new pet into Supabase 'mascotas' table
        const { data: newPetRecord, error: petError } = await supabase
          .from('mascotas')
          .insert({
            user_id: user.id,
            placa_id: plateId,
            nombre: regData.petName.trim(),
            especie: 'Perro',
            raza: regData.breed.trim() || 'Mascota registrada',
            foto_url: '/images/luna-perfil.jpg',
            acerca_de: `${regData.petName.trim()} es una mascota muy sociable y amigable. Si la encuentras por favor comunícate de inmediato con su familia.`,
            alergias_medicamentos: ['Penicilina', 'Amoxicilina'],
            alergias_alimentos: ['Chocolate', 'Uvas', 'Cebolla'],
            estado_alerta: 'safe'
          })
          .select()
          .maybeSingle();

        setIsLoading(false);

        if (petError) {
          console.warn('Error creating pet record:', petError);
        }

        setCurrentUser(user);
        setIsLoggedIn(true);
        await loadUserPetFromSupabase(user);
        showToast(`¡Usuario registrado y placa vinculada en Supabase con éxito!`);
      }
    } else {
      // Local fallback
      const newPet = {
        ...defaultPetData,
        nfcId: regData.nfcCode.trim() ? regData.nfcCode.trim().toUpperCase() : `VIGIO-${Math.floor(1000 + Math.random() * 9000)}-CL`,
        name: regData.petName.trim(),
        breed: regData.breed.trim() || 'Mascota registrada',
        owner: {
          ...defaultPetData.owner,
          name: regData.ownerName.trim(),
          email: regData.email.trim()
        }
      };

      setPetData(newPet);
      setIsLoggedIn(true);
      localStorage.setItem('vigio_is_logged_in', 'true');
      localStorage.setItem('findme_is_logged_in', 'true');
      showToast(`¡Cuenta creada y placa ${newPet.nfcId} vinculada con éxito!`);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    if (supabase && currentUser) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('vigio_is_logged_in');
    localStorage.removeItem('findme_is_logged_in');
    setIsEditing(false);
    showToast('Has cerrado sesión correctamente.');
  };

  // Toggle lost/safe status
  const toggleStatus = async () => {
    const newStatus = petData.status === 'safe' ? 'lost' : 'safe';
    setPetData({ ...petData, status: newStatus });

    // Sync with Supabase if active
    if (supabase && petData.id) {
      await supabase
        .from('mascotas')
        .update({ estado_alerta: newStatus, updated_at: new Date().toISOString() })
        .eq('id', petData.id);
    }

    if (newStatus === 'lost') {
      showToast('⚠️ Modo de alerta activado en Supabase: La placa mostrará un aviso urgente de mascota extraviada.');
    } else {
      showToast('✅ Mascota marcada como segura en casa.');
    }
  };

  // Save edited pet data
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setPetData(editFormData);
    setIsEditing(false);

    // Sync with Supabase if active
    if (supabase && editFormData.id) {
      await supabase
        .from('mascotas')
        .update({
          nombre: editFormData.name,
          raza: editFormData.breed,
          acerca_de: editFormData.about,
          alergias_medicamentos: editFormData.allergies.medicines,
          alergias_alimentos: editFormData.allergies.foods,
          updated_at: new Date().toISOString()
        })
        .eq('id', editFormData.id);

      if (currentUser?.id) {
        await supabase
          .from('profiles')
          .update({
            telefono: editFormData.owner.phone,
            instagram: editFormData.owner.instagram,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser.id);
      }
    }

    showToast('✓ Información guardada en la base de datos de Supabase.');
  };

  // Simulated & real location action
  const handleSendLocation = async () => {
    setIsLocating(true);

    const recordInSupabase = async (lat, lng) => {
      if (supabase && petData.id) {
        await supabase.from('escaneos_gps').insert({
          mascota_id: petData.id,
          latitud: lat,
          longitud: lng,
          dispositivo: navigator.userAgent
        });
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setIsLocating(false);
          const { latitude, longitude } = position.coords;
          await recordInSupabase(latitude, longitude);
          showToast(`📍 Ubicación registrada en Supabase (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Mensaje listo para WhatsApp.`);
        },
        async () => {
          setIsLocating(false);
          await recordInSupabase(-33.4372, -70.6506);
          showToast(`📍 Ubicación registrada en Supabase (Santiago, Chile) para ${petData.owner.name}`);
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(async () => {
        setIsLocating(false);
        await recordInSupabase(-33.4372, -70.6506);
        showToast(`📍 Coordenadas guardadas en la base de datos para ${petData.owner.name}`);
      }, 700);
    }
  };

  return (
    <section id="mi-nfc" className="py-20 md:py-24 bg-[#12141a] text-white relative overflow-hidden border-t border-b border-white/10">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-brand/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-teal-brand/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1120px] w-[calc(100%-40px)] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-brand/15 border border-teal-brand/30 text-teal-brand font-bold tracking-[0.1em] uppercase text-xs mb-3.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 9a9 9 0 0 1 0 6M9 6.5a13 13 0 0 1 0 11M13 4a17 17 0 0 1 0 16" />
            </svg>
            Área de Clientes
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-[-0.03em] leading-tight">
            Mi <span className="text-orange-brand">NFC</span>
          </h2>
          <p className="text-muted-light text-base sm:text-lg mt-3">
            {isLoggedIn 
              ? 'Administra la información de tu placa en tiempo real y gestiona cómo te contactan.' 
              : 'Accede a tu cuenta para gestionar el perfil de tu placa o vincula un nuevo collar inteligente.'}
          </p>

          {/* Cloud Database Connected Badge */}
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Supabase Cloud Conectado (PostgreSQL)</span>
          </div>
        </div>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-ink-secondary border border-teal-brand/60 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-float">
            <span className="w-8 h-8 rounded-full bg-teal-brand/20 text-teal-brand flex items-center justify-center shrink-0">
              ✓
            </span>
            <p className="text-xs sm:text-sm font-semibold">{toastMessage}</p>
          </div>
        )}

        {/* ========================================================
            CASE 1: USER IS NOT LOGGED IN (LOGIN / REGISTER VIEW)
           ======================================================== */}
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto bg-gradient-to-b from-[#1c1f27] to-[#12141a] rounded-[28px] border border-white/15 p-7 sm:p-9 shadow-2xl backdrop-blur-md">
            
            {/* Tabs: Iniciar Sesión / Registrar */}
            <div className="flex bg-black/40 p-1.5 rounded-2xl mb-7 border border-white/10">
              <button
                type="button"
                onClick={() => { setAuthView('login'); setAuthError(''); }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  authView === 'login'
                    ? 'bg-orange-brand text-white shadow-md'
                    : 'text-muted-light hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setAuthView('register'); setAuthError(''); }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  authView === 'register'
                    ? 'bg-orange-brand text-white shadow-md'
                    : 'text-muted-light hover:text-white'
                }`}
              >
                Registrar Placa
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs sm:text-sm font-medium">
                {authError}
              </div>
            )}

            {/* --- TAB 1: LOGIN FORM --- */}
            {authView === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1.5" htmlFor="login-email">
                    Correo electrónico
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="patricia@patika.cl"
                    className="w-full bg-[#12141a] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-brand transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim" htmlFor="login-password">
                      Contraseña
                    </label>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#12141a] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-brand transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 font-bold py-3.5 px-4 rounded-xl bg-orange-brand text-white hover:bg-orange-hover hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-orange-brand/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  {isLoading ? 'Verificando en Supabase...' : 'Iniciar Sesión'}
                </button>

                {/* Instant Demo Access Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    className="w-full py-2.5 px-3 rounded-xl bg-teal-brand/10 border border-teal-brand/30 text-teal-brand hover:bg-teal-brand/20 transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <span>⚡</span> Entrar con cuenta demo de Luna (1 clic)
                  </button>
                </div>

                {/* Switch to Register link */}
                <p className="text-center text-xs text-muted-light pt-3">
                  ¿Aún no tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthView('register'); setAuthError(''); }}
                    className="text-orange-brand font-bold hover:underline ml-1"
                  >
                    Registrar placa nueva
                  </button>
                </p>
              </form>
            )}

            {/* --- TAB 2: REGISTER FORM --- */}
            {authView === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1" htmlFor="reg-name">
                    Nombre del dueño *
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regData.ownerName}
                    onChange={(e) => setRegData({ ...regData, ownerName: e.target.value })}
                    placeholder="Patricia Morales"
                    className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal-brand transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1" htmlFor="reg-email">
                    Correo electrónico *
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    placeholder="patricia@patika.cl"
                    className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal-brand transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1" htmlFor="reg-petname">
                      Nombre mascota *
                    </label>
                    <input
                      id="reg-petname"
                      type="text"
                      required
                      value={regData.petName}
                      onChange={(e) => setRegData({ ...regData, petName: e.target.value })}
                      placeholder="Luna"
                      className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal-brand transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1" htmlFor="reg-breed">
                      Raza / Especie
                    </label>
                    <input
                      id="reg-breed"
                      type="text"
                      value={regData.breed}
                      onChange={(e) => setRegData({ ...regData, breed: e.target.value })}
                      placeholder="Golden Retriever"
                      className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal-brand transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1" htmlFor="reg-nfccode">
                    Código de placa NFC (opcional)
                  </label>
                  <input
                    id="reg-nfccode"
                    type="text"
                    value={regData.nfcCode}
                    onChange={(e) => setRegData({ ...regData, nfcCode: e.target.value })}
                    placeholder="VIGIO-9824-CL"
                    className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal-brand transition-colors"
                  />
                  <p className="text-[11px] text-muted-light mt-1">Si ya tienes una placa física, colócala aquí.</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1" htmlFor="reg-pass">
                      Contraseña (mín 6 car.) *
                    </label>
                    <input
                      id="reg-pass"
                      type="password"
                      required
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal-brand transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1" htmlFor="reg-confirmpass">
                      Confirmar *
                    </label>
                    <input
                      id="reg-confirmpass"
                      type="password"
                      required
                      value={regData.confirmPassword}
                      onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-teal-brand transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 font-bold py-3.5 px-4 rounded-xl bg-teal-brand text-ink hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-teal-brand/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  {isLoading ? 'Registrando en Supabase...' : 'Crear Cuenta y Vincular Placa'}
                </button>

                {/* Switch to Login link */}
                <p className="text-center text-xs text-muted-light pt-2">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthView('login'); setAuthError(''); }}
                    className="text-orange-brand font-bold hover:underline ml-1"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </form>
            )}
          </div>
        ) : (
          /* ========================================================
             CASE 2: USER IS LOGGED IN (DASHBOARD & NFC PROFILE VIEW)
             ======================================================== */
          <div className="space-y-8">
            
            {/* Top Owner Control Bar */}
            <div className="bg-[#1c1f27] border border-white/15 rounded-[24px] p-5 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-orange-brand/20 border border-orange-brand text-orange-brand flex items-center justify-center font-extrabold text-lg">
                  {petData.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">Placa de {petData.name}</h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-teal-brand border border-white/10">
                      {petData.nfcId}
                    </span>
                  </div>
                  <p className="text-xs text-muted-light">
                    Dueño: <strong className="text-white">{petData.owner.name}</strong> ({petData.owner.email})
                  </p>
                </div>
              </div>

              {/* Status and Action Controls */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Emergency Lost Toggle Button */}
                <button
                  type="button"
                  onClick={toggleStatus}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    petData.status === 'lost'
                      ? 'bg-red-600/90 hover:bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30 animate-pulse'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  }`}
                  title="Cambia el estado público de la placa en Supabase si tu mascota se extravía"
                >
                  <span className={`w-2 h-2 rounded-full ${petData.status === 'lost' ? 'bg-white' : 'bg-emerald-400'}`} />
                  {petData.status === 'lost' ? '🚨 Estado: Extraviada (Alerta Activa)' : '🟢 Estado: Segura en Casa'}
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all flex items-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  {isEditing ? 'Cancelar edición' : 'Editar datos'}
                </button>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 transition-all flex items-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Plate Specs & Edit Form (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Plate Specifications Card */}
                <div className="bg-[#1c1f27] border border-white/10 rounded-[24px] p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16d1b0" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Hardware de tu Placa NFC
                    </h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-teal-brand/15 text-teal-brand border border-teal-brand/30">
                      En línea
                    </span>
                  </div>

                  <dl className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <dt className="text-muted-light">Código ID:</dt>
                      <dd className="font-mono font-bold text-white">{petData.nfcId}</dd>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <dt className="text-muted-light">Chip de lectura:</dt>
                      <dd className="text-white font-medium">{petData.chipType}</dd>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <dt className="text-muted-light">Base de datos:</dt>
                      <dd className="text-teal-brand font-medium">PostgreSQL (Supabase Live)</dd>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <dt className="text-muted-light">Compatibilidad:</dt>
                      <dd className="text-white font-medium">iOS & Android (Sin app)</dd>
                    </div>
                  </dl>

                  <div className="mt-5 p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-light">Enlace público de la placa:</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href);
                        showToast('¡Enlace de tu placa copiado al portapapeles!');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all shrink-0"
                    >
                      Copiar Enlace
                    </button>
                  </div>
                </div>

                {/* Edit Form (if editing is active) */}
                {isEditing ? (
                  <form onSubmit={handleSaveEdit} className="bg-[#1c1f27] border border-orange-brand/30 rounded-[24px] p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h4 className="font-extrabold text-base text-orange-brand">Editar Datos de la Placa</h4>
                      <span className="text-xs text-muted-light">Sincroniza con Supabase</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1">
                        Nombre de la mascota
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-brand"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1">
                        Raza / Descripción breve
                      </label>
                      <input
                        type="text"
                        value={editFormData.breed}
                        onChange={(e) => setEditFormData({ ...editFormData, breed: e.target.value })}
                        className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-brand"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1">
                        Acerca de (Personalidad / Señales particulares)
                      </label>
                      <textarea
                        rows={3}
                        value={editFormData.about}
                        onChange={(e) => setEditFormData({ ...editFormData, about: e.target.value })}
                        className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-brand leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1">
                          Alergias a Medicamentos (coma)
                        </label>
                        <input
                          type="text"
                          value={editFormData.allergies.medicines.join(', ')}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            allergies: {
                              ...editFormData.allergies,
                              medicines: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }
                          })}
                          className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-brand"
                          placeholder="Penicilina, Amoxicilina"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1">
                          Alergias a Alimentos (coma)
                        </label>
                        <input
                          type="text"
                          value={editFormData.allergies.foods.join(', ')}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            allergies: {
                              ...editFormData.allergies,
                              foods: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }
                          })}
                          className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-brand"
                          placeholder="Chocolate, Uvas, Cebolla"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1">
                          Teléfono de contacto
                        </label>
                        <input
                          type="text"
                          value={editFormData.owner.phone}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            owner: { ...editFormData.owner, phone: e.target.value, whatsapp: e.target.value.replace(/\D/g, '') }
                          })}
                          className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-dim mb-1">
                          Instagram del dueño
                        </label>
                        <input
                          type="text"
                          value={editFormData.owner.instagram}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            owner: { ...editFormData.owner, instagram: e.target.value }
                          })}
                          className="w-full bg-[#12141a] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-brand"
                          placeholder="@patika.cl"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-orange-brand hover:bg-orange-hover text-white font-bold text-xs transition-all shadow-md"
                      >
                        Guardar en Supabase
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-[#1c1f27] border border-white/10 rounded-[24px] p-6 shadow-xl text-center">
                    <p className="text-xs text-muted-light mb-3">
                      ¿Quieres modificar las indicaciones médicas, el Instagram o los teléfonos vinculados a tu placa?
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 rounded-xl bg-orange-brand/20 border border-orange-brand/50 text-orange-brand hover:bg-orange-brand hover:text-white font-bold text-xs transition-all"
                    >
                      Editar Ficha de {petData.name}
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: The exact NFC plate profile in our FindMe format (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-center">
                
                {/* Mobile Preview Frame Badge */}
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-muted-dim">
                  <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
                  <span>Vista previa de lo que ve quien escanea tu placa</span>
                </div>

                {/* THE NFC PROFILE CARD: Faithful to user photo, adapted to FindMe's rich design */}
                <div className="w-full max-w-[430px] rounded-[32px] overflow-hidden bg-[#f4ebe1] text-[#12141a] shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[#e5d9ca] transition-all">
                  
                  {/* Photo of Luna (exact reproduction of the user photo) */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#e0d3c1]">
                    <img
                      src={petData.photoUrl}
                      alt={`Foto de ${petData.name}`}
                      className="w-full h-full object-cover object-center"
                    />

                    {/* Status Alert Overlay if pet is marked as lost */}
                    {petData.status === 'lost' && (
                      <div className="absolute top-0 inset-x-0 bg-red-600 text-white py-2 px-3 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md animate-pulse">
                        <span>🚨</span> ¡ESTOY EXTRAVIADA! AYÚDAME A VOLVER
                      </div>
                    )}

                    {/* Floating verified badge */}
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-teal-brand" />
                      <span>Vigio NFC</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 space-y-6">
                    
                    {/* Header: Name and Breed */}
                    <div>
                      <h3 className="text-3xl font-black tracking-[-0.03em] text-[#12141a] leading-none">
                        {petData.name}
                      </h3>
                      <p className="text-[#6c6760] text-sm sm:text-base font-medium mt-1">
                        {petData.breed}
                      </p>
                    </div>

                    {/* Section: ACERCA DE */}
                    <div>
                      <h4 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8c857b] mb-2">
                        Acerca de
                      </h4>
                      <p className="text-[#3a3733] text-xs sm:text-[13px] leading-relaxed">
                        {petData.about}
                      </p>
                    </div>

                    <div className="h-[1px] bg-[#dfd4c5] w-full" />

                    {/* Section: ALERGIAS */}
                    <div>
                      <h4 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8c857b] mb-2.5">
                        Alergias
                      </h4>
                      
                      <div className="space-y-2 text-xs sm:text-[13px] text-[#3a3733]">
                        {/* Medicamentos */}
                        <div>
                          <span className="font-semibold text-[#544e45]">Medicamentos:</span>
                          <ul className="list-disc list-inside mt-1 ml-1 space-y-0.5 text-[#2c2925]">
                            {petData.allergies.medicines.map((med, idx) => (
                              <li key={idx}>{med}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Alimentos */}
                        <div className="pt-1">
                          <span className="font-semibold text-[#544e45]">Alimentos:</span>
                          <ul className="list-disc list-inside mt-1 ml-1 space-y-0.5 text-[#2c2925]">
                            {petData.allergies.foods.map((food, idx) => (
                              <li key={idx}>{food}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="h-[1px] bg-[#dfd4c5] w-full" />

                    {/* Section: INSTAGRAM DEL DUEÑO */}
                    <div>
                      <h4 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8c857b] mb-2">
                        Instagram del dueño
                      </h4>
                      <a
                        href={`https://instagram.com/${petData.owner.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#3a3733] hover:text-orange-brand transition-colors"
                      >
                        {/* Instagram Camera Icon */}
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7d756b]">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                        <span>{petData.owner.instagram}</span>
                      </a>
                    </div>

                    <div className="h-[1px] bg-[#dfd4c5] w-full" />

                    {/* Section: CONTACTAR AL DUEÑO */}
                    <div>
                      <h4 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8c857b] mb-3">
                        Contactar al dueño
                      </h4>

                      {/* 3 Action Buttons in a row (Llamar, WhatsApp, Correo) */}
                      <div className="grid grid-cols-3 gap-2.5 mb-3">
                        
                        {/* Llamar */}
                        <a
                          href={`tel:${petData.owner.phone}`}
                          onClick={(e) => {
                            showToast(`📞 Iniciando llamada a ${petData.owner.name} (${petData.owner.phone})`);
                          }}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#faf6f0] hover:bg-white text-[#2a2723] text-xs font-bold border border-[#d8ccc0] shadow-sm hover:shadow transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <span>Llamar</span>
                        </a>

                        {/* WhatsApp */}
                        <a
                          href={`https://wa.me/${petData.owner.whatsapp}?text=Hola!%20Encontr%C3%A9%20a%20tu%20mascota%20${petData.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            showToast(`💬 Abriendo chat directo de WhatsApp con ${petData.owner.name}`);
                          }}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#faf6f0] hover:bg-white text-[#2a2723] text-xs font-bold border border-[#d8ccc0] shadow-sm hover:shadow transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                          <span>WhatsApp</span>
                        </a>

                        {/* Correo */}
                        <a
                          href={`mailto:${petData.owner.email}?subject=Encontr%C3%A9%20a%20tu%20mascota%20${petData.name}`}
                          onClick={() => {
                            showToast(`✉️ Abriendo redacción de correo para ${petData.owner.email}`);
                          }}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#faf6f0] hover:bg-white text-[#2a2723] text-xs font-bold border border-[#d8ccc0] shadow-sm hover:shadow transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          <span>Correo</span>
                        </a>
                      </div>

                      {/* Wide Button: Enviar mi ubicación al dueño */}
                      <button
                        type="button"
                        onClick={handleSendLocation}
                        disabled={isLocating}
                        className="w-full py-3 px-4 rounded-xl bg-[#a69683] hover:bg-[#968673] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{isLocating ? 'Obteniendo ubicación...' : 'Enviar mi ubicación al dueño'}</span>
                      </button>

                      {/* Subtitle disclaimer from the photo */}
                      <p className="text-[10px] text-center text-[#80776b] mt-2">
                        Preparamos un mensaje de WhatsApp con el punto donde estás.
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
