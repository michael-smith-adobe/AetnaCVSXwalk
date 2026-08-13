import { loadFragment } from '../fragment/fragment.js';

/**
 * Article block.
 *
 * Renders an AEM article Content Fragment selected via the block's
 * `reference` (aem-content) field — the Universal Editor content picker. The
 * referenced CF is built on an "article" CF model with these fields:
 *   title, author, date (timing), banner (image reference), body (rich text).
 *
 * Content Fragments published to Edge Delivery are delivered as HTML, so we
 * fetch the CF's HTML and map its fields onto the article layout by the
 * delivery-template convention: title (h1) → byline paragraphs (author, date)
 * → banner image → body. Styling uses the brand design tokens, so the article
 * adopts the current brand palette (purple on body.aetna).
 */
export default async function decorate(block) {
  // The CF reference is authored as a link (aem-content) or as a plain path.
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();

  block.textContent = '';

  if (!path) {
    block.remove();
    return;
  }

  const fragment = await loadFragment(new URL(path, window.location).pathname);
  if (!fragment) {
    // Reference could not be resolved — render nothing rather than a broken link.
    block.remove();
    return;
  }

  const article = document.createElement('article');
  article.className = 'article-content';
  while (fragment.firstElementChild) article.append(fragment.firstElementChild);

  // Field: title — first heading, promoted to the article title (h1).
  const title = article.querySelector('h1, h2, h3');
  if (title) title.classList.add('article-title');

  // Field: banner — first image, given the hero treatment.
  const banner = article.querySelector('picture');
  const bannerWrap = banner ? (banner.closest('p') || banner) : null;
  if (bannerWrap) bannerWrap.classList.add('article-banner');

  // Fields: author + date (timing) — the meta paragraphs that sit between the
  // title and the banner image. Grouped into a single byline row.
  const byline = document.createElement('div');
  byline.className = 'article-byline';
  let node = title ? title.nextElementSibling : article.firstElementChild;
  while (node && node !== bannerWrap) {
    const next = node.nextElementSibling;
    if (node.tagName === 'P' && !node.querySelector('picture')) {
      byline.append(node);
    }
    node = next;
  }
  if (byline.childElementCount && title) title.after(byline);

  // Everything after the banner is the body (already in place; just marked).
  article.querySelectorAll('p').forEach((p) => {
    if (!p.closest('.article-byline') && !p.classList.contains('article-banner') && !p.querySelector('picture')) {
      p.classList.add('article-body-text');
    }
  });

  block.append(article);
}
