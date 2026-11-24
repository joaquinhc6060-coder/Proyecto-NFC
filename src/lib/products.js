import catalog from '../data/products.json';

export const CATEGORIES = catalog.categories;
export const PRODUCTS = catalog.products;

const byId = new Map(PRODUCTS.map(product => [product.id, product]));

export const getProduct = id => byId.get(id) || null;
export const getProductsByCategory = category => PRODUCTS.filter(product => product.category === category);
export const productPath = id => `/producto/${id}`;

export const formatCLP = value => `$${Math.round(value).toLocaleString('es-CL')}`;

// Ahorro y precio por unidad se calculan desde el JSON para que nunca queden desalineados.
export const savingsOf = product => (product.regularPrice ? product.regularPrice - product.price : 0);
export const unitPriceOf = product => (product.units ? Math.round(product.price / product.units) : product.price);

// Caras del visor giratorio: /assets/products/<carpeta>/{frente,reverso}.webp.
// La carpeta sigue al color elegido (imagesFrom), así el visor cambia con el color.
// El resto de la galería se define en products.json (campo "gallery").
export const productImage = (folder, key) => `/assets/products/${folder}/${key}.webp`;

export function selectedColor(product, colorId) {
  return product.colors?.find(color => color.id === colorId) || null;
}

// Una variante puede representar un modelo comercial distinto. Por ejemplo, al
// cambiar de negro a azul no debe seguir diciendo "Negra · Azul marino".
export function displayProductName(product, colorId, { includeColor = false } = {}) {
  const color = selectedColor(product, colorId);
  if (color?.displayName) return color.displayName;
  if (includeColor && color && product.colors?.length > 1) return `${product.name} · ${color.name}`;
  return product.name;
}

export function cardImageFor(product, colorId) {
  return selectedColor(product, colorId)?.cardImage || product.cardImages?.[0] || '';
}

export function facesFor(product, colorId) {
  const color = selectedColor(product, colorId);
  if (product.viewer?.shape === 'keyring' || product.category === 'mascotas') {
    const isAzul = colorId === 'azul' || color?.imagesFrom === 'placa-nfc-azul' || product.id === 'placa-nfc-azul';
    // Dos renders fotográficos de la placa real, con aro y borde metálico.
    // La cara QR y la cara NFC son distintas: no se intercala arte plano en el visor.
    return isAzul
      ? { frente: '/images/vigio-placa-azul-llavero.png', reverso: '/images/vigio-placa-azul-llavero-nfc.png' }
      : { frente: '/images/vigio-placa-negra-llavero.png', reverso: '/images/vigio-placa-negra-llavero-nfc.png' };
  }
  const folder = color?.imagesFrom || product.id;
  return { frente: productImage(folder, 'frente'), reverso: productImage(folder, 'reverso') };
}
