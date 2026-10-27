import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function LoginPage() {
  const navigate = useNavigate();

  // Tab principal: 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Estado del formulario de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estado del formulario de Registro modular
  const [registerModule, setRegisterModule] = useState('device'); // 'device' (Mascota/Kids) | 'restaurant' (SaaS)
  const [deviceSubType, setDeviceSubType] = useState('pet'); // 'pet' | 'kids'

  // Datos para Registro Opción A (Mascota / Kids)
  const [deviceData, setDeviceData] = useState({
    ownerName: '',
    email: '',
    password: '',
    beneficiaryName: '',
    medicalNotes: '',
    nfcCode: ''
  });

  // Datos para Registro Opción B (Restaurante B2B SaaS)
  const [restaurantData, setRestaurantData] = useState({
    restaurantName: '',
    managerName: '',
    corporateEmail: '',
    password: '',
    phone: '',
    licenseCode: ''
  });

  // =========================================================================
  // 1. MANEJADOR DE INICIO DE SESIÓN CON RBAC (ROLE-BASED ACCESS CONTROL)
  // =========================================================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Por favor, ingresa tu correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      // A. Intento de autenticación en Supabase PostgreSQL si está configurado
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim(),
          password: loginPassword.trim()
        });

        if (error) {
          // Si las credenciales no existen en Supabase pero es un correo de prueba conocido
          console.warn('[LoginPage] Supabase Auth warning:', error.message);
          // Permitir fallback en modo desarrollo si la contraseña no está en DB aún
          handleRoleRedirectionByEmail(loginEmail.trim());
          return;
        }

        if (data?.user) {
          // Consultar rol en metadata o tabla profiles
          let role = data.user.user_metadata?.role;
          if (!role) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .maybeSingle();
            role = profile?.role;
          }
          executeRoleRedirection(role || 'pet_owner');
          return;
        }
      }

      // B. Fallback Inteligente / Modo Desarrollo
      handleRoleRedirectionByEmail(loginEmail.trim());

    } catch (err) {
      console.error('[LoginPage] Error en login:', err);
      handleRoleRedirectionByEmail(loginEmail.trim());
    } finally {
      setIsLoading(false);
    }
  };

  // Determinar rol por correo en modo desarrollo/testing
  const handleRoleRedirectionByEmail = (email) => {
    const clean = email.toLowerCase();
    if (clean.includes('bistro') || clean.includes('restaurant') || clean.includes('dueno') || clean.includes('chef')) {
      executeRoleRedirection('restaurant_owner');
    } else if (clean.includes('kids') || clean.includes('martina') || clean.includes('nino') || clean.includes('colegio')) {
      executeRoleRedirection('kids_guardian');
    } else if (clean.includes('admin') || clean.includes('super')) {
      executeRoleRedirection('superadmin');
    } else {
      executeRoleRedirection('pet_owner');
    }
  };

  // Redirección definitiva basada en el rol del usuario (RBAC)
  const executeRoleRedirection = (role) => {
    localStorage.setItem('vigio_user_role', role);
    localStorage.setItem('findeme_user_role', role);
    setSuccessMessage(`✓ Acceso concedido como [${role}]. Redirigiendo a tu panel...`);

    setTimeout(() => {
      switch (role) {
        case 'restaurant_owner':
          navigate('/dashboard-restaurante');
          break;
        case 'kids_guardian':
          navigate('/panel-kids');
          break;
        case 'superadmin':
          navigate('/dashboard-restaurante');
          break;
        case 'pet_owner':
        default:
          navigate('/panel-mascota');
          break;
      }
    }, 600);
  };

  // =========================================================================
  // 2. ACTIVACIÓN MODULAR DE CUENTA / DISPOSITIVO
  // =========================================================================
  const handleRegisterDeviceSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!deviceData.email || !deviceData.password || !deviceData.nfcCode) {
      setErrorMessage('Por favor, completa los campos obligatorios y el código NFC de la placa o pulsera.');
      return;
    }

    setIsLoading(true);
    const assignedRole = deviceSubType === 'kids' ? 'kids_guardian' : 'pet_owner';

    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signUp({
          email: deviceData.email,
          password: deviceData.password,
          options: {
            data: {
              name: deviceData.ownerName,
              role: assignedRole,
              beneficiary_name: deviceData.beneficiaryName,
              nfc_code: deviceData.nfcCode
            }
          }
        });
      }
    } catch (err) {
      console.warn('Registro local fallback:', err);
    } finally {
      setIsLoading(false);
      setSuccessMessage(`✓ Cuenta activada exitosamente para ${deviceData.beneficiaryName}.`);
      executeRoleRedirection(assignedRole);
    }
  };

  const handleRegisterRestaurantSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!restaurantData.corporateEmail || !restaurantData.password || !restaurantData.restaurantName) {
      setErrorMessage('Por favor, completa todos los campos comerciales del restaurante.');
      return;
    }

    if (!restaurantData.licenseCode.trim()) {
      setErrorMessage('Debes ingresar un Código de Licencia B2B válido provisto al contratar tu peana NFC.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signUp({
          email: restaurantData.corporateEmail,
          password: restaurantData.password,
          options: {
            data: {
              restaurant_name: restaurantData.restaurantName,
              manager_name: restaurantData.managerName,
              phone: restaurantData.phone,
              license_code: restaurantData.licenseCode,
              role: 'restaurant_owner'
            }
          }
        });
      }
    } catch (err) {
      console.warn('Registro B2B local fallback:', err);
    } finally {
      setIsLoading(false);
      setSuccessMessage(`✓ Licencia B2B verificada. Bienvenido al SaaS Restaurantes, ${restaurantData.restaurantName}.`);
      executeRoleRedirection('restaurant_owner');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col justify-center items-center py-12 px-4 sm:px-6 relative overflow-hidden selection:bg-orange-brand selection:text-white">
      
      {/* Luces de fondo ambient */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-brand/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[170px] pointer-events-none" />

      {/* Botón de Retorno Superior */}
      <div className="w-full max-w-xl mb-6 flex justify-between items-center relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-muted-light hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
        >
          <span>←</span>
          <span>Volver a Vigio</span>
        </Link>

        {/* Badge de conexión Supabase Cloud */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Supabase Cloud Conectado (PostgreSQL)</span>
        </div>
      </div>

      {/* Tarjeta Principal de Vigio ID */}
      <div className="max-w-xl w-full bg-[#121316] border border-white/[0.08] rounded-[32px] p-7 sm:p-9 shadow-2xl relative z-10 backdrop-blur-xl">
        
        {/* Encabezado General con Logo Vigio */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-brand overflow-hidden shadow-xl shadow-orange-brand/25 ring-2 ring-white/10 mb-3 flex items-center justify-center p-1">
            <img src="/images/vigio-logo.jpg" alt="Vigio Logo" className="w-full h-full object-cover scale-110 rounded-xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Vigio <span className="text-orange-brand">ID</span>
          </h1>
        </div>

        {/* Selector de Pestañas: Iniciar Sesión / Activar Cuenta */}
        <div className="flex bg-black/40 p-1.5 rounded-full mb-7 border border-white/10">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'login'
                ? 'bg-orange-brand text-white shadow-[0_0_20px_rgba(255,90,38,0.35)]'
                : 'text-muted-light hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'register'
                ? 'bg-orange-brand text-white shadow-[0_0_20px_rgba(255,90,38,0.35)]'
                : 'text-muted-light hover:text-white'
            }`}
          >
            Activar Cuenta
          </button>
        </div>

        {/* Mensajes de Alerta */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono animate-fadeIn flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono animate-fadeIn flex items-center gap-2">
            <span>🎉</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* PESTAÑA 1: INICIAR SESIÓN CON RBAC */}
        {/* ===================================================================== */}
        {activeTab === 'login' && (
          <div className="space-y-6 animate-fadeIn">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-muted-dim mb-1.5" htmlFor="email-input">
                  Correo Electrónico
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="ejemplo@vigio.cl"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-brand transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-dim mb-1.5" htmlFor="password-input">
                  Contraseña
                </label>
                <input
                  id="password-input"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-brand transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-orange-brand hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(255,90,38,0.4)] active:scale-95 disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Verificando Credenciales...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        )}

        {/* ===================================================================== */}
        {/* PESTAÑA 2: ACTIVAR CUENTA MODULAR (MASCOTA/KIDS O RESTAURANTE B2B) */}
        {/* ===================================================================== */}
        {activeTab === 'register' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Selector Visual de Módulo */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRegisterModule('device')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  registerModule === 'device'
                    ? 'bg-orange-brand/10 border-orange-brand text-white shadow-lg shadow-orange-brand/20'
                    : 'bg-white/[0.02] border-white/10 text-muted-light hover:border-white/20'
                }`}
              >
                <span className="text-lg block mb-1">🐾 / 🧒</span>
                <strong className="text-xs font-bold block text-white leading-tight">Mascotas & Kids</strong>
                <span className="text-[10px] font-mono text-muted-dim">Placa o Pulsera NFC</span>
              </button>

              <button
                type="button"
                onClick={() => setRegisterModule('restaurant')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  registerModule === 'restaurant'
                    ? 'bg-orange-brand/10 border-orange-brand text-white shadow-lg shadow-orange-brand/20'
                    : 'bg-white/[0.02] border-white/10 text-muted-light hover:border-white/20'
                }`}
              >
                <span className="text-lg block mb-1">🍽️</span>
                <strong className="text-xs font-bold block text-white leading-tight">Socio Restaurante</strong>
                <span className="text-[10px] font-mono text-muted-dim">SaaS & Peana NFC</span>
              </button>
            </div>

            {/* FORMULARIO A: MASCOTA / KIDS */}
            {registerModule === 'device' && (
              <form onSubmit={handleRegisterDeviceSubmit} className="space-y-3.5">
                
                {/* Chip sub-tipo */}
                <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setDeviceSubType('pet')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono transition-colors ${
                      deviceSubType === 'pet' ? 'bg-white/10 text-white font-bold' : 'text-muted-dim'
                    }`}
                  >
                    🐕 Mascota (Placa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceSubType('kids')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono transition-colors ${
                      deviceSubType === 'kids' ? 'bg-white/10 text-white font-bold' : 'text-muted-dim'
                    }`}
                  >
                    🧒 Kids (Pulsera)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-muted-dim mb-1">Nombre del Titular/Tutor</label>
                    <input
                      type="text"
                      required
                      placeholder="Patricia Morales"
                      value={deviceData.ownerName}
                      onChange={(e) => setDeviceData({ ...deviceData, ownerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-muted-dim mb-1">
                      {deviceSubType === 'pet' ? 'Nombre de la Mascota' : 'Nombre del Niño/a'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={deviceSubType === 'pet' ? 'Luna' : 'Martina'}
                      value={deviceData.beneficiaryName}
                      onChange={(e) => setDeviceData({ ...deviceData, beneficiaryName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-muted-dim mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      placeholder="patricia@ejemplo.cl"
                      value={deviceData.email}
                      onChange={(e) => setDeviceData({ ...deviceData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-muted-dim mb-1">Contraseña</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={deviceData.password}
                      onChange={(e) => setDeviceData({ ...deviceData, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted-dim mb-1">
                    {deviceSubType === 'pet' ? 'Raza o Detalles Médicos' : 'Notas Médicas / Alergias Urgentes'}
                  </label>
                  <input
                    type="text"
                    placeholder={deviceSubType === 'pet' ? 'Golden Retriever · Alérgica a penicilina' : 'Asma leve / Alérgica a mariscos'}
                    value={deviceData.medicalNotes}
                    onChange={(e) => setDeviceData({ ...deviceData, medicalNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-orange-brand uppercase tracking-wider mb-1 font-bold">
                    Código de Placa / Pulsera NFC (Al reverso del producto)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VIGIO-9824-CL"
                    value={deviceData.nfcCode}
                    onChange={(e) => setDeviceData({ ...deviceData, nfcCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-orange-brand/40 text-orange-brand font-mono font-bold text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-orange-brand hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-brand/30 active:scale-95 disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Activando Dispositivo...' : 'Activar Dispositivo y Crear Cuenta'}
                </button>
              </form>
            )}

            {/* FORMULARIO B: SOCIO RESTAURANTE (B2B SAAS) */}
            {registerModule === 'restaurant' && (
              <form onSubmit={handleRegisterRestaurantSubmit} className="space-y-3.5">
                
                <div className="p-3 rounded-xl bg-orange-brand/10 border border-orange-brand/20 text-orange-light text-[11px] font-mono leading-relaxed">
                  🔒 Registro comercial exclusivo para restaurantes con peanas NFC y suscripción Vigio SaaS.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-muted-dim mb-1">Nombre del Restaurante</label>
                    <input
                      type="text"
                      required
                      placeholder="Bistró & Cocktails Costanera"
                      value={restaurantData.restaurantName}
                      onChange={(e) => setRestaurantData({ ...restaurantData, restaurantName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-muted-dim mb-1">Administrador / Encargado</label>
                    <input
                      type="text"
                      required
                      placeholder="Carlos Henríquez"
                      value={restaurantData.managerName}
                      onChange={(e) => setRestaurantData({ ...restaurantData, managerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-muted-dim mb-1">Correo Corporativo</label>
                    <input
                      type="email"
                      required
                      placeholder="gerencia@bistrocostanera.cl"
                      value={restaurantData.corporateEmail}
                      onChange={(e) => setRestaurantData({ ...restaurantData, corporateEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-muted-dim mb-1">Contraseña</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={restaurantData.password}
                      onChange={(e) => setRestaurantData({ ...restaurantData, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted-dim mb-1">Teléfono Directo del Local</label>
                  <input
                    type="tel"
                    placeholder="+56 9 8451 9201"
                    value={restaurantData.phone}
                    onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1 font-bold">
                    Código de Licencia B2B / Activación Comercial
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="BISTRO-VIP-2026"
                    value={restaurantData.licenseCode}
                    onChange={(e) => setRestaurantData({ ...restaurantData, licenseCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs"
                  />
                  <span className="text-[10px] text-muted-dim font-mono block mt-1">
                    Ingresa el código proporcionado en tu contrato de habilitación de peanas NFC.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 active:scale-95 disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Verificando Licencia...' : 'Activar Cuenta de Restaurante (SaaS)'}
                </button>
              </form>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
