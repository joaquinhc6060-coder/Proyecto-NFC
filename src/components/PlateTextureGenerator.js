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
  const drawPaw = (x, y, scale = 1, opacity = 0.28) => {
    ctx.save();
    ctx.fillStyle = `rgba(115, 125, 145, ${opacity})`;
    ctx.beginPath(); ctx.ellipse(x, y + 22 * scale, 30 * scale, 38 * scale, 0, 0, Math.PI * 2); ctx.fill();
    [[-31, -18], [-10, -43], [13, -43], [34, -18]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.ellipse(x + dx * scale, y + dy * scale, 13 * scale, 17 * scale, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  };

  // Solid background with subtle radial gradient for lighting depth
  const grad = ctx.createRadialGradient(centerX - 60, centerY - 80, 50, centerX, centerY, 512);
  if (variant.id === 'negro') {
    grad.addColorStop(0, '#2b2c31');
    grad.addColorStop(0.7, '#18181c');
    grad.addColorStop(1, '#0e0e11');
  } else if (variant.id === 'azul') {
    grad.addColorStop(0, '#1c4585');
    grad.addColorStop(0.7, '#0e2a56');
    grad.addColorStop(1, '#07162e');
  } else {
    grad.addColorStop(0, '#2b2c31');
    grad.addColorStop(0.7, '#18181c');
    grad.addColorStop(1, '#0e0e11');
  }

  // Full solid background
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  [[180, 180, 0.85], [805, 175, 0.7], [120, 550, 0.75], [865, 625, 0.62], [225, 850, 0.6], [770, 850, 0.72]].forEach(([x, y, scale]) => drawPaw(x, y, scale));

  if (!isBack) {
    // ------------------------------------
    // FRONT FACE: VIGIO + NFC + ACERCA TU CELULAR
    // ------------------------------------
    
    // Ícono NFC central inspirado en la placa física.
    ctx.save();
    ctx.translate(centerX, centerY - 20);

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
    ctx.font = '800 76px Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '7px';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;
    ctx.fillText('VIGIO', centerX, 245);

    // Instruction copied from the physical model.
    ctx.font = '600 39px Georgia, serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.letterSpacing = '0px';
    ctx.fillText('Si me encontraste,', centerX, 765);
    ctx.fillText('acerca tu teléfono', centerX, 815);

  } else {
    // ------------------------------------
    // BACK FACE: SOLO CÓDIGO QR MÁS GRANDE (SIN ID DE TEXTO)
    // ------------------------------------

    // QR demonstrativo sin destino, como el mockup de catálogo.
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

    ctx.fillStyle = '#0a0a0c';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DEMO', centerX, qrY + qrSize - 22);
    ctx.font = '700 54px Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ESCÁNEAME', centerX, 230);
    ctx.font = '600 36px Georgia, serif';
    ctx.fillText('@vigio.cl', centerX, 850);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}
