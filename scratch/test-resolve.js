const cheerio = require('cheerio');

async function test() {
  const url = 'https://amzn.in/d/02mEOqcy';
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('#productTitle').text().trim() || $('title').text().trim();
    const wholePrice = $('.a-price-whole').first().text().replace(/[,.]/g, '').trim();
    const offscreenPrice = $('.a-price .a-offscreen').first().text().trim();
    const basisPrice = $('.basisPrice .a-offscreen, .a-price.a-text-price .a-offscreen').first().text().trim();
    const image = $('#landingImage').attr('src') || $('meta[property="og:image"]').attr('content');

    console.log('TITLE:', title);
    console.log('WHOLE PRICE:', wholePrice);
    console.log('OFFSCREEN PRICE:', offscreenPrice);
    console.log('BASIS (MRP):', basisPrice);
    console.log('IMAGE:', image);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
