/**
 * Hardware-based browser fingerprint for anti-abuse tracking.
 * Survives localStorage clears by using GPU, screen, and navigator signals.
 */
export async function generateFingerprint() {
  var signals = [];

  // Canvas fingerprint — GPU/driver differences produce unique pixel data
  try {
    var canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    var ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 100, 50);
    ctx.fillStyle = '#069';
    ctx.fillText('fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('fingerprint', 4, 17);
    signals.push(canvas.toDataURL());
  } catch (_) {
    signals.push('canvas:unavailable');
  }

  // WebGL renderer — exposes GPU vendor/model
  try {
    var gl = document.createElement('canvas').getContext('webgl');
    if (gl) {
      var dbg = gl.getExtension('WEBGL_debug_renderer_info');
      signals.push(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'webgl:no-dbg');
      signals.push(dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : '');
    } else {
      signals.push('webgl:unavailable');
    }
  } catch (_) {
    signals.push('webgl:error');
  }

  // Screen properties
  signals.push(screen.width + 'x' + screen.height);
  signals.push('' + screen.colorDepth);
  signals.push('' + (window.devicePixelRatio || 1));

  // Navigator properties
  signals.push(navigator.language || '');
  signals.push(navigator.platform || '');
  signals.push('' + (navigator.hardwareConcurrency || 0));
  signals.push('' + (navigator.maxTouchPoints || 0));

  // Timezone
  try {
    signals.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch (_) {
    signals.push('tz:unknown');
  }

  // Hash all signals into a stable fingerprint
  var raw = signals.join('|');
  var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}
