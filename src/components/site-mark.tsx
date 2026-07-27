export function SiteMark(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 224 256"
      aria-hidden
      {...props}
    >
      <path fill="currentColor" d="M0 0h32v32h-32zM192 0h32v32h-32zM0 32h32v32h-32zM32 32h32v32h-32zM160 32h32v32h-32zM192 32h32v32h-32zM0 64h32v32h-32zM64 64h32v32h-32zM128 64h32v32h-32zM192 64h32v32h-32zM0 96h32v32h-32zM96 96h32v32h-32zM192 96h32v32h-32zM0 128h32v32h-32zM192 128h32v32h-32zM0 160h32v32h-32zM192 160h32v32h-32zM0 192h32v32h-32zM192 192h32v32h-32zM0 224h32v32h-32zM192 224h32v32h-32z" />
    </svg>
  )
}

export function getMarkSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 224 256"><path fill="currentColor" d="M0 0h32v32h-32zM192 0h32v32h-32zM0 32h32v32h-32zM32 32h32v32h-32zM160 32h32v32h-32zM192 32h32v32h-32zM0 64h32v32h-32zM64 64h32v32h-32zM128 64h32v32h-32zM192 64h32v32h-32zM0 96h32v32h-32zM96 96h32v32h-32zM192 96h32v32h-32zM0 128h32v32h-32zM192 128h32v32h-32zM0 160h32v32h-32zM192 160h32v32h-32zM0 192h32v32h-32zM192 192h32v32h-32zM0 224h32v32h-32zM192 224h32v32h-32z"/></svg>`
}
