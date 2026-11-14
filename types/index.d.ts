export type OkyanusScheme = 'koyu' | 'acik'
export type OkyanusMotion = 'tam' | 'azalt' | 'durgun'
export type OkyanusSettings = {
  scheme: OkyanusScheme
  motion: OkyanusMotion
  isOn: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'okyanus-tema': { settings: Shaped<OkyanusSettings> }
  }
}
