// Vercel Function for Study Nest AI. Keep GEMINI_API_KEY in Vercel settings.
const SYSTEM_PROMPT = `Kamu adalah Study Nest AI, tutor yang sabar, hangat, dan teliti untuk mahasiswa Indonesia.
Jelaskan konsep dengan bahasa sederhana, contoh konkret, dan tahapan yang mudah dipahami.
Untuk latihan, berikan petunjuk dahulu, lalu cek jawaban siswa sebelum membuka solusi.
Jika siswa meminta review kode C, jelaskan letak kesalahan dan cara memperbaikinya.
Jangan mengarang fakta; ungkapkan ketidakpastian jika diperlukan.`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Gunakan POST untuk mengirim pesan.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'GEMINI_API_KEY belum dikonfigurasi di Vercel.' });

  let input;
  try {
    input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Format permintaan tidak valid.' });
  }

  const messages = Array.isArray(input?.messages) ? input.messages.slice(-12) : [];
  const valid = messages.every(m =>
    m && ['user', 'assistant'].includes(m.role) &&
    typeof m.content === 'string' && m.content.trim().length > 0 && m.content.length <= 8000
  );
  if (!messages.length || !valid) return res.status(400).json({ error: 'Pesan kosong atau terlalu panjang.' });
  if (JSON.stringify(messages).length > 22000) return res.status(413).json({ error: 'Riwayat chat terlalu panjang. Coba hapus chat.' });

  const context = typeof input.context === 'string' ? input.context.slice(0, 2400) : '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 27000);
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT + (context ? '\nKonteks belajar dari aplikasi:\n' + context : '') }] },
          contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
          generationConfig: { maxOutputTokens: 1400, temperature: 0.65 }
        }),
        signal: controller.signal
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const friendly = response.status === 429
        ? 'Kuota Gemini sedang penuh. Coba lagi beberapa saat.'
        : response.status === 400 || response.status === 403
          ? 'Koneksi Gemini ditolak. Periksa status API key dan model di Google AI Studio.'
          : 'Layanan Gemini sedang bermasalah. Silakan coba lagi.';
      return res.status(response.status === 429 ? 429 : 502).json({ error: friendly });
    }
    const answer = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (!answer) return res.status(502).json({ error: 'Gemini tidak menghasilkan jawaban. Coba ulangi pertanyaan.' });
    return res.status(200).json({ reply: answer });
  } catch (e) {
    return res.status(504).json({ error: e.name === 'AbortError' ? 'AI terlalu lama merespons. Coba lagi.' : 'Koneksi AI gagal. Coba lagi.' });
  } finally {
    clearTimeout(timer);
  }
}
