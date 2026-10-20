// =========================================================================
// SERVICIO SAAS RESTAURANTES: FIDELIZACIÓN, IA, WALLET Y PERFILES
// =========================================================================

export const RESTAURANT_DATA = {
  id: 'bistro-costanera',
  nombre: 'Bistró & Cocktails Costanera',
  tipo: 'Gastronomía & Coctelería de Autor',
  ciudad: 'Viña del Mar / Santiago, Chile',
  mesasTotales: 28,
  wifiSSID: 'Bistro_Clientes_VIP',
  wifiPass: 'BistroVip2026',
  urlCarta: 'https://findeme.cl/menu/bistro-costanera',
  geofenceRadius: 100, // metros
  geofenceMessage: '¡Estás a menos de 100m de Bistró Costanera! Muestra tu tarjeta VIP en la Wallet y recibe un cóctel de bienvenida con tu cena.',
};

export const MOCK_KPIS = {
  tarjetasActivas: 1284,
  tarjetasCrecimientoMes: '+18.4%',
  visitasHoy: 94,
  visitasMes: 1940,
  ticketPromedio: 44800,
  ticketCrecimiento: '+12.6%',
  tasaRetorno: 64.2,
  tasaRetornoDetalle: '2.3 visitas promedio / mes',
  sellosTotalesMes: 3410,
  premiosCanjeadosMes: 288,
};

export const MOCK_CUSTOMERS = [
  {
    id: 'cust-01',
    nombre: 'Rodrigo Valenzuela',
    telefono: '+56 9 8451 9201',
    email: 'rodrigo.valenzuela@gmail.com',
    nivel: 'Oro VIP',
    puntos: 450,
    sellos: 4,
    ultimaVisita: 'Hoy, 21:15 hrs',
    gastoTotal: 342000,
    boletasSubidas: 8,
    walletPlatform: 'Apple Wallet',
    tagsIA: ['Consume Coctelería', 'Amante de Pizzas', 'Cliente VIP Viernes', 'Ticket Alto'],
    historialBoletas: [
      { id: 'bol-101', fecha: '2026-10-18', total: 68500, items: ['2x Pizza Napolitana Trufada', '3x Negroni de Autor', '1x Tiramisú'] },
      { id: 'bol-088', fecha: '2026-10-09', total: 54000, items: ['1x Tabla Quesos & Jamón Ibérico', '2x Gin Tonic Botanical', '1x Carpaccio'] }
    ]
  },
  {
    id: 'cust-02',
    nombre: 'Carolina Henríquez',
    telefono: '+56 9 7122 3490',
    email: 'carolina.h@outlook.com',
    nivel: 'Black VIP',
    puntos: 820,
    sellos: 5,
    ultimaVisita: 'Ayer, 22:30 hrs',
    gastoTotal: 580000,
    boletasSubidas: 14,
    walletPlatform: 'Apple Wallet',
    tagsIA: ['Consume Coctelería', 'Ticket Alto', 'Cena Pareja / Romántica'],
    historialBoletas: [
      { id: 'bol-099', fecha: '2026-10-17', total: 89000, items: ['1x Filete al Vino Tinto', '1x Risotto Setas', '2x Aperol Spritz', '1x Botella Cabernet Sauvignon'] }
    ]
  },
  {
    id: 'cust-03',
    nombre: 'Matías Silva & Familia',
    telefono: '+56 9 6554 1109',
    email: 'matias.silva.cl@gmail.com',
    nivel: 'Plata',
    puntos: 210,
    sellos: 2,
    ultimaVisita: 'Hace 3 días (Domingo)',
    gastoTotal: 198000,
    boletasSubidas: 4,
    walletPlatform: 'Google Wallet',
    tagsIA: ['Perfil Familiar / Sin Alcohol', 'Menú Infantil', 'Cliente Domingo Almuerzo'],
    historialBoletas: [
      { id: 'bol-092', fecha: '2026-10-15', total: 58000, items: ['2x Menú Infantil Mini Hamburguesas', '2x Jugos Naturales Mango', '2x Ravioles Ricotta', '1x Botella Agua Mineral'] }
    ]
  },
  {
    id: 'cust-04',
    nombre: 'Ignacio Morales',
    telefono: '+56 9 9234 5678',
    email: 'ignacio.morales@empresa.cl',
    nivel: 'Oro VIP',
    puntos: 390,
    sellos: 3,
    ultimaVisita: 'Hace 5 días (Jueves)',
    gastoTotal: 275000,
    boletasSubidas: 6,
    walletPlatform: 'Google Wallet',
    tagsIA: ['Consume Coctelería', 'After Office', 'Amante de Hamburguesas'],
    historialBoletas: [
      { id: 'bol-085', fecha: '2026-10-13', total: 47500, items: ['2x Hamburguesa Smash Doble Cheddar', '4x Cerveza Artesanal IPA', '1x Papas Trufadas'] }
    ]
  },
  {
    id: 'cust-05',
    nombre: 'Francisca Vial',
    telefono: '+56 9 8871 0023',
    email: 'fran.vial@uandes.cl',
    nivel: 'Plata',
    puntos: 150,
    sellos: 1,
    ultimaVisita: 'Hace 8 días',
    gastoTotal: 96000,
    boletasSubidas: 2,
    walletPlatform: 'Apple Wallet',
    tagsIA: ['Amante de Pizzas', 'Vegetariano / Plant Based'],
    historialBoletas: [
      { id: 'bol-077', fecha: '2026-10-10', total: 38000, items: ['1x Pizza Margarita Búfala', '1x Ensalada Mediterránea', '2x Mocktail Frutos Rojos'] }
    ]
  },
  {
    id: 'cust-06',
    nombre: 'Sebastián Lagos',
    telefono: '+56 9 7789 4432',
    email: 's.lagos@inversiones.cl',
    nivel: 'Black VIP',
    puntos: 940,
    sellos: 5,
    ultimaVisita: 'Hace 2 días',
    gastoTotal: 720000,
    boletasSubidas: 18,
    walletPlatform: 'Apple Wallet',
    tagsIA: ['Ticket Alto', 'Consume Coctelería', 'Almuerzo Ejecutivo'],
    historialBoletas: [
      { id: 'bol-095', fecha: '2026-10-16', total: 112000, items: ['1x Degustación Carnes Maduradas', '2x Whiskey Escocés 12 Años', '1x Café Espresso'] }
    ]
  }
];

export const MOCK_BOLETAS = [
  {
    id: 'BOL-2026-9812',
    clienteId: 'cust-01',
    clienteNombre: 'Rodrigo Valenzuela',
    mesa: 'Mesa 14',
    fecha: 'Hoy, 20:45 hrs',
    total: 68500,
    itemsDetectados: [
      { cant: 2, nombre: 'Pizza Napolitana Trufada', cat: 'Pizzas', precio: 32000 },
      { cant: 3, nombre: 'Negroni de Autor Premium', cat: 'Coctelería', precio: 28500 },
      { cant: 1, nombre: 'Tiramisú Tradicional', cat: 'Postres', precio: 8000 }
    ],
    hashAntifraude: 'SHA256:7f9b8c2d1e0a4f56',
    estado: 'Aprobada por IA',
    confianzaOCR: 98.4,
    tagsGenerados: ['Consume Coctelería', 'Amante de Pizzas', 'Ticket Alto'],
    selloOtorgado: true,
    imagenUrl: '/images/findme-restaurant-loyalty.jpg'
  },
  {
    id: 'BOL-2026-9808',
    clienteId: 'cust-03',
    clienteNombre: 'Matías Silva',
    mesa: 'Mesa 6 (Terraza)',
    fecha: 'Ayer, 14:15 hrs',
    total: 58000,
    itemsDetectados: [
      { cant: 2, nombre: 'Menú Infantil Mini Burgers', cat: 'Infantil', precio: 18000 },
      { cant: 2, nombre: 'Jugos Naturales Mango', cat: 'Sin Alcohol', precio: 8000 },
      { cant: 2, nombre: 'Ravioles Ricotta & Espinaca', cat: 'Pastas', precio: 28000 },
      { cant: 1, nombre: 'Agua Puyehue con gas', cat: 'Sin Alcohol', precio: 4000 }
    ],
    hashAntifraude: 'SHA256:3a1b4c9e8d7f2a01',
    estado: 'Aprobada por IA',
    confianzaOCR: 99.1,
    tagsGenerados: ['Perfil Familiar / Sin Alcohol', 'Menú Infantil'],
    selloOtorgado: true,
    imagenUrl: '/images/findme-restaurant-loyalty.jpg'
  },
  {
    id: 'BOL-2026-9799',
    clienteId: 'cust-04',
    clienteNombre: 'Ignacio Morales',
    mesa: 'Mesa Barra 2',
    fecha: '18 Oct, 21:05 hrs',
    total: 47500,
    itemsDetectados: [
      { cant: 2, nombre: 'Hamburguesa Doble Smash', cat: 'Hamburguesas', precio: 21000 },
      { cant: 4, nombre: 'Cerveza Kross IPA 500cc', cat: 'Coctelería/Cerveza', precio: 22000 },
      { cant: 1, nombre: 'Papas Rústicas', cat: 'Snacks', precio: 4500 }
    ],
    hashAntifraude: 'SHA256:9c8d7e6f5a4b3c2d',
    estado: 'Aprobada por IA',
    confianzaOCR: 96.8,
    tagsGenerados: ['Consume Coctelería', 'After Office'],
    selloOtorgado: true,
    imagenUrl: '/images/findme-restaurant-loyalty.jpg'
  }
];

// Generador de PIN de mesero con rotación cada 60s
export function generateWaiterPin() {
  const code = Math.floor(1000 + Math.random() * 9000);
  return {
    pin: code.toString(),
    expiresInSeconds: 60,
    timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
}

// Simulación de Escaneo OCR con IA sobre una boleta
export async function simulateAIBoletaScan(fileOrDemo = null) {
  // Simulamos delay de red y análisis neuronal (1.8s)
  await new Promise(r => setTimeout(r, 1800));

  const sampleReceipts = [
    {
      folio: `BOL-${Math.floor(10000 + Math.random() * 90000)}`,
      total: 52400,
      mesa: 'Mesa 8',
      items: [
        { cant: 2, nombre: 'Pizzas Artesanales Cuatro Quesos', cat: 'Pizzas', precio: 28000 },
        { cant: 2, nombre: 'Cócteles de Autor Smoked Gin', cat: 'Coctelería', precio: 19000 },
        { cant: 1, nombre: 'Postre Volcán de Chocolate', cat: 'Postres', precio: 5400 }
      ],
      aiTagsInferred: ['Consume Coctelería', 'Amante de Pizzas', 'Ticket Alto'],
      confianzaOCR: 98.7,
      validAntifraude: true,
      mensajeIA: 'Boleta legítima verificada. Se detectaron 2x Pizzas Artesanales y 2x Cócteles de Autor. Perfil de hábitos actualizado y +1 Sello acreditado.'
    },
    {
      folio: `BOL-${Math.floor(10000 + Math.random() * 90000)}`,
      total: 39500,
      mesa: 'Mesa 3',
      items: [
        { cant: 2, nombre: 'Plato Infantil Nuggets & Papas', cat: 'Infantil', precio: 15000 },
        { cant: 2, nombre: 'Limonadas Menta Jengibre', cat: 'Sin Alcohol', precio: 7000 },
        { cant: 1, nombre: 'Gnocchis Gorgonzola', cat: 'Pastas', precio: 17500 }
      ],
      aiTagsInferred: ['Perfil Familiar / Sin Alcohol', 'Menú Infantil'],
      confianzaOCR: 99.2,
      validAntifraude: true,
      mensajeIA: 'Boleta verificada con éxito. Se detectó consumo sin alcohol y menú infantil. Hábitos actualizados a Perfil Familiar y +1 Sello acreditado.'
    }
  ];

  return sampleReceipts[Math.floor(Math.random() * sampleReceipts.length)];
}

// Simulación de Envío Masivo de Notificaciones Push a Apple & Google Wallet
export async function simulateSendWalletPush(campaignData) {
  await new Promise(r => setTimeout(r, 1200));
  return {
    success: true,
    sentCount: campaignData.recipientCount || 340,
    deliveredTo: ['Apple Wallet (APNs)', 'Google Wallet Pass API'],
    timestamp: new Date().toLocaleTimeString('es-CL'),
    campaignId: `CAMP-${Math.floor(1000 + Math.random() * 9000)}`
  };
}
