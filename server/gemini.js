export function fail(status, message) { return Object.assign(new Error(message), { status }); }
export function parseBody(req) {
  if (req.method !== 'POST') throw fail(405, 'Use POST for this endpoint.');
  try { return typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { throw fail(400, 'Invalid JSON body.'); }
}
export function validateAnalysis(value) {
  const texts = ['title', 'abstract_summary', 'methodology'];
  const lists = ['authors', 'key_contributions', 'keywords', 'future_work'];
  return Boolean(value && texts.every(k => typeof value[k] === 'string') &&
    lists.every(k => Array.isArray(value[k]) && value[k].every(v => typeof v === 'string')));
}
export async function generate(contents, json = false) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  if (!key) throw fail(503, 'The analysis service is not configured. No report was generated.');
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) throw fail(503, 'The configured model name is invalid.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 4096, ...(json ? { responseMimeType: 'application/json' } : {}) } }),
    });
    if (!response.ok) throw fail(response.status === 429 ? 429 : 502, 'The analysis provider is unavailable. Please retry later.');
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.filter(p => typeof p.text === 'string').map(p => p.text).join('');
    if (!text) throw fail(502, 'The provider returned no usable response.');
    return text;
  } catch (error) {
    if (controller.signal.aborted) throw fail(504, 'The analysis service took too long to respond.');
    if (error.status) throw error;
    throw fail(502, 'The analysis provider could not be reached.');
  } finally { clearTimeout(timer); }
}
export function sendError(res, error) {
  if (error.status === 405) res.setHeader('Allow', 'POST');
  return res.status(error.status || 500).json({ detail: error.status ? error.message : 'The request could not be processed.' });
}
