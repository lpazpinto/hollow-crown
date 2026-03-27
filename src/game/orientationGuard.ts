/**
 * Orientation guard — landscape-first mobile support.
 *
 * Shows a "rotate your device" overlay when a touch device is in portrait mode.
 * Does nothing on desktop (pointer: fine) devices.
 * Called once at app startup; persists across all scene transitions.
 */
export function startOrientationGuard(): void {
  // Only activate on coarse-pointer (touch) devices.
  if (!window.matchMedia('(pointer: coarse)').matches) {
    return
  }

  const overlay = buildOverlay()
  document.body.appendChild(overlay)

  function update() {
    const isPortrait = window.innerHeight > window.innerWidth
    overlay.style.display = isPortrait ? 'flex' : 'none'
  }

  window.addEventListener('resize', update)
  window.addEventListener('orientationchange', update)
  update()
}

function buildOverlay(): HTMLDivElement {
  const el = document.createElement('div')
  el.setAttribute('aria-live', 'polite')
  el.setAttribute('role', 'alert')
  el.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:9999',
    'display:none',
    'flex-direction:column',
    'align-items:center',
    'justify-content:center',
    'background:#0f172a',
    'color:#ffffff',
    'font-family:system-ui,sans-serif',
    'text-align:center',
    'padding:24px',
    'box-sizing:border-box',
    'user-select:none',
    '-webkit-user-select:none',
  ].join(';')

  // Keyframe animation lives in a scoped <style> tag inside the overlay.
  const style = document.createElement('style')
  style.textContent =
    '@keyframes hc-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'
  el.appendChild(style)

  const icon = document.createElement('div')
  icon.textContent = '↻'
  icon.style.cssText =
    'font-size:72px;margin-bottom:16px;animation:hc-spin 2.4s linear infinite;line-height:1;'
  el.appendChild(icon)

  const title = document.createElement('p')
  title.textContent = 'Rotate your device'
  title.style.cssText =
    'font-size:clamp(20px,5vw,30px);font-weight:bold;margin:0 0 10px;'
  el.appendChild(title)

  const sub = document.createElement('p')
  sub.textContent = 'Hollow Crown plays best in landscape mode.'
  sub.style.cssText =
    'font-size:clamp(14px,3.5vw,20px);color:#cbd5e1;margin:0;'
  el.appendChild(sub)

  return el
}
