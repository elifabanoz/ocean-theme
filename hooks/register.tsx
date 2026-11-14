import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { OkyanusMotion, OkyanusScheme, OkyanusSettings } from '../types'
import { buildScene } from './scene'

const PLUGIN = 'okyanus-tema'
const PANE = 'okyanus-ayarlar'
const STORE_KEY = 'settings'
const DEFAULTS: OkyanusSettings = { scheme: 'koyu', motion: 'tam', isOn: true }

const settings = atom({ plugin: 'okyanus-tema', key: 'settings' } as const, DEFAULTS, {
  shape: 'settings-1',
})

const SCHEMES: OkyanusScheme[] = ['koyu', 'acik']
const MOTIONS: OkyanusMotion[] = ['tam', 'azalt', 'durgun']

const clean = (raw: unknown): OkyanusSettings => {
  const v = (raw ?? {}) as Partial<OkyanusSettings>

  return {
    scheme: SCHEMES.includes(v.scheme as OkyanusScheme) ? (v.scheme as OkyanusScheme) : DEFAULTS.scheme,
    motion: MOTIONS.includes(v.motion as OkyanusMotion) ? (v.motion as OkyanusMotion) : DEFAULTS.motion,
    isOn: typeof v.isOn === 'boolean' ? v.isOn : DEFAULTS.isOn,
  }
}

// Panellerin buzlu camı: metin okunaklı kalsın diye sahnenin tonunda,
// yeterince opak bir örtü.
const GLASS: Record<OkyanusScheme, { blur: number; tint: string; opacity: number }> = {
  koyu: { blur: 18, tint: '#05203a', opacity: 0.68 },
  acik: { blur: 18, tint: '#f5fbfa', opacity: 0.7 },
}

const backdropId = (s: OkyanusSettings) => `okyanus-${s.scheme}-${s.motion}`

// Tanı bilgisi: son tema isteğinin sonucu ve arka planın kaç kez çizildiği.
let lastResult = 'henüz istenmedi'
let renders: string[] = []

type ThemeOutcome = Awaited<ReturnType<EngineInterface['theme']['set']>>

// Claude Code 2.1.323 ve sonrası: backdrop.scene + üst düzey overrideColorScheme.
// Daha eski sürümler: backdrop.id + backdrop.colorScheme. Önce yenisini dener,
// reddedilirse eskisine düşer.
const setTheme = async ($: EngineInterface, s: OkyanusSettings): Promise<ThemeOutcome> => {
  const scheme = s.scheme === 'koyu' ? 'dark' : 'light'
  try {
    const newer = {
      backdrop: { scene: backdropId(s), glass: GLASS[s.scheme] },
      overrideColorScheme: scheme,
    }
    return await $.theme.set(newer as unknown as ThemeSetArgs)
  } catch (newer) {
    try {
      return await $.theme.set({ backdrop: { id: backdropId(s), glass: GLASS[s.scheme], colorScheme: scheme } })
    } catch (older) {
      throw new Error(`yeni biçim: ${String(newer)} · eski biçim: ${String(older)}`)
    }
  }
}

const apply = async ($: EngineInterface, s: OkyanusSettings) => {
  try {
    const result = s.isOn ? await setTheme($, s) : await $.theme.clear()
    lastResult = result.isDrawn
      ? `çiziliyor (istek ${result.requestId})`
      : /stands and draws when one attaches/.test(result.reason)
        ? 'kaydedildi; uygulama bağlanınca çizilir'
        : `çizilmiyor: ${result.reason}`
  } catch (error) {
    lastResult = `hata: ${String(error)}`
  }
}

const diagnose = () =>
  `Tanı: tema isteği ${lastResult}. Arka plan çizim çağrıları: ${
    renders.length === 0 ? 'hiç gelmedi' : renders.slice(-4).join(', ')
  }.`

const save = async ($: EngineInterface, change: Partial<OkyanusSettings>) => {
  let next = DEFAULTS
  await update($, settings, old => {
    next = clean({ ...clean(old), ...change })

    return next
  })
  await $.store.set(STORE_KEY, next)
  await apply($, next)

  return next
}

const describe = (s: OkyanusSettings) => {
  const scheme = s.scheme === 'koyu' ? 'koyu (derin lacivert)' : 'açık (turkuaz-kum)'
  const motion = { tam: 'tam', azalt: 'azaltılmış', durgun: 'kapalı (durgun sahne)' }[s.motion]

  return s.isOn ? `Okyanus teması açık: ${scheme}, animasyon ${motion}.` : 'Okyanus teması kapalı.'
}

const HELP = [
  '/okyanus            ayar panelini açar',
  '/okyanus koyu       derin lacivert sahne',
  '/okyanus acik       açık turkuaz-kum sahne',
  '/okyanus tam        animasyonlar tam',
  '/okyanus azalt      daha yavaş ve daha az hareket',
  '/okyanus durgun     animasyonları kapatır (sahne kalır)',
  '/okyanus kapat      temayı kaldırır · /okyanus ac  geri getirir',
  '/okyanus tani       tema durumunu gösterir',
].join('\n')

const parse = (args: string): Partial<OkyanusSettings> | 'help' | null => {
  const words = args
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) {
    return null
  }
  const change: Partial<OkyanusSettings> = {}
  for (const w of words) {
    if (['koyu', 'dark', 'gece'].includes(w)) change.scheme = 'koyu'
    else if (['acik', 'light', 'gunduz'].includes(w)) change.scheme = 'acik'
    else if (['tam', 'full'].includes(w)) change.motion = 'tam'
    else if (['azalt', 'az', 'azaltilmis', 'reduce'].includes(w)) change.motion = 'azalt'
    else if (['durgun', 'sabit', 'kapali', 'still', 'dur'].includes(w)) change.motion = 'durgun'
    else if (['kapat', 'off'].includes(w)) change.isOn = false
    else if (['ac', 'on'].includes(w)) change.isOn = true
    else return 'help'
  }

  return change
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'okyanus',
      description: 'Okyanus teması: koyu/açık mod ve animasyon ayarı (tam, azalt, durgun)',
      argumentHint: '[koyu|acik] [tam|azalt|durgun] [kapat|ac]',
    })
    const stored = clean(await $.store.get(STORE_KEY))
    await update($, settings, () => stored)
    await apply($, stored)

    return next(e)
  })

  on('command.run', { command: 'okyanus' }, async ($, e) => {
    if (/^\s*tan[iı]\s*$/i.test(e.args)) {
      return { text: diagnose() }
    }
    const change = parse(e.args)
    if (change === 'help') {
      return { text: `Anlayamadım. Kullanım:\n${HELP}` }
    }
    if (change === null) {
      await $.ui.open({ id: PANE, title: 'Okyanus teması' })

      return { text: `${describe(await read($, settings))}\nAyar paneli açıldı.` }
    }
    const now = await save($, { ...change, isOn: change.isOn ?? true })

    return { text: describe(now) }
  })

  // Sahneyi çizen kanca: yalnızca bu modun kendi arka planı.
  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    const props = e.props as unknown as { scene?: string; id?: string; plugin: string }
    const sceneName = props.scene ?? props.id ?? ''
    const match = /^okyanus-(koyu|acik)-(tam|azalt|durgun)$/.exec(sceneName)
    if (!match || !e.props.plugin.startsWith(PLUGIN)) {
      return next(e)
    }
    renders = [...renders, `${e.surface}:${sceneName}`].slice(-8)
    const elements = $.ui.resolve(e)
    if (!('Svg' in elements)) {
      return next(e)
    }
    const { Box, Svg } = elements
    const scheme = match[1] as OkyanusScheme
    const motion = match[2] as OkyanusMotion

    return (
      <Box width="100%" height="100%">
        <Svg
          source={buildScene(scheme, motion)}
          alt="Sualtı sahnesi: ışık huzmeleri, yunus, kaplumbağa, deniz atı, denizanası, deniz yıldızları, yosunlar ve kabarcıklar"
        />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const s = await read($, settings)
    const mark = (isOn: boolean, label: string) => (isOn ? `● ${label}` : label)

    return (
      <Box flexDirection="column" gap={1} padding={1}>
        <Text bold color="#ff7f6b">
          🌊 Okyanus teması
        </Text>
        <Text dimColor>{describe(s)}</Text>

        <Text bold>Görünüm</Text>
        <Box flexDirection="row" gap={1} flexWrap="wrap">
          <Button key="koyu" label={mark(s.scheme === 'koyu', 'Koyu (lacivert)')} onPress={() => save($, { scheme: 'koyu', isOn: true })} />
          <Button key="acik" label={mark(s.scheme === 'acik', 'Açık (turkuaz-kum)')} onPress={() => save($, { scheme: 'acik', isOn: true })} />
        </Box>

        <Text bold>Animasyon</Text>
        <Box flexDirection="row" gap={1} flexWrap="wrap">
          <Button key="tam" label={mark(s.motion === 'tam', 'Tam')} onPress={() => save($, { motion: 'tam', isOn: true })} />
          <Button key="azalt" label={mark(s.motion === 'azalt', 'Azaltılmış')} onPress={() => save($, { motion: 'azalt', isOn: true })} />
          <Button key="durgun" label={mark(s.motion === 'durgun', 'Kapalı')} onPress={() => save($, { motion: 'durgun', isOn: true })} />
        </Box>

        <Box flexDirection="row" gap={1}>
          {s.isOn ? (
            <Button key="off" label="Temayı kaldır" onPress={() => save($, { isOn: false })} />
          ) : (
            <Button key="on" label="Temayı aç" onPress={() => save($, { isOn: true })} />
          )}
        </Box>
        <Text dimColor>İpucu: en iyi kontrast için uygulamanın kendi görünümünü de aynı moda (koyu/açık) alın.</Text>
      </Box>
    )
  })
}
