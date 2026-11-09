import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  
  const crcData = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcData), 0);
  
  return Buffer.concat([lenBuf, crcData, crcBuf]);
}

function createPng(size) {
  const width = size;
  const height = size;
  
  // Create scanlines: for each row, 1 filter byte (0) + width * 4 bytes (RGBA)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  
  const cornerRadius = Math.floor(size * 0.22);
  const borderSize = Math.max(3, Math.floor(size * 0.03));
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Calculate distance to rounded corners
      let inCorner = false;
      const dx = x < cornerRadius ? cornerRadius - x : x >= width - cornerRadius ? x - (width - cornerRadius) : 0;
      const dy = y < cornerRadius ? cornerRadius - y : y >= height - cornerRadius ? y - (height - cornerRadius) : 0;
      
      if (dx > 0 && dy > 0) {
        if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
          inCorner = true;
        }
      }
      
      if (inCorner) {
        // Transparent outside rounded squircle
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }
      
      // Border check
      const isBorder = (x < borderSize || x >= width - borderSize || y < borderSize || y >= height - borderSize) ||
        (dx > 0 && dy > 0 && dx * dx + dy * dy >= (cornerRadius - borderSize) * (cornerRadius - borderSize));
      
      if (isBorder) {
        // Teal border: #14b8a6 (R: 20, G: 184, B: 166)
        rawData[pxOffset] = 20;
        rawData[pxOffset + 1] = 184;
        rawData[pxOffset + 2] = 166;
        rawData[pxOffset + 3] = 255;
        continue;
      }
      
      // Header band area
      const headerTop = Math.floor(size * 0.12);
      const headerBottom = Math.floor(size * 0.24);
      if (y >= headerTop && y <= headerBottom && x >= size * 0.1 && x <= size * 0.9) {
        // Bright Teal header: #2dd4bf
        rawData[pxOffset] = 45;
        rawData[pxOffset + 1] = 212;
        rawData[pxOffset + 2] = 191;
        rawData[pxOffset + 3] = 255;
        continue;
      }
      
      // Grid cells simulation
      const gridTop = Math.floor(size * 0.32);
      const gridBottom = Math.floor(size * 0.82);
      const gridLeft = Math.floor(size * 0.12);
      const gridRight = Math.floor(size * 0.88);
      
      if (y >= gridTop && y <= gridBottom && x >= gridLeft && x <= gridRight) {
        const cellX = Math.floor((x - gridLeft) / (size * 0.12));
        const cellY = Math.floor((y - gridTop) / (size * 0.12));
        const inCell = ((x - gridLeft) % Math.floor(size * 0.12) > 4) &&
                       ((y - gridTop) % Math.floor(size * 0.12) > 4);
        
        if (inCell) {
          if ((cellX + cellY) % 2 === 0) {
            // Light teal cell #5eead4
            rawData[pxOffset] = 94;
            rawData[pxOffset + 1] = 234;
            rawData[pxOffset + 2] = 212;
            rawData[pxOffset + 3] = 255;
          } else {
            // Darker teal cell #0f766e
            rawData[pxOffset] = 15;
            rawData[pxOffset + 1] = 118;
            rawData[pxOffset + 2] = 110;
            rawData[pxOffset + 3] = 255;
          }
          continue;
        }
      }
      
      // Default Background: OLED Black #040c0c
      rawData[pxOffset] = 4;
      rawData[pxOffset + 1] = 12;
      rawData[pxOffset + 2] = 12;
      rawData[pxOffset + 3] = 255;
    }
  }
  
  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  
  // IDAT (compressed raw scanlines)
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  
  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
fs.writeFileSync(path.join(outDir, 'icon-192.png'), createPng(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), createPng(512));
console.log('Successfully generated public/icon-192.png and public/icon-512.png');
