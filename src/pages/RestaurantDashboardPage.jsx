import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RESTAURANT_DATA, 
  MOCK_KPIS, 
  MOCK_CUSTOMERS, 
  MOCK_BOLETAS, 
  generateWaiterPin 
} from '../services/restaurantService';
import { subscribeToRestaurantUpdates } from '../services/databaseService';
import { sendSegmentedPushNotification } from '../services/walletPassService';
import { sendFallbackNotification } from '../services/fallbackNotificationService';

export default function RestaurantDashboardPage() {
  const [activeTab, setActiveTab] = useState('kpis'); // 'kpis' | 'crm' | 'boletas' | 'push'

  // Datos reactivos en tiempo real (Base de datos / WebSockets)
  const [kpis, setKpis] = useState(MOCK_KPIS);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [boletas, setBoletas] = useState(MOCK_BOLETAS);
  const [realtimeNotification, setRealtimeNotification] = useState(null);

  // CRM & Filtros IA
  const [selectedTagFilter, setSelectedTagFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerModal, setSelectedCustomerModal] = useState(null);
  const [fallbackToast, setFallbackToast] = useState('');

  // Validador y PIN de Mesero
  const [waiterPinData, setWaiterPinData] = useState(generateWaiterPin());
  const [pinCountdown, setPinCountdown] = useState(60);
  const [inspectingBoleta, setInspectingBoleta] = useState(null);

  // Campaña Push
  const [pushSegment, setPushSegment] = useState('Consume Coctelería');
  const [pushTitle, setPushTitle] = useState('🍸 2x1 en Cócteles de Autor este Jueves');
  const [pushBody, setPushBody] = useState('Muestra tu tarjeta VIP en la barra después de las 20:00 hrs y disfruta de la nueva carta de autor.');
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [pushFeedback, setPushFeedback] = useState(null);

  // Geofencing
  const [geofenceActive, setGeofenceActive] = useState(true);
  const [geofenceRadius, setGeofenceRadius] = useState(100);
  const [geofenceMsg, setGeofenceMsg] = useState(RESTAURANT_DATA.geofenceMessage);

  // Suscripción en Tiempo Real (Cross-Tab BroadcastChannel + WebSockets)
  useEffect(() => {
    const unsubscribe = subscribeToRestaurantUpdates('bistro-costanera', (event) => {
      if (event.type === 'RECEIPT_SCANNED' && event.receipt) {
        // 1. Agregar boleta a la lista
        setBoletas((prev) => [event.receipt, ...prev]);

        // 2. Actualizar KPIs en vivo
        setKpis((prev) => ({
          ...prev,
          visitasHoy: prev.visitasHoy + 1,
          visitasMes: prev.visitasMes + 1,
          sellosTotalesMes: prev.sellosTotalesMes + 1,
          ticketPromedio: Math.round((prev.ticketPromedio + (event.receipt.total || 45000)) / 2)
        }));

        // 3. Actualizar cliente correspondiente
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === event.customerId || c.nombre === event.receipt.clienteNombre) {
              const updatedTags = Array.from(new Set([...(event.newTags || []), ...c.tagsIA]));
              return {
                ...c,
                sellos: Math.min(5, c.sellos + 1),
                puntos: c.puntos + 50,
                gastoTotal: c.gastoTotal + (event.receipt.total || 0),
                boletasSubidas: c.boletasSubidas + 1,
                tagsIA: updatedTags,
                ultimaVisita: 'Ahora (Boleta validada por IA)'
              };
            }
            return c;
          })
        );

        // 4. Mostrar banner flotante en tiempo real
        setRealtimeNotification({
          titulo: '⚡ Nueva Boleta Escaneada por IA',
          detalle: `${event.receipt.clienteNombre} (${event.receipt.mesa || 'Mesa'}) sumó un sello por $${(event.receipt.total || 0).toLocaleString('es-CL')} CLP.`
        });
        setTimeout(() => setRealtimeNotification(null), 8000);
      }
    });

    return () => unsubscribe();
  }, []);

  // Contador regresivo del PIN dinámico de mesero (cada 60s cambia)
  useEffect(() => {
    const interval = setInterval(() => {
      setPinCountdown((prev) => {
        if (prev <= 1) {
          setWaiterPinData(generateWaiterPin());
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRegeneratePin = () => {
    setWaiterPinData(generateWaiterPin());
    setPinCountdown(60);
  };

  // Filtrado de clientes en el CRM
  const filteredCustomers = customers.filter((cust) => {
    const matchesTag = selectedTagFilter === 'Todos' || cust.tagsIA.includes(selectedTagFilter);
    const matchesSearch = cust.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || cust.telefono.includes(searchQuery);
    return matchesTag && matchesSearch;
  });

  // Envío masivo de Push usando walletPassService
  const handleSendPush = async (e) => {
    e.preventDefault();
    setIsSendingPush(true);
    setPushFeedback(null);

    const segmentCountMap = {
      'Todos': 1284,
      'Consume Coctelería': 340,
      'Amante de Pizzas': 290,
      'Perfil Familiar / Sin Alcohol': 215,
      'Cliente VIP Viernes': 195,
      'Ticket Alto': 160
    };

    const count = segmentCountMap[pushSegment] || 300;
    const result = await sendSegmentedPushNotification([pushSegment], pushTitle, pushBody, count);
    
    setIsSendingPush(false);
    setPushFeedback(result);
  };

  // Disparar notificación por canal de respaldo (WhatsApp / Email)
  const handleSendFallback = async (customer, channel) => {
    setFallbackToast(`Enviando notificación por ${channel}...`);
    const resp = await sendFallbackNotification({
      customer,
      channel,
      messageTitle: '¡Tu Tarjeta VIP te espera!',
      messageBody: `Tienes ${customer.sellos}/5 sellos en Bistró Costanera. Sube tu boleta o muéstrala en mesa.`,
      passUrl: 'https://findeme.cl/restaurante/mi-tarjeta'
    });
    setFallbackToast(`✓ Notificación enviada exitosamente por ${resp.channel} a ${resp.recipient}`);
    setTimeout(() => setFallbackToast(''), 5000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col lg:flex-row font-sans selection:bg-orange-brand selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. SIDEBAR DE NAVEGACIÓN SAAS (DARK MODE FUTURISTA) */}
      {/* ========================================================================= */}
      <aside className="w-full lg:w-72 bg-[#0E0F12] border-b lg:border-b-0 lg:border-r border-white/[0.08] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Logo & Marca SaaS */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-brand animate-pulse" />
              <span className="font-mono text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-light to-orange-brand uppercase">
                FINDEME GASTRO SAAS
              </span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight">Portal Restaurante</h1>
            <span className="text-[11px] font-mono text-emerald-400">● Sistema IA & Wallet en Línea</span>
          </div>

          {/* Selector de Restaurante Activo */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-muted-dim uppercase block">Local Activo</span>
            <p className="text-xs font-bold text-white truncate">{RESTAURANT_DATA.nombre}</p>
            <span className="text-[10px] text-muted-dim block font-mono">28 Peanas NFC Operativas</span>
          </div>

          {/* Menú de Pestañas */}
          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('kpis')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-3 text-left ${
                activeTab === 'kpis'
                  ? 'bg-orange-brand text-white shadow-[0_0_20px_rgba(255,90,38,0.3)]'
                  : 'text-muted-light hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">📊</span>
              <span>Resumen & KPIs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('crm')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-3 text-left ${
                activeTab === 'crm'
                  ? 'bg-orange-brand text-white shadow-[0_0_20px_rgba(255,90,38,0.3)]'
                  : 'text-muted-light hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">👥</span>
              <span>Clientes & Perfiles IA (CRM)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('boletas')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-3 text-left ${
                activeTab === 'boletas'
                  ? 'bg-orange-brand text-white shadow-[0_0_20px_rgba(255,90,38,0.3)]'
                  : 'text-muted-light hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">🧾</span>
              <span>Validador de Boletas & PIN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('push')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-3 text-left ${
                activeTab === 'push'
                  ? 'bg-orange-brand text-white shadow-[0_0_20px_rgba(255,90,38,0.3)]'
                  : 'text-muted-light hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">📣</span>
              <span>Campañas Push & Geofence</span>
            </button>
          </nav>

          {/* Enlace para simular la tarjeta del cliente en móvil */}
          <div className="pt-4 border-t border-white/[0.08]">
            <Link
              to="/restaurante/bistro-costanera/mi-tarjeta"
              target="_blank"
              className="w-full py-2.5 px-3.5 rounded-xl bg-teal-brand/10 hover:bg-teal-brand/20 border border-teal-brand/30 text-teal-brand text-xs font-mono transition-colors flex items-center justify-between"
            >
              <span>Ver Tarjeta de Cliente (Móvil)</span>
              <span>↗</span>
            </Link>
          </div>

        </div>

        {/* Footer Sidebar */}
        <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-muted-dim">
          <Link to="/" className="hover:text-white transition-colors">
            ← Volver a FindeMe
          </Link>
          <span className="text-[10px]">v2.6 SaaS</span>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. ÁREA DE CONTENIDO PRINCIPAL DEL DASHBOARD */}
      {/* ========================================================================= */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-6">
        
        {/* BANNER FLOTANTE DE NOTIFICACIÓN EN TIEMPO REAL (Cross-Tab / WebSockets) */}
        {realtimeNotification && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-brand/20 via-teal-brand/20 to-emerald-500/20 border border-orange-brand/50 text-white flex items-center justify-between shadow-[0_0_30px_rgba(255,90,38,0.3)] animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-orange-brand animate-ping" />
              <div>
                <h4 className="text-xs font-bold font-mono text-orange-brand uppercase tracking-wider">{realtimeNotification.titulo}</h4>
                <p className="text-xs text-white/90 font-mono mt-0.5">{realtimeNotification.detalle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRealtimeNotification(null)}
              className="text-xs text-muted-dim hover:text-white px-2 py-1 font-mono"
            >
              Cerrar ✕
            </button>
          </div>
        )}

        {/* FEEDBACK TOAST DE CANAL DE RESPALDO (WHATSAPP / EMAIL) */}
        {fallbackToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono animate-fadeIn flex items-center gap-2">
            <span>📲</span>
            <span>{fallbackToast}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 1: PANEL DE KPIS EN TIEMPO REAL */}
        {/* ===================================================================== */}
        {activeTab === 'kpis' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Título de Vista */}
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-orange-brand">Métricas de Negocio</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Rendimiento de Fidelización & IA</h2>
              <p className="text-xs sm:text-sm text-muted-light mt-1">
                Monitorea en tiempo real las tarjetas en Apple/Google Wallet y el impacto de consumo extraído de boletas.
              </p>
            </div>

            {/* 4 Cards Principales de KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              
              {/* KPI 1 */}
              <div className="p-5 rounded-2xl bg-[#121316] border border-white/[0.08] shadow-lg relative overflow-hidden group hover:border-orange-brand/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-muted-dim uppercase">Tarjetas VIP Activas</span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {kpis.tarjetasCrecimientoMes}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white">{kpis.tarjetasActivas.toLocaleString('es-CL')}</h3>
                <span className="text-[11px] text-muted-light mt-2 block">
                  En Apple Wallet (62%) & Google Wallet (38%)
                </span>
              </div>

              {/* KPI 2 */}
              <div className="p-5 rounded-2xl bg-[#121316] border border-white/[0.08] shadow-lg relative overflow-hidden group hover:border-orange-brand/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-muted-dim uppercase">Visitas Validadas</span>
                  <span className="text-xs font-mono text-orange-brand bg-orange-brand/10 px-2 py-0.5 rounded-full">
                    {kpis.visitasHoy} hoy
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white">{kpis.visitasMes.toLocaleString('es-CL')}</h3>
                <span className="text-[11px] text-muted-light mt-2 block">
                  {kpis.sellosTotalesMes} sellos sumados este mes
                </span>
              </div>

              {/* KPI 3 */}
              <div className="p-5 rounded-2xl bg-[#121316] border border-white/[0.08] shadow-lg relative overflow-hidden group hover:border-orange-brand/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-muted-dim uppercase">Ticket Promedio (OCR)</span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {kpis.ticketCrecimiento}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white">${kpis.ticketPromedio.toLocaleString('es-CL')}</h3>
                <span className="text-[11px] text-muted-light mt-2 block">
                  Extraído con IA de boletas físicas y electrónicas
                </span>
              </div>

              {/* KPI 4 */}
              <div className="p-5 rounded-2xl bg-[#121316] border border-white/[0.08] shadow-lg relative overflow-hidden group hover:border-orange-brand/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-muted-dim uppercase">Tasa de Retorno</span>
                  <span className="text-xs font-mono text-teal-brand bg-teal-brand/10 px-2 py-0.5 rounded-full">
                    Frecuentes
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white">{kpis.tasaRetorno}%</h3>
                <span className="text-[11px] text-muted-light mt-2 block">
                  {kpis.tasaRetornoDetalle}
                </span>
              </div>

            </div>

            {/* Bloque Gráfico & Insights de IA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Desglose de Hábitos por IA */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#121316] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🧠</span>
                    <span>Distribución de Segmentos IA Detectados en Boletas</span>
                  </h3>
                  <span className="text-[11px] font-mono text-muted-dim">100% Automatizado</span>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white">Consume Coctelería de Autor (340 clientes)</span>
                      <span className="text-orange-brand font-bold">26.5%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-orange-brand rounded-full" style={{ width: '26.5%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white">Amantes de Pizzas Artesanales (290 clientes)</span>
                      <span className="text-teal-brand font-bold">22.6%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-teal-brand rounded-full" style={{ width: '22.6%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white">Perfil Familiar / Sin Alcohol (215 clientes)</span>
                      <span className="text-emerald-400 font-bold">16.7%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '16.7%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white">Cliente VIP Viernes / Noche (195 clientes)</span>
                      <span className="text-purple-400 font-bold">15.2%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: '15.2%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-white">Ticket Alto &gt; $80.000 (160 clientes)</span>
                      <span className="text-amber-400 font-bold">12.5%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: '12.5%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Acceso Rápido al Disparador de Campañas */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1C1F26] to-[#121316] border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-mono text-orange-brand uppercase tracking-wider block">Acción Inmediata</span>
                  <h3 className="text-lg font-black text-white mt-1">Disparar Notificación Push a la Wallet</h3>
                  <p className="text-xs text-muted-light mt-2 leading-relaxed">
                    Envía promociones en tiempo real a la pantalla de bloqueo de tus clientes sin coste de SMS ni WhatsApp.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
                    <span className="text-muted-dim block text-[10px]">Segmento sugerido hoy:</span>
                    <strong className="text-orange-brand">🍸 Consume Coctelería (340 teléfonos)</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('push')}
                    className="w-full py-3 px-4 rounded-xl bg-orange-brand hover:brightness-110 text-white font-black text-xs transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Redactar Notificación Push →</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: TABLA DE CLIENTES Y PERFILES IA (CRM INTELIGENTE) */}
        {/* ===================================================================== */}
        {activeTab === 'crm' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header del CRM */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-orange-brand">CRM Inteligente</span>
                <h2 className="text-2xl font-black text-white mt-1">Base de Clientes & Hábitos IA</h2>
                <p className="text-xs text-muted-light">
                  Etiquetas generadas en segundo plano según los productos reales consumidos en boletas.
                </p>
              </div>

              {/* Buscador */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-muted-dim focus:outline-none focus:border-orange-brand"
                />
              </div>
            </div>

            {/* Filtros visuales por etiquetas IA (Píldoras) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {['Todos', 'Consume Coctelería', 'Amante de Pizzas', 'Perfil Familiar / Sin Alcohol', 'Cliente VIP Viernes', 'Ticket Alto'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTagFilter(tag)}
                  className={`py-1.5 px-3.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                    selectedTagFilter === tag
                      ? 'bg-orange-brand text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-muted-light border border-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Tabla de Clientes */}
            <div className="rounded-3xl bg-[#121316] border border-white/[0.08] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] border-b border-white/[0.08] text-muted-dim font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3.5 px-5">Cliente</th>
                      <th className="py-3.5 px-4">Nivel / Wallet</th>
                      <th className="py-3.5 px-4">Sellos (0/5)</th>
                      <th className="py-3.5 px-4">Gasto Total</th>
                      <th className="py-3.5 px-4">Última Visita</th>
                      <th className="py-3.5 px-5">Etiquetas de Perfil IA</th>
                      <th className="py-3.5 px-4 text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-5">
                          <strong className="text-white block font-semibold">{cust.nombre}</strong>
                          <span className="text-[11px] font-mono text-muted-dim">{cust.telefono}</span>
                        </td>
                        <td className="py-4 px-4 font-mono">
                          <span className="text-teal-brand block font-bold">{cust.nivel}</span>
                          <span className="text-[10px] text-muted-dim">{cust.walletPlatform}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span
                                key={s}
                                className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${
                                  s <= cust.sellos ? 'bg-emerald-400 text-black font-black' : 'bg-white/10 text-transparent'
                                }`}
                              >
                                ✓
                              </span>
                            ))}
                            <span className="text-[11px] font-mono text-muted-light ml-1">{cust.sellos}/5</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-white font-semibold">
                          ${cust.gastoTotal.toLocaleString('es-CL')}
                          <span className="text-[10px] text-muted-dim block font-normal">{cust.boletasSubidas} boletas</span>
                        </td>
                        <td className="py-4 px-4 font-mono text-muted-light text-[11px]">
                          {cust.ultimaVisita}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {cust.tagsIA.map((t, i) => (
                              <span
                                key={i}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                                  t.includes('Coctelería')
                                    ? 'bg-orange-brand/10 text-orange-brand border-orange-brand/20'
                                    : t.includes('Familiar')
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : t.includes('Alto')
                                    ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                                    : 'bg-white/5 text-muted-light border-white/10'
                                }`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomerModal(cust)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-light hover:text-white transition-colors"
                          >
                            👁️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: VALIDADOR DE BOLETAS & ANTIFRAUDE */}
        {/* ===================================================================== */}
        {activeTab === 'boletas' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header */}
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-orange-brand">Control Antifraude</span>
              <h2 className="text-2xl font-black text-white mt-1">Validador de Boletas & PIN de Mesero</h2>
              <p className="text-xs text-muted-light">
                Verifica las boletas procesadas por IA o utiliza el PIN dinámico de mesa para validaciones presenciales.
              </p>
            </div>

            {/* SECCIÓN 1: PIN DINÁMICO DE MESERO (ROTACIÓN CADA 60S) */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1A1D24] via-[#15171D] to-[#0E0F14] border border-white/15 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    PIN Dinámico Activo para Meseros
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">Validación Manual sin Boleta</h3>
                <p className="text-xs text-muted-light max-w-md leading-relaxed font-light">
                  Si un cliente no desea subir su boleta, el mesero puede dictarle este PIN en mesa para acreditar el sello al instante. Cambia automáticamente cada 60 segundos para evitar fraudes.
                </p>
              </div>

              {/* Pin Display Box */}
              <div className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
                <span className="text-[10px] font-mono text-muted-dim uppercase">Código de Mesa Actual</span>
                <span className="text-4xl font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-brand via-white to-teal-brand">
                  {waiterPinData.pin}
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-dim">
                  <span>Expira en: <strong className="text-orange-brand">{pinCountdown}s</strong></span>
                  <button
                    type="button"
                    onClick={handleManualRegeneratePin}
                    className="text-teal-brand hover:underline text-[10px] ml-2"
                  >
                    ↻ Renovar
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: REGISTRO DE BOLETAS LEÍDAS CON OCR */}
            <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🧾</span>
                  <span>Últimas Boletas Escaneadas por Clientes (Cloud Storage + IA)</span>
                </h3>
                <span className="text-xs font-mono text-muted-dim">{boletas.length} registradas hoy</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {boletas.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setInspectingBoleta(b)}
                    className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-orange-brand/30 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-muted-dim uppercase block">{b.id}</span>
                        <strong className="text-sm font-bold text-white block">{b.clienteNombre}</strong>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ✓ {b.estado}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-muted-light">
                        <span>Ubicación:</span>
                        <span className="font-mono text-white">{b.mesa}</span>
                      </div>
                      <div className="flex justify-between text-muted-light">
                        <span>Total:</span>
                        <span className="font-mono text-orange-brand font-bold">${b.total.toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between text-muted-light">
                        <span>Confianza IA:</span>
                        <span className="font-mono text-teal-brand">{b.confianzaOCR}%</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1">
                      {b.tagsGenerados.map((t, idx) => (
                        <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-muted-light">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 4: CENTRO DE CAMPAÑAS PUSH & GEOFENCING (WALLET PUSH) */}
        {/* ===================================================================== */}
        {activeTab === 'push' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header */}
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-orange-brand">Marketing Automatizado</span>
              <h2 className="text-2xl font-black text-white mt-1">Disparador Push & Geofencing a Wallet</h2>
              <p className="text-xs text-muted-light">
                Envía notificaciones directas a la pantalla de bloqueo de Apple Wallet y Google Wallet según las etiquetas de IA.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Formulario de Redacción (Izquierda) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* SELECTOR DE SEGMENTO IA */}
                <div className="p-6 rounded-3xl bg-[#121316] border border-white/[0.08] space-y-4">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-light block font-bold">
                    1. Selecciona el Segmento de Clientes (IA)
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { name: 'Consume Coctelería', desc: '340 pases activos', icon: '🍸' },
                      { name: 'Amante de Pizzas', desc: '290 pases activos', icon: '🍕' },
                      { name: 'Perfil Familiar / Sin Alcohol', desc: '215 pases activos', icon: '👨‍👩‍👧' },
                      { name: 'Cliente VIP Viernes', desc: '195 pases activos', icon: '🎉' },
                      { name: 'Ticket Alto', desc: '160 pases activos', icon: '💎' },
                      { name: 'Todos los Clientes', desc: '1.284 pases activos', icon: '📢' }
                    ].map((seg) => (
                      <button
                        key={seg.name}
                        type="button"
                        onClick={() => setPushSegment(seg.name)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          pushSegment === seg.name
                            ? 'bg-orange-brand/10 border-orange-brand text-white shadow-md'
                            : 'bg-white/[0.02] border-white/5 text-muted-light hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{seg.icon}</span>
                          <strong className="text-xs text-white block">{seg.name}</strong>
                        </div>
                        <span className="text-[10px] font-mono text-orange-brand mt-1 block">{seg.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* REDACTOR DE CONTENIDO PUSH */}
                <form onSubmit={handleSendPush} className="p-6 rounded-3xl bg-[#121316] border border-white/[0.08] space-y-4">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-light block font-bold">
                    2. Mensaje en Pantalla de Bloqueo
                  </label>

                  <div>
                    <span className="text-[11px] font-mono text-muted-dim block mb-1">Título de la Notificación</span>
                    <input
                      type="text"
                      value={pushTitle}
                      onChange={(e) => setPushTitle(e.target.value)}
                      placeholder="Ej: 🍸 2x1 en Cócteles de Autor hoy"
                      className="w-full py-2.5 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-brand"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-muted-dim block mb-1">Cuerpo del Mensaje</span>
                    <textarea
                      rows={3}
                      value={pushBody}
                      onChange={(e) => setPushBody(e.target.value)}
                      placeholder="Escribe el beneficio o promoción..."
                      className="w-full py-2.5 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-brand resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingPush}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-brand via-[#FF6D3B] to-orange-brand hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,90,38,0.4)] transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span>⚡</span>
                    <span>{isSendingPush ? 'Transmitiendo a Servidores APNs & Google...' : `Enviar Push a ${pushSegment}`}</span>
                  </button>

                  {pushFeedback && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono animate-fadeIn flex items-center gap-2">
                      <span>✓</span>
                      <span>
                        ¡Éxito! Notificación entregada a {pushFeedback.sentCount} dispositivos Apple & Google Wallet ({pushFeedback.timestamp}).
                      </span>
                    </div>
                  )}
                </form>

                {/* CONFIGURACIÓN DE GEOFENCING / PROXIMIDAD */}
                <div className="p-6 rounded-3xl bg-[#121316] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">3. Geofencing & Beacons (Alerta por Cercanía)</h4>
                      <p className="text-[11px] text-muted-light mt-0.5">
                        Salta automáticamente en el teléfono del cliente cuando pasa caminando cerca del restaurante.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setGeofenceActive(!geofenceActive)}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                        geofenceActive ? 'bg-emerald-500' : 'bg-white/20'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full bg-white block transition-transform ${geofenceActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {geofenceActive && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-dim">Radio de Activación:</span>
                        <span className="text-orange-brand font-bold">{geofenceRadius} metros</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        step="50"
                        value={geofenceRadius}
                        onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                        className="w-full accent-orange-brand"
                      />

                      <textarea
                        rows={2}
                        value={geofenceMsg}
                        onChange={(e) => setGeofenceMsg(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-teal-brand text-[11px]"
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* VISTA PREVIA EN TIEMPO REAL: SMARTPHONE LOCK SCREEN (Derecha) */}
              <div className="lg:col-span-5 sticky top-8 space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-muted-dim block text-center">
                  Vista Previa en Pantalla de Bloqueo
                </span>

                {/* Smartphone Mockup */}
                <div className="w-[300px] sm:w-[320px] mx-auto rounded-[48px] p-3 bg-[#1B1D22] border-4 border-[#2A2E38] shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
                  
                  {/* Dynamic Island */}
                  <div className="w-24 h-5 rounded-full bg-black mx-auto mb-4 relative z-20" />

                  {/* Lock Screen Wallpaper */}
                  <div className="rounded-[36px] bg-gradient-to-b from-[#1E2538] via-[#0E131F] to-black p-5 min-h-[500px] flex flex-col justify-between relative overflow-hidden text-center text-white">
                    
                    {/* Hora y Fecha */}
                    <div className="space-y-1 pt-4">
                      <span className="text-[11px] text-white/70 font-medium">Jueves, 22 de Octubre</span>
                      <h2 className="text-5xl font-extralight tracking-tight text-white/90">20:15</h2>
                    </div>

                    {/* BURBUJA DE NOTIFICACIÓN PUSH WALLET */}
                    <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-2xl border border-white/20 text-left space-y-1.5 shadow-2xl animate-scaleIn">
                      <div className="flex items-center justify-between text-[10px] text-white/80">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-md bg-black text-white flex items-center justify-center text-[9px] font-bold">
                            
                          </span>
                          <span className="font-semibold uppercase tracking-wider">Wallet · {RESTAURANT_DATA.nombre}</span>
                        </div>
                        <span className="font-mono text-white/60">Ahora</span>
                      </div>

                      <strong className="text-xs font-bold text-white block leading-tight">
                        {pushTitle || 'Título de Notificación'}
                      </strong>
                      <p className="text-[11px] text-white/90 leading-snug">
                        {pushBody || 'Escribe el mensaje en el redactor para previsualizarlo en tiempo real.'}
                      </p>
                    </div>

                    {/* Barra de desbloqueo inferior */}
                    <div className="pt-6">
                      <div className="w-28 h-1 rounded-full bg-white/40 mx-auto" />
                    </div>

                  </div>
                </div>

                <p className="text-[11px] font-mono text-center text-muted-dim max-w-xs mx-auto">
                  La notificación aparece al 100% de los comensales del segmento sin necesidad de que abran ninguna aplicación.
                </p>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL DETALLE DE CLIENTE CRM */}
      {/* ========================================================================= */}
      {selectedCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121316] border border-white/15 rounded-[32px] p-6 shadow-2xl space-y-4 animate-scaleIn">
            <div className="flex justify-between items-start pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-black text-white">{selectedCustomerModal.nombre}</h3>
                <span className="text-xs font-mono text-teal-brand">{selectedCustomerModal.telefono}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-light"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-dim font-mono">Pase Activo:</span>
                <span className="text-white font-bold">{selectedCustomerModal.walletPlatform}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-dim font-mono">Gasto Histórico:</span>
                <span className="text-orange-brand font-mono font-bold">${selectedCustomerModal.gastoTotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-dim font-mono">Sellos Acreditados:</span>
                <span className="text-emerald-400 font-mono font-bold">{selectedCustomerModal.sellos} / 5</span>
              </div>

              <div>
                <span className="text-muted-dim font-mono block mb-1">Perfil IA:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCustomerModal.tagsIA.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-white">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <span className="text-muted-dim font-mono block mb-1">Últimas Boletas Subidas:</span>
                <div className="space-y-1.5">
                  {selectedCustomerModal.historialBoletas.map((h) => (
                    <div key={h.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-white font-bold">{h.fecha}</span>
                        <span className="text-orange-brand">${h.total.toLocaleString('es-CL')}</span>
                      </div>
                      <span className="text-[10px] text-muted-light block truncate mt-0.5">{h.items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones de Respaldo (WhatsApp & Email para clientes sin Wallet) */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-muted-dim uppercase block">Canales de Respaldo Directos:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendFallback(selectedCustomerModal, 'whatsapp')}
                    className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendFallback(selectedCustomerModal, 'email')}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>✉️</span>
                    <span>Email Resend</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL INSPECTOR DE BOLETA OCR & JSON IA */}
      {/* ========================================================================= */}
      {inspectingBoleta && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#121316] border border-white/15 rounded-[32px] p-6 shadow-2xl space-y-4 animate-scaleIn">
            <div className="flex justify-between items-start pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-muted-dim uppercase block">Inspector de Telemetría OCR</span>
                <h3 className="text-base font-black text-white">{inspectingBoleta.id} · {inspectingBoleta.mesa}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingBoleta(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-light"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 font-mono text-[11px] space-y-1">
                <div className="flex justify-between text-muted-dim">
                  <span>Hash Antifraude:</span>
                  <span className="text-emerald-400">{inspectingBoleta.hashAntifraude}</span>
                </div>
                <div className="flex justify-between text-muted-dim">
                  <span>Confianza Neuronal:</span>
                  <span className="text-teal-brand">{inspectingBoleta.confianzaOCR}%</span>
                </div>
              </div>

              <div>
                <span className="text-muted-dim font-mono block mb-1.5 uppercase text-[10px]">Productos Detectados:</span>
                <div className="space-y-1">
                  {inspectingBoleta.itemsDetectados.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-white/[0.02]">
                      <span className="text-white font-medium">{it.cant}x {it.nombre} ({it.cat})</span>
                      <span className="font-mono text-muted-light">${it.precio.toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold text-sm">
                <span className="text-white">Monto Acreditado:</span>
                <span className="text-orange-brand font-mono">${inspectingBoleta.total.toLocaleString('es-CL')} CLP</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
