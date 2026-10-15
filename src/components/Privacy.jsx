import React, { useState } from 'react';

export default function Privacy() {
  const [settings, setSettings] = useState({
    petName: true,
    medicalNotes: true,
    safeMessaging: true,
    homeAddress: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="privacidad" className="py-20 md:py-24 bg-cream">
      <div className="max-w-[1120px] w-[calc(100%-40px)] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Information */}
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-[1.1] tracking-[-0.03em] text-ink">
            Tú decides qué se comparte
          </h2>
          <p className="text-muted text-lg mt-3">
            El perfil público muestra exclusivamente lo que tú elijas configurar.
          </p>

          <ul className="space-y-4 mt-8">
            <li className="flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-teal-brand text-ink font-black flex items-center justify-center shrink-0 text-sm" aria-hidden="true">
                ✓
              </span>
              <span className="text-ink text-base">
                Control total sobre cada dato visible desde tu panel de usuario en cualquier momento.
              </span>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-teal-brand text-ink font-black flex items-center justify-center shrink-0 text-sm" aria-hidden="true">
                ✓
              </span>
              <span className="text-ink text-base">
                Recomendamos <strong>no mostrar la dirección física de tu casa</strong> ni información sensible innecesaria.
              </span>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-teal-brand text-ink font-black flex items-center justify-center shrink-0 text-sm" aria-hidden="true">
                ✓
              </span>
              <span className="text-ink text-base">
                Puedes optar por medios de contacto seguros e indirectos, como un botón de mensaje seguro en lugar de exponer tu teléfono privado.
              </span>
            </li>
          </ul>
        </div>

        {/* Right Interactive Toggle Card */}
        <div className="bg-white rounded-[22px] p-8 shadow-sm border border-ink/5">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-black/5">
            <h3 className="text-xl font-bold text-ink">
              Ejemplo de ajustes de privacidad
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-cream-secondary rounded-full text-muted">
              Interactivo
            </span>
          </div>

          <div className="space-y-4">
            {/* Setting 1 */}
            <div className="flex items-center justify-between py-2 border-b border-black/5">
              <div>
                <span className="font-semibold text-ink block text-sm sm:text-base">Nombre de la mascota</span>
                <small className="text-teal-brand font-bold text-xs uppercase tracking-wide">Recomendado</small>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.petName} 
                  onChange={() => toggleSetting('petName')} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-brand"></div>
              </label>
            </div>

            {/* Setting 2 */}
            <div className="flex items-center justify-between py-2 border-b border-black/5">
              <div>
                <span className="font-semibold text-ink block text-sm sm:text-base">Indicación médica / Alergias</span>
                <small className="text-muted font-medium text-xs uppercase tracking-wide">Opcional</small>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.medicalNotes} 
                  onChange={() => toggleSetting('medicalNotes')} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-brand"></div>
              </label>
            </div>

            {/* Setting 3 */}
            <div className="flex items-center justify-between py-2 border-b border-black/5">
              <div>
                <span className="font-semibold text-ink block text-sm sm:text-base">Contacto por mensaje seguro</span>
                <small className="text-teal-brand font-bold text-xs uppercase tracking-wide">Recomendado</small>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.safeMessaging} 
                  onChange={() => toggleSetting('safeMessaging')} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-brand"></div>
              </label>
            </div>

            {/* Setting 4 */}
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-semibold text-ink block text-sm sm:text-base">Dirección física exacta</span>
                <small className="text-red-500 font-bold text-xs uppercase tracking-wide">No recomendado</small>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.homeAddress} 
                  onChange={() => toggleSetting('homeAddress')} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-brand"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

