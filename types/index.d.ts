export type OceanScheme = 'dark' | 'light'
export type OceanMotion = 'full' | 'reduced' | 'still'
export type OceanSettings = {
  scheme: OceanScheme
  motion: OceanMotion
  isOn: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'ocean-theme': { settings: Shaped<OceanSettings> }
  }
}
