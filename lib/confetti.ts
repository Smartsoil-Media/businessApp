// Simple confetti effect
export function confetti() {
  // Create confetti elements
  const colors = ["#1E88E5", "#43A047", "#FFD54F", "#E53935", "#5E35B1"]
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.top = "0"
  container.style.left = "0"
  container.style.width = "100%"
  container.style.height = "100%"
  container.style.pointerEvents = "none"
  container.style.zIndex = "9999"
  document.body.appendChild(container)

  // Create confetti pieces
  for (let i = 0; i < 100; i++) {
    const piece = document.createElement("div")
    piece.style.position = "absolute"
    piece.style.width = `${Math.random() * 10 + 5}px`
    piece.style.height = `${Math.random() * 5 + 5}px`
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    piece.style.borderRadius = "2px"
    piece.style.top = "0"
    piece.style.left = `${Math.random() * 100}%`
    piece.style.transform = `rotate(${Math.random() * 360}deg)`
    piece.style.opacity = "1"
    piece.style.transition = "transform 1s ease-out, opacity 1s ease-out"
    container.appendChild(piece)

    // Animate the piece
    setTimeout(() => {
      piece.style.transform = `translateY(${Math.random() * 500 + 200}px) translateX(${Math.random() * 200 - 100}px) rotate(${Math.random() * 360 + 360}deg)`
      piece.style.opacity = "0"
    }, 10)
  }

  // Remove the container after animation
  setTimeout(() => {
    document.body.removeChild(container)
  }, 2000)
}
