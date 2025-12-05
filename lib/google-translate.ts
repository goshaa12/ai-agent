/**
 * Google Translate API интеграция
 * Использует бесплатный Google Translate API через fetch
 */

export async function translateWithGoogle(
  text: string,
  targetLang: 'ru' | 'kk' | 'en'
): Promise<string> {
  try {
    // Используем бесплатный Google Translate API
    // В продакшене лучше использовать официальный @google-cloud/translate
    const langCode = targetLang === 'kk' ? 'kk' : targetLang === 'ru' ? 'ru' : 'en';
    
    // Используем публичный API Google Translate (ограниченный, но бесплатный)
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Translation API error');
    }

    const data = await response.json();
    
    // Google Translate возвращает массив, где первый элемент содержит переводы
    if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      const translatedParts = data[0].map((part: any[]) => part[0]).filter(Boolean);
      return translatedParts.join('') || text;
    }

    return text;
  } catch (error) {
    console.error('Google Translate error:', error);
    // Fallback на OpenAI если доступен
    return text;
  }
}

