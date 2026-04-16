export default function playNotificationSound() {
  try {
    const audio = new Audio('/notification.mp3')
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch (e) {
    // Ignore autoplay restrictions
  }
}
