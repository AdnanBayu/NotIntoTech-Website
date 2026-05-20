// Sanitize article content to prevent XSS
// Allowed tags: h1-h6, p, br, strong, em, u, a, ul, ol, li, blockquote, img

const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const purify = DOMPurify(window);


const sanitizeArticle = (req, res, next) => {
  if (req.body.content) {
    const clean = purify.sanitize(req.body.content, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p',
        'br', 'strong', 'em', 'u', 'a', 'ul', 'ol',
        'li', 'blockquote', 'img', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src',
        'alt', 'title', 'class', 'id'],
      ALLOW_DATA_ATTR: false,
      KEEP_CONTENT: true
    });
    req.body.content = clean;
  }

  next();
};

module.exports = sanitizeArticle;