// app/api/tracking/route.js
// API para registrar page views y métricas

import { PageView, ApiMetric } from '@/lib/models';
import crypto from 'crypto';

// Detectar tipo de dispositivo
function detectDevice(userAgent) {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android.*mobile|windows phone/.test(ua)) return 'mobile';
  return 'desktop';
}

// Detectar navegador
function detectBrowser(userAgent) {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
  return 'Other';
}

// Hash del IP para privacidad
function hashIP(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'default-salt').digest('hex').substring(0, 16);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === 'pageview') {
      const userAgent = request.headers.get('user-agent') || '';
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      
      await PageView.create({
        path: data.path,
        user_agent: userAgent,
        ip_hash: hashIP(ip),
        referrer: data.referrer || null,
        session_id: data.sessionId || null,
        device_type: detectDevice(userAgent),
        browser: detectBrowser(userAgent),
        country: request.headers.get('x-vercel-ip-country') || null,
        duration_ms: data.duration || null,
        created_at: new Date(),
      });

      return Response.json({ success: true });
    }

    if (type === 'api') {
      await ApiMetric.create({
        endpoint: data.endpoint,
        method: data.method,
        status_code: data.statusCode,
        response_time_ms: data.responseTime,
        error_message: data.error || null,
        created_at: new Date(),
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
