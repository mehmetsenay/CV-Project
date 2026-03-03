import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export async function generateCVWithClaude(
  linkedinData: Record<string, unknown>,
  jobData: Record<string, unknown>
): Promise<string> {
  // Debug: Gelen veriyi logla
  console.log('📊 LinkedIn data keys:', Object.keys(linkedinData || {}).slice(0, 15))
  console.log('📊 Job data keys:', Object.keys(jobData || {}).slice(0, 15))

  const prompt = `Sen kıdemli bir ATS CV uzmanısın.

--- LİNKEDIN PROFİL VERİSİ (Ham JSON) ---
${JSON.stringify(linkedinData, null, 2)}

--- İŞ İLANI VERİSİ (Ham JSON) ---
${JSON.stringify(jobData, null, 2)}

--- GÖREV ---
Bu verileri analiz edip ATS-optimized bir CV JSON'ı üret.

--- KİŞİSEL BİLGİ ÇIKARMA (harvestapi formatı) ---
LinkedIn verisi harvestapi formatında gelir. Şu sırayla dene:

İSİM: "fullName" → yoksa "firstName" + " " + "lastName" → yoksa "name"
EMAİL: "email" → yoksa null (uydurma)
TELEFON: "phone" → yoksa null
KONUM: "location.linkedinText" → yoksa "location" (string ise direkt kullan)
HEADLINE: "headline" → yoksa "jobTitle"
LİNKEDİN URL: "linkedinUrl" → yoksa "publicIdentifier" ile https://linkedin.com/in/[id] oluştur
ÖZET: "about" → yoksa "summary" → yoksa "description"
FOTOĞRAF: "profilePicUrl" → yoksa "profileImageUrl" → yoksa null
DENEYIM: "experience" → yoksa "positions" → yoksa her öğede title/company/startDate/endDate/description
EĞİTİM: "education" → yoksa "schools"
BECERİLER: "topSkills" (array of strings veya {name} objeleri) → yoksa "skills"

--- ÇIKTI KURALLARI ---
1. SADECE geçerli JSON döndür. Markdown yok, code block yok.
2. Uydurma bilgi ekleme (email, telefon özellikle).
3. İş ilanındaki anahtar kelimeleri CV'ye yerleştir.
4. ATS skoru hesapla (0-100).
5. matched_keywords listesini iş ilanındaki terimlerden doldur.
6. ÖNEMLİ: "projects" ve "certifications" alanlarını eğer adayın profilinde veya deneyim açıklamalarında (experience bullets) zikredilmişse KESİNLİKLE doldur. Boş bırakmaktan kaçın. Adayın projelerini bul ve listele.

JSON FORMATI:
{
  "personal": {
    "name": "Gerçek ad soyad (LinkedIn'den)",
    "email": "email veya null",
    "phone": null,
    "location": "konum",
    "linkedin": "linkedin profil url",
    "portfolio": null,
    "profileImage": "profil fotoğrafı URL'si veya null"
  },
  "summary": "2-3 cümle pozisyona özel özet",
  "experience": [
    {
      "company": "şirket adı",
      "title": "pozisyon",
      "startDate": "Oca 2022",
      "endDate": "Hâlâ",
      "location": "konum",
      "bullets": ["başarı 1", "başarı 2"]
    }
  ],
  "education": [
    {
      "school": "okul adı",
      "degree": "lisans/yüksek lisans + bölüm",
      "year": "mezuniyet yılı"
    }
  ],
  "skills": {
    "technical": ["beceri1", "beceri2"],
    "soft": ["beceri1"],
    "languages": ["Türkçe (Anadil)"]
  },
  "certifications": [
    {
      "name": "Sertifika veya Eğitim Adı",
      "issuer": "Veren Kurum",
      "date": "Tarih (örn: 2023)"
    }
  ],
  "projects": [
    {
      "name": "Proje Adı",
      "description": "Proje hakkında 1-2 cümlelik açıklama. Adayın deneyimlerinden veya projelerinden çıkar.",
      "technologies": ["React", "Typescript"]
    }
  ],
  "ats_score": 85,
  "matched_keywords": ["keyword1", "keyword2"]
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  console.log('🤖 Gemini response preview:', text.slice(0, 200))
  return text
}

export async function generateMotivationLetterWithClaude(
  linkedinData: Record<string, unknown>,
  jobData: Record<string, unknown>,
  cvJson: Record<string, unknown>
): Promise<string> {
  const prompt = `Sen profesyonel bir İnsan Kaynakları Uzmanı ve deneyimli bir Kariyer Danışmanısın.

GÖREV:
Kullanıcının LinkedIn profil verisi (JSON), hedef iş ilanı verisi (JSON) ve yeni oluşturulmuş CV'si (JSON) sana sağlandı.
Bu verileri kullanarak hedef iş ilanına tam olarak uyan, İkna Edici ve Profesyonel bir Motivasyon Mektubu (Ön Yazı) oluştur.

KURALLAR:
1. Hitap ile başla (Eğer ilanda isim varsa kullanarak, yoksa "Sayın İlgili" veya "İnsan Kaynakları Yöneticisi" gibi profesyonel bir hitap kullan).
2. Giriş: Neden bu şirkete ve pozisyona başvurduğunu güçlü bir şekilde ifade et.
3. Gelişme: Adayın geçmiş tecrübelerinden RAKAMSAL başarılarını kullan.
4. Sonuç: Teşekkür ederek mülakat talebinde bulun.
5. Yazım Dili: Profesyonel, akıcı Türkçe. Yaklaşık 250-350 kelime.
6. Asla boş placeholder bırakma.
7. Çıktı olarak SADECE mektubun tam metnini döndür.

LinkedIn Profil Verisi:
${JSON.stringify(linkedinData, null, 2)}

İş İlanı Verisi:
${JSON.stringify(jobData, null, 2)}

Adayın CV Verisi:
${JSON.stringify(cvJson, null, 2)}

Lütfen bu verileri kullanarak muhteşem bir motivasyon mektubu (ön yazı) metni üret.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return text.trim()
}
