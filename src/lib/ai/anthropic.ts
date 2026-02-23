import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateCVWithClaude(
    linkedinData: Record<string, unknown>,
    jobData: Record<string, unknown>
): Promise<string> {
    const systemPrompt = `Sen kıdemli bir ATS CV uzmanısın. 10 yılı aşkın işe alım danışmanlığı deneyimine sahipsin.

GÖREV:
Kullanıcının LinkedIn profil verisi (JSON) ve hedef iş ilanı verisi (JSON) sana verildi.
Bu ikisini derinlemesine analiz ederek, ATS sistemlerini geçecek ve recruiter'ların dikkatini çekecek, TAMAMEN bu pozisyona özel bir CV oluştur.

KURALLAR:
1. İş ilanındaki anahtar kelimeleri CV'ye organik biçimde yerleştir
2. Her deneyim maddesi bir RAKAMLA başlasın: "%40 daha hızlı...", "5 kişilik ekip..."
3. Geçmiş işler için geçmiş zaman, mevcut iş için geniş zaman kullan
4. Beceriler bölümünü iş ilanındaki teknolojilerle önceliklendir
5. Toplam kelime sayısı 400-600 arasında olsun (1 sayfa kuralı)
6. ATS skoru hesapla (0-100) ve matched_keywords listesini doldur
7. Hiçbir uydurma bilgi ekleme — sadece LinkedIn'deki gerçek verileri kullan
8. Eğer LinkedIn verisi eksik alanlar içeriyorsa o alanları boş bırak, uydurmaaçıklama yazma

ÇIKTI: Yalnızca aşağıdaki JSON formatında yanıt ver. Başka hiçbir şey yazma. Markdown code block kullanma. Sadece ham JSON.`

    const userMessage = `LinkedIn Profil Verisi:
${JSON.stringify(linkedinData, null, 2)}

İş İlanı Verisi:
${JSON.stringify(jobData, null, 2)}

Lütfen bu iki veriyi analiz ederek ATS-optimized CV JSON'ı üret. Format:
{
  "personal": {
    "name": "Ad Soyad",
    "email": "email@domain.com",
    "phone": "+90 5xx xxx xxxx",
    "location": "Şehir, Ülke",
    "linkedin": "linkedin.com/in/username",
    "portfolio": "portfolio.com"
  },
  "summary": "2-3 cümlelik güçlü, pozisyona özel özet...",
  "experience": [
    {
      "company": "Şirket Adı",
      "title": "Pozisyon",
      "startDate": "Oca 2022",
      "endDate": "Hâlâ",
      "location": "İstanbul",
      "bullets": [
        "%40 daha hızlı teslimat sağlayan CI/CD pipeline kurdu",
        "5 kişilik frontend ekibine teknik liderlik yaptı"
      ]
    }
  ],
  "education": [
    {
      "school": "Üniversite Adı",
      "degree": "Lisans, Bilgisayar Mühendisliği",
      "year": "2020"
    }
  ],
  "skills": {
    "technical": ["React", "TypeScript", "PostgreSQL"],
    "soft": ["Proje Yönetimi", "Ekip Liderliği"],
    "languages": ["Türkçe (Anadil)", "İngilizce (C1)"]
  },
  "certifications": [],
  "projects": [],
  "ats_score": 87,
  "matched_keywords": ["Next.js", "PostgreSQL", "API Design"]
}`

    const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
            {
                role: 'user',
                content: userMessage,
            },
        ],
        system: systemPrompt,
    })

    const content = message.content[0]
    if (content.type !== 'text') {
        throw new Error('Claude beklenmeyen format döndürdü')
    }

    return content.text
}
