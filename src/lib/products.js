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

export function facesFor(product, colorId) {
  const color = product.colors?.find(c => c.id === colorId);
  const folder = color?.imagesFrom || product.id;
  return { frente: productImage(folder, 'frente'), reverso: productImage(folder, 'reverso') };
}
