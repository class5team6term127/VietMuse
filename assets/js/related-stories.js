/* VietMuse V28 — automatic, privacy-friendly related-story ranking.
 * No paid AI service, API keys, cookies, or additional database tables required.
 * Uses the already loaded list of published stories. */
(function (root) {
  'use strict';

  const STOP_VI = new Set(`và là của cho với trong trên dưới từ đến tại về theo một những các cái này đó đây kia được đang đã sẽ cũng còn thì rằng như bởi vì hay hoặc nhưng mà rất hơn nhiều khi nơi của họ chúng tôi bạn người bài báo tin tức thông qua sau trước cùng khác có không bị vừa mới rằng ngày tháng năm hiện nay hiện tại việt nam vietnam vietmuse chúng ta một số các bên thành phố quốc gia`.split(' ').map(word => word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')));
  const STOP_EN = new Set(`the a an and or but for nor so yet of to in on at by with from as is are was were be been being have has had do does did will would can could should may might must this that these those it its their they them you your we our he she his her who which what when where how why not more most less very many some about into than then now after before news report article stories story said says also new latest vietnam vietnamese vietmuse people year years today yesterday monday tuesday wednesday thursday friday saturday sunday`.split(' '));
  const STOP_ALL = new Set(['https', 'http', 'www', 'com', 'jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm']);
  const normalize = value => String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLocaleLowerCase('en');
  const TOKEN_RE = /[\p{L}\p{N}]+/gu;
  function tokens(text, lang, maxChars) {
    const clean = String(text || '').slice(0, maxChars)
      .replace(/\[\[(?:image|video)\|[^\]]+\]\]/gi, ' ')
      .replace(/https?:\/\/\S+/gi, ' ');
    const words = normalize(clean).match(TOKEN_RE) || [];
    const ignored = lang === 'en' ? STOP_EN : STOP_VI;
    const keep = word => word.length >= 3 && word.length <= 35 && !ignored.has(word) && !STOP_ALL.has(word) && (!/^\d+$/.test(word) || word.length === 4);
    const filtered = words.filter(keep);
    // Bigrams capture topical phrases such as "bao luc", "hoc duong", "kinh te".
    const unique = [...filtered];
    for (let i = 0; i < words.length - 1; i++) {
      if (keep(words[i]) && keep(words[i + 1])) unique.push(words[i] + '_' + words[i + 1]);
    }
    return unique;
  }
  function docTerms(post, lang) {
    const result = new Map();
    const add = (text, weight, size) => {
      const freq = new Map();
      for (const w of tokens(text, lang, size)) freq.set(w, Math.min((freq.get(w) || 0) + 1, 3));
      for (const [term, n] of freq) result.set(term, (result.get(term) || 0) + weight * (1 + (n - 1) * 0.2));
    };
    add(post.title, 6, 250);
    add(post.excerpt, 3, 750);
    add(post.body, 0.65, 6500);
    return result;
  }
  function ms(date) { const n = Date.parse(date || ''); return Number.isFinite(n) ? n : 0; }
  function recommend(current, articles, metrics, limit = 3) {
    if (!current || !Array.isArray(articles) || current.status !== 'published') return [];
    const lang = current.language === 'en' ? 'en' : 'vi';
    const source = String(current.source_key || '');
    const sameStory = p => p.id === current.id || (current.translation_group && p.translation_group === current.translation_group) || (source && p.source_key === source);
    const pool = articles.filter(p => p && p.id && p.status === 'published' && p.language === lang && p.post_type === current.post_type && !sameStory(p));
    if (!pool.length) return [];
    const docs = [current, ...pool].map(p => docTerms(p, lang));
    const frequency = new Map();
    for (const terms of docs) for (const term of terms.keys()) frequency.set(term, (frequency.get(term) || 0) + 1);
    const idf = t => Math.log(1 + (docs.length + 1) / (1 + (frequency.get(t) || 0)));
    const original = docs[0];
    const topical = [...original.entries()].sort((a, b) => b[1] * idf(b[0]) - a[1] * idf(a[0])).slice(0, 130);
    const candidates = pool.map((p, index) => {
      const terms = docs[index + 1];
      let overlap = 0, count = 0;
      for (const [word, sourceWeight] of topical) {
        const otherWeight = terms.get(word) || 0;
        if (!otherWeight) continue;
        const distinctive = idf(word);
        overlap += Math.min(sourceWeight, otherWeight) * distinctive * (word.includes('_') ? 1.15 : 1);
        count++;
      }
      const sameCategory = Boolean(current.category && p.category === current.category);
      // Never suggest an unrelated article from a completely different section.
      if (!sameCategory && (count < 2 || overlap < 5.0)) return null;
      const sameType = p.post_type === current.post_type;
      const age = Math.max(0, Date.now() - ms(p.published_at || p.created_at));
      const fresh = Math.exp(-age / (1000 * 60 * 60 * 24 * 120));
      const viewCount = Math.max(0, Number(metrics?.[p.id]?.views || 0));
      const popular = Math.min(2.5, Math.log1p(viewCount) / 3);
      return {
        article: p,
        score: overlap * 0.9 + (sameCategory ? 22 : 0) + (sameType ? 3 : 0) + fresh * 2 + popular,
        reason: count >= 2 && overlap >= 5.0 ? 'topic' : 'category',
        overlap
      };
    }).filter(Boolean);
    candidates.sort((a, b) => b.score - a.score || ms(b.article.published_at) - ms(a.article.published_at) || String(a.article.id).localeCompare(String(b.article.id)));
    // Avoid multiple editions of one source story, even if the database contains duplicates.
    const seen = new Set(), final = [];
    for (const entry of candidates) {
      const p = entry.article, key = p.translation_group || p.source_key || p.id;
      if (seen.has(key)) continue;
      seen.add(key); final.push(entry);
      if (final.length >= Math.max(1, Math.min(6, Number(limit) || 3))) break;
    }
    return final;
  }
  root.VMRelatedStories = Object.freeze({ recommend });
})(typeof window !== 'undefined' ? window : globalThis);
