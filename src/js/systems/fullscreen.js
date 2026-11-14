export function initFullscreen() {
  const box = document.getElementById('fullscreen-toggle');
  if (!box) return;
  box.addEventListener('change', () => {
    if (box.checked) document.documentElement.requestFullscreen?.().catch(() => { box.checked = false; });
    else document.exitFullscreen?.();
  });
  document.addEventListener('fullscreenchange', () => { box.checked = !!document.fullscreenElement; });
}
