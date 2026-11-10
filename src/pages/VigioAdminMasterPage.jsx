import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '../lib/adminApi';
import { inventoryCsv, supplierCsv } from '../lib/adminCsv';

export default function VigioAdminMasterPage() {
  // Autenticación de Acceso de Dueños
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState('');

  // Estados del Dashboard
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, mascotas, kids
  const [filterStatus, setFilterStatus] = useState('all'); // all, fabricada, activada
  const [searchTerm, setSearchTerm] = useState('');

  // Generador de Códigos
  const [genCategory, setGenCategory] = useState('mascotas'); // mascotas, kids
  const [genQuantity, setGenQuantity] = useState(10);
  const [genLote, setGenLote] = useState('LOTE-1-2026');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState('');

  // Copia rápida al portapapeles
  const [copiedId, setCopiedId] = useState(null);

  const [checking, setChecking] = useState(true);
  const [notice, setNotice] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filterBatch, setFilterBatch] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteBatch, setDeleteBatch] = useState('');
  const deleting = useRef(false);
  const requestVersion = useRef(0);
  const generating = useRef(false);
  const fetching = useRef(false);

  useEffect(() => {
    let active = true;
    adminApi('session').then(() => { if (active) setIsAuthenticated(true); })
      .catch(err => { if (active && err.status !== 401) setLoginError(err.message); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  const fetchDevices = useCallback(async () => {
    if (fetching.current || deleting.current) return;
    fetching.current = true;
    const version = requestVersion.current;
    setLoading(true);
    try {
      const { devices: items } = await adminApi('list');
      if (version !== requestVersion.current) return;
      setDevices(items); setSelectedIds(ids => ids.filter(id => items.some(item => item.id === id))); setNotice(''); setLastUpdated(new Date());
    } catch (err) {
      if (version !== requestVersion.current) return;
      setNotice(err.message);
      if (err.status === 401) { setIsAuthenticated(false); setDevices([]); setSelectedIds([]); setLoginError(err.message); }
    } finally { fetching.current = false; setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchDevices();
    const timer = setInterval(() => { if (!document.hidden) fetchDevices(); }, 15000);
    return () => clearInterval(timer);
  }, [isAuthenticated, fetchDevices]);
  useEffect(() => { setPage(1); setSelectedIds([]); }, [filterType, filterStatus, filterBatch, searchTerm]);

  const handleLogin = async e => {
    e.preventDefault(); setLoading(true); setLoginError('');
    try { await adminApi('login', authForm); setAuthForm({ user: '', pass: '' }); setIsAuthenticated(true); }
    catch (err) { setLoginError(err.message); }
    finally { setLoading(false); }
  };
  const handleLogout = async () => {
    try {
      await adminApi('logout'); requestVersion.current++;
      setIsAuthenticated(false); setDevices([]); setSelectedIds([]); setNotice(''); setGenSuccessMsg(''); setLastUpdated(null);
    } catch (err) { setNotice(err.message); }
  };
  const generateNewBatch = async e => {
    e.preventDefault();
    if (generating.current || deleting.current) return;
    generating.current = true; setIsGenerating(true); setGenSuccessMsg(''); setNotice('');
    try {
      const { count } = await adminApi('generate', { quantity: Number(genQuantity), category: genCategory, batch: genLote });
      setGenSuccessMsg(count + ' códigos guardados en Supabase. Lote: ' + genLote.trim());
      setFilterBatch(genLote.trim()); setFilterType('all'); setFilterStatus('all'); setSearchTerm('');
      await fetchDevices();
    } catch (err) {
      setNotice(err.message + (!err.status || err.status >= 500 ? ' Revisa el inventario antes de reintentar: el lote podría haberse guardado si se interrumpió la conexión.' : ''));
      if (err.status === 401) { setIsAuthenticated(false); setDevices([]); setSelectedIds([]); setLoginError(err.message); }
    } finally { generating.current = false; setIsGenerating(false); }
  };
  const deleteDevices = async rows => {
    if (deleting.current || generating.current || fetching.current || !rows.length) return;
    const detail = rows.length === 1 ? `la placa ${rows[0].token}` : `${rows.length} placas seleccionadas`;
    if (!window.confirm(`¿Eliminar definitivamente ${detail} de la base de datos?\n\nTambién se eliminarán sus perfiles vinculados y los enlaces NFC/QR dejarán de funcionar. Esta acción no se puede deshacer.`)) return;
    deleting.current = true; setIsDeleting(true); setDeleteMessage(''); setNotice('');
    const version = ++requestVersion.current;
    try {
      const { count, deletedIds } = await adminApi('delete', { ids: rows.map(row => row.id) });
      if (version !== requestVersion.current) return;
      setDevices(items => items.filter(item => !deletedIds.includes(item.id)));
      setSelectedIds(ids => ids.filter(id => !rows.some(row => row.id === id)));
      setDeleteMessage(`${count} placa(s) eliminada(s) de Supabase.`); setLastUpdated(new Date());
    } catch (err) {
      setNotice(err.message + ' Actualiza el inventario antes de volver a intentar.');
      if (err.status === 401) { setIsAuthenticated(false); setDevices([]); setSelectedIds([]); setLoginError(err.message); }
    } finally {
      deleting.current = false; setIsDeleting(false);
    }
  };
  const toggleSelection = id => setSelectedIds(ids => ids.includes(id) ? ids.filter(value => value !== id) : ids.length < 500 ? [...ids, id] : ids);
  const deleteScope = async (all = false) => {
    if (deleting.current || generating.current || fetching.current) return;
    const rows = all ? devices : devices.filter(d => d.lote === deleteBatch);
    if (!rows.length) return;
    const expected = all ? 'BORRAR TODO' : deleteBatch;
    const confirmation = window.prompt(`Vas a borrar ${all ? 'TODO el inventario' : `el lote completo ${deleteBatch}`} (${rows.length} placas en la última actualización), incluyendo placas activadas y perfiles vinculados. Los enlaces NFC/QR dejarán de funcionar. No se borran cuentas de usuarios.\n\nEsta acción es irreversible y abarca todas las páginas, sin aplicar los filtros de búsqueda.\n\nEscribe ${expected} para confirmar:`);
    if (confirmation === null) return;
    if (confirmation !== expected) { setNotice('La confirmación no coincide. No se borró nada.'); return; }
    deleting.current = true; setIsDeleting(true); setNotice(''); setDeleteMessage('');
    ++requestVersion.current;
    let success = false;
    try {
      const { count } = await adminApi(all ? 'delete-all' : 'delete-batch', { batch: deleteBatch, confirmation });
      setDevices(items => all ? [] : items.filter(d => d.lote !== deleteBatch));
      setSelectedIds([]); setDeleteBatch(''); setDeleteMessage(`${count} placa(s) eliminada(s) de Supabase.`);
      success = true;
    } catch (err) {
      setNotice(err.message + ' Actualiza el inventario antes de reintentar.');
      if (err.status === 401) { setIsAuthenticated(false); setDevices([]); setSelectedIds([]); setLoginError(err.message); }
    } finally { deleting.current = false; setIsDeleting(false); }
    if (success) await fetchDevices();
  };
  const exportToCSV = (packaging = false) => {
    const url = URL.createObjectURL(new Blob([packaging ? inventoryCsv(filteredDevices, true) : supplierCsv(filteredDevices)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url;
    link.download = 'vigio_' + (packaging ? 'empaque_privado' : 'proveedor') + '_' + new Date().toISOString().slice(0,10) + '.csv';
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const copyToClipboard = async (text, id) => {
    try { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 1800); }
    catch { setNotice('No se pudo copiar. Revisa el permiso del portapapeles.'); }
  };

  // Filtrado
  // Restaurante queda preservado en la base, pero fuera de la experiencia activa.
  const activeDevices = devices.filter(d => d.tipo_producto !== 'restaurante');
  const filteredDevices = activeDevices.filter((d) => {
    const matchesCategory = filterType === 'all' || d.tipo_producto === filterType || (filterType === 'mascotas' && d.tipo_producto === 'mascota_circular');
    const matchesBatch = filterBatch === 'all' || d.lote === filterBatch;
    const matchesStatus = filterStatus === 'all' || d.estado === filterStatus;
    const matchesSearch = searchTerm === '' || 
      d.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.pin_activacion && d.pin_activacion.includes(searchTerm)) ||
      (d.lote && d.lote.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch && matchesBatch;
  });

  const pageCount = Math.max(1, Math.ceil(filteredDevices.length / 50));
  const currentPage = Math.min(page, pageCount);
  const visibleDevices = filteredDevices.slice((currentPage - 1) * 50, currentPage * 50);

  const totalFabricadas = activeDevices.filter(d => d.estado === 'fabricada').length;
  const totalActivadas = activeDevices.filter(d => d.estado === 'activada').length;

  // ----------------------------------------------------
  // VISTA 1: LOGIN DE ADMINISTRACIÓN
  // ----------------------------------------------------
  if (checking) return <div role="status" className="p-16 text-center">Verificando sesión…</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07080a] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#111216] border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="text-center space-y-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-brand mx-auto flex items-center justify-center shadow-lg shadow-orange-brand/30">
              <span className="text-2xl font-black text-white">V</span>
            </div>
            <h1 className="text-2xl font-black text-white">Panel Master Vigio</h1>
            <p className="text-xs text-zinc-400 font-mono">
              Acceso exclusivo socios fundadores
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Usuario
              </label>
              <input
                id="admin-user"
                aria-label="Usuario administrador"
                autoComplete="username"
                type="text"
                required
                value={authForm.user}
                onChange={(e) => setAuthForm({ ...authForm, user: e.target.value })}
                placeholder="Usuario maestro"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-brand font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Contraseña
              </label>
              <input
                id="admin-password"
                aria-label="Contraseña del administrador"
                autoComplete="current-password"
                type="password"
                required
                value={authForm.pass}
                onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-brand font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-brand/30 active:scale-95"
            >
              Ingresar al Panel →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VISTA 2: DASHBOARD MASTER ADMINISTRATIVO
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#07080a] text-white p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Vigio <span className="text-orange-brand">Master Hub</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
              Control de fabricación e inventario · actualización cada 15 segundos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => exportToCSV(false)}
              disabled={!filteredDevices.length || loading || !!notice}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono flex items-center gap-2 transition-all shadow-md"
            >
              <span>📥</span>
              <span>Generar CSV para proveedor</span>
            </button>
            <button onClick={() => exportToCSV(true)} disabled={!filteredDevices.length || loading || !!notice} className="px-4 py-2.5 rounded-xl bg-amber-500/15 text-amber-300 text-xs disabled:opacity-50">CSV empaque (con PIN)</button>
            <button
              disabled={isGenerating || isDeleting}
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-mono transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {notice && <div role="alert" className="p-4 rounded-xl border border-red-500/30 text-red-300">{notice}</div>}
        <div className="flex flex-wrap justify-between gap-3 text-xs text-zinc-400">
          <span role="status">{loading ? 'Actualizando…' : lastUpdated ? 'Actualizado: ' + lastUpdated.toLocaleTimeString('es-CL') : 'Sin datos cargados'}</span>
          <button onClick={fetchDevices} disabled={loading || isDeleting} className="text-orange-brand">Actualizar ahora</button>
          <span>CSV para proveedor: número, tipo, token, URL de grabación NFC/QR y lote. Sin PIN. Incluye todas las páginas de los filtros actuales.</span>
        </div>
        {/* Resumen Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#111216] border border-white/10">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Total Fabricados</span>
            <span className="text-3xl font-black text-white">{activeDevices.length}</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#111216] border border-amber-500/30 bg-amber-500/5">
            <span className="text-[11px] font-mono uppercase text-amber-300 block mb-1">En Stock (Sin Activar)</span>
            <span className="text-3xl font-black text-amber-400">{totalFabricadas}</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#111216] border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-[11px] font-mono uppercase text-emerald-300 block mb-1">Activados por Clientes</span>
            <span className="text-3xl font-black text-emerald-400">{totalActivadas}</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#111216] border border-orange-brand/30 bg-orange-brand/5">
            <span className="text-[11px] font-mono uppercase text-orange-brand block mb-1">% de Conversión</span>
            <span className="text-3xl font-black text-orange-brand">
              {activeDevices.length > 0 ? Math.round((totalActivadas / activeDevices.length) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Generador de Nuevos Códigos */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#131418] to-[#0d0e12] border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-orange-brand/20 text-orange-brand flex items-center justify-center font-bold">
              ⚡
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Generar Nuevo Lote para Fabricación</h2>
              <p className="text-xs text-zinc-400">
                Crea tokens únicos para grabar en chips NFC + PIN secreto para la tarjeta del empaque.
              </p>
            </div>
          </div>

          {genSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              {genSuccessMsg}
            </div>
          )}

          <form onSubmit={generateNewBatch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Línea de Producto</label>
              <select
                value={genCategory}
                onChange={(e) => setGenCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-orange-brand"
              >
                <option value="mascotas">🐕 Placas Mascotas</option>
                <option value="kids">👶 Pulseras Kids</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Cantidad de Placas</label>
              <input
                type="number"
                min="1"
                max="500"
                required
                step="1"
                value={genQuantity}
                onChange={(e) => setGenQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-orange-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Identificador de Lote</label>
              <input
                type="text"
                required
                maxLength={50}
                value={genLote}
                onChange={(e) => setGenLote(e.target.value)}
                placeholder="LOTE-1-2026"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-orange-brand"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isGenerating || isDeleting}
                className="w-full py-3.5 rounded-xl bg-orange-brand hover:bg-orange-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-brand/30 active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? 'Generando...' : 'Crear Códigos +'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabla de Dispositivos e Inventario */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#111216] border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📋</span>
              <span>Inventario de Dispositivos ({filteredDevices.length})</span>
            </h2>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Buscar token, PIN o lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-orange-brand"
              />

              <select aria-label="Filtrar por lote" value={filterBatch} onChange={e => setFilterBatch(e.target.value)} className="px-3 py-2 rounded-xl bg-black text-xs text-white">
                <option value="all">Todos los lotes</option>
                {[...new Set(activeDevices.map(d => d.lote).filter(Boolean))].sort().map(batch => <option key={batch} value={batch}>{batch}</option>)}
              </select>
              <select
                aria-label="Filtrar por producto"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono"
              >
                <option value="all">Todas las Líneas</option>
                <option value="mascotas">Mascotas</option>
                <option value="kids">Kids</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono"
              >
                <option value="all">Todos los Estados</option>
                <option value="fabricada">Sin Activar (Stock)</option>
                <option value="activada">Activada por Cliente</option>
                <option value="bloqueada">Bloqueada</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button disabled={!visibleDevices.length || loading || isDeleting} onClick={() => setSelectedIds(ids => [...new Set([...ids, ...visibleDevices.map(d => d.id)])].slice(0, 500))} className="px-4 py-3 rounded-xl bg-white/10 disabled:opacity-40">Seleccionar página ({visibleDevices.length})</button>
            <button disabled={!filteredDevices.length || loading || isDeleting} onClick={() => setSelectedIds(filteredDevices.slice(0, 500).map(d => d.id))} className="px-4 py-3 rounded-xl bg-white/10 disabled:opacity-40">Seleccionar resultados ({Math.min(500, filteredDevices.length)}{filteredDevices.length > 500 ? ' de ' + filteredDevices.length : ''})</button>
            <span className="text-zinc-400">{selectedIds.length} seleccionadas · máximo 500. Cambiar filtros limpia la selección.</span>
            <button disabled={!selectedIds.length || loading || isDeleting || isGenerating} onClick={() => deleteDevices(activeDevices.filter(d => selectedIds.includes(d.id)))} className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 disabled:opacity-40">
              {isDeleting ? 'Eliminando…' : `Eliminar seleccionadas (${selectedIds.length})`}
            </button>
            <button disabled={!selectedIds.length || isDeleting} onClick={() => setSelectedIds([])} className="text-zinc-400 disabled:opacity-40">Limpiar selección</button>
          </div>
          {deleteMessage && <p role="status" className="text-sm text-emerald-300">{deleteMessage}</p>}
          <div className="p-4 rounded-xl border border-red-500/30 space-y-3">
            <p className="text-sm font-semibold">Borrar un lote completo o todo el inventario</p>
            <p className="text-xs text-zinc-400">Incluye todas las páginas y placas activadas, aunque estén ocultas por los filtros. También borra sus perfiles vinculados.</p>
            <div className="flex flex-wrap gap-3">
              <select aria-label="Lote completo para borrar" disabled={isDeleting} value={deleteBatch} onChange={e => setDeleteBatch(e.target.value)} className="px-4 py-3 rounded-xl bg-black text-sm">
                <option value="">Elige un lote para borrar</option>
                {[...new Set(activeDevices.map(d => d.lote).filter(Boolean))].sort().map(batch => <option key={batch} value={batch}>{batch} ({activeDevices.filter(d => d.lote === batch).length} placas)</option>)}
              </select>
              <button disabled={!deleteBatch || loading || isDeleting || isGenerating} onClick={() => deleteScope(false)} className="px-4 py-3 rounded-xl bg-red-500/15 text-red-300 disabled:opacity-40">Borrar lote completo</button>
              <button disabled={!devices.length || loading || isDeleting || isGenerating} onClick={() => deleteScope(true)} className="px-4 py-3 rounded-xl bg-red-600 text-white disabled:opacity-40">Borrar todo el inventario ({devices.length})</button>
            </div>
          </div>
          {/* Tabla Responsive */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/60 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4"><input type="checkbox" className="w-6 h-6 accent-orange-500 cursor-pointer" aria-label="Seleccionar filas de esta pagina" disabled={!visibleDevices.length || loading || isDeleting} checked={visibleDevices.length > 0 && visibleDevices.every(d => selectedIds.includes(d.id))} onChange={e => setSelectedIds(ids => e.target.checked ? [...new Set([...ids, ...visibleDevices.map(d => d.id)])].slice(0, 500) : ids.filter(id => !visibleDevices.some(d => d.id === id)))} /></th>
                  <th className="py-3 px-4">Línea</th>
                  <th className="py-3 px-4">Token Público (NFC/QR)</th>
                  <th className="py-3 px-4">PIN Secreto (Empaque)</th>
                  <th className="py-3 px-4">URL Fija</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Dueño / Perfil</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visibleDevices.map((d) => {
                  const url = `https://vigio.cl/p/${d.token}`;
                  const isAct = d.estado === 'activada';
                  const perfil = Array.isArray(d.perfiles_vigio) ? d.perfiles_vigio[0] : d.perfiles_vigio;

                  return (
                    <tr key={d.id || d.token} onClick={e => { if (!loading && !isDeleting && !e.target.closest('button, a, input, label')) toggleSelection(d.id); }} className={`cursor-pointer transition-colors ${selectedIds.includes(d.id) ? 'bg-orange-brand/15' : 'hover:bg-white/[0.04]'}`}>
                      <td className="py-3 px-4"><input type="checkbox" className="w-6 h-6 accent-orange-500 cursor-pointer" aria-label={`Seleccionar placa ${d.token}`} checked={selectedIds.includes(d.id)} disabled={loading || isDeleting || (!selectedIds.includes(d.id) && selectedIds.length >= 500)} onChange={() => toggleSelection(d.id)} /></td>
                      <td className="py-3 px-4 capitalize font-sans font-semibold">
                        {['mascotas', 'mascota_circular'].includes(d.tipo_producto) ? '🐕 Mascota' : d.tipo_producto === 'kids' ? '👶 Pulsera Kids' : '🍽️ Restaurante'}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {d.token}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                          {d.pin_activacion || 'Sin PIN legado'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        <button
                          onClick={() => copyToClipboard(url, d.token)}
                          className="hover:text-orange-brand transition-colors flex items-center gap-1.5"
                          title="Copiar URL"
                        >
                          <span className="truncate max-w-[140px]">{d.token}</span>
                          <span className="text-[10px]">{copiedId === d.token ? '✓ Copiado' : '📋'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isAct 
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                            : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAct ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {isAct ? 'Activada en uso' : d.estado === 'bloqueada' ? 'Bloqueada' : 'Sin activar (Stock)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {isAct ? (
                          <div>
                            <span className="font-bold text-white block">
                              {perfil?.nombre || 'Sin perfil asociado'}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {perfil?.nombre_contacto || 'Sin contacto asociado'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">Esperando venta</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/p/${d.token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-orange-brand text-zinc-300 hover:text-white transition-all text-[11px]"
                        >
                          Simular Escaneo →
                        </a>
                        <button aria-label={`Eliminar placa ${d.token}`} disabled={loading || isDeleting || isGenerating} onClick={() => deleteDevices([d])} className="ml-2 px-3 py-1 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 disabled:opacity-40">Eliminar</button>
                      </td>
                    </tr>
                  );
                })}

                {filteredDevices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500">
                      No se encontraron códigos con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="disabled:opacity-30">← Anterior</button>
            <span>Página {currentPage} de {pageCount} · {filteredDevices.length} dispositivos</span>
            <button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="disabled:opacity-30">Siguiente →</button>
          </div>
        </div>

      </div>
    </div>
  );
}
