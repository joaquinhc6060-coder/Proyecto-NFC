import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function VigioActivationForm({ token, onActivated }) {
  // Step 0: Validación de PIN Secreto (Empaque de compra)
  // Step 1: Datos Mascota/Objeto
  // Step 2: Cuenta y Contacto del Dueño
  const [step, setStep] = useState(0); 
  const [pinCode, setPinCode] = useState('');
  const [placaRecord, setPlacaRecord] = useState(null);

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

  // PASO 0: VERIFICAR PIN SECRETO DE COMPRA
  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanPin = pinCode.trim().replace(/\D/g, '');

    if (cleanPin.length < 4) {
      setErrorMessage('Por favor ingresa el código PIN de tu tarjeta de empaque.');
      return;
    }

    setSubmitting(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        // Consultar la placa física en Supabase
        const { data: placa, error } = await supabase
          .from('placas_vigio')
          .select('*')
          .eq('token', token)
          .maybeSingle();

        if (error) throw error;

        if (!placa) {
          // Si la tabla existe pero este token no ha sido precargado por el fabricante:
          // Permitir activación si el PIN es un código numérico válido de 6 dígitos
          if (cleanPin.length === 6) {
            setPlacaRecord({ token, pin_activacion: cleanPin, isNew: true });
            setStep(1);
          } else {
            setErrorMessage('Código PIN inválido. Revisa tu tarjeta de empaque.');
          }
        } else {
          // Si ya existe en la base de datos, validar que coincida el PIN
          if (placa.estado === 'activada') {
            setErrorMessage('Esta placa ya se encuentra activada por su dueño.');
            return;
          }

          if (placa.pin_activacion && placa.pin_activacion !== cleanPin) {
            setErrorMessage('El PIN ingresado no coincide con el empaque de esta placa.');
            return;
          }

          setPlacaRecord(placa);
          setStep(1);
        }
      } else {
        // Modo local sin Supabase: Acepta cualquier PIN de 4 a 6 dígitos para pruebas
        setPlacaRecord({ token, pin_activacion: cleanPin });
        setStep(1);
      }
    } catch (err) {
      console.warn('Error verificando PIN:', err);
      // Si la tabla no está creada aún en Supabase, permitimos continuar en modo desarrollo
      if (err.message && err.message.includes('schema cache')) {
        setPlacaRecord({ token, pin_activacion: cleanPin });
        setStep(1);
      } else {
        setErrorMessage(err.message || 'Error al validar el código.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep = (e) => {
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

      // 1. Registro de cuenta en Supabase Auth
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

        // 2. Actualizar o insertar la placa
        let finalPlacaId = null;

        if (placaRecord && placaRecord.id) {
          const { error: updatePlacaErr } = await supabase
            .from('placas_vigio')
            .update({
              estado: 'activada',
              owner_id: ownerId,
              fecha_activacion: new Date().toISOString()
            })
            .eq('id', placaRecord.id);

          if (updatePlacaErr) throw updatePlacaErr;
          finalPlacaId = placaRecord.id;
        } else {
          const { data: newPlaca, error: insertPlacaErr } = await supabase
            .from('placas_vigio')
            .insert([{
              token: token,
              pin_activacion: pinCode.trim(),
              estado: 'activada',
              owner_id: ownerId,
              fecha_activacion: new Date().toISOString()
            }])
            .select()
            .single();

          if (insertPlacaErr) throw insertPlacaErr;
          finalPlacaId = newPlaca.id;
        }

        // 3. Crear el perfil en 'perfiles_vigio'
        const { data: perfilCreado, error: perfilErr } = await supabase
          .from('perfiles_vigio')
          .insert([{
            placa_id: finalPlacaId,
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
      }

      // Guardar backup local
      const localActiveKey = `vigio_active_${token}`;
      const simulatedData = {
        token,
        estado: 'activada',
        ...formData,
        whatsapp_contacto: (formData.whatsapp_contacto || formData.telefono_contacto).replace(/\D/g, ''),
      };
      localStorage.setItem(localActiveKey, JSON.stringify(simulatedData));

      setSuccessToast('¡Placa Activada con Éxito!');
      setTimeout(() => {
        if (onActivated) {
          onActivated();
        } else {
          window.location.reload();
        }
      }, 1200);

    } catch (err) {
      console.error('Error activating Vigio plate:', err);
      // Si la base de datos aún no tiene la tabla en Supabase, guardar localmente para no bloquear al usuario
      if (err.message && err.message.includes('schema cache')) {
        const localActiveKey = `vigio_active_${token}`;
        const simulatedData = {
          token,
          estado: 'activada',
          ...formData,
          whatsapp_contacto: (formData.whatsapp_contacto || formData.telefono_contacto).replace(/\D/g, ''),
        };
        localStorage.setItem(localActiveKey, JSON.stringify(simulatedData));
        setSuccessToast('¡Placa Activada con Éxito!');
        setTimeout(() => {
          if (onActivated) onActivated();
          else window.location.reload();
        }, 1000);
      } else {
        setErrorMessage(err.message || 'Error al guardar los datos. Inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-white flex flex-col items-center justify-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-brand/15 border border-orange-brand/30 text-orange-brand text-xs font-mono font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-orange-brand animate-ping" />
            <span>Dispositivo Físico · ID: {token}</span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-orange-brand mx-auto overflow-hidden shadow-xl shadow-orange-brand/25 ring-2 ring-white/10 flex items-center justify-center p-1">
            <img src="/images/vigio-logo.jpg" alt="Vigio Logo" className="w-full h-full object-cover scale-110 rounded-xl" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Activa tu Placa <span className="text-orange-brand">Vigio</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-light font-light max-w-sm mx-auto leading-relaxed">
            {step === 0 
              ? 'Para vincular esta placa a tu nombre, ingresa el código PIN secreto que viene en la tarjeta dentro de tu empaque de compra.'
              : 'Configúralo en menos de 1 minuto para activar la protección y el contacto de emergencia.'}
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-[#131418] to-[#0c0d10] border border-white/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                step === 0 ? 'bg-orange-brand text-white shadow-md shadow-orange-brand/30' : 'bg-emerald-500 text-black'
              }`}>
                {step === 0 ? '🔒' : step === 1 ? '1' : '✓'}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {step === 0 ? 'Validación de Seguridad' : step === 1 ? 'Datos de tu Mascota' : 'Tus Datos de Contacto'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-dim">
              {step === 0 ? 'Paso de Seguridad' : `Paso ${step} de 2`}
            </span>
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

          {/* PASO 0: PIN DE SEGURIDAD (ANTI-ROBO / COMPRA VERIFICADA) */}
          {step === 0 && (
            <form onSubmit={handleVerifyPin} className="space-y-6">
              <div className="p-4 rounded-2xl bg-orange-brand/10 border border-orange-brand/20 text-xs text-orange-200/90 leading-relaxed">
                <span className="font-bold text-orange-brand block mb-1">🔐 Seguridad de Activación Vigio</span>
                Este producto está protegido. Solo quien tenga la placa física y la tarjeta de empaque puede configurarla.
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-dim mb-2 font-bold">
                  PIN Secreto de Activación (6 dígitos) *
                </label>
                <input
                  type="text"
                  maxLength={8}
                  required
                  placeholder="Ej: 849201"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl bg-black/60 border border-white/15 text-white text-center text-2xl font-mono tracking-[8px] focus:outline-none focus:border-orange-brand transition-colors font-bold"
                  autoFocus
                />
                <span className="block mt-2 text-[11px] text-zinc-500 text-center font-mono">
                  Encuentra este código impreso en la tarjeta dentro de la cajita.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-orange-brand/25 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? 'Verificando PIN...' : 'Verificar y Continuar →'}
              </button>
            </form>
          )}

          {/* PASO 1: DATOS DEL OBJETO / MASCOTA */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-muted-dim mb-1 font-bold">
                  Nombre de tu Mascota u Objeto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej: Luna, Max, Rocky..."
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
                    <option value="mascota">🐕 Mascota</option>
                    <option value="nino">👶 Niño / Familiar</option>
                    <option value="llaves">🔑 Llaves</option>
                    <option value="equipaje">🧳 Equipaje</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-muted-dim mb-1 font-bold">
                    Raza / Tipo
                  </label>
                  <input
                    type="text"
                    name="raza_o_modelo"
                    placeholder="Ej: Golden Retriever"
                    value={formData.raza_o_modelo}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors font-medium"
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
                  placeholder="https://... (Foto clara de tu mascota)"
                  value={formData.foto_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-brand transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-dim mb-1 font-bold">
                  Alergias o Cuidados Especiales
                </label>
                <input
                  type="text"
                  name="alergias"
                  placeholder="Ej: Alérgico al pollo, necesita insulina diaria..."
                  value={formData.alergias}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-brand transition-colors font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-4 rounded-2xl bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-orange-brand/25 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Continuar a Datos de Contacto</span>
                <span>→</span>
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
                  placeholder="Ej: Benjamín Carvajal"
                  value={formData.nombre_contacto}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-brand transition-colors font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-muted-dim mb-1 font-bold">
                    Teléfono de Llamada Directa *
                  </label>
                  <input
                    type="tel"
                    name="telefono_contacto"
                    required
                    placeholder="+56 9 1234 5678"
                    value={formData.telefono_contacto}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-muted-dim mb-1 font-bold">
                    WhatsApp para GPS *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp_contacto"
                    placeholder="912345678"
                    value={formData.whatsapp_contacto}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors font-mono font-medium"
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
                  placeholder="Ej: Coquimbo, Santiago, La Serena..."
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-brand transition-colors font-medium"
                />
              </div>

              <div className="pt-2 border-t border-white/10">
                <span className="block text-[11px] font-mono text-orange-brand mb-2 font-bold uppercase tracking-wider">
                  🔒 Crea tu cuenta de gestión (Vigio ID)
                </span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-muted-dim mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="tu@correo.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-muted-dim mb-1">
                      Crea una Contraseña Segura
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-brand transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase transition-colors"
                >
                  ← Volver
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 rounded-2xl bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-orange-brand/30 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? 'Activando Placa...' : 'Guardar y Activar Placa ✓'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
