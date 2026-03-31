/**
 * qrcode.js — Platinum QR & vCard Engine (Native Edition)
 * Zero-Dependency QR Generator for vCard 3.0
 * 
 * Based on QRCode for JavaScript by Kazuhiko Arase
 * Licensed under the MIT license.
 */

// --- MINIMAL QR ENGINE CORE (Kazuhiko Arase) ---
const QRMode = { MODE_8BIT_BYTE: 4 };
const QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };

function QR8bitByte(data) {
  this.mode = QRMode.MODE_8BIT_BYTE;
  this.data = data;
  this.parsedData = [];
  for (let i = 0, l = this.data.length; i < l; i++) {
    let code = this.data.charCodeAt(i);
    if (code > 0x10000) {
      this.parsedData.push(0xF0 | ((code & 0x1C0000) >>> 18), 0x80 | ((code & 0x3F000) >>> 12), 0x80 | ((code & 0xFC0) >>> 6), 0x80 | (code & 0x3F));
    } else if (code > 0x800) {
      this.parsedData.push(0xE0 | ((code & 0xF000) >>> 12), 0x80 | ((code & 0xFC0) >>> 6), 0x80 | (code & 0x3F));
    } else if (code > 0x80) {
      this.parsedData.push(0xC0 | ((code & 0x7C0) >>> 6), 0x80 | (code & 0x3F));
    } else {
      this.parsedData.push(code);
    }
  }
}
QR8bitByte.prototype.write = function(buffer) {
  for (let i = 0, l = this.parsedData.length; i < l; i++) buffer.put(this.parsedData[i], 8);
};

function QRBitBuffer() {
  this.buffer = [];
  this.length = 0;
}
QRBitBuffer.prototype = {
  put: function(num, length) {
    for (let i = 0; i < length; i++) this.putBit(((num >>> (length - i - 1)) & 1) == 1);
  },
  putBit: function(bit) {
    let bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) this.buffer.push(0);
    if (bit) this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
    this.length++;
  }
};

function QRPolynomial(num, shift) {
  let offset = 0;
  while (offset < num.length && num[offset] == 0) offset++;
  this.num = new Array(num.length - offset + shift);
  for (let i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
}
QRPolynomial.prototype = {
  get: function(index) { return this.num[index]; },
  getLength: function() { return this.num.length; },
  multiply: function(e) {
    let num = new Array(this.getLength() + e.getLength() - 1);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
      }
    }
    return new QRPolynomial(num, 0);
  },
  mod: function(e) {
    if (this.getLength() - e.getLength() < 0) return this;
    let ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
    let num = new Array(this.getLength());
    for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i);
    for (let i = 0; i < e.getLength(); i++) num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
    return new QRPolynomial(num, 0).mod(e);
  }
};

const QRMath = {
  glog: function(n) { return this.LOG_TABLE[n]; },
  gexp: function(n) {
    while (n < 0) n += 255;
    while (n >= 256) n -= 255;
    return this.EXP_TABLE[n];
  },
  EXP_TABLE: new Array(256),
  LOG_TABLE: new Array(256)
};
for (let i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
for (let i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;

function QRCodeModel(typeNumber, errorCorrectLevel) {
  this.typeNumber = typeNumber;
  this.errorCorrectLevel = errorCorrectLevel;
  this.modules = null;
  this.moduleCount = 0;
  this.dataCache = null;
  this.dataList = [];
}
QRCodeModel.prototype = {
  addData: function(data) { this.dataList.push(new QR8bitByte(data)); this.dataCache = null; },
  isDark: function(row, col) { return this.modules[row][col]; },
  getModuleCount: function() { return this.moduleCount; },
  make: function() { this.makeImpl(false, this.getBestMaskPattern()); },
  getBestMaskPattern: function() {
    let minLostPoint = 0, pattern = 0;
    for (let i = 0; i < 8; i++) {
      this.makeImpl(true, i);
      let lostPoint = QRUtil.getLostPoint(this);
      if (i == 0 || minLostPoint > lostPoint) { minLostPoint = lostPoint; pattern = i; }
    }
    return pattern;
  },
  makeImpl: function(test, maskPattern) {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = new Array(this.moduleCount);
    for (let row = 0; row < this.moduleCount; row++) {
      this.modules[row] = new Array(this.moduleCount);
      for (let col = 0; col < this.moduleCount; col++) this.modules[row][col] = null;
    }
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);
    if (this.typeNumber >= 7) this.setupTypeNumber(test);
    if (this.dataCache == null) this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
    this.mapData(this.dataCache, maskPattern);
  },
  setupPositionProbePattern: function(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        if ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  },
  setupTimingPattern: function() {
    for (let r = 8; r < this.moduleCount - 8; r++) if (this.modules[r][6] == null) this.modules[r][6] = (r % 2 == 0);
    for (let c = 8; c < this.moduleCount - 8; c++) if (this.modules[6][c] == null) this.modules[6][c] = (c % 2 == 0);
  },
  setupPositionAdjustPattern: function() {
    let pos = QRUtil.getPatternPosition(this.typeNumber);
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        let row = pos[i], col = pos[j];
        if (this.modules[row][col] != null) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            this.modules[row + r][col + c] = (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0));
          }
        }
      }
    }
  },
  setupTypeNumber: function(test) {
    let bits = QRUtil.getBCHTypeNumber(this.typeNumber);
    for (let i = 0; i < 18; i++) this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = (!test && ((bits >> i) & 1) == 1);
    for (let i = 0; i < 18; i++) this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = (!test && ((bits >> i) & 1) == 1);
  },
  setupTypeInfo: function(test, maskPattern) {
    let data = (this.errorCorrectLevel << 3) | maskPattern, bits = QRUtil.getBCHTypeInfo(data);
    for (let i = 0; i < 15; i++) {
      let mod = (!test && ((bits >> i) & 1) == 1);
      if (i < 6) this.modules[i][8] = mod; else if (i < 8) this.modules[i + 1][8] = mod; else this.modules[this.moduleCount - 15 + i][8] = mod;
    }
    for (let i = 0; i < 15; i++) {
      let mod = (!test && ((bits >> i) & 1) == 1);
      if (i < 8) this.modules[8][this.moduleCount - i - 1] = mod; else if (i < 9) this.modules[8][15 - i - 1 + 1] = mod; else this.modules[8][15 - i - 1] = mod;
    }
    this.modules[this.moduleCount - 8][8] = (!test);
  },
  mapData: function(data, maskPattern) {
    let inc = -1, row = this.moduleCount - 1, bitIndex = 7, byteIndex = 0;
    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col == 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.modules[row][col - c] == null) {
            let dark = false;
            if (byteIndex < data.length) dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
            if (QRUtil.getMask(maskPattern, row, col - c)) dark = !dark;
            this.modules[row][col - c] = dark;
            bitIndex--;
            if (bitIndex == -1) { byteIndex++; bitIndex = 7; }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) { row -= inc; inc = -inc; break; }
      }
    }
  }
};
QRCodeModel.createData = function(typeNumber, errorCorrectLevel, dataList) {
  let rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel), buffer = new QRBitBuffer();
  for (let i = 0; i < dataList.length; i++) {
    let data = dataList[i];
    buffer.put(data.mode, 4);
    buffer.put(data.parsedData.length, QRUtil.getLengthInBits(data.mode, typeNumber));
    data.write(buffer);
  }
  let totalDataCount = 0;
  for (let i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
  if (buffer.length > totalDataCount * 8) throw new Error("overflow");
  if (buffer.length + 4 <= totalDataCount * 8) buffer.put(0, 4);
  while (buffer.length % 8 != 0) buffer.putBit(false);
  while (true) {
    if (buffer.length >= totalDataCount * 8) break;
    buffer.put(0xEC, 8);
    if (buffer.length >= totalDataCount * 8) break;
    buffer.put(0x11, 8);
  }
  return QRCodeModel.createBytes(buffer, rsBlocks);
};
QRCodeModel.createBytes = function(buffer, rsBlocks) {
  let offset = 0, maxDcCount = 0, maxEcCount = 0, dcdata = new Array(rsBlocks.length), ecdata = new Array(rsBlocks.length);
  for (let r = 0; r < rsBlocks.length; r++) {
    let dcCount = rsBlocks[r].dataCount, ecCount = rsBlocks[r].totalCount - dcCount;
    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);
    dcdata[r] = new Array(dcCount);
    for (let i = 0; i < dcdata[r].length; i++) dcdata[r][i] = 0xff & buffer.buffer[i + offset];
    offset += dcCount;
    let rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount), rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1), modPoly = rawPoly.mod(rsPoly);
    ecdata[r] = new Array(rsPoly.getLength() - 1);
    for (let i = 0; i < ecdata[r].length; i++) {
      let modIndex = i + modPoly.getLength() - ecdata[r].length;
      ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
    }
  }
  let totalCodeCount = 0;
  for (let i = 0; i < rsBlocks.length; i++) totalCodeCount += rsBlocks[i].totalCount;
  let data = new Array(totalCodeCount), index = 0;
  for (let i = 0; i < maxDcCount; i++) for (let r = 0; r < rsBlocks.length; r++) if (i < dcdata[r].length) data[index++] = dcdata[r][i];
  for (let i = 0; i < maxEcCount; i++) for (let r = 0; r < rsBlocks.length; r++) if (i < ecdata[r].length) data[index++] = ecdata[r][i];
  return data;
};

const QRUtil = {
  PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
  G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
  G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
  G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),
  getBCHTypeInfo: function(data) {
    let d = data << 10;
    while (this.getBCHDigit(d) - this.getBCHDigit(this.G15) >= 0) d ^= (this.G15 << (this.getBCHDigit(d) - this.getBCHDigit(this.G15)));
    return ((data << 10) | d) ^ this.G15_MASK;
  },
  getBCHTypeNumber: function(data) {
    let d = data << 12;
    while (this.getBCHDigit(d) - this.getBCHDigit(this.G18) >= 0) d ^= (this.G18 << (this.getBCHDigit(d) - this.getBCHDigit(this.G18)));
    return (data << 12) | d;
  },
  getBCHDigit: function(data) {
    let digit = 0;
    while (data != 0) { digit++; data >>>= 1; }
    return digit;
  },
  getPatternPosition: function(typeNumber) { return this.PATTERN_POSITION_TABLE[typeNumber - 1]; },
  getMask: function(maskPattern, i, j) {
    switch (maskPattern) {
      case 0: return (i + j) % 2 == 0;
      case 1: return i % 2 == 0;
      case 2: return j % 3 == 0;
      case 3: return (i + j) % 3 == 0;
      case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
      case 5: return (i * j) % 2 + (i * j) % 3 == 0;
      case 6: return ((i * j) % 2 + (i * j) % 3) % 2 == 0;
      case 7: return ((i * j) % 3 + (i + j) % 2) % 2 == 0;
    }
  },
  getErrorCorrectPolynomial: function(errorCorrectLength) {
    let a = new QRPolynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i++) a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
    return a;
  },
  getLengthInBits: function(mode, type) {
    if (1 <= type && type < 10) return { 1: 10, 2: 9, 4: 8 }[mode];
    if (type < 27) return { 1: 12, 2: 11, 4: 16 }[mode];
    return { 1: 14, 2: 13, 4: 16 }[mode];
  },
  getLostPoint: function(qrCode) {
    let moduleCount = qrCode.getModuleCount(), lostPoint = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        let sameCount = 0, dark = qrCode.isDark(row, col);
        for (let r = -1; r <= 1; r++) {
          if (row + r < 0 || moduleCount <= row + r) continue;
          for (let c = -1; c <= 1; c++) {
            if (col + c < 0 || moduleCount <= col + c || (r == 0 && c == 0)) continue;
            if (dark == qrCode.isDark(row + r, col + c)) sameCount++;
          }
        }
        if (sameCount > 5) lostPoint += (3 + sameCount - 5);
      }
    }
    for (let row = 0; row < moduleCount - 1; row++) for (let col = 0; col < moduleCount - 1; col++) {
      let count = 0; if (qrCode.isDark(row, col)) count++; if (qrCode.isDark(row + 1, col)) count++; if (qrCode.isDark(row, col + 1)) count++; if (qrCode.isDark(row + 1, col + 1)) count++;
      if (count == 0 || count == 4) lostPoint += 3;
    }
    for (let row = 0; row < moduleCount; row++) for (let col = 0; col < moduleCount - 6; col++) if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) && qrCode.isDark(row, col + 6)) lostPoint += 40;
    for (let col = 0; col < moduleCount; col++) for (let row = 0; row < moduleCount - 6; row++) if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) && qrCode.isDark(row + 6, col)) lostPoint += 40;
    let darkCount = 0; for (let col = 0; col < moduleCount; col++) for (let row = 0; row < moduleCount; row++) if (qrCode.isDark(row, col)) darkCount++;
    let ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5; lostPoint += ratio * 10;
    return lostPoint;
  }
};

function QRRSBlock(totalCount, dataCount) { this.totalCount = totalCount; this.dataCount = dataCount; }
QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15]];
QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
  let rsBlock = this.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + [1, 0, 3, 2][errorCorrectLevel]];
  let list = [];
  for (let i = 0; i < rsBlock.length; i += 3) for (let j = 0; j < rsBlock[i]; j++) list.push(new QRRSBlock(rsBlock[i + 1], rsBlock[i + 2]));
  return list;
};

// --- PLATINUM WRAPPER ---
export const QRCodeEngine = {
  generateVCard(p) {
    if (!p) return "";
    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${p.name || ""}`,
      `TEL;TYPE=CELL:${p.phone || ""}`,
      `EMAIL;TYPE=INTERNET:${p.email || ""}`,
      `ADR;TYPE=HOME:;;${p.street || ""};${p.city || ""};;${p.zip || ""};Germany`,
      "END:VCARD"
    ].join("\r\n");
  },

  render(el, data) {
    if (!el || !data) return;
    el.innerHTML = "";
    const canvas = document.createElement("canvas");
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    el.appendChild(canvas);

    try {
      // Find best typeNumber
      let type = 1;
      while (type < 40) {
        try {
          const qr = new QRCodeModel(type, QRErrorCorrectLevel.M);
          qr.addData(data);
          qr.make();
          const ctx = canvas.getContext("2d");
          const count = qr.getModuleCount();
          const tile = size / count;
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = "black";
          for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
              if (qr.isDark(r, c)) ctx.fillRect(c * tile, r * tile, tile, tile);
            }
          }
          break;
        } catch (e) { type++; }
      }
    } catch (err) {
      console.error("[QR] Render failed:", err);
    }
  }
};
