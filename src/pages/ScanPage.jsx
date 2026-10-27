import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import VigioActivationForm from '../components/VigioActivationForm';

export default function ScanPage() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [deviceData, setDeviceData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isUnactivated, setIsUnactivated] = useState(false);
  const [gpsSent, setGpsSent] = useState(false);
  const [gpsSending, setGpsSending] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  // Estados interactivos para Restaurante
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [billRequested, setBillRequested] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);

  const fetchScanData = async () => {
    setLoading(true);
    setErrorNotice(null);
    setIsUnactivated(false);

    const isRestCode = code && (code.startsWith('REST-') || code.includes('BAR') || code.includes('MESA'));
    const isKidCode = code && (code.startsWith('KID-') || code.startsWith('NIÑO-') || code.includes('KIDS'));

    // 0. Comprobar si existe simulación local de activación
    const localActive = localStorage.getItem(`vigio_active_${code}`);
    if (localActive) {
      try {
        const parsed = JSON.parse(localActive);
        setProfileData({
          type: 'mascota',
          codigo: code,
          nombre: parsed.nombre,
          especie: parsed.raza_o_modelo || 'Mascota Protegida',
          foto: parsed.foto_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
          alerta: parsed.estado_alerta || 'lost',
          acerca_de: parsed.alergias ? `Alergias / Cuidados: ${parsed.alergias}` : 'Mascota protegida con tecnología Vigio.',
          alergias: parsed.alergias ? [parsed.alergias] : [],
          medicamentos: parsed.cuidados_especiales ? [parsed.cuidados_especiales] : [],
          owner_nombre: parsed.nombre_contacto || 'Dueño Vigio',
          owner_telefono: parsed.telefono_contacto || '+56 9 8765 4321',
          owner_whatsapp: parsed.whatsapp_contacto || '56987654321',
          owner_ciudad: parsed.ciudad || 'Chile',
          placa_id: 'local-demo'
        });
        setLoading(false);
        return;
      } catch (e) {
        console.warn('Error reading local active:', e);
      }
    }

    // 1. Consulta a Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        // A) Buscar en tabla placas_vigio (nueva arquitectura de 100 placas con token)
        const { data: placaVigio } = await supabase
          .from('placas_vigio')
          .select('*')
          .eq('token', code)
          .maybeSingle();

        if (placaVigio) {
          // ESTADO 1: No vendido / No activado
          if (placaVigio.estado === 'fabricada' || !placaVigio.owner_id) {
            // Verificar si tiene perfil asociado
            const { data: perfilVigio } = await supabase
              .from('perfiles_vigio')
              .select('*')
              .eq('placa_id', placaVigio.id)
              .maybeSingle();

            if (!perfilVigio) {
              setDeviceData(placaVigio);
              setIsUnactivated(true);
              setLoading(false);
              return;
            }
          }

          // ESTADO 2: Activada -> Obtener perfil del objeto/mascota
          const { data: perfilVigio } = await supabase
            .from('perfiles_vigio')
            .select('*')
            .eq('placa_id', placaVigio.id)
            .maybeSingle();

          if (perfilVigio) {
            setProfileData({
              type: 'mascota',
              codigo: placaVigio.token,
              nombre: perfilVigio.nombre,
              especie: perfilVigio.raza_o_modelo || 'Mascota Registrada',
              foto: perfilVigio.foto_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
              alerta: perfilVigio.estado_alerta || 'lost',
              mensaje_auxilio: perfilVigio.mensaje_auxilio || '¡Hola! Me he perdido, por favor contacta a mi dueño.',
              acerca_de: perfilVigio.alergias || perfilVigio.cuidados_especiales || 'Mascota protegida con tecnología Vigio.',
              alergias: perfilVigio.alergias ? [perfilVigio.alergias] : [],
              medicamentos: perfilVigio.cuidados_especiales ? [perfilVigio.cuidados_especiales] : [],
              owner_nombre: perfilVigio.nombre_contacto || 'Dueño Vigio',
              owner_telefono: perfilVigio.telefono_contacto,
              owner_whatsapp: perfilVigio.whatsapp_contacto,
              owner_ciudad: perfilVigio.ciudad || 'Chile',
              placa_id: placaVigio.id
            });
            setLoading(false);
            return;
          }
        }

        // B) Compatibilidad con tabla previa placas_nfc
        const { data: placaLegacy } = await supabase
          .from('placas_nfc')
          .select('*')
          .eq('codigo_publico', code)
          .maybeSingle();

        if (placaLegacy) {
          const category = placaLegacy.categoria || 'mascota';
          setDeviceData(placaLegacy);

          if (category === 'mascota') {
            const { data: mascota } = await supabase
              .from('mascotas')
              .select('*')
              .eq('placa_id', placaLegacy.id)
              .maybeSingle();

            if (!mascota) {
              setIsUnactivated(true);
              setLoading(false);
              return;
            }

            let owner = null;
            if (placaLegacy.user_id) {
              const { data: prof } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', placaLegacy.user_id)
                .maybeSingle();
              owner = prof;
            }

            setProfileData({
              type: 'mascota',
              codigo: placaLegacy.codigo_publico,
              nombre: mascota.nombre,
              especie: `${mascota.especie} (${mascota.raza || 'Mestizo'})`,
              foto: mascota.foto_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
              alerta: mascota.estado_alerta || 'safe',
              acerca_de: mascota.acerca_de || 'Mascota registrada en Vigio.',
              alergias: mascota.alergias_alimentos || [],
              medicamentos: mascota.alergias_medicamentos || [],
              owner_nombre: owner?.nombre_completo || 'Dueño Vigio',
              owner_telefono: owner?.telefono || '+56 9 8765 4321',
              owner_whatsapp: owner?.whatsapp || '56987654321',
              owner_ciudad: owner?.ciudad || 'Chile',
              mascota_id: mascota.id,
              placa_id: placaLegacy.id
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Scan read error:', err);
      }
    }

    // 2. Fallbacks de demostración (si es token desconocido corto de 6-8 chars -> Estado 1 No activado para probar)
    if (code && code.length >= 6 && code.length <= 12 && !isRestCode && !isKidCode && !code.includes('9824')) {
      setIsUnactivated(true);
      setLoading(false);
      return;
    }

    // Si es demo o restaurante
    const category = isRestCode ? 'restaurante' : isKidCode ? 'kids' : 'mascota';
    setDeviceData({ codigo_publico: code, categoria: category });

    if (category === 'restaurante') {
      setProfileData({
        type: 'restaurante',
        codigo: code,
        nombre_local: 'Bistró & Cocktails Costanera',
        numero_mesa: 'Mesa 4',
        tipo_gastronomia: 'Gastronomía & Coctelería de Autor',
        wifi_ssid: 'Bistro_Clientes_VIP',
        wifi_password: 'BistroVip2026',
        url_carta: 'https://vigio.cl/menu/bistro-costanera',
        slug: 'bistro-costanera',
        foto: '/images/findme-restaurant-loyalty.jpg',
      });
      setLoading(false);
      return;
    }

    if (category === 'kids') {
      setProfileData({
        type: 'kids',
        codigo: code || 'KID-4109',
        nombre: 'Martina González',
        edad: '5 años',
        ciudad: 'Providencia, Santiago',
        alerta: 'safe',
        grupo_sanguineo: 'A Positivo (A+)',
        alergia_severa: 'Maní / Frutos Secos',
        mensaje_padres: 'Martina suele ponerse tímida si se pierde. Por favor llama de inmediato a sus padres o comparte tu ubicación.',
        mama_telefono: '+56 9 9876 5432',
        papa_telefono: '+56 9 8765 4321',
        foto: '/images/vigio-pulsera-nfc.jpg',
      });
      setLoading(false);
      return;
    }

    // Fallback Luna si es demo de Luna (VIGIO-9824-CL)
    setProfileData({
      type: 'mascota',
      codigo: code || 'VIGIO-9824-CL',
      nombre: 'Luna',
      especie: 'Perro (Golden Retriever)',
      foto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
      alerta: 'lost',
      mensaje_auxilio: '¡Hola! Me he perdido, por favor contacta a mi dueño.',
      acerca_de: 'Muy dócil y cariñosa. Requiere alimento hipoalergénico.',
      alergias: ['Pollo', 'Cereales procesados'],
      medicamentos: ['Apoquel (Dermatitis estacional)'],
      owner_nombre: 'Carlos Mendoza',
      owner_telefono: '+56 9 8765 4321',
      owner_whatsapp: '56987654321',
      owner_ciudad: 'Santiago, Chile',
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchScanData();
  }, [code]);

  // Copiar clave Wi-Fi al portapapeles
  const handleCopyWifi = () => {
    if (profileData?.wifi_password) {
      navigator.clipboard.writeText(profileData.wifi_password);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2500);
    }
  };

  // Llamar al mesero
  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 5000);
  };

  // Pedir la cuenta
  const handleRequestBill = () => {
    setBillRequested(true);
    setTimeout(() => setBillRequested(false), 5000);
  };

  // Handle GPS location dispatch
  const handleSendLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por este navegador.');
      return;
    }

    setGpsSending(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          if (supabase && isSupabaseConfigured() && profileData?.placa_id) {
            await supabase.from('escaneos_gps').insert([
              {
                placa_id: profileData.placa_id,
                mascota_id: profileData?.mascota_id || null,
                latitud: latitude,
                longitud: longitude,
                dispositivo: navigator.userAgent.slice(0, 100),
              }
            ]);
          }
          setGpsSent(true);
        } catch (err) {
          console.warn('GPS log err:', err);
          setGpsSent(true);
        } finally {
          setGpsSending(false);
        }
      },
      (err) => {
        console.warn('Geo err:', err);
        setGpsSending(false);
        alert('Por favor autoriza el acceso a la ubicación para avisar al dueño en qué mapa te encuentras.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-[#07080a] text-white p-6">
        <div className="w-12 h-12 border-4 border-teal-brand border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-sm tracking-wider text-muted-light uppercase">
          Leyendo telemetría NFC del dispositivo...
        </p>
      </div>
    );
  }

  // =========================================================================
  // ESTADO 1: PLACA NO ACTIVADA / RECIÉN FABRICADA
  // =========================================================================
  if (isUnactivated) {
    return (
      <VigioActivationForm 
        token={code} 
        onActivated={() => {
          fetchScanData();
        }} 
      />
    );
  }

  // =========================================================================
  // RENDER VISTA 1: PEANA NFC DE RESTAURANTE
  // =========================================================================
  if (profileData?.type === 'restaurante') {
    return (
      <div className="min-h-screen bg-[#07080a] text-white py-10 px-4 sm:px-6">
        <div className="max-w-md mx-auto space-y-5">

          {/* Top NFC Active Badge */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                Peana NFC de Mesa Activa
              </span>
            </div>
            <span className="text-xs font-mono text-white/60 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 font-bold">
              {profileData.codigo}
            </span>
          </div>

          {/* Main Card Container */}
          <div className="bg-gradient-to-b from-white/[0.07] to-black/80 rounded-[32px] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl">
            
            {/* Header Gastronómico */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-neutral-900">
              <img 
                src={profileData.foto} 
                alt={profileData.nombre_local} 
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono uppercase bg-orange-brand/90 backdrop-blur-md text-white font-bold tracking-wider">
                    {profileData.numero_mesa}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En Servicio
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profileData.nombre_local}
                </h1>
                <p className="text-xs text-muted-light font-light mt-0.5">
                  {profileData.tipo_gastronomia}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* Botón Destacado: GUARDAR TARJETA VIP EN APPLE / GOOGLE WALLET */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/15 via-black/40 to-teal-500/15 border border-orange-500/30 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-brand/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-orange-brand uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <span>👑</span> Programa de Fidelización VIP
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    Cero Apps
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  Guarda tu Pase VIP en tu Billetera
                </h3>
                <p className="text-xs text-muted-light leading-relaxed mb-4">
                  Suma sellos automáticamente con tus boletas, canjea cócteles de cortesía y recibe avisos exclusivos en tu pantalla de bloqueo.
                </p>

                <Link
                  to={`/restaurante/${profileData.slug}/mi-tarjeta`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-brand to-orange-hover hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-brand/20 active:scale-95"
                >
                  <span>📲</span>
                  <span>Ver / Añadir Tarjeta a Apple o Google Wallet</span>
                </Link>
              </div>

              {/* Acciones de Mesa: Wi-Fi y Carta Digital */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Carta Digital */}
                <button
                  type="button"
                  onClick={() => setShowMenuModal(true)}
                  className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all text-left flex flex-col justify-between group active:scale-95"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-2xl">📖</span>
                    <span className="text-[10px] font-mono text-teal-brand group-hover:translate-x-1 transition-transform">
                      Abrir →
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Carta Digital</span>
                    <span className="text-[11px] text-muted-dim block">Comida & Coctelería</span>
                  </div>
                </button>

                {/* Conexión Wi-Fi */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-2xl">📶</span>
                    <button
                      type="button"
                      onClick={handleCopyWifi}
                      className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2 py-0.5 rounded-lg transition-colors font-bold"
                    >
                      {copiedWifi ? '✓ Copiada' : 'Copiar Clave'}
                    </button>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block truncate">
                      Red: {profileData.wifi_ssid}
                    </span>
                    <span className="text-[11px] font-mono text-muted-dim block">
                      Pass: {profileData.wifi_password}
                    </span>
                  </div>
                </div>

              </div>

              {/* Botones de Servicio de Mesa: Mesero & Cuenta */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                
                {/* Llamar al mesero */}
                {waiterCalled ? (
                  <div className="py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono text-center flex items-center justify-center gap-2 animate-pulse">
                    <span>✓</span>
                    <span>¡Mesero notificado para {profileData.numero_mesa}! En camino.</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCallWaiter}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>🛎️</span>
                    <span>Llamar al Mesero a {profileData.numero_mesa}</span>
                  </button>
                )}

                {/* Pedir la cuenta */}
                {billRequested ? (
                  <div className="py-3 px-4 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-mono text-center flex items-center justify-center gap-2 animate-pulse">
                    <span>🧾</span>
                    <span>Solicitud de cuenta enviada a Caja.</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestBill}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-muted-light transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>🧾</span>
                    <span>Pedir la Cuenta a la Mesa</span>
                  </button>
                )}

              </div>

              {/* Footer de administración */}
              <div className="text-center pt-2">
                <Link 
                  to="/login"
                  className="text-[11px] font-mono text-muted-dim hover:text-white transition-colors"
                >
                  ¿Personal del local? Acceso al Dashboard de Restaurante →
                </Link>
              </div>

            </div>
          </div>

          {/* Modal de Carta Digital Rápida */}
          {showMenuModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#101217] border border-white/15 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Carta Digital</h3>
                    <p className="text-xs text-muted-dim">{profileData.nombre_local}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMenuModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs max-h-72 overflow-y-auto pr-1">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">Pizza Napolitana Trufada</span>
                      <span className="text-muted-dim text-[11px]">Mozzarella di bufala, aceite de trufa blanca</span>
                    </div>
                    <span className="font-mono text-teal-brand font-bold">$16.000</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">Negroni de Autor Premium</span>
                      <span className="text-muted-dim text-[11px]">Gin infusionado, vermouth rosso, bitter artesanal</span>
                    </div>
                    <span className="font-mono text-teal-brand font-bold">$9.500</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">Filete al Vino Tinto</span>
                      <span className="text-muted-dim text-[11px]">Corte premium 280g con reducción de Carmenere</span>
                    </div>
                    <span className="font-mono text-teal-brand font-bold">$18.500</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">Tiramisú Tradicional</span>
                      <span className="text-muted-dim text-[11px]">Mascarpone italiano, café espresso y cacao amargo</span>
                    </div>
                    <span className="font-mono text-teal-brand font-bold">$6.500</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/restaurante/${profileData.slug}/mi-tarjeta`}
                    className="w-full py-3 px-4 rounded-xl bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold text-center block transition-colors"
                  >
                    Subir boleta para sumar Sellos VIP →
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER VISTA 2: PULSERA NFC KIDS (MARTINA)
  // =========================================================================
  if (profileData?.type === 'kids') {
    return (
      <div className="min-h-screen bg-[#07080a] text-white py-12 px-4 sm:px-6">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Top Badge */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-brand animate-ping" />
              <span className="text-xs font-mono text-teal-brand uppercase tracking-widest font-bold">
                Pulsera Vigio Kids Activa
              </span>
            </div>
            <span className="text-xs font-mono text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              {profileData.codigo}
            </span>
          </div>

          <div className="bg-black/60 rounded-[32px] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl">
            {/* Foto de la niña / niño */}
            <div className="relative h-60 w-full overflow-hidden bg-neutral-900">
              <img 
                src={profileData.foto} 
                alt={profileData.nombre} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white">{profileData.nombre}</h1>
                  <p className="text-xs text-teal-brand font-medium">{profileData.edad} · {profileData.ciudad}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-teal-brand/20 border border-teal-brand/40 text-teal-brand font-bold">
                  Ficha Infantil
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Alergias críticas & Grupo Sanguíneo */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-muted-dim text-[10px] uppercase block">Grupo Sanguíneo</span>
                  <span className="text-white font-bold">{profileData.grupo_sanguineo}</span>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-red-300 text-[10px] uppercase block">Alergia Severa</span>
                  <span className="text-red-400 font-bold">{profileData.alergia_severa}</span>
                </div>
              </div>

              {/* Mensaje de los padres */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-muted-light leading-relaxed">
                “{profileData.mensaje_padres}”
              </div>

              {/* Botones de Llamada a los padres */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${profileData.mama_telefono?.replace(/\s+/g, '')}`}
                  className="py-3.5 px-3 rounded-xl bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-md shadow-orange-brand/20"
                >
                  <span>📞</span> Llamar a Mamá
                </a>
                <a
                  href={`tel:${profileData.papa_telefono?.replace(/\s+/g, '')}`}
                  className="py-3.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 border border-white/10"
                >
                  <span>📞</span> Llamar a Papá
                </a>
              </div>

              {/* GPS Broadcast */}
              <div>
                {gpsSent ? (
                  <div className="py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center flex items-center justify-center gap-2">
                    <span>✓</span> Ubicación GPS compartida con los padres
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendLocation}
                    disabled={gpsSending}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-all flex items-center justify-center gap-2"
                  >
                    <span>📍</span> {gpsSending ? 'Obteniendo GPS...' : 'Enviar mi ubicación actual a los padres'}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER VISTA 3: PLACA NFC MASCOTAS (LUNA / RESCATE)
  // =========================================================================
  const isAlertLost = profileData?.alerta === 'lost';

  return (
    <div className="min-h-screen bg-[#07080a] text-white py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        
        {/* Top NFC Scan Badge */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
              Escaneo NFC Activo
            </span>
          </div>
          <span className="text-xs font-mono text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            {code || profileData?.codigo}
          </span>
        </div>

        {/* Emergency Alert Banner */}
        {isAlertLost && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 flex items-start gap-3 backdrop-blur-xl animate-pulse">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wide">
                ¡Mascota Reportada como Extraviada!
              </p>
              <p className="text-xs mt-1 text-red-200/90 leading-relaxed">
                Por favor, presiona los botones abajo para llamar o enviar tu ubicación al dueño de inmediato.
              </p>
            </div>
          </div>
        )}

        {/* Main Pet Card */}
        <div className="bg-black/60 rounded-[32px] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl">
          
          {/* Photo */}
          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900">
            <img 
              src={profileData?.foto} 
              alt={profileData?.nombre} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {profileData?.nombre}
                </h1>
                <p className="text-sm text-teal-brand font-medium">
                  {profileData?.especie}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-white/20 backdrop-blur-md border border-white/30 text-white">
                Vigio Mascotas
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Banner Destacado del Mensaje de Rescate */}
            <div className="p-4 rounded-2xl bg-orange-brand/15 border border-orange-brand/30 text-white shadow-inner">
              <span className="text-[10px] font-mono text-orange-brand uppercase tracking-wider block font-bold mb-1">
                Aviso de Emergencia
              </span>
              <p className="text-sm font-semibold text-zinc-100 leading-snug">
                “{profileData?.mensaje_auxilio || '¡Hola! Me he perdido, por favor contacta a mi dueño.'}”
              </p>
            </div>
            
            {/* Quick Actions (Call & WhatsApp) */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${profileData?.owner_telefono?.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-bold text-sm text-white shadow-lg transition-transform active:scale-95"
              >
                <span>📞</span>
                <span>Llamar al Dueño</span>
              </a>

              <a
                href={`https://wa.me/${profileData?.owner_whatsapp}?text=${encodeURIComponent(`¡Hola! Encontré a ${profileData?.nombre} con su placa Vigio (${code}). ¿Cómo coordinamos para devolverlo?`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-teal-brand hover:bg-teal-brand/90 font-bold text-sm text-ink shadow-lg transition-transform active:scale-95"
              >
                <span>💬</span>
                <span>Enviar WhatsApp</span>
              </a>
            </div>

            {/* GPS Broadcast Button */}
            <div>
              {gpsSent ? (
                <div className="py-3 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center flex items-center justify-center gap-2">
                  <span>✓</span>
                  <span>Ubicación GPS enviada con éxito al dueño</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendLocation}
                  disabled={gpsSending}
                  className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-all flex items-center justify-center gap-2"
                >
                  <span>📍</span>
                  <span>{gpsSending ? 'Obteniendo GPS...' : 'Enviar mi ubicación actual al dueño'}</span>
                </button>
              )}
            </div>

            {/* Owner Info & Details */}
            <div className="pt-4 border-t border-white/5 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-dim font-mono uppercase">Dueño / Contacto:</span>
                <span className="text-white font-semibold">{profileData?.owner_nombre}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-dim font-mono uppercase">Ciudad:</span>
                <span className="text-white font-semibold">{profileData?.owner_ciudad}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-dim font-mono uppercase">Teléfono de Rescate:</span>
                <span className="text-white font-mono">{profileData?.owner_telefono}</span>
              </div>
            </div>

            {/* Medical & Allergies */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-brand flex items-center gap-1.5">
                <span>⚠️</span> Información Crítica
              </h4>
              <p className="text-xs text-muted-light leading-relaxed">
                {profileData?.acerca_de}
              </p>
              {profileData?.alergias?.length > 0 && (
                <div className="mt-2 text-[11px] text-white/80">
                  <span className="font-semibold text-white">Alergias:</span> {profileData.alergias.join(', ')}
                </div>
              )}
              {profileData?.medicamentos?.length > 0 && (
                <div className="text-[11px] text-white/80">
                  <span className="font-semibold text-white">Medicamentos:</span> {profileData.medicamentos.join(', ')}
                </div>
              )}
            </div>

            {/* Bottom Brand Stamp */}
            <div className="text-center pt-2">
              <Link 
                to="/login"
                className="text-[11px] font-mono text-muted-dim hover:text-white transition-colors"
              >
                ¿Eres el dueño? Inicia sesión en el portal Mi NFC →
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
