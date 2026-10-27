// Script to generate high-resolution, vector-crisp textures (1024x1024) for Vigio 3D Pet Plate
// Clean minimalist Apple-style layout
import * as THREE from 'three';

export function createVigioPlateTexture(variant, isBack = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const centerX = 512;
  const centerY = 512;

  // Solid background with subtle radial gradient for lighting depth
  const grad = ctx.createRadialGradient(centerX - 60, centerY - 80, 50, centerX, centerY, 512);
  if (variant.id === 'negro') {
    grad.addColorStop(0, '#2b2c31');
    grad.addColorStop(0.7, '#18181c');
    grad.addColorStop(1, '#0e0e11');
  } else if (variant.id === 'fucsia') {
    grad.addColorStop(0, '#f23899');
    grad.addColorStop(0.7, '#d91b7d');
    grad.addColorStop(1, '#9b0e55');
  } else if (variant.id === 'azul') {
    grad.addColorStop(0, '#1c4585');
    grad.addColorStop(0.7, '#0e2a56');
    grad.addColorStop(1, '#07162e');
  } else if (variant.id === 'verde') {
    grad.addColorStop(0, '#22c55e');
    grad.addColorStop(0.7, '#159648');
    grad.addColorStop(1, '#0c5c2a');
  } else {
    // naranja
    grad.addColorStop(0, '#ff733b');
    grad.addColorStop(0.7, '#f55716');
    grad.addColorStop(1, '#bd3a05');
  }

  // Full solid background
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Interior bevel rim ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, 475, 0, Math.PI * 2);
  ctx.lineWidth = 14;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, 460, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.stroke();

  // Top hole indicator (collar connector)
  ctx.beginPath();
  ctx.arc(centerX, centerY - 380, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0d';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY - 380, 42, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.stroke();

  if (!isBack) {
    // ------------------------------------
    // FRONT FACE: VIGIO + NFC + ACERCA TU CELULAR
    // ------------------------------------
    
    // Logo Shield / Icon at center-top
    ctx.save();
    ctx.translate(centerX, centerY - 100);

    // Glowing shield background
    ctx.beginPath();
    ctx.arc(0, 0, 105, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fill();

    // NFC Wave lines (Vector arcs)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';

    // Wave 1
    ctx.beginPath();
    ctx.arc(0, 0, 40, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();

    // Wave 2
    ctx.beginPath();
    ctx.arc(0, 0, 68, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();

    // Wave 3
    ctx.beginPath();
    ctx.arc(0, 0, 96, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();

    // Text: VIGIO Brand Name
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 96px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '7px';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;
    ctx.fillText('VIGIO', centerX, centerY + 105);

    // Instruction: ACERCA TU CELULAR (más grande y limpio, sin "contactless pet id")
    ctx.font = '700 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.letterSpacing = '3px';
    ctx.fillText('ACERCA TU CELULAR', centerX, centerY + 205);

  } else {
    // ------------------------------------
    // BACK FACE: SOLO CÓDIGO QR MÁS GRANDE (SIN ID DE TEXTO)
    // ------------------------------------

    // Rounded card for QR (más grande y centrado)
    const qrSize = 440;
    const qrX = centerX - qrSize / 2;
    const qrY = centerY - qrSize / 2 + 10; // Perfectly centered

    const r = 40;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(qrX + r, qrY);
    ctx.arcTo(qrX + qrSize, qrY, qrX + qrSize, qrY + qrSize, r);
    ctx.arcTo(qrX + qrSize, qrY + qrSize, qrX, qrY + qrSize, r);
    ctx.arcTo(qrX, qrY + qrSize, qrX, qrY, r);
    ctx.arcTo(qrX, qrY, qrX + qrSize, qrY, r);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 8;
    ctx.fill();
    ctx.restore();

    // Stylized QR pattern inside (17x17 grid)
    const margin = 34;
    const innerSize = qrSize - margin * 2;
    const cellSize = innerSize / 17;

    const isCorner = (row, col) => {
      if (row < 5 && col < 5) return true; // Top-Left
      if (row < 5 && col >= 12) return true; // Top-Right
      if (row >= 12 && col < 5) return true; // Bottom-Left
      return false;
    };

    // Draw 3 Big Position Targets
    const drawFinder = (startX, startY) => {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(startX, startY, cellSize * 5, cellSize * 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX + cellSize, startY + cellSize, cellSize * 3, cellSize * 3);
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(startX + cellSize * 1.5, startY + cellSize * 1.5, cellSize * 2, cellSize * 2);
    };

    drawFinder(qrX + margin, qrY + margin);
    drawFinder(qrX + margin + cellSize * 12, qrY + margin);
    drawFinder(qrX + margin, qrY + margin + cellSize * 12);

    // Fill data cells
    ctx.fillStyle = '#0a0a0c';
    for (let row = 0; row < 17; row++) {
      for (let col = 0; col < 17; col++) {
        if (isCorner(row, col)) continue;
        // Skip center for small badge
        if (row >= 7 && row <= 9 && col >= 7 && col <= 9) continue;
        const val = Math.sin(row * 12.9898 + col * 78.233) * 43758.5453;
        if ((val - Math.floor(val)) > 0.46) {
          ctx.beginPath();
          ctx.arc(
            qrX + margin + col * cellSize + cellSize / 2,
            qrY + margin + row * cellSize + cellSize / 2,
            cellSize * 0.42,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Mini center logo
    ctx.beginPath();
    ctx.arc(centerX, qrY + qrSize / 2, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#f55716';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V', centerX, qrY + qrSize / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}
