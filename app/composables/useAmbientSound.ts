export type AmbientSoundType = 'white' | 'brown'

export interface AmbientSound {
  id: AmbientSoundType
  label: string
  emoji: string
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'white', label: 'White noise', emoji: '〰️' },
  { id: 'brown', label: 'Brown noise', emoji: '🟤' },
]

// Shared singleton so sound persists while focus mode is mounted
let audioCtx: AudioContext | null = null
let gainNode: GainNode | null = null
let sourceNode: AudioBufferSourceNode | null = null
let currentSound: AmbientSoundType | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function buildWhiteNoise(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function buildBrownNoise(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    data[i] = (last + 0.02 * white) / 1.02
    last = data[i]
    data[i] *= 3.5
  }
  return buffer
}

function buildBuffer(ctx: AudioContext, type: AmbientSoundType): AudioBuffer {
  switch (type) {
    case 'white': return buildWhiteNoise(ctx)
    case 'brown': return buildBrownNoise(ctx)
  }
}

function stopCurrent() {
  if (sourceNode) {
    try { sourceNode.stop() } catch {}
    sourceNode.disconnect()
    sourceNode = null
  }
  currentSound = null
}

function playSound(type: AmbientSoundType, volume: number) {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') ctx.resume()

  stopCurrent()

  if (!gainNode) {
    gainNode = ctx.createGain()
    gainNode.connect(ctx.destination)
  }
  gainNode.gain.setValueAtTime(volume, ctx.currentTime)

  const buffer = buildBuffer(ctx, type)
  sourceNode = ctx.createBufferSource()
  sourceNode.buffer = buffer
  sourceNode.loop = true
  sourceNode.connect(gainNode)
  sourceNode.start()
  currentSound = type
}

export function useAmbientSound() {
  const active = ref<AmbientSoundType | null>(currentSound)
  const volume = ref(0.5)

  function select(type: AmbientSoundType) {
    if (active.value === type) {
      stopCurrent()
      active.value = null
    } else {
      playSound(type, volume.value)
      active.value = type
    }
  }

  function setVolume(v: number) {
    volume.value = v
    if (gainNode) gainNode.gain.setValueAtTime(v, getAudioContext().currentTime)
  }

  function stop() {
    stopCurrent()
    active.value = null
  }

  return { active, volume, select, setVolume, stop }
}
