import { loadFragment } from '../fragment/fragment.js';

/**
 * Article block.
 *
 * References an AEM article Content Fragment and renders it as a styled
 * article. In the Universal Editor the author picks a Content Fragment via the
 * block's `reference` (aem-content) field; that reference is authored as a link
 * whose href is the CF's delivery path. Content Fragments published to Edge
 * Delivery are delivered as HTML, so we fetch the CF's `.plain.html` and lay
 * out its fields (category/eyebrow, title, byline, hero image, body) with the
 * article styling. Styling uses the brand design tokens, so the same article
 * adopts the current brand palette (purple on body.aetna, red on body.cvs).
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
    // Reference could not be resolved — leave nothing rather than a broken link.
    block.remove();
    return;
  }

  const article = document.createElement('article');
  article.className = 'article-content';
  while (fragment.firstElementChild) article.append(fragment.firstElementChild);

  // Promote the first image to a hero treatment.
  const firstPicture = article.querySelector('picture');
  if (firstPicture) {
    const wrapper = firstPicture.closest('p') || firstPicture;
    wrapper.classList.add('article-hero');
  }

  // Tag the byline: the first paragraph that starts with "By ".
  article.querySelectorAll('p').forEach((p) => {
    if (/^\s*by\s+/i.test(p.textContent) && !p.querySelector('picture')) {
      p.classList.add('article-byline');
    }
  });

  block.append(article);
}
