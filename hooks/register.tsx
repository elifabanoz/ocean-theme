import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { OceanMotion, OceanScheme, OceanSettings } from '../types'
import { buildScene } from './scene'

const PLUGIN = 'ocean-theme'
const PANE = 'ocean-settings'
const STORE_KEY = 'settings'
const DEFAULTS: OceanSettings = { scheme: 'dark', motion: 'full', isOn: true }

const settings = atom({ plugin: 'ocean-theme', key: 'settings' } as const, DEFAULTS, {
  shape: 'settings-1',
})

const SCHEMES: OceanScheme[] = ['dark', 'light']
const MOTIONS: OceanMotion[] = ['full', 'reduced', 'still']

const clean = (raw: unknown): OceanSettings => {
  const v = (raw ?? {}) as Partial<OceanSettings>

  return {
    scheme: SCHEMES.includes(v.scheme as OceanScheme) ? (v.scheme as OceanScheme) : DEFAULTS.scheme,
    motion: MOTIONS.includes(v.motion as OceanMotion) ? (v.motion as OceanMotion) : DEFAULTS.motion,
    isOn: typeof v.isOn === 'boolean' ? v.isOn : DEFAULTS.isOn,
  }
}

// The frosted glass over the scene: tinted to match it, and opaque enough
// that the conversation stays easy to read.
const GLASS: Record<OceanScheme, { blur: number; tint: string; opacity: number }> = {
  dark: { blur: 18, tint: '#05203a', opacity: 0.68 },
  light: { blur: 18, tint: '#f5fbfa', opacity: 0.7 },
}

const sceneId = (s: OceanSettings) => `ocean-${s.scheme}-${s.motion}`

// Diagnostics: the outcome of the last theme request and the latest draws.
let lastResult = 'not requested yet'
let renders: string[] = []

type ThemeOutcome = Awaited<ReturnType<EngineInterface['theme']['set']>>

// Claude Code 2.1.323 and later: backdrop.scene plus a top-level
// overrideColorScheme. Earlier builds: backdrop.id plus backdrop.colorScheme.
// Try the newer shape first and fall back to the older one if it is refused.
const setTheme = async ($: EngineInterface, s: OceanSettings): Promise<ThemeOutcome> => {
  try {
    const newer = {
      backdrop: { scene: sceneId(s), glass: GLASS[s.scheme] },
      overrideColorScheme: s.scheme,
    }
    return await $.theme.set(newer as unknown as ThemeSetArgs)
  } catch (newer) {
    try {
      const older = { backdrop: { id: sceneId(s), glass: GLASS[s.scheme], colorScheme: s.scheme } }
      return await $.theme.set(older as unknown as ThemeSetArgs)
    } catch (older) {
      throw new Error(`newer shape: ${String(newer)} · older shape: ${String(older)}`)
    }
  }
}

const apply = async ($: EngineInterface, s: OceanSettings) => {
  try {
    const result = s.isOn ? await setTheme($, s) : await $.theme.clear()
    lastResult = result.isDrawn
      ? `drawn (request ${result.requestId})`
      : /stands and draws when one attaches/.test(result.reason)
        ? 'saved; it draws as soon as the app attaches'
        : `not drawn: ${result.reason}`
  } catch (error) {
    lastResult = `error: ${String(error)}`
  }
}

const diagnose = () =>
  `Status: theme request ${lastResult}. Backdrop draws: ${
    renders.length === 0 ? 'none yet' : renders.slice(-4).join(', ')
  }.`

const save = async ($: EngineInterface, change: Partial<OceanSettings>) => {
  let next = DEFAULTS
  await update($, settings, old => {
    next = clean({ ...clean(old), ...change })

    return next
  })
  await $.store.set(STORE_KEY, next)
  await apply($, next)

  return next
}

const describe = (s: OceanSettings) => {
  const scheme = s.scheme === 'dark' ? 'dark (deep ocean navy)' : 'light (turquoise and sand)'
  const motion = { full: 'full', reduced: 'reduced', still: 'off (still scene)' }[s.motion]

  return s.isOn ? `Ocean theme on: ${scheme}, motion ${motion}.` : 'Ocean theme off.'
}

const HELP = [
  '/ocean              open the settings panel',
  '/ocean dark         deep navy scene',
  '/ocean light        light turquoise and sand scene',
  '/ocean full         full motion',
  '/ocean reduced      slower, calmer motion',
  '/ocean still        no motion (the scene stays)',
  '/ocean off          remove the theme · /ocean on  bring it back',
  '/ocean status       show whether the theme is drawn',
].join('\n')

const parse = (args: string): Partial<OceanSettings> | 'help' | null => {
  const words = args.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return null
  }
  const change: Partial<OceanSettings> = {}
  for (const w of words) {
    if (['dark', 'night'].includes(w)) change.scheme = 'dark'
    else if (['light', 'day'].includes(w)) change.scheme = 'light'
    else if (['full'].includes(w)) change.motion = 'full'
    else if (['reduced', 'reduce', 'calm'].includes(w)) change.motion = 'reduced'
    else if (['still', 'static', 'pause'].includes(w)) change.motion = 'still'
    else if (['off'].includes(w)) change.isOn = false
    else if (['on'].includes(w)) change.isOn = true
    else return 'help'
  }

  return change
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'ocean',
      description: 'Ocean theme: dark or light scene, and motion (full, reduced, still)',
      argumentHint: '[dark|light] [full|reduced|still] [off|on|status]',
    })
    const stored = clean(await $.store.get(STORE_KEY))
    await update($, settings, () => stored)
    await apply($, stored)

    return next(e)
  })

  on('command.run', { command: 'ocean' }, async ($, e) => {
    if (/^\s*status\s*$/i.test(e.args)) {
      return { text: diagnose() }
    }
    const change = parse(e.args)
    if (change === 'help') {
      return { text: `Unknown option. Usage:\n${HELP}` }
    }
    if (change === null) {
      await $.ui.open({ id: PANE, title: 'Ocean theme' })

      return { text: `${describe(await read($, settings))}\nSettings panel opened.` }
    }
    const now = await save($, { ...change, isOn: change.isOn ?? true })

    return { text: describe(now) }
  })

  // Draws this mod's own backdrop and passes every other one on.
  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    const props = e.props as unknown as { scene?: string; id?: string; plugin: string }
    const name = props.scene ?? props.id ?? ''
    const match = /^ocean-(dark|light)-(full|reduced|still)$/.exec(name)
    if (!match || !props.plugin.startsWith(PLUGIN)) {
      return next(e)
    }
    renders = [...renders, `${e.surface}:${name}`].slice(-8)
    const elements = $.ui.resolve(e)
    if (!('Svg' in elements)) {
      return next(e)
    }
    const { Box, Svg } = elements
    const scheme = match[1] as OceanScheme
    const motion = match[2] as OceanMotion

    return (
      <Box width="100%" height="100%">
        <Svg
          source={buildScene(scheme, motion)}
          alt="Underwater scene: light rays, dolphins, turtles, seahorses, jellyfish, fish, starfish, seaweed and bubbles"
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
          🌊 Ocean theme
        </Text>
        <Text dimColor>{describe(s)}</Text>

        <Text bold>Scene</Text>
        <Box flexDirection="row" gap={1} flexWrap="wrap">
          <Button key="dark" label={mark(s.scheme === 'dark', 'Dark (navy)')} onPress={() => save($, { scheme: 'dark', isOn: true })} />
          <Button key="light" label={mark(s.scheme === 'light', 'Light (turquoise and sand)')} onPress={() => save($, { scheme: 'light', isOn: true })} />
        </Box>

        <Text bold>Motion</Text>
        <Box flexDirection="row" gap={1} flexWrap="wrap">
          <Button key="full" label={mark(s.motion === 'full', 'Full')} onPress={() => save($, { motion: 'full', isOn: true })} />
          <Button key="reduced" label={mark(s.motion === 'reduced', 'Reduced')} onPress={() => save($, { motion: 'reduced', isOn: true })} />
          <Button key="still" label={mark(s.motion === 'still', 'Off')} onPress={() => save($, { motion: 'still', isOn: true })} />
        </Box>

        <Box flexDirection="row" gap={1}>
          {s.isOn ? (
            <Button key="off" label="Remove theme" onPress={() => save($, { isOn: false })} />
          ) : (
            <Button key="on" label="Turn theme on" onPress={() => save($, { isOn: true })} />
          )}
        </Box>
        <Text dimColor>Tip: for the best contrast, set the app's own appearance to the same mode (dark or light).</Text>
      </Box>
    )
  })
}
