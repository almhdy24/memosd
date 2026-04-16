export default function beep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    oscillator.frequency.value = 800
    gainNode.gain.value = 0.1
    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.15)
  } catch (e) {}
}
