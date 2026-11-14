// Okyanus sahnesi: tek bir SVG belgesi, CSS ve SMIL animasyonlarıyla.
// Görünüm kutusu 1600x1000; canlılar kenarlarda ve arka planda kalır,
// ortadaki sohbet sütunu buzlu panelin arkasında sakin kalır.

import type { OkyanusMotion, OkyanusScheme } from '../types'

type Palette = {
  top: string
  mid: string
  deep: string
  sandTop: string
  sandBottom: string
  ray: string
  rayOpacity: number
  coral: string
  coralSoft: string
  teal: string
  tealDeep: string
  weedA: string
  weedB: string
  dolphin: string
  dolphinBelly: string
  shell: string
  plate: string
  skin: string
  turtleBelly: string
  jelly: string
  jellyGlow: string
  jellyOpacity: number
  bubble: string
  starA: string
  starB: string
  eye: string
  snow: string
  rock: string
}

const PALETTES: Record<OkyanusScheme, Palette> = {
  koyu: {
    top: '#0e4d6e',
    mid: '#08304f',
    deep: '#03172a',
    sandTop: '#1f4a58',
    sandBottom: '#122f3c',
    ray: '#aeeeff',
    rayOpacity: 0.11,
    coral: '#ff7f6b',
    coralSoft: '#ffa48f',
    teal: '#2ec4b6',
    tealDeep: '#178a80',
    weedA: '#1c8a74',
    weedB: '#2fb59b',
    dolphin: '#5d9fc7',
    dolphinBelly: '#d3ecf7',
    shell: '#3aa98a',
    plate: '#2a8068',
    skin: '#8fd4b1',
    turtleBelly: '#e6d7a3',
    jelly: '#ff9fcb',
    jellyGlow: '#ffd0e6',
    jellyOpacity: 0.62,
    bubble: '#c4f4ff',
    starA: '#ff8a65',
    starB: '#ffc56b',
    eye: '#062238',
    snow: '#cfefff',
    rock: '#163b4a',
  },
  acik: {
    top: '#dff8f5',
    mid: '#a6e3df',
    deep: '#73cbc8',
    sandTop: '#f6e7c6',
    sandBottom: '#e9d2a2',
    ray: '#ffffff',
    rayOpacity: 0.42,
    coral: '#f2674f',
    coralSoft: '#f7907c',
    teal: '#13a195',
    tealDeep: '#0d7f75',
    weedA: '#1f9a7f',
    weedB: '#3cbf9f',
    dolphin: '#3f87b5',
    dolphinBelly: '#e6f5fb',
    shell: '#2f9e80',
    plate: '#237a62',
    skin: '#86cfa9',
    turtleBelly: '#f1e2ae',
    jelly: '#f27fb4',
    jellyGlow: '#ffd3e7',
    jellyOpacity: 0.55,
    bubble: '#ffffff',
    starA: '#f26b4a',
    starB: '#f5ab3c',
    eye: '#163246',
    snow: '#ffffff',
    rock: '#d9bf8c',
  },
}

// Tekrarlanabilir sözde rastgele sayılar: sahne her çizimde aynı kalır.
const rng = (seed: number) => () => {
  seed = (seed * 9301 + 49297) % 233280

  return seed / 233280
}

const n = (v: number) => Math.round(v * 10) / 10

export const buildScene = (scheme: OkyanusScheme, motion: OkyanusMotion): string => {
  const p = PALETTES[scheme]
  const isMoving = motion !== 'durgun'
  const isFull = motion === 'tam'
  // Azaltılmış modda her şey ~2,3 kat yavaş, bazı ayrıntılar kapalı.
  const f = isFull ? 1 : 2.3
  const s = (sec: number) => `${n(sec * f)}s`
  const cls = (name: string) => (isMoving ? ` class="${name}"` : '')

  // ---- Işık huzmeleri ----
  const rays = [
    { x: 260, w: 120, tilt: 160, delay: 0 },
    { x: 520, w: 70, tilt: 120, delay: -5 },
    { x: 860, w: 150, tilt: 180, delay: -9 },
    { x: 1180, w: 90, tilt: 140, delay: -3 },
    { x: 1420, w: 130, tilt: 170, delay: -12 },
  ]
    .map(
      (r, i) =>
        `<polygon${cls('ray')} style="animation-delay:${n(r.delay * f)}s;animation-duration:${s(13 + i * 2.5)}" points="${r.x},-20 ${r.x + r.w},-20 ${r.x + r.w + r.tilt + 90},1000 ${r.x + r.tilt - 40},1000" fill="url(#rayGrad)"/>`,
    )
    .join('')

  // ---- Deniz karı (koyu modda sabit, minik parçacıklar) ----
  const rnd = rng(7)
  const snow = Array.from({ length: scheme === 'koyu' ? 46 : 18 }, () => {
    const x = n(rnd() * 1600)
    const y = n(rnd() * 820)
    const r = n(0.8 + rnd() * 1.6)

    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.snow}" opacity="${n(0.12 + rnd() * 0.25)}"/>`
  }).join('')

  // ---- Yunus (sağa bakar) ----
  const dolphinShape = `
    <g class="dolphin-body">
      <path${cls('fluke')} d="M8,40 C-4,32 -14,22 -26,20 C-20,32 -20,46 -26,58 C-14,56 -4,48 8,44 Z" fill="${p.dolphin}"/>
      <path d="M100,12 C96,-2 84,-12 66,-17 C74,-6 74,4 70,14 Z" fill="${p.dolphin}"/>
      <path d="M0,40 C22,22 62,10 104,10 C124,10 140,13 148,22 C153,27 156,30 162,31 L178,33 C183,34 183,40 178,41 L158,43 C150,52 130,58 104,59 C70,61 30,53 0,40 Z" fill="${p.dolphin}"/>
      <path d="M44,51 C74,59 112,57 136,50 C146,47 152,44 158,43 L176,41 C168,45 160,46 154,47 C140,58 120,62 96,62 C76,62 58,58 44,51 Z" fill="${p.dolphinBelly}" opacity="0.92"/>
      <path${cls('pec')} d="M106,50 C104,62 96,72 86,75 C90,66 92,58 92,51 Z" fill="${p.dolphin}" opacity="0.95"/>
      <circle cx="140" cy="27" r="3.6" fill="${p.eye}"/>
      <circle cx="141.3" cy="25.7" r="1.2" fill="#ffffff"/>
      <path d="M158,43 C164,41 171,40 176,40" stroke="${p.eye}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.55"/>
      <ellipse cx="134" cy="37" rx="5" ry="2.6" fill="${p.coralSoft}" opacity="0.5"/>
      <path d="M118,14 C126,12 136,14 142,19" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.35"/>
    </g>`

  // Yunus rotası: soldan girer, ortada bir kez kavisli zıplar, sağdan çıkar,
  // sonra döngünün geri kalanında ekran dışında bekler.
  const dolphinFrames: string[] = []
  const pushFrame = (pct: number, x: number, y: number, rot: number) =>
    dolphinFrames.push(`${n(pct)}%{transform:translate(${n(x)}px,${n(y)}px) rotate(${n(rot)}deg)}`)
  pushFrame(0, -320, 230, 0)
  pushFrame(6, 80, 214, -2)
  pushFrame(11, 420, 224, 2)
  if (isFull) {
    const steps = 9
    for (let i = 0; i <= steps; i++) {
      const u = i / steps
      pushFrame(14 + u * 12, 620 + u * 460, 214 - 120 * Math.sin(Math.PI * u), -20 * Math.cos(Math.PI * u))
    }
  } else {
    pushFrame(19, 860, 200, -2)
  }
  pushFrame(31, 1360, 226, 2)
  pushFrame(38, 1920, 210, 0)
  pushFrame(100, 1920, 210, 0)

  // ---- Kaplumbağa (sağa bakar; sahnede sola doğru yüzer) ----
  const turtleShape = `
    <g transform="scale(-1,1)">
      <path${cls('flip-back')} d="M-46,14 C-58,26 -72,32 -84,30 C-74,22 -64,14 -56,8 Z" fill="${p.skin}"/>
      <path d="M-62,6 L-76,10 L-62,14 Z" fill="${p.skin}"/>
      <path d="M58,-2 C70,-8 82,-8 90,-2 C96,4 94,14 86,18 C78,22 66,18 56,10 Z" fill="${p.skin}"/>
      <circle cx="84" cy="2" r="3.2" fill="${p.eye}"/>
      <circle cx="85" cy="1" r="1" fill="#ffffff"/>
      <path d="M88,10 C90,11 92,11 93,9" stroke="${p.eye}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.6"/>
      <path d="M-62,10 C-30,24 30,24 64,10 Z" fill="${p.turtleBelly}"/>
      <path d="M-62,10 C-60,-28 -22,-44 0,-44 C30,-44 60,-28 64,10 Z" fill="${p.shell}"/>
      <path d="M-30,-6 L-14,-26 L12,-26 L28,-6 L12,12 L-14,12 Z" fill="${p.plate}" opacity="0.8"/>
      <path d="M-56,4 L-38,-20 L-30,-6 L-14,12 Z M60,4 L42,-20 L28,-6 L12,12 Z" fill="${p.plate}" opacity="0.55"/>
      <path d="M-14,-26 L-6,-40 M12,-26 L20,-38" stroke="${p.plate}" stroke-width="3" opacity="0.5"/>
      <path d="M-62,10 C-30,20 30,20 64,10" stroke="${p.plate}" stroke-width="2.5" fill="none" opacity="0.6"/>
      <path${cls('flip-front')} d="M30,12 C40,30 60,48 84,54 C70,42 56,26 46,10 Z" fill="${p.skin}"/>
    </g>`

  // ---- Deniz atı (sağa bakar, mercan tonlarında) ----
  const tailA = 'M9,32 C4,56 18,74 32,70 C44,66 42,50 30,50 C22,50 22,60 28,61'
  const tailB = 'M9,32 C0,58 10,80 28,78 C42,76 46,58 34,54 C24,52 22,62 28,64'
  const seahorseShape = `
    <path d="${tailA}" fill="none" stroke="${p.coral}" stroke-width="9" stroke-linecap="round">
      ${isMoving ? `<animate attributeName="d" dur="${s(5.5)}" values="${tailA};${tailB};${tailA}" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>` : ''}
    </path>
    <path${cls('sh-fin')} d="M-5,-16 C-24,-22 -28,4 -7,6 Z" fill="${p.coralSoft}" opacity="0.85"/>
    <path d="M4,-78 C14,-90 36,-88 42,-74 L64,-70 C68,-69 68,-61 64,-60 L40,-58 C38,-50 40,-44 36,-36 C48,-24 50,0 40,16 C34,26 24,32 14,34 L4,34 C-6,20 -10,4 -6,-12 C-4,-30 -12,-46 -8,-58 C-6,-68 -2,-74 4,-78 Z" fill="${p.coral}"/>
    <path d="M36,-36 C46,-24 48,0 40,16 C34,26 24,32 14,34 C24,20 32,0 28,-22 Z" fill="${p.coralSoft}" opacity="0.8"/>
    <path d="M28,-26 L42,-24 M30,-14 L46,-12 M30,-2 L44,0 M26,10 L38,13" stroke="${p.coral}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    <path d="M8,-82 L10,-92 L16,-84 L20,-94 L24,-84" stroke="${p.coral}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="30" cy="-70" r="4.2" fill="${p.eye}"/>
    <circle cx="31.4" cy="-71.4" r="1.4" fill="#ffffff"/>
    <ellipse cx="26" cy="-60" rx="4" ry="2.4" fill="#ffffff" opacity="0.35"/>`

  // ---- Denizanası ----
  const tent = (x: number, len: number, phase: number) => {
    const a = `M${x},0 C${x - 8},${len * 0.3} ${x + 8},${len * 0.6} ${x},${len}`
    const b = `M${x},0 C${x + 8},${len * 0.3} ${x - 8},${len * 0.6} ${x + 3},${len}`
    const anim = isMoving
      ? `<animate attributeName="d" dur="${s(3.4)}" begin="${n(-phase * f)}s" values="${a};${b};${a}" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>`
      : ''

    return `<path d="${a}" stroke="${p.jelly}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.75">${anim}</path>`
  }
  const arm = (x: number, len: number, phase: number) => {
    const a = `M${x},0 C${x - 10},${len * 0.25} ${x + 10},${len * 0.5} ${x - 4},${len * 0.75} S${x + 6},${len} ${x},${len}`
    const b = `M${x},0 C${x + 10},${len * 0.25} ${x - 10},${len * 0.5} ${x + 4},${len * 0.75} S${x - 6},${len} ${x + 2},${len}`
    const anim = isMoving
      ? `<animate attributeName="d" dur="${s(4.2)}" begin="${n(-phase * f)}s" values="${a};${b};${a}" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>`
      : ''

    return `<path d="${a}" stroke="${p.jellyGlow}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.55">${anim}</path>`
  }
  const jellyShape = `
    <ellipse cx="0" cy="-10" rx="78" ry="70" fill="url(#jellyHalo)"/>
    <g${cls('jelly-pulse')}>
      <g transform="translate(0,2)">
        ${tent(-30, 110, 0)}${tent(-15, 140, 0.8)}${tent(15, 130, 1.6)}${tent(30, 100, 2.4)}
        ${arm(-6, 80, 0.4)}${arm(8, 90, 1.9)}
      </g>
      <path d="M-42,0 C-42,-36 -22,-52 0,-52 C22,-52 42,-36 42,0 C32,7 22,2 12,7 C2,2 -8,7 -18,2 C-28,7 -36,3 -42,0 Z" fill="url(#jellyBell)" opacity="${p.jellyOpacity + 0.2}"/>
      <path d="M-26,-30 C-20,-42 -6,-46 4,-45" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.5"/>
      <circle cx="-12" cy="-18" r="2.6" fill="${p.eye}" opacity="0.7"/>
      <circle cx="12" cy="-18" r="2.6" fill="${p.eye}" opacity="0.7"/>
      <path d="M-5,-10 C-2,-7 2,-7 5,-10" stroke="${p.eye}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.55"/>
    </g>`

  // ---- Deniz yıldızı ----
  const starPath = (R: number, r: number) => {
    const pts: string[] = []
    for (let i = 0; i < 10; i++) {
      const ang = -Math.PI / 2 + (i * Math.PI) / 5
      const rad = i % 2 === 0 ? R : r
      pts.push(`${n(Math.cos(ang) * rad)},${n(Math.sin(ang) * rad)}`)
    }

    return `M${pts.join(' L')} Z`
  }
  const star = (x: number, y: number, size: number, color: string, tilt: number, dur: number, delay: number) => `
    <g transform="translate(${x},${y}) rotate(${tilt}) scale(${size})">
      <g${cls('star')} style="animation-duration:${s(dur)};animation-delay:${n(delay * f)}s">
        <path d="${starPath(34, 15)}" fill="${color}" stroke="${color}" stroke-width="9" stroke-linejoin="round"/>
        <circle cx="0" cy="-14" r="2.2" fill="#ffffff" opacity="0.5"/>
        <circle cx="12" cy="-3" r="2" fill="#ffffff" opacity="0.5"/>
        <circle cx="-12" cy="-3" r="2" fill="#ffffff" opacity="0.5"/>
        <circle cx="7" cy="11" r="2" fill="#ffffff" opacity="0.5"/>
        <circle cx="-7" cy="11" r="2" fill="#ffffff" opacity="0.5"/>
        <circle cx="0" cy="0" r="3" fill="#ffffff" opacity="0.35"/>
      </g>
    </g>`

  // ---- Deniz yosunu ----
  const weed = (x: number, h: number, color: string, dur: number, delay: number, lean: number) => {
    const d = `M0,0 C${-14 + lean},${-h * 0.25} ${14 + lean},${-h * 0.5} ${lean * 1.5},${-h * 0.75} S${-8 + lean * 2},${-h * 0.95} ${lean * 2},${-h}`

    return `<g transform="translate(${x},905)"><path${cls('weed')} style="animation-duration:${s(dur)};animation-delay:${n(delay * f)}s" d="${d}" stroke="${color}" stroke-width="11" fill="none" stroke-linecap="round"/></g>`
  }
  const weeds = [
    weed(150, 250, p.weedA, 6.5, -1, 6),
    weed(176, 330, p.weedB, 7.8, -3, -4),
    weed(204, 210, p.weedA, 5.9, -2, 8),
    weed(236, 290, p.weedB, 8.6, -5, 2),
    weed(640, 150, p.weedB, 7.2, -2, 4),
    weed(662, 190, p.weedA, 6.1, -4, -6),
    weed(960, 170, p.weedA, 6.8, -3, 5),
    weed(1366, 270, p.weedB, 7.1, -2, -6),
    weed(1396, 350, p.weedA, 8.2, -4, 4),
    weed(1426, 230, p.weedB, 6.3, -1, -8),
    weed(1452, 300, p.weedA, 7.5, -6, -2),
  ].join('')

  // ---- Kabarcıklar (yalnızca kenarlardan yükselir) ----
  const bubbleCount = isFull ? 20 : 8
  const brnd = rng(42)
  const bubbles = isMoving
    ? Array.from({ length: bubbleCount }, (_, i) => {
        const side = i % 2 === 0
        const x = n(side ? 150 + brnd() * 260 : 1190 + brnd() * 260)
        const r = n(3 + brnd() * 7)
        const dur = 11 + brnd() * 9
        const delay = -brnd() * dur

        return `<g transform="translate(${x},900)"><g class="bubble" style="animation-duration:${s(dur)};animation-delay:${n(delay * f)}s"><circle r="${r}" fill="${p.bubble}" fill-opacity="0.12" stroke="${p.bubble}" stroke-opacity="0.7" stroke-width="1.4"/><circle cx="${n(-r * 0.35)}" cy="${n(-r * 0.35)}" r="${n(r * 0.28)}" fill="#ffffff" opacity="0.8"/></g></g>`
      }).join('')
    : [
        [260, 640, 6],
        [290, 580, 4],
        [1330, 600, 7],
        [1300, 540, 4],
        [380, 420, 5],
        [1240, 380, 5],
      ]
        .map(
          ([x, y, r]) =>
            `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.bubble}" fill-opacity="0.12" stroke="${p.bubble}" stroke-opacity="0.7" stroke-width="1.4"/>`,
        )
        .join('')

  // ---- Küçük balık sürüleri ----
  const fish = (x: number, y: number, size: number, color: string, phase: number) => `
    <g transform="translate(${x},${y}) scale(${size})">
      <g${cls('fish')} style="animation-delay:${n(-phase * f)}s">
        <path d="M-14,0 L-26,-9 L-24,0 L-26,9 Z" fill="${color}" opacity="0.9"/>
        <ellipse cx="0" cy="0" rx="17" ry="9" fill="${color}"/>
        <path d="M-2,-8 C2,-14 8,-14 10,-8 Z" fill="${color}" opacity="0.8"/>
        <circle cx="8" cy="-2" r="2.2" fill="${p.eye}"/>
        <circle cx="8.6" cy="-2.6" r="0.7" fill="#ffffff"/>
        <path d="M-6,-6 C-4,-2 -4,2 -6,6" stroke="#ffffff" stroke-width="1.6" fill="none" opacity="0.45"/>
      </g>
    </g>`
  const school = (colors: string[], seed: number) => {
    const r = rng(seed)

    return colors
      .map((c, i) => fish(n(i * 38 + r() * 20), n((i % 3) * 24 - 24 + r() * 10), n(0.8 + r() * 0.4), c, r() * 2))
      .join('')
  }
  const schoolA = school([p.coral, p.starB, p.coral, p.coralSoft, p.starB, p.coral], 11)
  const schoolB = school([p.teal, p.tealDeep, p.teal, p.weedB, p.teal], 23)

  // ---- Dip: kum, çakıllar, kayalar, mercan dalları, deniz kabukları ----
  const coralBranch = (x: number, y: number, scale: number, color: string) => `
    <g transform="translate(${x},${y}) scale(${scale})" stroke="${color}" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.85">
      <path d="M0,0 C0,-40 -6,-70 -30,-96 M0,-30 C10,-60 30,-70 34,-100 M-4,-58 C-20,-70 -40,-66 -52,-80 M18,-62 C30,-76 46,-74 56,-90"/>
    </g>`
  const prnd = rng(99)
  const pebbles = Array.from({ length: 34 }, () => {
    const x = n(prnd() * 1600)
    const y = n(900 + prnd() * 90)

    return `<ellipse cx="${x}" cy="${y}" rx="${n(2 + prnd() * 4)}" ry="${n(1.5 + prnd() * 2)}" fill="${p.sandBottom}" opacity="0.7"/>`
  }).join('')
  const shell = (x: number, y: number, sc: number, color: string) =>
    `<g transform="translate(${x},${y}) scale(${sc})"><path d="M-12,0 C-12,-14 12,-14 12,0 Z" fill="${color}"/><path d="M0,0 L-7,-10 M0,0 L0,-12 M0,0 L7,-10" stroke="#ffffff" stroke-width="1.4" opacity="0.6"/></g>`
  const seabed = `
    <path d="M0,872 C160,852 280,884 420,868 C600,848 760,890 960,872 C1140,856 1300,884 1460,866 C1530,860 1570,864 1600,860 L1600,1000 L0,1000 Z" fill="url(#sandGrad)"/>
    <path d="M60,922 C200,910 300,930 440,918 M700,936 C820,924 940,944 1060,930 M1180,918 C1300,906 1420,926 1540,914" stroke="${p.sandBottom}" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round"/>
    ${pebbles}
    <ellipse cx="330" cy="905" rx="70" ry="22" fill="${p.rock}" opacity="0.85"/>
    <ellipse cx="1270" cy="908" rx="90" ry="26" fill="${p.rock}" opacity="0.85"/>
    <ellipse cx="820" cy="930" rx="50" ry="14" fill="${p.rock}" opacity="0.6"/>
    ${coralBranch(290, 900, 0.9, p.coral)}
    ${coralBranch(520, 915, 0.55, p.teal)}
    ${coralBranch(1110, 912, 0.6, p.coralSoft)}
    ${coralBranch(1320, 898, 0.75, p.teal)}
    ${coralBranch(1230, 905, 0.5, p.coral)}
    ${shell(600, 940, 1, p.coralSoft)}
    ${shell(880, 962, 0.8, p.starB)}
    ${shell(1050, 948, 1.1, p.coralSoft)}
    ${shell(420, 968, 0.7, p.teal)}`

  const stars = [
    star(220, 918, 0.9, p.starA, 12, 11, 0),
    star(450, 950, 0.6, p.starB, -18, 13, -4),
    star(740, 966, 0.55, p.starA, 30, 12, -7),
    star(990, 930, 0.7, p.starB, -4, 14, -2),
    star(1180, 958, 0.6, p.starA, 18, 10, -5),
    star(1400, 925, 0.85, p.starB, -8, 12, -2),
  ].join('')

  // ---- Durağan konumlar (hareket kapalıyken) ----
  const dolphinStatic = 'translate(1120,150) rotate(-4)'
  const turtleStatic = 'translate(420,740)'

  const css = isMoving
    ? `
    .ray{transform-box:fill-box;transform-origin:50% 0;animation:ray ease-in-out infinite alternate}
    @keyframes ray{0%{opacity:.45;transform:skewX(-2deg)}100%{opacity:1;transform:skewX(2deg)}}
    .dolphin{transform:translate(-320px,230px);animation:dolphin ${s(56)} linear 3s infinite both}
    @keyframes dolphin{${dolphinFrames.join('')}}
    .fluke{transform-box:fill-box;transform-origin:100% 50%;animation:fluke ${s(1.2)} ease-in-out infinite alternate}
    @keyframes fluke{0%{transform:rotate(-12deg)}100%{transform:rotate(12deg)}}
    .pec{transform-box:fill-box;transform-origin:50% 0;animation:fluke ${s(1.6)} ease-in-out infinite alternate}
    .turtle{transform:translate(1720px,800px);animation:turtle ${s(120)} linear 2s infinite both}
    @keyframes turtle{0%{transform:translate(1720px,800px)}45%{transform:translate(760px,770px)}85%{transform:translate(-260px,800px)}100%{transform:translate(-260px,800px)}}
    .bob{animation:bob ${s(6)} ease-in-out infinite alternate}
    @keyframes bob{0%{transform:translateY(-8px) rotate(-2deg)}100%{transform:translateY(8px) rotate(2deg)}}
    .flip-front{transform-box:fill-box;transform-origin:0 0;animation:flip ${s(3.2)} ease-in-out infinite alternate}
    .flip-back{transform-box:fill-box;transform-origin:100% 0;animation:flip ${s(3.2)} ease-in-out -1.6s infinite alternate}
    @keyframes flip{0%{transform:rotate(-22deg)}100%{transform:rotate(18deg)}}
    .seahorse{animation:sway ${s(8)} ease-in-out infinite alternate}
    @keyframes sway{0%{transform:translateY(-16px) rotate(-4deg)}100%{transform:translateY(16px) rotate(4deg)}}
    .sh-fin{transform-box:fill-box;transform-origin:100% 50%;animation:fin ${s(0.7)} ease-in-out infinite alternate}
    @keyframes fin{0%{transform:scaleX(.65)}100%{transform:scaleX(1)}}
    .jelly-rise{transform:translateY(1200px);animation:rise linear infinite both}
    @keyframes rise{0%{transform:translateY(1200px)}100%{transform:translateY(-260px)}}
    .jelly-drift{animation:drift ${s(7)} ease-in-out infinite alternate}
    @keyframes drift{0%{transform:translateX(-18px)}100%{transform:translateX(18px)}}
    .jelly-pulse{transform-box:fill-box;transform-origin:50% 0;animation:pulse ${s(3.4)} ease-in-out infinite}
    @keyframes pulse{0%{transform:scale(1,1)}20%{transform:scale(.84,1.1)}48%{transform:scale(1.05,.95)}100%{transform:scale(1,1)}}
    .star{transform-box:fill-box;transform-origin:50% 50%;animation:star ease-in-out infinite alternate}
    @keyframes star{0%{transform:rotate(-7deg) scale(1)}100%{transform:rotate(7deg) scale(1.05)}}
    .weed{transform-box:fill-box;transform-origin:50% 100%;animation:weed ease-in-out infinite alternate}
    @keyframes weed{0%{transform:rotate(-4deg)}100%{transform:rotate(4deg)}}
    .school-a{transform:translate(1800px,0);animation:school-a ${s(64)} linear 9s infinite both}
    @keyframes school-a{0%{transform:translate(1800px,0)}55%{transform:translate(-300px,-30px)}100%{transform:translate(-300px,-30px)}}
    .school-b{transform:translate(-300px,0);animation:school-b ${s(76)} linear 30s infinite both}
    @keyframes school-b{0%{transform:translate(-300px,0)}60%{transform:translate(1800px,24px)}100%{transform:translate(1800px,24px)}}
    .fish{transform-box:fill-box;transform-origin:70% 50%;animation:fish ${s(0.9)} ease-in-out infinite alternate}
    @keyframes fish{0%{transform:rotate(-5deg)}100%{transform:rotate(5deg)}}
    .bubble{opacity:0;animation:bubble linear infinite}
    @keyframes bubble{0%{transform:translate(0,0);opacity:0}8%{opacity:.85}35%{transform:translate(9px,-330px)}65%{transform:translate(-7px,-610px)}92%{opacity:.6}100%{transform:translate(4px,-940px);opacity:0}}
    @media (prefers-reduced-motion: reduce){*{animation-duration:0s!important;animation-iteration-count:1!important}}`
    : ''

  const jelly = (x: number, scale: number, dur: number, delay: number, staticY: number) =>
    isMoving
      ? `<g transform="translate(${x},0)"><g class="jelly-rise" style="animation-duration:${s(dur)};animation-delay:${n(delay * f)}s"><g class="jelly-drift"><g transform="scale(${scale})">${jellyShape}</g></g></g></g>`
      : `<g transform="translate(${x},${staticY}) scale(${scale})">${jellyShape}</g>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000" preserveAspectRatio="xMidYMax slice">
  <defs>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.top}"/>
      <stop offset="0.55" stop-color="${p.mid}"/>
      <stop offset="1" stop-color="${p.deep}"/>
    </linearGradient>
    <linearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.ray}" stop-opacity="${p.rayOpacity}"/>
      <stop offset="0.7" stop-color="${p.ray}" stop-opacity="${n(p.rayOpacity * 0.25 * 100) / 100}"/>
      <stop offset="1" stop-color="${p.ray}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.sandTop}"/>
      <stop offset="1" stop-color="${p.sandBottom}"/>
    </linearGradient>
    <radialGradient id="jellyBell" cx="0.5" cy="0.35" r="0.65">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="0.45" stop-color="${p.jellyGlow}"/>
      <stop offset="1" stop-color="${p.jelly}"/>
    </radialGradient>
    <radialGradient id="jellyHalo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${p.jellyGlow}" stop-opacity="${scheme === 'koyu' ? 0.35 : 0.3}"/>
      <stop offset="1" stop-color="${p.jellyGlow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="surface" cx="0.5" cy="0" r="0.8">
      <stop offset="0" stop-color="${p.ray}" stop-opacity="${scheme === 'koyu' ? 0.14 : 0.5}"/>
      <stop offset="1" stop-color="${p.ray}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <style>${css}</style>
  <rect width="1600" height="1000" fill="url(#water)"/>
  <rect width="1600" height="620" fill="url(#surface)"/>
  <g>${rays}</g>
  <g>${snow}</g>
  ${jelly(1400, 0.95, 62, -18, 420)}
  ${jelly(250, 0.7, 78, -55, 300)}
  ${jelly(1290, 0.6, 70, -38, 260)}
  ${isFull || !isMoving ? jelly(370, 0.55, 88, -8, 520) : ''}
  ${isMoving ? `<g transform="translate(0,380)"><g class="school-a">${schoolA}</g></g>` : `<g transform="translate(1180,360)">${schoolA}</g>`}
  ${isMoving ? `<g transform="translate(0,560)"><g class="school-b"><g transform="scale(-1,1)">${schoolB}</g></g></g>` : `<g transform="translate(470,560) scale(-1,1)">${schoolB}</g>`}
  <g${isMoving ? '' : ` transform="${dolphinStatic}"`}><g${cls('dolphin')}>${dolphinShape}</g></g>
  ${isMoving ? `<g class="dolphin" style="animation-delay:4.4s"><g transform="translate(-40,46) scale(0.72)">${dolphinShape}</g></g>` : `<g transform="translate(1290,215) rotate(-4) scale(0.72)">${dolphinShape}</g>`}
  ${isFull ? `<g class="dolphin" style="animation-delay:5.6s"><g transform="translate(30,-30) scale(0.55)">${dolphinShape}</g></g>` : ''}
  ${seabed}
  ${weeds}
  ${stars}
  <g transform="translate(200,520) scale(1.1)"><g${cls('seahorse')}>${seahorseShape}</g></g>
  <g transform="translate(1410,600) scale(-0.85,0.85)"><g${cls('seahorse')} style="animation-delay:-3s;animation-duration:${s(9.5)}">${seahorseShape.split(p.coralSoft).join(p.weedB).split(p.coral).join(p.teal)}</g></g>
  <g${isMoving ? '' : ` transform="${turtleStatic}"`}><g${cls('turtle')}><g${cls('bob')}>${turtleShape}</g></g></g>
  ${isMoving ? `<g transform="translate(0,-110)"><g class="turtle" style="animation-delay:48s;animation-duration:${s(150)}"><g class="bob" style="animation-delay:-2s"><g transform="scale(0.55)">${turtleShape}</g></g></g></g>` : `<g transform="translate(1150,680) scale(0.55)">${turtleShape}</g>`}
  ${bubbles}
</svg>`
}
