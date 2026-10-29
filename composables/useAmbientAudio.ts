import { onBeforeUnmount, ref } from 'vue'

/**
 * Original synthesized ambience: filtered noise (wind) + tiny bird chirps.
 * There are no downloaded audio files or copyrighted music.
 * The AudioContext is created only when the visitor clicks "Sound on".
 */
export function useAmbientAudio() {
  const enabled = ref(false)
  const supported = ref(true)
  const error = ref('')
  let context: AudioContext | null = null
  let wind: AudioBufferSourceNode | null = null
  let chirpTimer: number | undefined
  let starting = false
  let requestVersion = 0

  function chirp() {
    const ctx = context
    if (!ctx || ctx.state !== 'running') return
    const start = ctx.currentTime
    const oscillator = ctx.createOscillator()
    const envelope = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(960, start)
    oscillator.frequency.exponentialRampToValueAtTime(1450, start + .17)
    envelope.gain.setValueAtTime(.00001, start)
    envelope.gain.exponentialRampToValueAtTime(.013, start + .045)
    envelope.gain.exponentialRampToValueAtTime(.00001, start + .2)
    oscillator.connect(envelope).connect(ctx.destination)
    oscillator.start(start)
    oscillator.stop(start + .21)
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect() }
  }

  async function turnOn() {
    if (enabled.value || starting) return
    starting = true
    const version = ++requestVersion
    try {
      if (typeof window === 'undefined' || !window.AudioContext) {
        supported.value = false
        error.value = 'This browser does not support Web Audio.'
        return
      }
      // This call happens synchronously from the button's click handler.
      const ctx = new window.AudioContext()
      context = ctx
      const duration = 2
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      const lowPass = ctx.createBiquadFilter()
      lowPass.type = 'lowpass'
      lowPass.frequency.value = 320
      const volume = ctx.createGain()
      volume.gain.value = .027
      source.connect(lowPass).connect(volume).connect(ctx.destination)
      source.start()
      wind = source
      await ctx.resume()
      if (version !== requestVersion) return // unmounted / turned off while resuming
      enabled.value = true
      error.value = ''
      chirpTimer = window.setInterval(chirp, 8500)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Unable to start ambience.'
      await turnOff()
    } finally {
      starting = false
    }
  }

  async function turnOff() {
    requestVersion++
    if (chirpTimer !== undefined) { window.clearInterval(chirpTimer); chirpTimer = undefined }
    try { wind?.stop() } catch { /* already stopped */ }
    wind?.disconnect()
    wind = null
    const oldContext = context
    context = null
    enabled.value = false
    if (oldContext && oldContext.state !== 'closed') await oldContext.close().catch(() => {})
  }

  const toggle = () => enabled.value ? turnOff() : turnOn()
  onBeforeUnmount(() => { void turnOff() })
  return { enabled, supported, error, toggle, turnOff }
}
