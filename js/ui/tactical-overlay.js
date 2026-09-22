export function drawTacticalOverlay(ctx, state) {
  if (!state.flags?.tacticalPaused) return;
  const { x, y } = state.player;
  ctx.save();
  ctx.fillStyle = 'rgba(8,14,18,.26)'; ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
  ctx.strokeStyle = 'rgba(220,235,240,.75)'; ctx.setLineDash([6,5]);
  ctx.beginPath(); ctx.arc(x / 1600 * ctx.canvas.width, y / 1200 * ctx.canvas.height, 70, 0, Math.PI*2); ctx.stroke();
  ctx.setLineDash([]); ctx.fillStyle = '#eef3f4'; ctx.font = '14px sans-serif'; ctx.fillText('TACTICAL PAUSE · click to queue move', 20, 30);
  ctx.restore();
}
