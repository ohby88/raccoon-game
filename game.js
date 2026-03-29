
// 새로운 페이지 닫기 전역 함수
window.closePages = function () {
  const s = document.getElementById('settingsPanel'); if (s) s.style.display = 'none';
  document.getElementById('shopPanel').style.display = 'none';
  document.getElementById('missionPanel').style.display = 'none';
};
// ============================================================
//  RACCOON ADVENTURE - game.js
// ============================================================

window.onerror = function (msg, url, line, col, err) {
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;background:red;color:white;padding:20px;font-size:20px;border:3px solid yellow;width:100%;word-wrap:break-word;';
  errDiv.textContent = msg + " @ line " + line + ":" + col;
  if (document.body) document.body.appendChild(errDiv);
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 360, H = 640;

// ────────────────────────────────────────────────────────────
//  사운드 시스템 (Web Audio API - 8비트 레트로 사운드)
// ────────────────────────────────────────────────────────────
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);
window.updateAudioVolume = function () {
  masterGain.gain.value = (typeof SAVE !== 'undefined' && SAVE.get('opt_sfx', true)) ? 1 : 0;
};
setTimeout(window.updateAudioVolume, 100);


const SFX = {
  // 점프 사운드 (짧은 상승 톤)
  jump: () => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    osc.type = 'square';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
  },

  // 과일 먹기 (팅! 소리)
  coin: () => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.08);
  },

  // 콤보 (높은 톤)
  combo: () => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.12);
  },

  // 아이템 획득 (반짝)
  item: () => {
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc2.frequency.setValueAtTime(900, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

    osc1.start(audioCtx.currentTime);
    osc2.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.2);
    osc2.stop(audioCtx.currentTime + 0.2);
  },

  // 피해 입기 (낮은 톤)
  hit: () => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.3);
  },

  // 스테이지 클리어 (팡파레)
  clear: () => {
    const notes = [523, 659, 784, 1047]; // C-E-G-C
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = audioCtx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  },

  // 게임 오버 (하강 톤)
  gameOver: () => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.8);
  },

  // 대시 (쉿!)
  dash: () => {
    const noise = audioCtx.createBufferSource();
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;

    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    noise.start(audioCtx.currentTime);
    noise.stop(audioCtx.currentTime + 0.1);
  },
};

// 오디오 컨텍스트 활성화 (모바일 대응)
document.addEventListener('click', () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });

// ────────────────────────────────────────────────────────────
//  스프라이트 이미지 로드
// ────────────────────────────────────────────────────────────
const BG_IMAGE = new Image();
BG_IMAGE.src = 'sprites/sunny_meadow_bg.png';

const SPRITES = {
  raccoon_idle: new Image(),
  raccoon_walk: new Image(),
  raccoon_jump: new Image(),
  fox_idle: new Image(),
  fox_walk: new Image(),
  fox_jump: new Image(),
  rabbit_idle: new Image(),
  rabbit_walk: new Image(),
  rabbit_jump: new Image(),
};

SPRITES.raccoon_idle.src = 'sprites/raccoon_idle.png?v=3';
SPRITES.raccoon_walk.src = 'sprites/raccoon_walk.png?v=3';
SPRITES.raccoon_jump.src = 'sprites/raccoon_jump.png?v=3';
SPRITES.fox_idle.src = 'sprites/fox_idle.png?v=3';
SPRITES.fox_walk.src = 'sprites/fox_walk.png?v=3';
SPRITES.fox_jump.src = 'sprites/fox_jump.png?v=3';
SPRITES.rabbit_idle.src = 'sprites/rabbit_idle.png?v=3';
SPRITES.rabbit_walk.src = 'sprites/rabbit_walk.png?v=3';
SPRITES.rabbit_jump.src = 'sprites/rabbit_jump.png?v=3';

// 이미지 로드 완료 대기
let imagesLoaded = 0;
const totalImages = 9;
Object.values(SPRITES).forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    console.log(`이미지 로드: ${imagesLoaded}/${totalImages}`);
  };
  img.onerror = () => {
    console.error('이미지 로드 실패:', img.src);
  };
});

// ────────────────────────────────────────────────────────────
//  캐릭터 정의
// ────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────
//  스킨 및 캐릭터 정의
// ────────────────────────────────────────────────────────────
const SKINS = {
  raccoon: [
    { id: 'basic', name: '기본 너구리', price: 0, filter: 'none' },
    { id: 'dark', name: '다크 너구리', price: 200, filter: 'brightness(0.4) grayscale(1)' },
    { id: 'gold', name: '황금 너구리', price: 1000, filter: 'sepia(1) saturate(2) hue-rotate(5deg) brightness(1.2)' }
  ],
  fox: [
    { id: 'basic', name: '기본 여우', price: 0, filter: 'none' },
    { id: 'snow', name: '눈꽃 여우', price: 300, filter: 'brightness(1.5) grayscale(1)' },
    { id: 'shadow', name: '그림자 여우', price: 1200, filter: 'brightness(0.3) sepia(1) hue-rotate(240deg) saturate(1.5)' }
  ],
  rabbit: [
    { id: 'basic', name: '기본 토끼', price: 0, filter: 'none' },
    { id: 'pink', name: '벚꽃 토끼', price: 400, filter: 'hue-rotate(300deg) saturate(1.5) brightness(1.2)' },
    { id: 'neon', name: '네온 토끼', price: 1500, filter: 'hue-rotate(180deg) saturate(3) brightness(1.5)' }
  ]
};


function getSkinId(charId) {
  if (typeof SAVE === 'undefined') return 'basic';
  return SAVE.get('equippedSkin', {})[charId] || 'basic';
}

function drawAccessory(ctx, charId) {
  const skinId = getSkinId(charId);
  if (skinId === 'basic' || !skinId) return;

  ctx.save();
  ctx.translate(0, -22); // 머리 대략적 위치

  if (skinId === 'dark') {
    // 🕶️ 까만 썬글라스
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.roundRect(-12, -4, 24, 8, 3); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-8, -2, 4, 3);
  } else if (skinId === 'gold') {
    // 👑 왕관
    ctx.fillStyle = '#F1C40F';
    ctx.beginPath(); ctx.moveTo(-12, 2); ctx.lineTo(12, 2); ctx.lineTo(16, -15);
    ctx.lineTo(6, -5); ctx.lineTo(0, -18); ctx.lineTo(-6, -5); ctx.lineTo(-16, -15); ctx.fill();
  } else if (skinId === 'ghost') {
    // 👼 천사 링
    ctx.strokeStyle = '#F1C40F'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, -20, 14, 4, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (skinId === 'ninja') {
    // 🥷 붉은 머리띠
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(-14, -6, 28, 6);
    ctx.fillRect(-22, -2, 10, 4);
    ctx.fillRect(-18, 2, 8, 4);
  } else if (skinId === 'arctic' || skinId === 'moon') {
    // ❄️ 파란 귀마개 / 모자
    ctx.fillStyle = '#3498DB';
    ctx.beginPath(); ctx.arc(0, -5, 13, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(-14, -5, 6, 0, Math.PI * 2); ctx.arc(14, -5, 6, 0, Math.PI * 2); ctx.fill();
  } else if (skinId === 'flame') {
    // 🔥 악마 뿔
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath(); ctx.moveTo(-10, -2); ctx.lineTo(-16, -18); ctx.lineTo(-4, -5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -5); ctx.lineTo(16, -18); ctx.lineTo(10, -2); ctx.fill();
  } else if (skinId === 'pink') {
    // 🌸 벚꽃 핀
    ctx.fillStyle = '#FD79A8';
    ctx.translate(10, -10);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.arc(Math.cos(i * Math.PI * 2 / 5) * 6, Math.sin(i * Math.PI * 2 / 5) * 6, 4, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function getSkinFilter(charId) {
  const eq = SAVE.get('equippedSkin', {})[charId] || 'basic';
  const skin = SKINS[charId] ? SKINS[charId].find(s => s.id === eq) : null;
  return skin ? skin.filter : 'none';
}

const CHAR_DEFS = {
  raccoon: {
    speed: 1.5,
    jumpForce: -6,
    doubleJump: false,
    dash: false,
    color: '#aaaaaa',
    bodyColor: '#888888',
    earColor: '#555555',
    eyeColor: '#ffffff',
    noseColor: '#ff6666',
    tailColor: '#666666',
    maskColor: '#333333',
  },
  fox: {
    speed: 1.0,
    jumpForce: -5,
    doubleJump: true,
    dash: false,
    color: '#ff8833',
    bodyColor: '#ff6600',
    earColor: '#cc4400',
    eyeColor: '#ffffff',
    noseColor: '#ffccaa',
    tailColor: '#ff9944',
    maskColor: '#ffffff',
  },
  rabbit: {
    speed: 1.8,
    jumpForce: -8,
    doubleJump: false,
    dash: true,
    color: '#ddddff',
    bodyColor: '#ccccee',
    earColor: '#ffaaaa',
    eyeColor: '#ff4488',
    noseColor: '#ff88aa',
    tailColor: '#ffffff',
    maskColor: '#eeeeee',
  },
};

// ────────────────────────────────────────────────────────────
//  20스테이지 맵 데이터
//  platforms: [{x,y,w}]  ladders: [{x,y,h}]  fruits: [{x,y,t}]
//  enemies: [{x,y,type,range,speed}]
//  type: 'walk'|'patrol'|'bounce'   t(fruit): 0=cherry 1=orange 2=melon 3=coin
// ────────────────────────────────────────────────────────────
function buildStages() {
  const S = [];

  // 스테이지 템플릿 생성기 (20스테이지)
  const templates = [
    // Stage 1 - 튜토리얼
    // 사다리 y = 아랫층 플랫폼 y, y-h = 윗층 플랫폼 y
    {
      platforms: [
        { x: 0, y: 580, w: 360 },                        // 바닥
        { x: 0, y: 460, w: 360 },                        // 1층 (전체)
        { x: 0, y: 340, w: 160 }, { x: 220, y: 340, w: 140 },    // 2층
        { x: 0, y: 220, w: 360 },                        // 3층 (전체)
        { x: 80, y: 100, w: 200 },                       // 4층
      ],
      ladders: [
        { x: 80, y: 580, h: 120 },   // 바닥(580)→1층(460)
        { x: 100, y: 460, h: 120 },  // 1층(460)→2층(340) 왼쪽
        { x: 240, y: 460, h: 120 },  // 1층(460)→2층(340) 오른쪽
        { x: 80, y: 340, h: 120 },   // 2층(340)→3층(220)
        { x: 160, y: 220, h: 120 },  // 3층(220)→4층(100)
      ],
      fruits: [
        { x: 100, y: 420, t: 0 }, { x: 280, y: 420, t: 0 },
        { x: 60,  y: 300, t: 1 }, { x: 260, y: 300, t: 0 },
        { x: 80,  y: 180, t: 0 }, { x: 260, y: 180, t: 1 },
        { x: 160, y: 60,  t: 2 },
      ],
      enemies: [
        { x: 50, y: 450, type: 'walk', range: 160, speed: 0.8 },
        { x: 240, y: 330, type: 'walk', range: 100, speed: 0.9 },
      ],
    },
    // Stage 2
    {
      platforms: [
        { x: 0, y: 580, w: 360 },
        { x: 0, y: 470, w: 360 },
        { x: 0, y: 360, w: 160 }, { x: 200, y: 360, w: 160 },
        { x: 0, y: 250, w: 360 },
        { x: 0, y: 140, w: 160 }, { x: 200, y: 140, w: 160 },
        { x: 80, y: 30, w: 200 },
      ],
      ladders: [
        { x: 100, y: 580, h: 110 },  // 바닥(580)→1층(470)
        { x: 80, y: 470, h: 110 },   // 1층(470)→2층(360) 왼쪽
        { x: 220, y: 470, h: 110 },  // 1층(470)→2층(360) 오른쪽
        { x: 80, y: 360, h: 110 },   // 2층(360)→3층(250)
        { x: 80, y: 250, h: 110 },   // 3층(250)→4층(140) 왼쪽
        { x: 220, y: 250, h: 110 },  // 3층(250)→4층(140) 오른쪽
        { x: 160, y: 140, h: 110 },  // 4층(140)→5층(30)
      ],
      fruits: [
        { x: 80,  y: 430, t: 0 }, { x: 240, y: 430, t: 0 },
        { x: 50,  y: 320, t: 1 }, { x: 240, y: 320, t: 0 },
        { x: 80,  y: 210, t: 1 }, { x: 260, y: 210, t: 0 },
        { x: 60,  y: 100, t: 2 }, { x: 240, y: 100, t: 1 }, { x: 180, y: 0, t: 3 },
      ],
      enemies: [
        { x: 40, y: 460, type: 'walk', range: 140, speed: 0.9 },
        { x: 220, y: 350, type: 'walk', range: 120, speed: 1.0 },
        { x: 80, y: 240, type: 'walk', range: 160, speed: 1.0 },
      ],
    },
    // Stage 3
    {
      platforms: [
        { x: 0, y: 580, w: 360 },
        { x: 0, y: 480, w: 360 },
        { x: 0, y: 380, w: 140 }, { x: 180, y: 380, w: 180 },
        { x: 0, y: 280, w: 360 },
        { x: 0, y: 180, w: 160 }, { x: 200, y: 180, w: 160 },
        { x: 60, y: 80, w: 240 },
      ],
      ladders: [
        { x: 60, y: 580, h: 100 },   // 바닥→1층
        { x: 60, y: 480, h: 100 },   // 1층→2층 왼쪽
        { x: 200, y: 480, h: 100 },  // 1층→2층 오른쪽
        { x: 80, y: 380, h: 100 },   // 2층→3층
        { x: 80, y: 280, h: 100 },   // 3층→4층 왼쪽
        { x: 220, y: 280, h: 100 },  // 3층→4층 오른쪽
        { x: 100, y: 180, h: 100 },  // 4층→5층
        { x: 160, y: 80, h: 100 },   // 5층→최상층
      ],
      fruits: [
        { x: 60,  y: 440, t: 0 }, { x: 240, y: 440, t: 1 },
        { x: 60,  y: 340, t: 0 }, { x: 220, y: 340, t: 0 },
        { x: 80,  y: 240, t: 1 }, { x: 240, y: 240, t: 2 },
        { x: 60,  y: 140, t: 1 }, { x: 220, y: 140, t: 0 },
        { x: 100, y: 40,  t: 3 }, { x: 220, y: 40,  t: 2 },
      ],
      enemies: [
        { x: 20, y: 470, type: 'walk', range: 120, speed: 1.0 },
        { x: 200, y: 370, type: 'walk', range: 120, speed: 1.1 },
        { x: 80, y: 270, type: 'walk', range: 160, speed: 1.1 },
      ],
    },
    // Stage 4
    {
      platforms: [
        { x: 0, y: 580, w: 360 },
        { x: 0, y: 490, w: 100 }, { x: 130, y: 490, w: 100 }, { x: 260, y: 490, w: 100 },
        { x: 0, y: 400, w: 360 },
        { x: 0, y: 310, w: 160 }, { x: 200, y: 310, w: 160 },
        { x: 0, y: 220, w: 360 },
        { x: 0, y: 130, w: 160 }, { x: 200, y: 130, w: 160 },
        { x: 80, y: 40, w: 200 },
      ],
      ladders: [
        { x: 60, y: 580, h: 90 },   // 바닥(580)→1층(490)
        { x: 270, y: 580, h: 90 },
        { x: 60, y: 490, h: 90 },   // 1층(490)→2층(400)
        { x: 260, y: 490, h: 90 },
        { x: 80, y: 400, h: 90 },   // 2층(400)→3층(310)
        { x: 240, y: 400, h: 90 },
        { x: 80, y: 310, h: 90 },   // 3층(310)→4층(220)
        { x: 240, y: 310, h: 90 },
        { x: 80, y: 220, h: 90 },   // 4층(220)→5층(130)
        { x: 240, y: 220, h: 90 },
        { x: 160, y: 130, h: 90 },  // 5층(130)→최상층(40)
      ],
      fruits: [
        { x: 30,  y: 450, t: 0 }, { x: 150, y: 450, t: 0 }, { x: 270, y: 450, t: 0 },
        { x: 100, y: 360, t: 1 }, { x: 240, y: 360, t: 1 },
        { x: 60,  y: 270, t: 2 }, { x: 240, y: 270, t: 2 },
        { x: 80,  y: 180, t: 1 }, { x: 240, y: 180, t: 0 },
        { x: 60,  y: 90,  t: 3 }, { x: 240, y: 90,  t: 3 }, { x: 160, y: 10, t: 3 },
      ],
      enemies: [
        { x: 0, y: 390, type: 'walk', range: 240, speed: 1.1 },
        { x: 20, y: 300, type: 'walk', range: 140, speed: 1.2 },
        { x: 220, y: 300, type: 'walk', range: 120, speed: 1.2 },
        { x: 0, y: 120, type: 'walk', range: 140, speed: 1.3 },
        { x: 220, y: 120, type: 'walk', range: 120, speed: 1.3 },
      ],
    },
    // Stage 5 - bounce 등장
    {
      platforms: [
        { x: 0, y: 580, w: 360 },
        { x: 0, y: 490, w: 360 },
        { x: 0, y: 400, w: 160 }, { x: 200, y: 400, w: 160 },
        { x: 0, y: 310, w: 360 },
        { x: 0, y: 220, w: 160 }, { x: 200, y: 220, w: 160 },
        { x: 0, y: 130, w: 360 },
        { x: 80, y: 40, w: 200 },
      ],
      ladders: [
        { x: 80, y: 580, h: 90 },   // 바닥(580)→1층(490)
        { x: 80, y: 490, h: 90 },   // 1층(490)→2층(400) 왼쪽
        { x: 240, y: 490, h: 90 },  // 1층(490)→2층(400) 오른쪽
        { x: 80, y: 400, h: 90 },   // 2층(400)→3층(310)
        { x: 240, y: 400, h: 90 },
        { x: 80, y: 310, h: 90 },   // 3층(310)→4층(220)
        { x: 240, y: 310, h: 90 },
        { x: 80, y: 220, h: 90 },   // 4층(220)→5층(130)
        { x: 240, y: 220, h: 90 },
        { x: 160, y: 130, h: 90 },  // 5층(130)→최상층(40)
        { x: 160, y: 40, h: 90 },
      ],
      fruits: [
        { x: 60,  y: 450, t: 0 }, { x: 240, y: 450, t: 1 },
        { x: 60,  y: 360, t: 0 }, { x: 240, y: 360, t: 1 },
        { x: 60,  y: 270, t: 2 }, { x: 220, y: 270, t: 0 },
        { x: 60,  y: 180, t: 2 }, { x: 240, y: 180, t: 1 },
        { x: 60,  y: 90,  t: 3 }, { x: 240, y: 90,  t: 3 }, { x: 160, y: 10, t: 3 },
      ],
      enemies: [
        { x: 20, y: 480, type: 'walk', range: 140, speed: 1.2 },
        { x: 220, y: 480, type: 'walk', range: 120, speed: 1.2 },
        { x: 60, y: 390, type: 'walk', range: 100, speed: 1.3 },
        { x: 220, y: 300, type: 'bounce', range: 80, speed: 2.5 },
        { x: 60, y: 210, type: 'walk', range: 100, speed: 1.4 },
        { x: 220, y: 120, type: 'bounce', range: 60, speed: 2.5 },
      ],
    },
    // Stage 6~20: 자동 생성 (난이도 점진 증가)
  ];

  // Stage 1~5 추가
  for (let i = 0; i < templates.length; i++) {
    S.push(templates[i]);
  }

  // Stage 6~20 절차적 생성
  for (let si = 6; si <= 20; si++) {
    const diff = (si - 1) / 19; // 0~1
    const numFloors = 6 + Math.floor(diff * 3);
    const floorGap = Math.floor((H - 100) / numFloors);
    const platforms = [];
    const ladders = [];
    const fruits = [];
    const enemies = [];

    // 바닥
    platforms.push({ x: 0, y: H - 60, w: W });

    const rng = mulberry32(si * 1337);

    // 각 층의 플랫폼 세그먼트를 기록해두고 사다리를 그 위에만 배치
    const floorSegs = []; // floorSegs[f] = [{x, w}]

    for (let f = 1; f < numFloors; f++) {
      const y = H - 60 - f * floorGap;
      // 이 층 플랫폼: 전체 or 갭 있는 두 조각
      const pieces = 1 + Math.floor(rng() * 2);
      const segs = [];
      if (pieces === 1) {
        const gapStart = 60 + Math.floor(rng() * 60);
        const gapW = 40 + Math.floor(rng() * 50);
        const seg1 = { x: 0, w: gapStart };
        const seg2 = { x: gapStart + gapW, w: W - gapStart - gapW };
        platforms.push({ x: seg1.x, y, w: seg1.w });
        platforms.push({ x: seg2.x, y, w: seg2.w });
        segs.push(seg1, seg2);
      } else {
        platforms.push({ x: 0, y, w: W });
        segs.push({ x: 0, w: W });
      }
      floorSegs[f] = segs;

      // 사다리: 이 층 세그먼트 중 하나에서 x 선택 (플랫폼 위에 반드시 존재)
      // 아랫층(f-1)과 이 층 모두에 겹치는 x 구간에 사다리 배치
      const prevSegs = f === 1 ? [{ x: 0, w: W }] : (floorSegs[f - 1] || [{ x: 0, w: W }]);
      // 이 층 세그 중 하나 택
      const thisSeg = segs[Math.floor(rng() * segs.length)];
      // 아랫층 세그 중 thisSeg와 겹치는 것 찾기
      let lx = thisSeg.x + 20 + Math.floor(rng() * Math.max(1, thisSeg.w - 40));
      // 아랫층에도 lx 위치에 플랫폼이 있는지 확인, 없으면 prevSegs에서 찾기
      const prevMatch = prevSegs.find(s => lx >= s.x + 10 && lx + 20 <= s.x + s.w - 10);
      if (!prevMatch) {
        // 아랫층 첫 세그 위에 강제 배치
        const ps = prevSegs[0];
        lx = ps.x + 20 + Math.floor(rng() * Math.max(1, ps.w - 40));
      }
      // 사다리 y = 아랫층 플랫폼 y (= y + floorGap), h = 두 층 사이 간격
      const ladderBottomY = y + floorGap;
      ladders.push({ x: lx, y: ladderBottomY, h: floorGap });

      // 과일
      const numFruits = 2 + Math.floor(diff * 3);
      for (let fi = 0; fi < numFruits; fi++) {
        fruits.push({
          x: 20 + Math.floor(rng() * (W - 40)),
          y: y - 50,
          t: Math.floor(rng() * 4),
        });
      }

      // 적
      const numE = Math.floor(0.8 + diff * 2.5);
      for (let ei = 0; ei < numE; ei++) {
        const etype = rng() < 0.2 + diff * 0.3 ? 'bounce' : 'walk';
        enemies.push({
          x: 20 + Math.floor(rng() * (W - 60)),
          y: y - 20,
          type: etype,
          range: 80 + Math.floor(rng() * 140),
          speed: 0.8 + diff * 1.5 + rng() * 0.5,
        });
      }
    }

    S.push({ platforms, ladders, fruits, enemies });
  }

  return S;
}

// 간단한 시드 랜덤
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const STAGES = buildStages();

// ────────────────────────────────────────────────────────────
//  로컬스토리지 세이브 시스템
// ────────────────────────────────────────────────────────────
const SAVE = {
  get(key, defaultVal) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('Failed to save:', e);
    }
  }
};

// ────────────────────────────────────────────────────────────
//  픽셀 아트 캐릭터 드로우 함수들
// ────────────────────────────────────────────────────────────

function getSkinFilter(charId) { return 'none'; }
function drawAccessory(ctx, charId) {
  const eq = (typeof SAVE !== 'undefined') ? (SAVE.get('equippedSkin', {})[charId] || 'basic') : 'basic';
  if (eq === 'basic') return;

  ctx.save();
  if (charId === 'raccoon') {
    if (eq === 'dark') { ctx.fillStyle = '#111'; ctx.fillRect(14, 18, 20, 6); ctx.fillStyle = '#fff'; ctx.fillRect(16, 20, 4, 3); }
    else if (eq === 'gold') { ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(14, 18); ctx.lineTo(24, 14); ctx.lineTo(34, 18); ctx.lineTo(38, 10); ctx.fill(); }
    else if (eq === 'ghost') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(24, 4, 14, 4, 0, 0, Math.PI * 2); ctx.stroke(); }
    else if (eq === 'ninja') { ctx.fillStyle = '#e74c3c'; ctx.fillRect(10, 16, 28, 6); }
  } else if (charId === 'fox') {
    if (eq === 'arctic') { ctx.fillStyle = '#3498db'; ctx.fillRect(12, 16, 24, 8); ctx.fillStyle = '#ecf0f1'; ctx.fillRect(12, 18, 24, 4); }
    else if (eq === 'flame') { ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(16, 14); ctx.lineTo(12, 4); ctx.lineTo(20, 14); ctx.fill(); ctx.beginPath(); ctx.moveTo(32, 14); ctx.lineTo(36, 4); ctx.lineTo(28, 14); ctx.fill(); }
    else if (eq === 'ninja') { ctx.fillStyle = '#e74c3c'; ctx.fillRect(10, 18, 28, 6); }
  } else if (charId === 'rabbit') {
    if (eq === 'pink') { ctx.fillStyle = '#fd79a8'; ctx.beginPath(); ctx.arc(28, 12, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(28, 12, 2, 0, Math.PI * 2); ctx.fill(); }
    else if (eq === 'moon') { ctx.fillStyle = '#0984e3'; ctx.beginPath(); ctx.arc(12, 20, 6, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(36, 20, 6, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#0984e3'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(24, 20, 12, Math.PI, 0); ctx.stroke(); }
    else if (eq === 'ninja') { ctx.fillStyle = '#e74c3c'; ctx.fillRect(12, 24, 24, 6); }
  }
  ctx.restore();
}


function drawRaccoon(c, x, y, w, h, def, frame, facingLeft, isJumping, isMoving) {
  c.save();

  // 이미지 선택: 점프 > 걷기 > 서있기
  let sprite;
  if (isJumping) {
    sprite = SPRITES.raccoon_jump;
  } else if (isMoving) {
    sprite = SPRITES.raccoon_walk;
  } else {
    sprite = SPRITES.raccoon_idle;
  }

  // 이미지가 로드되지 않았으면 기본 도형으로 그리기
  if (!sprite.complete || sprite.naturalWidth === 0) {
    c.fillStyle = def.bodyColor;
    c.fillRect(x, y, w, h);
    drawAccessory(c, 'raccoon');
    c.restore();
    return;
  }

  // 좌우 반전 처리
  if (facingLeft) {
    c.translate(x + w, y);
    c.scale(-1, 1);
    c.drawImage(sprite, 0, 0, w, h);
  } else {
    c.drawImage(sprite, x, y, w, h);
  }
  c.filter = 'none';
  c.filter = 'none';
  c.filter = 'none';

  c.restore();
}

function drawFox(c, x, y, w, h, def, frame, facingLeft, isJumping, isMoving) {
  c.save();

  // 이미지 선택
  let sprite;
  if (isJumping) {
    sprite = SPRITES.fox_jump;
  } else if (isMoving) {
    sprite = SPRITES.fox_walk;
  } else {
    sprite = SPRITES.fox_idle;
  }

  // 이미지가 로드되지 않았으면 기본 도형으로 그리기
  if (!sprite.complete || sprite.naturalWidth === 0) {
    c.fillStyle = def.bodyColor;
    c.fillRect(x, y, w, h);
    drawAccessory(c, 'fox');
    c.restore();
    return;
  }

  // 좌우 반전 처리
  if (facingLeft) {
    c.translate(x + w, y);
    c.scale(-1, 1);
    c.drawImage(sprite, 0, 0, w, h);
  } else {
    c.drawImage(sprite, x, y, w, h);
  }

  c.restore();
}

function drawRabbit(c, x, y, w, h, def, frame, facingLeft, dashing, isJumping, isMoving) {
  c.save();

  // 대시 잔상 효과 (대시 중일 때)
  if (dashing) {
    const dashTrailCount = 3;
    for (let i = 0; i < dashTrailCount; i++) {
      const offsetX = facingLeft ? (i + 1) * 8 : -(i + 1) * 8;
      const alpha = 0.15 - (i * 0.05);
      c.globalAlpha = alpha;
      const trailSprite = isJumping ? SPRITES.rabbit_jump : SPRITES.rabbit_walk;
      if (trailSprite.complete) {
        if (facingLeft) {
          c.save();
          c.translate(x + w + offsetX, y);
          c.scale(-1, 1);
          c.drawImage(trailSprite, 0, 0, w, h);
          drawAccessory(c, 'rabbit');
          c.restore();
        } else {
          c.drawImage(trailSprite, x + offsetX, y, w, h);
        }
        c.filter = 'none';
      }
    }
    c.globalAlpha = 1.0;
  }

  // 이미지 선택
  let sprite;
  if (isJumping) {
    sprite = SPRITES.rabbit_jump;
  } else if (isMoving || dashing) {
    sprite = SPRITES.rabbit_walk;
  } else {
    sprite = SPRITES.rabbit_idle;
  }

  // 이미지가 로드되지 않았으면 기본 도형으로 그리기
  if (!sprite.complete || sprite.naturalWidth === 0) {
    c.fillStyle = def.bodyColor;
    c.fillRect(x, y, w, h);
    c.restore();
    return;
  }

  // 좌우 반전 처리
  if (facingLeft) {
    c.translate(x + w, y);
    c.scale(-1, 1);
    c.drawImage(sprite, 0, 0, w, h);
  } else {
    c.drawImage(sprite, x, y, w, h);
  }

  c.restore();
}

function drawEnemy(c, x, y, w, h, type, frame) {
  c.save();
  c.translate(x + w / 2, y + h / 2);

  // 찌그러짐(Squash/Stretch) 점프/이동 애니메이션
  const bounce = Math.abs(Math.sin(frame * 0.2));
  c.scale(1 + bounce * 0.1, 1 - bounce * 0.1);
  c.translate(0, -bounce * 4);

  let emoji = '👾'; // 기본 슬라임
  let size = 28;
  if (type === 'bird') { emoji = '🦇'; size = 30; } // 박쥐
  if (type === 'spike') { emoji = '🦔'; size = 30; } // 가시도치
  if (type === 'boss') { emoji = '👹'; size = 50; } // 보스 오니

  c.font = size + 'px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';

  c.shadowColor = 'rgba(0,0,0,0.4)';
  c.shadowOffsetY = 3;
  c.shadowBlur = 5;

  c.fillText(emoji, 0, 0);
  c.restore();
}



function drawFruit(c, x, y, type) {
  // 모든 과일 타입을 ⭐ 별 하나로 통일
  c.save();
  c.translate(x + 10, y + 10);

  // 둥실둥실 떠다니는 효과
  const t = Date.now() / 400 + x * 0.05;
  const floatY = Math.sin(t) * 3;
  const scale = 1 + Math.sin(t * 1.3) * 0.08; // 살짝 커졌다 작아졌다
  c.translate(0, floatY);
  c.scale(scale, scale);

  // 황금빛 글로우
  c.shadowColor = '#FFD700';
  c.shadowBlur = 10;
  c.font = '20px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('⭐', 0, 0);
  c.restore();
}

function drawStageItem(c, x, y, type, frameCount) {
  let emoji = '⭐';
  if (type === 'freeze') emoji = '⏱️';
  else if (type === 'magnet') emoji = '🧲';
  else if (type === 'speed') emoji = '⚡';

  c.save();
  c.translate(x + 10, y + 10);

  const scale = 1 + Math.sin(frameCount * 0.1) * 0.15;
  c.scale(scale, scale);

  c.font = '24px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';

  c.shadowColor = (type === 'star' || type === 'speed') ? 'rgba(255, 215, 0, 0.8)' : 'rgba(52, 152, 219, 0.8)';
  c.shadowBlur = 10;
  c.fillText(emoji, 0, 0);
  c.restore();
}

function openMissions() {
  const mission = document.getElementById('missionPanel');
  if (!mission) return;
  mission.style.display = 'flex';
  mission.innerHTML = `
    <div class="toss-app-bar">
      <button class="btn-icon" onclick="closePages()">←</button>
      <h2>미션 & 챌린지</h2>
      <div style="width: 48px;"></div>
    </div>
    <div style="padding: 40px 24px; text-align: center;">
      <div style="font-size: 40px; margin-bottom: 16px;">🚧</div>
      <h3 style="font-size: 18px; color: var(--toss-text-primary); margin:0 0 8px 0;">미션 시스템 준비 중</h3>
      <p style="font-size: 15px; color: var(--toss-text-secondary); word-break: keep-all; line-height: 1.5;">조금만 기다려주세요! 다채로운 도전과제와 보상이 곧 추가됩니다.</p>
    </div>
  `;
}
function openShop() {
  const panel = document.getElementById('shopPanel');
  if (!panel) return;
  panel.style.display = 'flex';

  panel.innerHTML = `
  <div class="toss-app-bar">
    <button class="btn-icon" onclick="closePages()">←</button>
    <h2>스킨 상점</h2>
    <div style="width: 48px;"></div> <!-- 중앙 정렬용 -->
  </div>`;

  const content = document.createElement('div');
  content.style.cssText = 'padding: 24px; padding-bottom: 80px;';

  const unlockedSt = getUnlocked();
  const ownedSkins = SAVE.get('ownedSkins', {});
  const maxPts = SAVE.get('points', 0);
  const charNames = { raccoon: '너구리', fox: '사막 여우', rabbit: '토끼' };

  for (const cid of ['raccoon', 'fox', 'rabbit']) {
    if (!unlockedSt[cid]) continue;

    // 👕 각 캐릭터별 현재 장착된 스킨을 보여주는 라이브 프리뷰 캔버스 추가
    content.innerHTML += `
      <div style="display:flex; align-items:center; gap: 16px; margin-top:32px; margin-bottom:16px;">
         <div style="width: 64px; height: 64px; background:#F2F4F6; border-radius: 16px; display:flex; justify-content:center; align-items:center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
            <canvas id="shopIcon_${cid}" width="48" height="48"></canvas>
         </div>
         <div style="font-size:18px;color:#191F28;font-weight:800;">${charNames[cid]}</div>
      </div>`;

    for (const skin of SKINS[cid]) {
      const isOwned = skin.id === 'basic' || ownedSkins[`${cid}_${skin.id}`];
      const isEq = (SAVE.get('equippedSkin', {})[cid] || 'basic') === skin.id;

      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#FFFFFF;border:1px solid #E5E8EB;padding:12px 16px;border-radius:12px;margin-bottom:8px;';

      let btnHTML = '';
      if (isEq) {
        btnHTML = `<button disabled style="padding:8px 14px;font-size:12px;font-weight:700;background:#00C85A;color:#fff;border:none;border-radius:8px;">장착중</button>`;
      } else if (isOwned) {
        btnHTML = `<button onclick="equipSkin('${cid}','${skin.id}')" style="padding:8px 14px;font-size:12px;font-weight:700;background:#F2F4F6;color:#4E5968;border:none;border-radius:8px;cursor:pointer;">장착</button>`;
      } else {
        const canBuy = maxPts >= skin.price;
        const btnStyle = canBuy ? 'background:#3182F6;color:#fff;cursor:pointer;' : 'background:#F2F4F6;color:#8B95A1;cursor:not-allowed;';
        btnHTML = `<button ${canBuy ? `onclick="buySkin('${cid}','${skin.id}',${skin.price})"` : 'disabled'} style="padding:8px 14px;font-size:12px;font-weight:700;border:none;border-radius:8px;${btnStyle}">🪙 ${skin.price}</button>`;
      }

      row.innerHTML = `
        <div style="font-size:14px;font-weight:700;color:#191F28;">${skin.name}</div>
        ${btnHTML}
      `;
      content.appendChild(row);
    }
  }
  content.innerHTML += `<div style="margin-top:20px;"><button onclick="watchAdForPoints()" style="width:100%;padding:16px;background:#E8F3FF;color:#1B64DA;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;">📺 광고 보고 500 P 받기</button></div>`;
  panel.appendChild(content);

  // 상점 렌더링 직후 캔버스에 프리뷰 아이콘 그리기 예약
  setTimeout(window.drawShopIcons, 10);
}
function buySkin(cid, sid, price) {
  let pts = SAVE.get('points', 0);
  if (pts >= price) {
    SAVE.set('points', pts - price);
    const owned = SAVE.get('ownedSkins', {});
    owned[`${cid}_${sid}`] = true;
    SAVE.set('ownedSkins', owned);
    equipSkin(cid, sid);
  }
}

function equipSkin(cid, sid) {
  const eq = SAVE.get('equippedSkin', {});
  eq[cid] = sid;
  SAVE.set('equippedSkin', eq);
  openShop();
  drawSelectIcons();
  updateSelectScreen();
}


window.updateSelectScreen = function () {
  const pts = SAVE.get('points', 0);
  const pointEl = document.getElementById('pointVal');
  if (pointEl) pointEl.textContent = pts.toLocaleString();
};

window.drawSelectIcons = function () {
  const chars = ['raccoon', 'fox', 'rabbit'];
  const sprites = [SPRITES.raccoon_idle, SPRITES.fox_idle, SPRITES.rabbit_idle];
  chars.forEach((cId, i) => {
    const canvas = document.getElementById('icon' + i);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const sprite = sprites[i];
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.save();
      const colorFilter = typeof getSkinFilter !== 'undefined' ? getSkinFilter(cId) : 'none';
      if (colorFilter && colorFilter !== 'none') ctx.filter = colorFilter;
      // Draw nicely centered
      ctx.drawImage(sprite, 6, 6, w - 12, h - 12);
      ctx.restore();
    }
  });
};

Object.values(SPRITES).forEach(s => {
  if (s.complete && s.naturalWidth > 0) {
    setTimeout(window.drawSelectIcons, 10);
  } else {
    const old = s.onload;
    s.onload = function () {
      if (old) old.apply(this, arguments);
      window.drawSelectIcons();
    };
  }
});

window.addEventListener('load', () => {
  if (window.TossAPI) {
    TossAPI.init().then(() => {
      TossAPI.getUserInfo().then(info => {
        const heading = document.querySelector('.title-section h1');
        if (heading) heading.innerHTML = `${info.name}님 반가워요!<br>모험을 떠나볼까요?`;
      });
    });
  }
});

window.watchAdForPoints = function () {
  if (window.TossAPI) {
    TossAPI.showRewardAd(() => {
      const current = SAVE.get('points', 0);
      SAVE.set('points', current + 500);
      updateSelectScreen();
      openShop(); // refresh
      // alert
      const msg = document.createElement('div');
      msg.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:12px 24px;border-radius:24px;z-index:9999;font-weight:600;font-size:14px;';
      msg.textContent = '리워드 500 P가 지급되었습니다! 🎉';
      document.body.appendChild(msg);
      setTimeout(() => document.body.removeChild(msg), 2500);
    });
  }
};

window.drawShopIcons = function () {
  const chars = ['raccoon', 'fox', 'rabbit'];
  const sprites = [SPRITES.raccoon_idle, SPRITES.fox_idle, SPRITES.rabbit_idle];
  chars.forEach((cId, i) => {
    const canvas = document.getElementById('shopIcon_' + cId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const sprite = sprites[i];
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.save();
      const colorFilter = typeof getSkinFilter !== 'undefined' ? getSkinFilter(cId) : 'none';
      if (colorFilter && colorFilter !== 'none') ctx.filter = colorFilter;
      // 캐릭터를 캔버스 중앙에 조금 크게 그리기
      ctx.drawImage(sprite, 0, 0, w, h);
      ctx.restore();
    }
  });
};

window.toggleSetting = function (key) {
  const chk = document.getElementById('chk_' + key);
  if (!chk) return;
  const val = chk.checked;
  SAVE.set(key, val);
  if (key === 'opt_sfx') window.updateAudioVolume();
  if (key === 'opt_vibrate' && val && navigator.vibrate) navigator.vibrate(50); // 짧은 피드백
}

function openSettings() {
  const panel = document.getElementById('settingsPanel');
  if (!panel) return;
  panel.style.display = 'flex';

  const bgm = SAVE.get('opt_bgm', true);
  const sfx = SAVE.get('opt_sfx', true);
  const vib = SAVE.get('opt_vibrate', true);

  panel.innerHTML = `
    <div class="toss-app-bar">
      <button class="btn-icon" onclick="closePages()">←</button>
      <h2>설정</h2>
      <div style="width: 48px;"></div>
    </div>
    <div style="padding: 24px;">
       <div style="display:flex; justify-content:space-between; align-items:center; padding: 16px 0; border-bottom: 1px solid #E5E8EB;">
         <span style="font-weight:600; color:#191F28;">효과음</span>
         <label class="toss-switch"><input type="checkbox" id="chk_opt_sfx" ${sfx ? 'checked' : ''} onchange="toggleSetting('opt_sfx')"><span class="slider"></span></label>
       </div>
       <div style="display:flex; justify-content:space-between; align-items:center; padding: 16px 0; border-bottom: 1px solid #E5E8EB;">
         <span style="font-weight:600; color:#191F28;">진동</span>
         <label class="toss-switch"><input type="checkbox" id="chk_opt_vibrate" ${vib ? 'checked' : ''} onchange="toggleSetting('opt_vibrate')"><span class="slider"></span></label>
       </div>
       <div style="margin-top:24px; padding:16px; background:#F9FAFB; border-radius:12px; font-size:13px; color:#4E5968;">
         <p style="margin:0;">RACCOON ADVENTURE v1.0</p>
         <p style="margin:8px 0 0 0;">Toss 미니게임 플랫폼</p>
       </div>
    </div>
  `;
}

class Game {
  constructor(charId, stageIdx = 0) {
    this.c = document.getElementById('gameCanvas');
    this.ctx = this.c.getContext('2d');
    this.W = this.c.width;
    this.H = this.c.height;

    this.charId = charId || 'raccoon';
    this.charDef = CHAR_DEFS[this.charId] || CHAR_DEFS['raccoon']; // ★ 항상 유효한 값 보장
    this.stageIdx = stageIdx;
    this.score = 0;
    this.topScore = SAVE.get('topScore', 0);
    this.lives = 4;
    this.gameOver = false;
    this.running = false;
    this.animId = null;

    this.keys = { left: false, right: false, up: false, down: false, jump: false };
    this._jumpPressed = false;

    this.player = null;
    this.platforms = [];
    this.ladders = [];
    this.fruits = [];
    this.enemies = [];
    this.items = []; // 스테이지 아이템

    this.frameCount = 0;
    this.invincible = 0;

    // ── 콤보 ──
    this.combo = 0;
    this.comboTimer = 0;       // 콤보 유지 프레임 (180f = 3초)
    this.maxComboEver = 0;
    this.comboBroken = false;
    this.comboPopups = [];     // [{text, x, y, life}]
    this.particles = [];       // [{x, y, vx, vy, color, life}] - 파티클 효과

    // ── 타이머 ──
    this.stageTimer = 0;       // 프레임 단위
    this.stageTimeLimitF = 60 * 60; // 60초 (기본)

    // ── 아이템 효과 ──
    this.itemsUsed = 0;
    this.effectInvincible = 0; // 무적별 남은 프레임
    this.effectFreeze = 0;     // 시간정지 남은 프레임
    this.effectMagnet = 0;     // 자석 남은 프레임
    this.effectSpeed = 0;      // 속도부스트 남은 프레임

    // ── 데일리 ──
    this.daily = getTodayDaily();
    this.nodieThisStage = true;

    this._setupInput();
    this._setupTouch();
    this._loadStage();
  }

  // ── 입력 ──────────────────────────────────────────────
  _setupInput() {
    this._keydown = (e) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) this.keys.left = true;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) this.keys.right = true;
      if (['ArrowUp', 'w', 'W'].includes(e.key)) this.keys.up = true;
      if (['ArrowDown', 's', 'S'].includes(e.key)) this.keys.down = true;
      // ★ 스페이스바만 점프로 사용 (ArrowUp/W는 사다리 전용)
      if (e.key === ' ') {
        if (!this._jumpPressed) { this._doJump(); this._jumpPressed = true; }
      }
    };
    this._keyup = (e) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) this.keys.left = false;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) this.keys.right = false;
      if (['ArrowUp', 'w', 'W'].includes(e.key)) this.keys.up = false;
      if (['ArrowDown', 's', 'S'].includes(e.key)) this.keys.down = false;
      if (e.key === ' ') this._jumpPressed = false;
    };
    window.addEventListener('keydown', this._keydown);
    window.addEventListener('keyup', this._keyup);
  }

  _setupTouch() {
    // 🕹️ 조이스틱 로직
    const container = document.getElementById('joystick-container');
    const knob = document.getElementById('joystick-knob');
    if (container && knob) {
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxRadius = 35; // 노브가 움직일 최대 반경

      const handleJoystick = (e) => {
        e.preventDefault();
        const touch = e.targetTouches[0];
        if (!touch) return;

        // 컨테이너 기준 상대 좌표 계산
        const x = touch.clientX - (rect.left + window.scrollX) - centerX;
        const y = touch.clientY - (rect.top + window.scrollY) - centerY;

        const distance = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);

        // 노브 이동 제한 및 렌더링
        const moveDist = Math.min(distance, maxRadius);
        const knobX = Math.cos(angle) * moveDist;
        const knobY = Math.sin(angle) * moveDist;
        knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

        // 입력 키 매핑 (데드존 적용)
        // 이전 값과 비교하여 필요할 때만 업데이트
        const deadzone = 10; // 데드존 증가
        const threshold = 15; // 입력 인식 임계값 증가

        const newLeft = distance > deadzone && x < -threshold;
        const newRight = distance > deadzone && x > threshold;
        const newUp = distance > deadzone && y < -threshold;
        const newDown = distance > deadzone && y > threshold;

        // 값이 변경될 때만 업데이트
        if (this.keys.left !== newLeft) this.keys.left = newLeft;
        if (this.keys.right !== newRight) this.keys.right = newRight;
        if (this.keys.up !== newUp) this.keys.up = newUp;
        if (this.keys.down !== newDown) this.keys.down = newDown;
      };

      const resetJoystick = (e) => {
        if (e) e.preventDefault();
        knob.style.transform = 'translate(0px, 0px)';
        this.keys.left = false;
        this.keys.right = false;
        this.keys.up = false;
        this.keys.down = false;
      };

      container.addEventListener('touchstart', handleJoystick, { passive: false });
      container.addEventListener('touchmove', handleJoystick, { passive: false });
      container.addEventListener('touchend', resetJoystick, { passive: false });
      container.addEventListener('touchcancel', resetJoystick, { passive: false });
    }

    // 🚀 점프 버튼 (기존 로직 유지)
    const jumpEl = document.getElementById('btnJump');
    if (jumpEl) {
      jumpEl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jumpEl.classList.add('btn-active');
        if (!this._jumpPressed) { this._doJump(); this._jumpPressed = true; }
        if (this.charDef.dash) this._doDash();
      }, { passive: false });
      jumpEl.addEventListener('touchend', (e) => {
        e.preventDefault();
        jumpEl.classList.remove('btn-active');
        this._jumpPressed = false;
      }, { passive: false });
    }
  }

  _removeInput() {
    window.removeEventListener('keydown', this._keydown);
    window.removeEventListener('keyup', this._keyup);
  }

  // ── 점프 / 대시 ────────────────────────────────────────
  _doJump() {
    const p = this.player;
    if (!p) return;
    if (p.onGround) {
      // ★ 아래 키만 눌렸을 때(좌우 없이) 플랫폼 통과 시도
      // 조이스틱 대각선 입력 시 점프를 막지 않도록 수정
      if (this.keys.down && !this.keys.left && !this.keys.right) {
        const nearLadder = this._getNearLadder(p, false);
        if (!nearLadder) {
          p.fallThrough = 20; // 20프레임(약 0.33초) 동안 플랫폼 통과
        }
        // 사다리가 있으면 플랫폼 통과 하지 않음 (사다리 진입 대기)
        return; // 순수 아래 키 + 점프 = 사다리 내려가기/플랫폼 통과
      }
      p.vy = this.charDef.jumpForce;
      p.onGround = false;
      p.onLadder = false;
      p.doubleJumpUsed = false;
      SFX.jump(); // 🔊 점프 사운드
    } else if (this.charDef.doubleJump && !p.doubleJumpUsed) {
      p.vy = this.charDef.jumpForce * 0.85;
      p.doubleJumpUsed = true;
      SFX.jump(); // 🔊 2단 점프 사운드
    }
  }

  _doDash() {
    const p = this.player;
    if (!p || p.dashCooldown > 0) return;
    p.dashTimer = 12;
    p.dashCooldown = 50;
    p.dashDir = p.facingLeft ? -1 : 1;
    SFX.dash(); // 🔊 대시 사운드
  }

  // ── 스테이지 로드 ──────────────────────────────────────
  _loadStage() {
    const data = STAGES[Math.min(this.stageIdx, STAGES.length - 1)];

    this.platforms = data.platforms.map(p => ({ ...p }));
    this.ladders = data.ladders.map(l => ({ ...l }));
    this.fruits = data.fruits.map(f => ({ ...f, collected: false }));

    // 스테이지 아이템 스폰 (스테이지마다 1~2개 랜덤)
    this.items = [];
    const itemTypes = ['star', 'freeze', 'magnet', 'speed'];
    const numItems = 1 + (this.stageIdx % 3 === 0 ? 1 : 0);
    const rngItem = mulberry32(this.stageIdx * 9999 + 42);
    for (let i = 0; i < numItems; i++) {
      const pl = this.platforms[1 + Math.floor(rngItem() * (this.platforms.length - 1))];
      this.items.push({
        type: itemTypes[Math.floor(rngItem() * itemTypes.length)],
        x: pl.x + 20 + Math.floor(rngItem() * Math.max(1, pl.w - 40)),
        y: pl.y - 22,
        collected: false,
      });
    }
    // 플레이어 초기화 (적 안전구역 계산을 위해 먼저 위치 결정)
    const firstPlat = this.platforms[0];
    const spawnX = 30;

    this.enemies = data.enemies.map(e => {
      // 플레이어 스폰 위치에서 80px 이내면 반대편으로 밀어냄
      let ex = e.x;
      if (Math.abs(ex - spawnX) < 80) ex = Math.min(W - 40, ex + 120);
      return {
        ...e,
        x: ex,
        startX: ex,
        vx: e.speed,
        vy: 0,
        onGround: false,
        dir: 1,
        frame: 0,
        frameTimer: 0,
      };
    });

    this.player = {
      fallThrough: 0,
      x: spawnX,
      y: firstPlat.y - 32,
      w: 26, h: 28,
      vx: 0, vy: 0,
      onGround: false,
      onLadder: false,
      facingLeft: false,
      doubleJumpUsed: false,
      dashTimer: 0,
      dashCooldown: 0,
      dashDir: 1,
      frame: 0,
      frameTimer: 0,
      fallThrough: 0, // ★ 플랫폼 통과 타이머
    };
  }

  nextStage() {
    this.stageIdx++;
    if (this.stageIdx >= STAGES.length) {
      // 게임 클리어
      this._showOverlay('CLEAR!!', 'ALL ' + STAGES.length + ' STAGES COMPLETE!', 'MENU', true);
      return;
    }
    this._loadStage();
    this.running = true;
    this._loop();
  }

  // ── 메인 루프 ──────────────────────────────────────────
  start() {
    this.running = true;
    this._loop();
  }

  _loop() {
    if (!this.running) return;
    this._update();
    this._draw();
    this.animId = requestAnimationFrame(() => this._loop());
  }

  _update() {
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;

    if (this.hitStop > 0) { this.hitStop--; return; }
    this.frameCount++;
    if (this.invincible > 0) this.invincible--;

    const p = this.player;
    const def = this.charDef;
    const GRAVITY = 0.55;
    const FRICTION = 0.75;

    // 대시 쿨다운
    if (p.dashCooldown > 0) p.dashCooldown--;
    if (p.fallThrough > 0) p.fallThrough--;

    // ★ 플랫폼 통과 타이머 감소 (이미 위에서 감소했으므로 중복 제거)

    // 좌우 이동
    let moveX = 0;
    if (this.keys.left) { moveX = -def.speed; p.facingLeft = true; }
    if (this.keys.right) { moveX = def.speed; p.facingLeft = false; }

    // 대시 오버라이드
    if (p.dashTimer > 0) {
      moveX = p.dashDir * def.speed * 3.2;
      p.dashTimer--;
      // ✨ 대시 트레일 파티클
      if (this.frameCount % 2 === 0) {
        this._spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#ccccff', 3);
      }
    }

    // ══════════════════════════════════════════════════
    //  사다리 로직
    // ══════════════════════════════════════════════════

    // STEP 1: 사다리 진입 시도 (아직 안 탑승 중일 때만)
    if (!p.onLadder) {
      const entryL = this._getNearLadder(p, false);
      if (entryL) {
        const ladderTop = entryL.y - entryL.h; // 사다리 위쪽
        const ladderBottom = entryL.y;             // 사다리 아래쪽
        const playerBottom = p.y + p.h;
        const playerTop = p.y;

        // 위로 올라가기: 사다리 범위 내에서 UP 키
        if (this.keys.up) {
          // 플레이어가 사다리 근처에 있으면 진입 (범위 축소)
          if (playerBottom >= ladderTop - 15 && playerBottom <= ladderBottom + 15) {
            p.onLadder = true;
            p.onGround = false;
            p.x = entryL.x + 1;
            p.vx = 0;
            p.vy = 0;
          }
        }
        // 아래로 내려가기: 사다리 범위 내에서 DOWN 키
        else if (this.keys.down) {
          // 플레이어가 사다리 상단 근처에 있으면 진입 (범위 축소)
          if (playerBottom >= ladderTop - 10 && playerTop <= ladderTop + 20) {
            p.onLadder = true;
            p.onGround = false;
            p.x = entryL.x + 1;
            p.vx = 0;
            p.vy = 0;
          }
        }
      }
    }

    // STEP 2: 탑승 중 처리 (STEP 1 이후 p.onLadder 값으로 계산)
    if (p.onLadder) {
      const activeL = this._getNearLadder(p, true);

      // 좌우 방향키 또는 점프키로 사다리 이탈
      if (this._jumpPressed || this.keys.left || this.keys.right) {
        p.onLadder = false;
        p.ladderGrace = 0;
        if (this.keys.left) p.vx = -this.charDef.speed * 1.5;
        if (this.keys.right) p.vx = this.charDef.speed * 1.5;
      } else if (!activeL) {
        // 모든 사다리에서 완전히 벗어남 → 이탈
        p.onLadder = false;
        p.ladderGrace = 0;
      } else {
        p.ladderGrace = 0;
        // 쬈 방향부터 자연스럽게 이동 (경계 이탈 로직 제거)
        if (this.keys.up) { p.vy = -3.2; }
        else if (this.keys.down) { p.vy = 3.2; }
        else { p.vy = 0; } // 키 없으면 정지
        p.vx = 0;
        moveX = 0;
        p.onGround = false;
      }
    }

    // ── 중력 (사다리 위에선 적용 안 함) ──
    if (!p.onLadder) {
      p.vy += GRAVITY;
      p.vy = Math.min(p.vy, 14);
    }

    p.vx = moveX;
    p.x += p.vx;
    p.y += p.vy;

    // 벽 바운스
    if (p.x < 0) p.x = 0;
    if (p.x + p.w > W) p.x = W - p.w;

    // 바닥 아래로 떨어지면 사망
    if (p.y > H + 20) {
      this._loseLife();
      return;
    }

    // ── 플랫폼 충돌 ──
    p.onGround = false;
    for (const pl of this.platforms) {
      if (p.x + p.w > pl.x && p.x < pl.x + pl.w) {
        const prevBottom = p.y + p.h - p.vy;
        const platTop = pl.y;
        if (p.vy >= 0 && prevBottom <= platTop + 4 && p.y + p.h >= platTop) {
          // 사다리 타는 중엔 모든 플랫폼 통과
          if (p.onLadder) continue;
          // 아래 키 + fallThrough 중엔 통과 (바닥 제외)
          if (this.keys.down && p.fallThrough > 0 && pl !== this.platforms[0]) continue;
          p.y = platTop - p.h;
          p.vy = 0;
          p.onGround = true;
          p.doubleJumpUsed = false;
        }
        // 천장 충돌 (사다리 중엔 무시)
        if (!p.onLadder && p.vy < 0 && p.y <= pl.y + 8 && p.y >= pl.y) {
          p.y = pl.y + 8;
          p.vy = 0;
        }
      }
    }

    // 애니메이션 프레임
    p.frameTimer++;
    if (p.frameTimer > 8) { p.frame = (p.frame + 1) % 2; p.frameTimer = 0; }

    // ── 스테이지 타이머 ──
    this.stageTimer++;

    // ── 콤보 타이머 감소 ──
    if (this.combo > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        if (this.fruits.some(f => !f.collected)) {
          // 아직 과일 남아 있는데 콤보 끊김
          this.comboBroken = true;
        }
        this.combo = 0;
      }
    }

    // ── 아이템 효과 틱 ──
    if (this.effectInvincible > 0) this.effectInvincible--;
    if (this.effectFreeze > 0) this.effectFreeze--;
    if (this.effectMagnet > 0) this.effectMagnet--;
    if (this.effectSpeed > 0) this.effectSpeed--;

    // ── 팝업 틱 ──
    this.comboPopups = this.comboPopups.filter(cp => {
      cp.y -= 1; cp.life--;
      return cp.life > 0;
    });

    // ── 파티클 틱 ──
    this.particles = this.particles.filter(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.2; // 중력
      pt.vx *= 0.98; // 마찰
      pt.life--;
      return pt.life > 0;
    });

    // ── 자석 효과: 근처 과일 자동 수집 ──
    if (this.effectMagnet > 0) {
      for (const f of this.fruits) {
        if (f.collected) continue;
        const dx = (f.x + 10) - (p.x + p.w / 2);
        const dy = (f.y + 10) - (p.y + p.h / 2);
        if (Math.sqrt(dx * dx + dy * dy) < 80) {
          f.x -= dx * 0.12;
          f.y -= dy * 0.12;
        }
      }
    }

    // ── 과일 수집 ──
    for (const f of this.fruits) {
      if (f.collected) continue;
      const collectBox = this.effectMagnet > 0
        ? { x: f.x - 10, y: f.y - 10, w: 40, h: 40 }
        : { x: f.x, y: f.y, w: 20, h: 20 };
      if (this._rect(p, collectBox)) {
        f.collected = true;
        const pts = [100, 150, 200, 500];
        this.combo++;
        this.comboTimer = 180; // 3초 리셋
        if (this.combo > this.maxComboEver) this.maxComboEver = this.combo;
        const multiplier = Math.min(this.combo, 10);
        const earned = pts[f.t] * (this.stageIdx + 1) * multiplier;
        this.score += earned;
        if (this.score > this.topScore) {
          this.topScore = this.score;
          SAVE.set('topScore', this.topScore);
        }
        // 콤보 팝업
        const popText = this.combo >= 2 ? `x${this.combo} COMBO! +${earned}` : `+${earned}`;
        this.comboPopups.push({ text: popText, x: f.x, y: f.y - 10, life: 60, combo: this.combo });
        // 🔊 사운드
        if (this.combo >= 2) SFX.combo();
        else SFX.coin();
        // ✨ 파티클 생성
        this._spawnParticles(f.x + 10, f.y + 10, this.combo >= 2 ? '#ffff00' : '#00ffff', 8);
        // 미션: 과일 총 수집
        SAVE.set('totalFruits', SAVE.get('totalFruits', 0) + 1);
        if (this.combo >= 5) SAVE.set('maxCombo5', 1);
        if (this.combo >= 10) SAVE.set('maxCombo10', 1);
      }
    }

    // ── 스테이지 아이템 수집 ──
    for (const it of this.items) {
      if (it.collected) continue;
      if (this._rect(p, { x: it.x, y: it.y, w: 22, h: 22 })) {
        it.collected = true;
        this.itemsUsed++;
        if (it.type === 'star') { this.effectInvincible = 300; this.invincible = 300; }
        if (it.type === 'freeze') { this.effectFreeze = 240; }
        if (it.type === 'magnet') { this.effectMagnet = 300; }
        if (it.type === 'speed') { this.effectSpeed = 240; }
        this.comboPopups.push({ text: it.type.toUpperCase() + '!', x: it.x, y: it.y - 10, life: 80, combo: 0 });
        SFX.item(); // 🔊 아이템 획득 사운드
        // ✨ 아이템 파티클 (더 화려하게)
        this._spawnParticles(it.x + 11, it.y + 11, '#ff88ff', 12);
      }
    }

    // ── 스테이지 클리어 체크 ──
    const remaining = this.fruits.filter(f => !f.collected).length;
    if (remaining === 0) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      this.running = false;
      cancelAnimationFrame(this.animId);

      // TIME BONUS
      const elapsedSec = Math.floor(this.stageTimer / 60);
      const timeBonus = Math.max(0, (90 - elapsedSec) * 10 * (this.stageIdx + 1));
      this.score += timeBonus;
      if (this.score > this.topScore) { this.topScore = this.score; SAVE.set('topScore', this.topScore); }

      // 클리어 스테이지 저장
      const prev = SAVE.get('clearedStage', 0);
      if (this.stageIdx + 1 > prev) SAVE.set('clearedStage', this.stageIdx + 1);

      // 목숨 유지 클리어 미션
      if (this.nodieThisStage) SAVE.set('nodieClears', SAVE.get('nodieClears', 0) + 1);

      // 데일리 체크
      const dailyOk = this.daily.check(this);
      if (dailyOk) {
        const today = this.daily.date;
        if (SAVE.get('dailyDate', '') !== today) {
          SAVE.set('dailyDate', today);
          SAVE.set('dailyDone', true);
          this.score += 2000;
        }
      }

      this._draw();
      SFX.clear(); // 🔊 스테이지 클리어 사운드
      const isLast = this.stageIdx + 1 >= STAGES.length;
      setTimeout(() => {
        const bonusLine = timeBonus > 0 ? `\nTIME BONUS +${timeBonus}` : '';
        this._showOverlay(
          isLast ? 'ALL CLEAR!!' : 'STAGE CLEAR!',
          `SCORE: ${this.score}${bonusLine}`,
          isLast ? 'FINISH' : 'NEXT STAGE',
          isLast
        );
      }, 400);
      return;
    }

    // ── 적 업데이트 (시간정지 중엔 스킵) ──
    if (this.effectFreeze === 0) {
      for (const e of this.enemies) {
        this._updateEnemy(e);
      }
    }

    // ── 적 충돌 (무적별 효과 중엔 면제) ──
    if (this.invincible === 0 && this.effectInvincible === 0) {
      const ph = { x: p.x + 4, y: p.y + 4, w: p.w - 8, h: p.h - 6 };
      for (const e of this.enemies) {
        const eh = { x: e.x + 4, y: e.y + 3, w: 16, h: 16 };
        if (this._rect(ph, eh)) {
          this._loseLife();
          return;
        }
      }
    }
  }

  _checkLadder(p) {
    return this._getNearLadder(p, false) !== null;
  }

  // 레거시 호환
  _getLadder(p, sticky = false) {
    return this._getNearLadder(p, sticky);
  }

  /**
   * 가장 가까운 사다리를 반환 (AABB 격리 기반)
   * @param {Object} p - 플레이어
   * @param {boolean} sticky - true: 탑승 중 (너그러운 범위), false: 진입 탐지
   */
  _getNearLadder(p, sticky) {
    const pL = p.x;
    const pR = p.x + p.w;
    const pCenterX = (pL + pR) / 2;

    // X축: 실제로 겹쳐야 감지 (패딩 최소화)
    const xPad = sticky ? 4 : 2;
    // Y축: 진입/탑승 모두 좁은 범위로 통일
    const yTopPad = sticky ? 8 : 12;
    const yBotPad = sticky ? 8 : 12;

    let best = null;
    let bestDist = Infinity;
    for (const l of this.ladders) {
      const lL = l.x - xPad;
      const lR = l.x + 20 + xPad;
      const lCenterX = l.x + 10;

      // X축 AABB 충돌 체크
      if (pR > lL && pL < lR) {
        const lyTop = l.y - l.h - yTopPad;
        const lyBot = l.y + yBotPad;

        // Y축 범위 체크
        if (p.y + p.h > lyTop && p.y < lyBot) {
          // 플레이어 중심과 사다리 중심 거리로 우선순위 결정
          const dist = Math.abs(pCenterX - lCenterX);
          if (dist < bestDist) {
            bestDist = dist;
            best = l;
          }
        }
      }
    }
    return best;
  }

  _rect(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
      a.y < b.y + b.h && a.y + a.h > b.y;
  }

  _updateEnemy(e) {
    const GRAVITY = 0.55;
    e.frameTimer = (e.frameTimer || 0) + 1;
    if (e.frameTimer > 10) { e.frame = (e.frame + 1) % 2; e.frameTimer = 0; }

    if (e.type === 'bounce') {
      // 통통 튀기는 적
      if (e.onGround) {
        e.vy = -8 - Math.random() * 2;
        e.vx = e.dir * e.speed;
      }
      e.vy += GRAVITY;
      e.x += e.vx;
      e.y += e.vy;

      if (e.x < e.startX - e.range || e.x > e.startX + e.range) {
        e.dir *= -1;
        e.vx *= -1;
      }
      if (e.x < 0) { e.x = 0; e.dir = 1; e.vx = Math.abs(e.vx); }
      if (e.x + 24 > W) { e.x = W - 24; e.dir = -1; e.vx = -Math.abs(e.vx); }
    } else {
      // 평지 순찰
      e.x += e.vx * e.dir;
      if (e.x < e.startX - e.range || e.x > e.startX + e.range) {
        e.dir *= -1;
      }
      if (e.x < 0) { e.x = 0; e.dir = 1; }
      if (e.x + 24 > W) { e.x = W - 24; e.dir = -1; }
    }

    // 플랫폼 착지
    e.onGround = false;
    for (const pl of this.platforms) {
      if (e.x + 24 > pl.x && e.x < pl.x + pl.w) {
        const prevBottom = e.y + 22 - e.vy;
        if (e.vy >= 0 && prevBottom <= pl.y + 2 && e.y + 22 >= pl.y) {
          e.y = pl.y - 22;
          e.vy = 0;
          e.onGround = true;
        }
      }
    }

    if (!e.onGround && e.type !== 'bounce') {
      e.vy += GRAVITY;
      e.y += e.vy;
      e.vy = Math.min(e.vy, 14);
      for (const pl of this.platforms) {
        if (e.x + 24 > pl.x && e.x < pl.x + pl.w) {
          const prevBottom = e.y + 22 - e.vy;
          if (e.vy >= 0 && prevBottom <= pl.y + 2 && e.y + 22 >= pl.y) {
            e.y = pl.y - 22;
            e.vy = 0;
            e.onGround = true;
          }
        }
      }
    }
  }

  _loseLife() {
    this.lives--;
    this.combo = 0;
    this.comboBroken = true;
    this.nodieThisStage = false;
    SFX.hit(); // 🔊 피해 사운드
    if (this.lives <= 0) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      this.running = false;
      cancelAnimationFrame(this.animId);
      this.gameOver = true;
      this._draw();
      SFX.gameOver(); // 🔊 게임 오버 사운드
      setTimeout(() => {
        this._showOverlay('GAME OVER', `SCORE: ${this.score}`, 'RETRY', false);
      }, 300);
    } else {
      this.invincible = 120;
      const firstPlat = this.platforms[0];
      this.player.x = 30;
      this.player.y = firstPlat.y - 32;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.onGround = false;
      this.player.onLadder = false;
      this.player.fallThrough = 0;
    }
  }

  _showOverlay(title, msg, btnText, backToMenu) {
    const overlay = document.getElementById('overlay');
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMsg').textContent = msg;
    const btn = document.getElementById('overlayBtn');
    btn.textContent = btnText;
    overlay.style.display = 'flex';

    btn.onclick = () => {
      overlay.style.display = 'none';
      if (backToMenu) {
        document.getElementById('selectScreen').style.display = 'flex';
        document.getElementById('controls').style.display = 'none';
        this._removeInput();
      } else {
        // RETRY: restart current stage
        this._removeInput();
        // DOM에서 선택된 캐릭터 다시 읽기 (stale this.charId 피하기)
        const selCard = document.querySelector('.charCard.selected');
        const retryCharId = selCard ? selCard.getAttribute('data-char') : (this.charId || 'raccoon');
        const retryStage = (typeof this.stageIdx === 'number') ? this.stageIdx : 0;
        if (window.game) {
          window.game.running = false;
          cancelAnimationFrame(window.game.animId);
        }
        window.game = new Game(retryCharId, retryStage);
        window.game.start();
      }
    };
    // HTML onclick="handleOverlayBtn()" 속성을 위한 global 노출
    window.handleOverlayBtn = () => btn.onclick();
  }

  // ── 파티클 생성 ────────────────────────────────────────
  _spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 1.5 + Math.random() * 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        color,
        life: 30 + Math.floor(Math.random() * 15),
      });
    }
  }

  // ── 렌더 ──────────────────────────────────────────────
  _draw() {
    const ctx = this.ctx;
    const c = this.ctx;
    const W = this.W;
    const H = this.H;

    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, W, H);

    // 배경 별
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 40; i++) {
      const bx = (i * 73 + this.stageIdx * 11) % W;
      const by = (i * 137) % (H - 130);
      ctx.fillRect(bx, by, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }

    // 플랫폼 — 사다리가 지나가는 x 구간은 빈칸으로 남기고 좌우만 그림
    for (const pl of this.platforms) {
      // 이 플랫폼 위에 올라오는 사다리 x 구간 수집
      const cuts = [];
      for (const l of this.ladders) {
        const lx = l.x;
        // 사다리가 이 플랫폼 y에 닿는지: l.y(아랫끝) ≈ pl.y  OR  l.y - l.h(윗끝) ≈ pl.y
        const atBottom = Math.abs(l.y - pl.y) <= 4;
        const atTop = Math.abs((l.y - l.h) - pl.y) <= 4;
        if ((atBottom || atTop) && lx >= pl.x - 2 && lx + 20 <= pl.x + pl.w + 2) {
          cuts.push({ x: lx, w: 20 });
        }
      }

      // 플랫폼을 cut 구간 제외하고 조각내어 그리기
      const drawPlatSegment = (sx, sw) => {
        if (sw <= 0) return;
        ctx.fillStyle = '#1144aa';
        ctx.fillRect(sx, pl.y, sw, 12);
        ctx.fillStyle = '#2266dd';
        ctx.fillRect(sx, pl.y, sw, 3);
        ctx.fillStyle = '#0a2255';
        ctx.fillRect(sx, pl.y + 9, sw, 3);
        ctx.fillStyle = '#3388ff';
        for (let rx = sx + 8; rx < sx + sw - 4; rx += 24) {
          ctx.fillRect(rx, pl.y + 4, 4, 4);
        }
      };

      if (cuts.length === 0) {
        drawPlatSegment(pl.x, pl.w);
      } else {
        // cuts 정렬
        cuts.sort((a, b) => a.x - b.x);
        let cursor = pl.x;
        for (const cut of cuts) {
          drawPlatSegment(cursor, cut.x - cursor);
          cursor = cut.x + cut.w;
        }
        drawPlatSegment(cursor, pl.x + pl.w - cursor);
      }
    }

    // 사다리 — 플랫폼 위에 그림 (항상 보임)
    for (const l of this.ladders) {
      const top = l.y - l.h;
      const bot = l.y;
      // 세로 봉
      ctx.fillStyle = '#999999';
      ctx.fillRect(l.x + 3, top, 4, bot - top);
      ctx.fillRect(l.x + 13, top, 4, bot - top);
      // 가로 발판
      ctx.fillStyle = '#cccccc';
      for (let ry = bot - 8; ry >= top + 4; ry -= 16) {
        ctx.fillRect(l.x + 1, ry, 18, 3);
      }
    }

    // 과일
    for (const f of this.fruits) {
      if (f.collected) continue;
      if (this.frameCount % 60 < 30) {
        drawFruit(ctx, f.x, f.y, f.t);
      } else {
        ctx.globalAlpha = 0.75;
        drawFruit(ctx, f.x, f.y, f.t);
        ctx.globalAlpha = 1.0;
      }
    }

    // 스테이지 아이템
    for (const it of this.items) {
      if (it.collected) continue;
      drawStageItem(ctx, it.x, it.y, it.type, this.frameCount);
    }

    // 적 (시간정지 중엔 반투명)
    if (this.effectFreeze > 0) ctx.globalAlpha = 0.5;
    for (const e of this.enemies) {
      drawEnemy(ctx, Math.round(e.x), Math.round(e.y), 24, 22, e.type, e.frame);
    }
    ctx.globalAlpha = 1.0;

    // 플레이어
    const p = this.player;
    // 무적 깜빡임
    if (this.invincible > 0 && Math.floor(this.invincible / 6) % 2 === 0) {
      // 깜빡 - 건너뜀
    } else {
      const isJumping = !p.onGround && !p.onLadder;
      const isMoving = Math.abs(p.vx) > 0.1;

      if (this.charId === 'raccoon') {
        drawRaccoon(ctx, Math.round(p.x), Math.round(p.y), p.w, p.h, this.charDef, p.frame, p.facingLeft, isJumping, isMoving);
      } else if (this.charId === 'fox') {
        drawFox(ctx, Math.round(p.x), Math.round(p.y), p.w, p.h, this.charDef, p.frame, p.facingLeft, isJumping, isMoving);
      } else {
        drawRabbit(ctx, Math.round(p.x), Math.round(p.y), p.w, p.h, this.charDef, p.frame, p.facingLeft, p.dashTimer > 0, isJumping, isMoving);
      }
    }

    // ── HUD ──
    this._drawHUD();
  }

  _drawHUD() {
    const p = this.player;

    // 상단 바
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, W, 38);

    // 점수
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px "Courier New"';
    ctx.fillText('1UP', 6, 11);
    ctx.fillStyle = '#00ffff'; ctx.font = 'bold 12px "Courier New"';
    ctx.fillText(String(this.score).padStart(7, '0'), 4, 26);

    // TOP SCORE
    ctx.fillStyle = '#ffff00'; ctx.font = 'bold 9px "Courier New"';
    ctx.fillText('TOP', W / 2 - 28, 11);
    ctx.fillStyle = '#ff6666'; ctx.font = 'bold 12px "Courier New"';
    ctx.fillText(String(this.topScore).padStart(7, '0'), W / 2 - 38, 26);

    // STAGE + 하트
    ctx.fillStyle = '#00ffff'; ctx.font = 'bold 9px "Courier New"';
    ctx.fillText('ST.' + (this.stageIdx + 1), W - 48, 11);
    ctx.fillStyle = '#ff2244';
    for (let i = 0; i < this.lives; i++) {
      ctx.font = '11px sans-serif';
      ctx.fillText('♥', W - 12 - i * 14, 26);
    }

    // 타이머
    const sec = Math.floor(this.stageTimer / 60);
    const timerColor = sec > 50 ? '#ff4444' : sec > 35 ? '#ffaa00' : '#88ff88';
    ctx.fillStyle = timerColor; ctx.font = 'bold 10px "Courier New"';
    ctx.fillText(`${String(sec).padStart(3, '0')}s`, W / 2 + 20, 11);

    // 콤보 표시
    if (this.combo >= 2) {
      const flash = Math.floor(this.comboTimer / 10) % 2 === 0;
      ctx.fillStyle = flash ? '#ffff00' : '#ff8800';
      ctx.font = `bold ${12 + Math.min(this.combo, 8)}px "Courier New"`;
      ctx.fillText(`x${this.combo} COMBO`, 4, 50);
    }

    // 아이템 효과 아이콘
    let ix = 4;
    const drawEffect = (label, color, frames, total) => {
      const pct = frames / total;
      ctx.fillStyle = color; ctx.font = '9px Courier New';
      ctx.fillText(label, ix, 62);
      ctx.fillStyle = '#333';
      ctx.fillRect(ix, 64, 36, 4);
      ctx.fillStyle = color;
      ctx.fillRect(ix, 64, 36 * pct, 4);
      ix += 42;
    };
    if (this.effectInvincible > 0) drawEffect('★STAR', '#ffff00', this.effectInvincible, 300);
    if (this.effectFreeze > 0) drawEffect('❄STOP', '#88ddff', this.effectFreeze, 240);
    if (this.effectMagnet > 0) drawEffect('⊕MAGNET', '#ff88ff', this.effectMagnet, 300);
    if (this.effectSpeed > 0) drawEffect('⚡SPEED', '#88ff44', this.effectSpeed, 240);

    // 대시 쿨다운 (토끼)
    if (this.charId === 'rabbit') {
      const cd = p.dashCooldown;
      ctx.fillStyle = '#222244'; ctx.fillRect(W - 46, 40, 40, 5);
      ctx.fillStyle = cd === 0 ? '#44ffaa' : '#ffaa22';
      ctx.fillRect(W - 46, 40, 40 * (1 - cd / 50), 5);
      ctx.fillStyle = '#aaa'; ctx.font = '8px Courier New';
      ctx.fillText('DASH', W - 46, 54);
    }
    // 2단점프 (여우)
    if (this.charId === 'fox' && !p.onGround) {
      ctx.fillStyle = p.doubleJumpUsed ? '#444' : '#ffff00';
      ctx.fillRect(W - 20, 40, 14, 14);
      ctx.fillStyle = '#000'; ctx.font = 'bold 9px Courier New';
      ctx.fillText('2X', W - 19, 51);
    }

    // 남은 과일
    const rem = this.fruits.filter(f => !f.collected).length;
    ctx.fillStyle = '#ffaa00'; ctx.font = '9px Courier New';
    ctx.fillText(`LEFT:${rem}`, W / 2 - 16, H - 136);

    // 파티클
    for (const pt of this.particles) {
      const alpha = Math.min(1, pt.life / 15);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x - 2), Math.round(pt.y - 2), 4, 4);
    }
    ctx.globalAlpha = 1;

    // 콤보 팝업
    for (const cp of this.comboPopups) {
      const alpha = Math.min(1, cp.life / 20);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = cp.combo >= 5 ? '#ffff00' : cp.combo >= 2 ? '#ff8800' : '#ffffff';
      ctx.font = `bold ${cp.combo >= 5 ? 14 : 11}px "Courier New"`;
      ctx.fillText(cp.text, Math.max(2, Math.min(W - 80, cp.x)), cp.y);
      ctx.globalAlpha = 1;
    }

    // 데일리 챌린지 진행 상태 (위쪽 HUD 두 번째 줄)
    const dailyDone = SAVE.get('dailyDate', '') === this.daily.date && SAVE.get('dailyDone', false);
    if (!dailyDone) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 30, W, 14);
      ctx.fillStyle = '#ffcc00';
      ctx.font = '7px Courier New';
      ctx.fillText('DAILY: ' + this.daily.label, 4, 40);
    }
  }
}

// ────────────────────────────────────────────────────────────
//  스테이지 아이템 드로우
// ────────────────────────────────────────────────────────────
function drawStageItem(c, x, y, type, frame) {
  const pulse = Math.sin(frame * 0.1) * 2;
  c.save();
  c.translate(x + 11, y + 11);
  if (type === 'star') {
    // 노란 별
    c.fillStyle = frame % 20 < 10 ? '#ffff00' : '#ffcc00';
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 - 90) * Math.PI / 180;
      const r = 9 + pulse;
      c.fillRect(Math.cos(a) * r - 2, Math.sin(a) * r - 2, 4, 4);
    }
    c.fillStyle = '#fff';
    c.fillRect(-3, -3, 6, 6);
  } else if (type === 'freeze') {
    // 파란 결정
    c.fillStyle = '#88ddff';
    c.fillRect(-2, -9 - pulse, 4, 18 + pulse * 2);
    c.fillRect(-9 - pulse, -2, 18 + pulse * 2, 4);
    c.fillStyle = '#ffffff';
    c.fillRect(-2, -2, 4, 4);
  } else if (type === 'magnet') {
    // 자홍 자석
    c.fillStyle = '#ff44cc';
    c.fillRect(-8, -9, 7, 12);
    c.fillRect(1, -9, 7, 12);
    c.fillStyle = '#ff88ff';
    c.fillRect(-8, -9, 16, 5);
    c.fillStyle = '#4444ff';
    c.fillRect(-8, 3, 7, 5);
    c.fillStyle = '#ff4444';
    c.fillRect(1, 3, 7, 5);
  } else {
    // 초록 번개 (속도)
    c.fillStyle = '#88ff44';
    c.fillRect(-1, -9 - pulse, 6, 9);
    c.fillRect(-6, -1, 12, 4);
    c.fillRect(-5, 2, 6, 8 + pulse);
    c.fillStyle = '#ccff88';
    c.fillRect(-1, -6, 3, 5);
  }
  c.restore();
}

// ────────────────────────────────────────────────────────────
//  미션 패널 (선택 화면에서 열기)
// ────────────────────────────────────────────────────────────
function openMissions() {
  const panel = document.getElementById('missionPanel');
  if (!panel) return;
  panel.innerHTML = '';

  const title = document.createElement('div');
  title.style.cssText = 'color:#00ffff;font-size:14px;letter-spacing:3px;margin-bottom:10px;';
  title.textContent = '▶ MISSIONS';
  panel.appendChild(title);

  for (const m of MISSIONS) {
    const progress = Math.min(SAVE.get(m.key, 0), m.max);
    const done = progress >= m.max;
    const row = document.createElement('div');
    row.style.cssText = `margin-bottom:8px;opacity:${done ? 0.5 : 1}`;
    row.innerHTML = `
      <div style="font-size:10px;color:${done ? '#44ff88' : '#ccc'};margin-bottom:2px;">
        ${done ? '✅' : '⬜'} ${m.label} <span style="color:#ffff00">+${m.reward}pt</span>
      </div>
      <div style="background:#222;height:5px;width:100%;border:1px solid #444;">
        <div style="background:${done ? '#44ff88' : '#00aaff'};height:100%;width:${(progress / m.max) * 100}%"></div>
      </div>
      <div style="font-size:9px;color:#666;">${progress} / ${m.max}</div>
    `;
    panel.appendChild(row);
  }

  const daily = getTodayDaily();
  const dailyDone = SAVE.get('dailyDate', '') === daily.date && SAVE.get('dailyDone', false);
  const drow = document.createElement('div');
  drow.style.cssText = 'margin-top:10px;padding:8px;border:1px solid #ffcc00;';
  drow.innerHTML = `
    <div style="font-size:10px;color:#ffcc00;margin-bottom:4px;">📅 TODAY'S CHALLENGE</div>
    <div style="font-size:10px;color:${dailyDone ? '#44ff88' : '#fff'};">${dailyDone ? '✅ COMPLETED!' : daily.label}</div>
    ${dailyDone ? '' : '<div style="font-size:9px;color:#aaa;margin-top:2px;">클리어 시 +2000점</div>'}
  `;
  panel.appendChild(drow);

  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

let game;

window.selectChar = function (el, cId) {
  document.querySelectorAll('.charCard').forEach(c => c.classList.remove('selected'));
  if (el) el.classList.add('selected');
};

window.closePages = function () {
  document.querySelectorAll('.toss-page').forEach(p => p.style.display = 'none');
};

const CHAR_UNLOCK = {
  raccoon: { unlocked: true, condition: null, label: '' },
  fox: { unlocked: false, condition: s => s >= 3, label: 'STAGE 3 CLEAR' },
  rabbit: { unlocked: false, condition: s => s >= 7, label: 'STAGE 7 CLEAR' },
};

window.getUnlocked = function () {
  const clearedStage = SAVE.get('clearedStage', 0);
  const result = {};
  for (const [id, def] of Object.entries(CHAR_UNLOCK)) {
    result[id] = def.unlocked || (def.condition && def.condition(clearedStage));
  }
  return result;
};

const DAILY_TYPES = [
  { id: 'speedrun', label: '⚡ 제한시간 60초 안에 클리어!', check: g => g.stageTimer <= 60 * 60 },
  { id: 'noitem', label: '🚫 아이템 없이 클리어!', check: g => g.itemsUsed === 0 },
  { id: 'fullcombo', label: '🔥 콤보 끊기지 않고 전부 수집!', check: g => g.comboBroken === false },
  { id: 'lives4', label: '❤ 목숨 4개 유지로 클리어!', check: g => g.lives >= 4 },
];

window.getTodayDaily = function () {
  const today = new Date().toISOString().slice(0, 10);
  const idx = today.split('-').reduce((a, v) => a + parseInt(v), 0) % DAILY_TYPES.length;
  return { ...DAILY_TYPES[idx], date: today };
};

window.startGame = function () {
  document.getElementById('selectScreen').style.display = 'none';
  document.getElementById('controls').style.display = 'flex';
  const bCta = document.getElementById('bottomCtaBtn');
  if (bCta) bCta.style.display = 'none';

  const selCard = document.querySelector('.charCard.selected');
  const cId = selCard ? selCard.getAttribute('data-char') : 'raccoon';

  if (window.game) {
    window.game.running = false;
    cancelAnimationFrame(window.game.animId);
  }

  const startStage = parseInt(SAVE.get('clearedStage', 0)) || 0;
  window.game = new Game(cId, startStage);
  window.game.start();

  if (SAVE.get('opt_bgm', true) && typeof SFX !== 'undefined') {
    if (typeof SFX.playBGM === 'function') SFX.playBGM();
  }
};

window.onload = () => {
  // 캐릭터 선택 화면 초기화
  if (typeof updateSelectScreen === 'function') updateSelectScreen();
  if (typeof drawSelectIcons === 'function') drawSelectIcons();

  // 아이콘 애니메이션 (1초마다 업데이트)
  setInterval(() => {
    const selectScreen = document.getElementById('selectScreen');
    if (selectScreen && selectScreen.style.display !== 'none') {
      if (typeof drawSelectIcons === 'function') drawSelectIcons();
    }
  }, 1000);
};
