import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function VigioActivationForm({ token, onActivated }) {
  const [step, setStep] = useState(1); // 1: Datos Mascota/Objeto, 2: Cuenta y Contacto
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Paso 1: Objeto / Mascota
    nombre: '',
    categoria: 'mascota', // mascota | nino | llaves | equipaje
    raza_o_modelo: '',
    foto_url: '',
    mensaje_auxilio: '¡Hola! Me he perdido, por favor contacta a mi dueño.',
    alergias: '',
    cuidados_especiales: '',
    
    // Paso 2: Dueño / Contacto de rescate
    nombre_contacto: '',
    telefono_contacto: '',
    whatsapp_contacto: '',
    ciudad: 'Santiago, Chile',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setErrorMessage('Por favor ingresa el nombre de tu mascota u objeto.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      let ownerId = null;

      // 1. Registro o autenticación en Supabase Auth si está configurado
      if (isSupabaseConfigured() && supabase) {
        if (formData.email && formData.password) {
          const { data: authData, error: authErr } = await supabase.auth.signUp({
            email: formData.email.trim(),
            password: formData.password,
            options: {
              data: {
                nombre_completo: formData.nombre_contacto.trim(),
                telefono: formData.telefono_contacto.trim(),
                whatsapp: formData.whatsapp_contacto.trim(),
              }
            }
          });

          if (authErr && !authErr.message.includes('already registered')) {
            console.warn('Auth note:', authErr);
          }
          ownerId = authData?.user?.id || null;
        }

        // 2. Buscar o crear la placa en la tabla 'placas_vigio'
        let { data: placa, error: placaErr } = await supabase
          .from('placas_vigio')
          .select('*')
          .eq('token', token)
          .maybeSingle();

        if (!placa) {
          // Si no existe previamente, la insertamos
          const { data: newPlaca, error: insertPlacaErr } = await supabase
            .from('placas_vigio')
            .insert([{
              token: token,
              estado: 'activada',
              owner_id: ownerId,
              fecha_activacion: new Date().toISOString()
            }])
            .select()
            .single();

          if (insertPlacaErr) throw insertPlacaErr;
          placa = newPlaca;
        } else {
          // Actualizamos a 'activada'
          const { error: updatePlacaErr } = await supabase
            .from('placas_vigio')
            .update({
              estado: 'activada',
              owner_id: ownerId,
              fecha_activacion: new Date().toISOString()
            })
            .eq('id', placa.id);

          if (updatePlacaErr) throw updatePlacaErr;
        }

        // 3. Crear el perfil en 'perfiles_vigio'
        const { data: perfilCreado, error: perfilErr } = await supabase
          .from('perfiles_vigio')
          .insert([{
            placa_id: placa.id,
            owner_id: ownerId,
            nombre: formData.nombre.trim(),
            categoria: formData.categoria,
            raza_o_modelo: formData.raza_o_modelo.trim(),
            foto_url: formData.foto_url.trim() || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
            telefono_contacto: formData.telefono_contacto.trim(),
            whatsapp_contacto: (formData.whatsapp_contacto || formData.telefono_contacto).replace(/\D/g, ''),
            nombre_contacto: formData.nombre_contacto.trim(),
            ciudad: formData.ciudad.trim(),
            mensaje_auxilio: formData.mensaje_auxilio.trim() || '¡Hola! Me he perdido, por favor contacta a mi dueño.',
            alergias: formData.alergias.trim(),
            cuidados_especiales: formData.cuidados_especiales.trim(),
            estado_alerta: 'lost'
          }])
          .select()
          .single();

        if (perfilErr) throw perfilErr;
      } else {
        // Fallback local en memoria / LocalStorage para pruebas sin conexión
        const localActiveKey = `vigio_active_${token}`;
        const simulatedData = {
          token,
          estado: 'activada',
          ...formData,
          whatsapp_contacto: (formData.whatsapp_contacto || formData.telefono_contacto).replace(/\D/g, ''),
          foto_url: formData.foto_url.trim() || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
          estado_alerta: 'lost'
        };
        localStorage.setItem(localActiveKey, JSON.stringify(simulatedData));
      }

      setSuccessToast('¡Placa Vigio activada exitosamente! Tu dispositivo ya está protegido.');
      
      setTimeout(() => {
        if (onActivated) onActivated();
      }, 1200);

    } catch (err) {
      console.error('Error al activar placa:', err);
      setErrorMessage(err.message || 'Ocurrió un error al activar la placa. Inténtalo nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-white py-10 px-4 sm:px-6 flex flex-col justify-center items-center selection:bg-orange-brand selection:text-white">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-orange-brand/20 via-teal-brand/15 to-transparent blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-lg w-full relative z-10 space-y-6">
        
        {/* Top Header Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-brand/15 border border-orange-brand/30 text-orange-brand text-xs font-mono font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-orange-brand animate-ping" />
            <span>Dispositivo No Activado · Token: {token}</span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-orange-brand mx-auto overflow-hidden shadow-xl shadow-orange-brand/25 ring-2 ring-white/10 flex items-center justify-center p-1">
            <img src="/images/vigio-logo.jpg" alt="Vigio Logo" className="w-full h-full object-cover scale-110 rounded-xl" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Activa tu Placa <span className="text-orange-brand">Vigio</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-light font-light max-w-sm mx-auto leading-relaxed">
            Acabas de recibir tu dispositivo físico. Configúralo en menos de 1 minuto para activar la protección y el contacto de emergencia.
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-[#131418] to-[#0c0d10] border border-white/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                step === 1 ? 'bg-orange-brand text-white shadow-md shadow-orange-brand/30' : 'bg-emerald-500 text-black'
              }`}>
                {step === 1 ? '1' : '✓'}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {step === 1 ? 'Datos de tu Mascota' : 'Tus Datos de Contacto'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-dim">Paso {step} de 2</span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Toast */}
          {successToast && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <span>✓</span>
              <span>{successToast}</span>
            </div>
          )}

          {/* PASO 1: DATOS DEL OBJETO / MASCOTA */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-muted-dim mb-1 font-bold">
                  Nombre de tu Mascota u Objeto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej: Luna, Max, Maleta de Viaje..."
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-brand transition-colors font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-muted-dim mb-1 font-bold">
                    Categoría
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors"
                  >
                    <option value="mascota">🐾 Mascota (Perro/Gato)</option>
                    <option value="nino">🧒 Niño / Adulto Mayor</option>
                    <option value="llaves">🔑 Llaves / Mochila</option>
                    <option value="equipaje">🧳 Equipaje</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-muted-dim mb-1 font-bold">
                    Raza o Descripción
                  </label>
                  <input
                    type="text"
                    name="raza_o_modelo"
                    placeholder="Ej: Golden Retriever"
                    value={formData.raza_o_modelo}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-dim mb-1 font-bold">
                  URL de Foto (Opcional)
                </label>
                <input
                  type="url"
                  name="foto_url"
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={formData.foto_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors font-mono"
                />
                <span className="text-[10px] text-muted-dim block mt-1">Si no tienes una foto ahora, asignaremos una foto ilustrativa de alta calidad.</span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-dim mb-1 font-bold">
                  Alergias o Cuidados Críticos
                </label>
                <input
                  type="text"
                  name="alergias"
                  placeholder="Ej: Alérgica a penicilina, requiere agua constante..."
                  value={formData.alergias}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-orange-brand hover:bg-orange-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-brand/30 active:scale-95 mt-4"
              >
                Siguiente: Datos de Contacto →
              </button>
            </form>
          )}

          {/* PASO 2: DATOS DEL DUEÑO Y CREACIÓN DE CUENTA */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-muted-dim mb-1 font-bold">
                  Tu Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre_contacto"
                  required
                  placeholder="Ej: Carlos Morales"
                  value={formData.nombre_contacto}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-brand transition-colors font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-muted-dim mb-1 font-bold">
                    Teléfono de Llamada Directa *
                  </label>
                  <input
                    type="tel"
                    name="telefono_contacto"
                    required
                    placeholder="+56 9 8765 4321"
                    value={formData.telefono_contacto}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-muted-dim mb-1 font-bold">
                    WhatsApp para GPS *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp_contacto"
                    required
                    placeholder="56987654321"
                    value={formData.whatsapp_contacto}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-dim mb-1 font-bold">
                  Ciudad / Comuna
                </label>
                <input
                  type="text"
                  name="ciudad"
                  placeholder="Santiago, Providencia, etc."
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors"
                />
              </div>

              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono text-teal-brand uppercase tracking-wider block mb-2 font-bold">
                  🔒 Crea tu Cuenta de Gestión (Vigio ID)
                </span>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-muted-dim mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="tu-email@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-muted-dim mb-1">
                      Crea una Contraseña Segura
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  ← Volver
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-3 rounded-2xl bg-orange-brand hover:bg-orange-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-brand/30 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Activando Placa...' : 'Guardar y Activar Placa ✓'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Security badge */}
        <div className="text-center text-[11px] font-mono text-muted-dim flex items-center justify-center gap-1.5">
          <span>🔒</span>
          <span>Vinculación segura punto a punto con token criptográfico único.</span>
        </div>

      </div>
    </div>
  );
}
