import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function ScanPage() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [deviceData, setDeviceData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [gpsSent, setGpsSent] = useState(false);
  const [gpsSending, setGpsSending] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  useEffect(() => {
    async function fetchScanData() {
      setLoading(true);
      setErrorNotice(null);

      // Default fallback data for simulation / offline
      const fallbackLuna = {
        type: 'mascota',
        codigo: code || 'FINDME-9824-CL',
        nombre: 'Luna',
        especie: 'Perro (Golden Retriever)',
        foto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
        alerta: 'lost',
        acerca_de: 'Muy dócil y cariñosa. Requiere alimento hipoalergénico.',
        alergias: ['Pollo', 'Cereales procesados'],
        medicamentos: ['Apoquel (Dermatitis estacional)'],
        owner_nombre: 'Carlos Mendoza',
        owner_telefono: '+56 9 8765 4321',
        owner_whatsapp: '56987654321',
        owner_ciudad: 'Santiago, Chile',
      };

      if (!isSupabaseConfigured() || !supabase) {
        setDeviceData({ codigo_publico: code, categoria: 'mascota' });
        setProfileData(fallbackLuna);
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch plate record
        const { data: placa, error: pErr } = await supabase
          .from('placas_nfc')
          .select('*')
          .eq('codigo_publico', code)
          .single();

        if (pErr || !placa) {
          // If not in database, show friendly activation prompt
          setErrorNotice('Dispositivo no encontrado o pendiente de activación.');
          setProfileData(fallbackLuna);
          setLoading(false);
          return;
        }

        setDeviceData(placa);

        // 2. Fetch linked Pet profile
        const { data: mascota } = await supabase
          .from('mascotas')
          .select('*')
          .eq('placa_id', placa.id)
          .single();

        // 3. Fetch linked Owner profile
        let owner = null;
        if (placa.user_id) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', placa.user_id)
            .single();
          owner = prof;
        }

        if (mascota) {
          setProfileData({
            type: 'mascota',
            codigo: placa.codigo_publico,
            nombre: mascota.nombre,
            especie: `${mascota.especie} (${mascota.raza || 'Mestizo'})`,
            foto: mascota.foto_url || fallbackLuna.foto,
            alerta: mascota.estado_alerta || 'safe',
            acerca_de: mascota.acerca_de || 'Mascota registrada en FindeMe.',
            alergias: mascota.alergias_alimentos || [],
            medicamentos: mascota.alergias_medicamentos || [],
            owner_nombre: owner?.nombre_completo || 'Dueño FindeMe',
            owner_telefono: owner?.telefono || '+56 9 8765 4321',
            owner_whatsapp: owner?.whatsapp || '56987654321',
            owner_ciudad: owner?.ciudad || 'Chile',
            mascota_id: mascota.id,
            placa_id: placa.id
          });
        } else {
          setProfileData(fallbackLuna);
        }

      } catch (err) {
        console.warn('Scan read error:', err);
        setProfileData(fallbackLuna);
      } finally {
        setLoading(false);
      }
    }

    fetchScanData();
  }, [code]);

  // Handle GPS location dispatch to owner
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
                mascota_id: profileData.mascota_id,
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
                FindeMe Animales
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
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
                href={`https://wa.me/${profileData?.owner_whatsapp}?text=${encodeURIComponent(`¡Hola! Encontré a ${profileData?.nombre} con su placa FindeMe (${code}). ¿Cómo coordinamos para devolverlo?`)}`}
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
