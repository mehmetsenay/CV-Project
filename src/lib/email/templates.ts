import { Resend } from 'resend'

// Lazy init — API key olmasa da build patlamaz
function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Resend free plan: sadece verified email'e gönderilebilir.
// RESEND_TO_OVERRIDE set edilirse tüm emaillar o adrese gider (geliştirme için)
function resolveRecipient(to: string): string {
  return process.env.RESEND_TO_OVERRIDE ?? to
}

// ============================================================
// HOŞGELDİN EMAİLİ
// ============================================================
export async function sendWelcomeEmail(to: string, name: string) {
  const r = getResend()
  if (!r) return { error: 'Resend not configured' }
  return r.emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(to),
    subject: '🎉 CVAI\'ye hoş geldin! 7 günlük denemen başladı.',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CVAI\'ye Hoş Geldin</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#18181b;border-radius:16px;border:1px solid #27272a;overflow:hidden;max-width:560px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:36px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="background:rgba(255,255,255,0.2);border-radius:10px;padding:8px 14px;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
                  CV<span style="color:#c4b5fd;">AI</span>
                </div>
              </div>
              <p style="color:rgba(255,255,255,0.8);margin:12px 0 0;font-size:14px;">AI ile ATS CV Oluşturucu</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="color:#fff;font-size:24px;margin:0 0 8px;font-weight:700;">
                Hoş geldin, ${name || 'Kullanıcı'}! 👋
              </h1>
              <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px;">
                CVAI\'ye katıldığın için çok memnunuz. <strong style="color:#c4b5fd;">7 günlük ücretsiz denemen</strong> şimdi başladı.
                Bu süre içinde dilediğin kadar CV oluşturabilirsin.
              </p>

              <!-- Steps -->
              <div style="background:#0f0f10;border-radius:12px;padding:24px;margin:0 0 28px;">
                <p style="color:#71717a;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">
                  3 Adımda CV\'ni Hazırla
                </p>
                ${[
        ['01', 'LinkedIn profil URL\'ini yapıştır', '#7c3aed'],
        ['02', 'Başvurmak istediğin iş ilanını ekle', '#4f46e5'],
        ['03', 'AI\'nin sana özel CV\'yi hazırlamasını izle', '#10b981'],
      ].map(([num, text, color]) => `
                  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                    <div style="background:${color}20;color:${color};font-weight:700;font-size:13px;width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;text-align:center;line-height:28px;">
                      ${num}
                    </div>
                    <span style="color:#e4e4e7;font-size:14px;">${text}</span>
                  </div>
                `).join('')}
              </div>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/dashboard/cv/new"
                       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
                      İlk CV\'ni Oluştur →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#52525b;font-size:13px;text-align:center;margin:24px 0 0;line-height:1.6;">
                7 gün sonra $99/yıl olarak ücretlendirileceğini hatırlatırız.<br>
                İstediğin zaman iptal edebilirsin.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #27272a;padding:20px 40px;text-align:center;">
              <p style="color:#3f3f46;font-size:12px;margin:0;">
                © 2025 CVAI · <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none;">cvai.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

// ============================================================
// CV HAZIR EMAİLİ
// ============================================================
export async function sendCVReadyEmail(
  to: string,
  name: string,
  cvId: string,
  cvTitle: string,
  atsScore: number
) {
  const r = getResend()
  if (!r) return { error: 'Resend not configured' }
  return r.emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(to),
    subject: `✅ CV\'n hazır! ATS Skoru: ${atsScore}/100`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#18181b;border-radius:16px;border:1px solid #27272a;max-width:560px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:28px 40px;text-align:center;">
              <div style="font-size:22px;font-weight:900;color:#fff;">CV<span style="color:#c4b5fd;">AI</span></div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="font-size:48px;">🎉</div>
                <h1 style="color:#fff;font-size:22px;margin:12px 0 8px;">CV\'n hazır!</h1>
                <p style="color:#a1a1aa;font-size:14px;margin:0;">${cvTitle}</p>
              </div>

              <!-- ATS Score -->
              <div style="background:#0f0f10;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
                <p style="color:#71717a;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">ATS SKORU</p>
                <div style="font-size:48px;font-weight:900;color:${atsScore >= 80 ? '#10b981' : atsScore >= 60 ? '#f59e0b' : '#ef4444'};">
                  ${atsScore}<span style="font-size:20px;color:#52525b;">/100</span>
                </div>
                <p style="color:#71717a;font-size:13px;margin:8px 0 0;">
                  ${atsScore >= 80 ? 'Mükemmel! ATS sistemlerini geçecek.' : atsScore >= 60 ? 'İyi, biraz daha optimize edilebilir.' : 'Düşük. CV\'ni incelemeni öneririz.'}
                </p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/dashboard/cv/${cvId}"
                       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
                      CV\'ni Görüntüle & PDF İndir →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #27272a;padding:20px 40px;text-align:center;">
              <p style="color:#3f3f46;font-size:12px;margin:0;">© 2025 CVAI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

// ============================================================
// DENEME SÜRESİ BİTİYOR EMAİLİ
// ============================================================
export async function sendTrialEndingSoonEmail(to: string, name: string, daysLeft: number) {
  const r = getResend()
  if (!r) return { error: 'Resend not configured' }
  return r.emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(to),
    subject: `⏰ Deneme süren ${daysLeft} gün içinde bitiyor`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#18181b;border-radius:16px;border:1px solid #27272a;max-width:560px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:28px 40px;text-align:center;">
              <div style="font-size:22px;font-weight:900;color:#fff;">CV<span style="color:#fef3c7;">AI</span></div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="color:#fff;font-size:22px;margin:0 0 16px;">Merhaba ${name || ''}! ⏰</h1>
              <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Ücretsiz deneme süren <strong style="color:#fbbf24;">${daysLeft} gün</strong> içinde sona eriyor.
                Erişimini kaybetmemek için şimdi abone ol.
              </p>
              <div style="background:#292524;border-radius:12px;padding:20px;margin:0 0 24px;">
                <p style="color:#fbbf24;font-size:28px;font-weight:900;margin:0;text-align:center;">$99<span style="font-size:14px;color:#78716c;">/yıl</span></p>
                <p style="color:#78716c;font-size:13px;text-align:center;margin:4px 0 0;">Sınırsız CV · PDF İndir · Paylaşılabilir Link</p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/dashboard/settings"
                       style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
                      Şimdi Abone Ol →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}
