/* @vitest-environment jsdom */
import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock store and audio service used in App.vue
vi.mock('./stores/gameStore', () => {
  const store = { initializeStore: vi.fn() }
  return { useGameStore: () => store, __storeMock: store }
})

vi.mock('./services/audioService', () => ({
  audioService: { init: vi.fn() }
}))

import App from './App.vue'
import { __storeMock } from './stores/gameStore'
import { audioService } from './services/audioService'

describe('App.vue', () => {
  test('calls initializeStore and audio init on mount', () => {
    mount(App, { global: { stubs: { 'router-view': true } } })
    expect(__storeMock.initializeStore).toHaveBeenCalled()
    expect(audioService.init).toHaveBeenCalled()
  })
})


