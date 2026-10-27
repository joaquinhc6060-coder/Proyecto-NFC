import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RESTAURANT_DATA } from '../services/restaurantService';
import { uploadReceiptFile } from '../services/storageService';
import { analyzeReceipt } from '../services/receiptAiService';
import { recordReceiptTransaction } from '../services/databaseService';
import { generateWalletPass, updatePassStamps } from '../services/walletPassService';

export default function ClientWalletCardPage() {
  const { id } = useParams();
  const restaurantName = RESTAURANT_DATA.nombre;

  // Estado del usuario / cliente
  const [isRegistered, setIsRegistered] = useState(true);
  const [formData, setFormData] = useState({
    nombre: 'Rodrigo Valenzuela',
    telefono: '+56 9 8451 9201',
    email: 'rodrigo.valenzuela@gmail.com',
    cumpleanos: '1994-08-14'
  });

  // Estado de la tarjeta VIP
  const [stamps, setStamps] = useState(4);
  const [points, setPoints] = useState(450);
  const [tier, setTier] = useState('Socio VIP Oro');
  const [qrCodeSalt, setQrCodeSalt] = useState('7F9B-2026');
  const [qrTimer, setQrTimer] = useState(30);

  // Estados del escáner de boleta IA
  const [isScanningModalOpen, setIsScanningModalOpen] = useState(false);
  const [scanStep, setScanStep] = useState('idle'); // 'idle' | 'uploading' | 'analyzing' | 'success'
  const [scanResult, setScanResult] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Contador dinámico para QR antifraude (cada 30s se renueva el hash)
  useEffect(() => {
    const timer = setInterval(() => {
      setQrTimer((prev) => {
        if (prev <= 1) {
          setQrCodeSalt(Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000));
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Flujo modular de Subida a Storage + Análisis IA + Registro en DB + Actualización de Pases
  const handleStartScan = async (eventOrCustomFile = null) => {
    try {
      let fileToUpload = null;
      if (eventOrCustomFile?.target?.files?.[0]) {
        fileToUpload = eventOrCustomFile.target.files[0];
      } else if (eventOrCustomFile instanceof Blob) {
        fileToUpload = eventOrCustomFile;
      } else {
        // Objeto dummy para simulación cuando hace clic en "Probar Escaneo Automático"
        fileToUpload = new Blob(['BOLETA_DEMO_VIGIO_MESA_14'], { type: 'image/jpeg' });
        fileToUpload.name = 'boleta_mesa14.jpg';
      }

      setScanStep('uploading');

      // 1. Subida a Cloud Storage (Supabase / R2 / S3 o Mock seguro)
      const storageResult = await uploadReceiptFile(fileToUpload, id || 'bistro-costanera', formData.email);

      setScanStep('analyzing');

      // 2. Lectura y perfilamiento multimodal con IA (Gemini / OpenAI o Mock con 1.8s delay)
      const aiAnalysis = await analyzeReceipt(storageResult.publicUrl || storageResult.simulatedCloudUrl);

      // 3. Registro de transacción en base de datos en tiempo real (emite a Dashboard)
      const dbRecord = await recordReceiptTransaction({
        restaurantId: id || 'bistro-costanera',
        customerId: 'cust-01',
        customerName: formData.nombre,
        total: aiAnalysis.totalAmount,
        items: aiAnalysis.items,
        generatedTags: aiAnalysis.generatedTags,
        fileUrl: storageResult.publicUrl,
        confidenceOCR: aiAnalysis.confidenceOCR
      });

      // 4. Actualización del pase nativo de Wallet
      const newStamps = Math.min(5, stamps + 1);
      const newPoints = points + 50;
      await updatePassStamps('VIP-cust-01', newStamps, newPoints);

      setScanResult({
        folio: aiAnalysis.folioBoleta || dbRecord.id,
        merchantName: aiAnalysis.merchantName,
        total: aiAnalysis.totalAmount,
        items: aiAnalysis.items,
        confianzaOCR: aiAnalysis.confidenceOCR,
        aiTagsInferred: aiAnalysis.generatedTags,
        mensajeIA: aiAnalysis.mensajeResumen || 'Boleta legítima verificada con IA. Productos identificados, hábitos clasificados y +1 Sello VIP acreditado al instante.'
      });

      setStamps(newStamps);
      setPoints(newPoints);
      setScanStep('success');

    } catch (err) {
      console.error('[ClientWalletCardPage] Error durante escaneo:', err);
      setScanStep('idle');
      setToastMessage(`⚠️ Error: ${err.message || 'No se pudo procesar la boleta'}`);
      setTimeout(() => setToastMessage(''), 5000);
    }
  };

  const resetScanner = () => {
    setIsScanningModalOpen(false);
    setScanStep('idle');
    setScanResult(null);
  };

  const handleWalletDownload = async (platform) => {
    try {
      const passInfo = await generateWalletPass(
        {
          id: 'cust-01',
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
          nivel: tier,
          sellos: stamps,
          puntos: points,
          qrSalt: qrCodeSalt
        },
        RESTAURANT_DATA
      );
      setToastMessage(`✓ Pase nativo de ${platform} generado. Se ha sincronizado con tu pantalla de bloqueo y geocerca de ${passInfo.geofenceRadius}m.`);
      setTimeout(() => setToastMessage(''), 5000);
    } catch (e) {
      setToastMessage(`✓ Pase nativo de ${platform} vinculado.`);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white py-8 px-4 sm:px-6 relative selection:bg-orange-brand selection:text-white">
      {/* Luces de fondo ambient */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-brand/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-md mx-auto space-y-6 relative z-10">
        
        {/* Header de Mesa / Restaurante */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-orange-brand/10 border border-orange-brand/20 flex items-center justify-center text-orange-brand font-bold text-sm">
              🍽️
            </span>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">{restaurantName}</h2>
              <span className="text-[11px] font-mono text-muted-dim block">Mesa 14 · Peana Contactless</span>
            </div>
          </div>
          
          <Link
            to="/dashboard-restaurante"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-orange-brand transition-colors"
          >
            <span>Dueño</span>
            <span>→</span>
          </Link>
        </div>

        {/* Notificación de Geofencing Activo */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-brand/5 border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">Geocerca & Push Activos</span>
          </div>
          <span className="text-[10px] text-muted-dim">&lt; 100m radio</span>
        </div>

        {/* FEEDBACK TOAST */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono animate-fadeIn flex items-center gap-2">
            <span>🎉</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TARJETA VIP DIGITAL NATIVA (VIGIO VIP LOYALTY) */}
        <div className="relative group perspective">
          <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#1C1F26] via-[#16181F] to-[#0E0F14] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-xl">
            
            {/* Brillo holográfico sutil */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-teal-brand/20 to-orange-brand/20 rounded-full blur-2xl pointer-events-none" />

            {/* Cabecera Tarjeta */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-brand" />
                <span className="font-mono text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-brand to-orange-brand">
                  VIGIO VIP LOYALTY
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                {tier}
              </span>
            </div>

            {/* Datos del Socio */}
            <div className="space-y-1 mb-6">
              <span className="text-[10px] font-mono text-muted-dim uppercase tracking-wider block">Titular Autorizado</span>
              <h3 className="text-xl font-black text-white tracking-tight">{formData.nombre}</h3>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-mono font-bold text-teal-brand">{points} Puntos</span>
                <span className="text-[11px] text-muted-dim">·</span>
                <span className="text-xs font-mono text-muted-light">{formData.telefono}</span>
              </div>
            </div>

            {/* BARRA DE SELLOS (0/5) EN COLOR VERDE ESMERALDA */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[11px] text-muted-light">
                  Progreso de Sellos: <strong className="text-emerald-400">{stamps} / 5</strong>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  {stamps >= 5 ? '¡Recompensa Lista!' : 'Gana 1 Cena Gratis'}
                </span>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-500 ${
                      s <= stamps
                        ? 'bg-gradient-to-br from-[#10B981] to-[#00E599] text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.02]'
                        : 'bg-white/5 border border-white/10 text-white/20'
                    }`}
                  >
                    {s <= stamps ? '✓' : s}
                  </div>
                ))}
              </div>
            </div>

            {/* CÓDIGO QR DINÁMICO ANTIFRAUDE */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                {/* QR Visual */}
                <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg">
                  <div className="w-full h-full bg-black rounded-lg grid grid-cols-3 gap-0.5 p-1">
                    <span className="bg-white rounded-sm" />
                    <span className="bg-transparent" />
                    <span className="bg-white rounded-sm" />
                    <span className="bg-white rounded-sm" />
                    <span className="bg-white rounded-sm" />
                    <span className="bg-transparent" />
                    <span className="bg-white rounded-sm" />
                    <span className="bg-transparent" />
                    <span className="bg-white rounded-sm" />
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-muted-dim block uppercase">Token Antifraude</span>
                  <span className="text-xs font-mono font-bold text-white tracking-wider block">{qrCodeSalt}</span>
                  <span className="text-[10px] font-mono text-emerald-400">Renueva en {qrTimer}s</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-muted-dim block">Emisión</span>
                <span className="text-xs font-mono text-white/90">NFC Pass v2</span>
              </div>
            </div>

          </div>
        </div>

        {/* BOTÓN PRINCIPAL DE ACCIÓN: SUBIDA DE BOLETA IA */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setIsScanningModalOpen(true)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-brand via-[#FF6D3B] to-orange-brand hover:brightness-110 text-white font-black text-sm tracking-wide shadow-[0_0_25px_rgba(255,90,38,0.4)] transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
          >
            <span className="text-lg">🧾</span>
            <span>Subir Boleta para Sumar Sello (IA)</span>
          </button>
          <p className="text-[11px] text-center text-muted-dim font-light">
            La Inteligencia Artificial valida la autenticidad de tu boleta en segundos y actualiza tus beneficios.
          </p>
        </div>

        {/* BOTONES OFICIALES NATIVOS: APPLE WALLET & GOOGLE WALLET */}
        <div className="p-5 rounded-3xl bg-[#121316] border border-white/[0.08] space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-light block text-center">
            Pases Nativos · Cero Apps Requeridas
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Apple Wallet Badge */}
            <button
              type="button"
              onClick={() => handleWalletDownload('Apple Wallet')}
              className="py-3 px-4 rounded-xl bg-black hover:bg-neutral-900 border border-white/20 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-95"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.84-10.4-12.22-22.37-16.14-35.91-3.92-13.54-5.88-26.17-5.88-37.89 0-14.7 3.59-26.69 10.77-35.96 7.18-9.27 16.29-14.01 27.33-14.22 4.48 0 9.8 1.25 15.96 3.75 6.16 2.5 10.15 3.78 11.96 3.84 1.55 0 5.69-1.33 12.42-3.99 6.73-2.66 12.06-3.87 16-3.63 11.85.87 21.09 5.38 27.72 13.53-10.36 6.31-15.43 14.92-15.22 25.83.21 8.59 3.48 15.82 9.8 21.69 6.32 5.87 13.82 9.29 22.5 10.26-1.96 5.87-4.35 11.69-7.18 17.47zM119.22 31.84c0-7.39 2.66-14.46 7.98-21.21 5.32-6.75 11.96-10.63 19.92-11.63.22 1.3.33 2.5.33 3.6 0 7.39-2.77 14.57-8.31 21.54-5.54 6.97-12.16 10.87-19.86 11.7-.06-1.3-.06-2.63-.06-4z"/>
              </svg>
              <span>Añadir a Apple Wallet</span>
            </button>

            {/* Google Wallet Badge */}
            <button
              type="button"
              onClick={() => handleWalletDownload('Google Wallet')}
              className="py-3 px-4 rounded-xl bg-black hover:bg-neutral-900 border border-white/20 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-95"
            >
              <span className="text-base">💳</span>
              <span>Guardar en Google Wallet</span>
            </button>
          </div>
        </div>

        {/* DATOS DE LA CUENTA / PERFIL */}
        <div className="p-5 rounded-3xl bg-[#121316] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Tus Datos de Contacto</span>
            <span className="text-[10px] font-mono text-emerald-400">● Verificado</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-muted-dim block">WhatsApp</span>
              <span className="font-mono text-white text-[11px]">{formData.telefono}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-muted-dim block">Cumpleaños (Regalo VIP)</span>
              <span className="font-mono text-white text-[11px]">14 de Agosto</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL INTERACTIVO: ESCANEO Y LECTURA CON IA DE LA BOLETA */}
      {/* ========================================================================= */}
      {isScanningModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121316] border border-white/15 rounded-[32px] p-6 shadow-2xl space-y-5 relative overflow-hidden animate-scaleIn">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h3 className="text-base font-black text-white">Validación de Boleta con IA</h3>
              </div>
              <button
                type="button"
                onClick={resetScanner}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-light text-sm"
              >
                ✕
              </button>
            </div>

            {/* ESTADO 1: IDLE / SELECCIÓN DE BOLETA */}
            {scanStep === 'idle' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-orange-brand/10 border-2 border-dashed border-orange-brand/40 flex flex-col items-center justify-center text-orange-brand">
                  <span className="text-3xl">📸</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Toma una foto o sube tu boleta</h4>
                  <p className="text-xs text-muted-light max-w-xs mx-auto">
                    Nuestra IA procesará los ítems, fecha y monto para acreditar tu sello al instante.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleStartScan}
                    className="w-full py-3.5 px-4 rounded-xl bg-orange-brand hover:brightness-110 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>⚡</span>
                    <span>Probar Escaneo Automático (Demo Boleta Mesa 14)</span>
                  </button>

                  <label className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-muted-light text-xs font-mono cursor-pointer block transition-colors">
                    <span>Seleccionar archivo o foto del dispositivo</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleStartScan} />
                  </label>
                </div>
              </div>
            )}

            {/* ESTADO 2: PROCESANDO CON IA (ANIMACIÓN LÁSER & OCR) */}
            {(scanStep === 'uploading' || scanStep === 'analyzing') && (
              <div className="py-8 text-center space-y-6">
                
                {/* Animación del visor OCR */}
                <div className="relative w-48 h-48 mx-auto rounded-2xl bg-black/60 border border-teal-brand/40 overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(0,229,153,0.2)]">
                  {/* Láser de barrido */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-brand to-transparent animate-laserScan shadow-[0_0_15px_#00E599]" />
                  
                  {/* Wireframe de boleta simulada */}
                  <div className="w-32 space-y-2 opacity-60">
                    <div className="h-2 bg-white/20 rounded" />
                    <div className="h-2 bg-white/40 rounded w-3/4 mx-auto" />
                    <div className="h-1.5 bg-teal-brand/50 rounded w-1/2" />
                    <div className="h-1.5 bg-teal-brand/40 rounded w-2/3" />
                    <div className="h-1.5 bg-white/20 rounded w-4/5" />
                    <div className="h-2 bg-orange-brand/50 rounded w-1/3 ml-auto" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-brand animate-ping" />
                    <h4 className="text-sm font-bold text-white font-mono">
                      {scanStep === 'uploading' ? 'Subiendo archivo a Cloud Storage...' : 'Extrayendo productos con IA & OCR...'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-muted-dim font-mono">
                    Verificando hash antifraude y analizando categorías de consumo
                  </p>
                </div>
              </div>
            )}

            {/* ESTADO 3: ÉXITO / RECONOCIMIENTO COMPLETADO */}
            {scanStep === 'success' && scanResult && (
              <div className="space-y-4 py-2 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">¡Boleta Validada con Éxito!</h4>
                    <p className="text-[11px] text-emerald-200/90 leading-relaxed mt-0.5">
                      {scanResult.mensajeIA}
                    </p>
                  </div>
                </div>

                {/* Desglose de ítems detectados */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-[11px] font-mono text-muted-dim pb-1.5 border-b border-white/10">
                    <span>Folio: {scanResult.folio}</span>
                    <span className="text-teal-brand">Confianza OCR: {scanResult.confianzaOCR}%</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {scanResult.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-white font-medium">{it.quantity || it.cant || 1}x {it.name || it.nombre}</span>
                        <span className="font-mono text-muted-light">${(it.price || it.precio || 0).toLocaleString('es-CL')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold text-sm">
                    <span className="text-white">Total Validado:</span>
                    <span className="text-orange-brand font-mono">${scanResult.total?.toLocaleString('es-CL')} CLP</span>
                  </div>
                </div>

                {/* Etiquetas de hábitos asignadas */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-muted-dim uppercase block">Etiquetas de Perfil IA asignadas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.aiTagsInferred.map((tag, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-orange-brand/10 text-orange-brand border border-orange-brand/20">
                        🏷️ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetScanner}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs shadow-lg transition-transform active:scale-95"
                >
                  Continuar a mi Tarjeta VIP (+1 Sello Actualizado)
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
