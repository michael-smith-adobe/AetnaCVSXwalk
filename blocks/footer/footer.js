import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Inline SVG icons for social links, keyed by a substring of the link href.
// Content (labels, hrefs) lives in the fragment; only the glyph shape is here.
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.29-.04-1.3-.13-2.48-.13-2.45 0-4.13 1.5-4.13 4.25v2.17H7.3V13h2.79v8z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2m0 7.9A3.1 3.1 0 1 1 15.1 12 3.1 3.1 0 0 1 12 15.1m6.1-8.1a1.12 1.12 0 1 1-1.12-1.12A1.12 1.12 0 0 1 18.1 7M21.2 8.1a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-3.8-1.5C14.4 2.7 9.6 2.7 8.1 2.8a5.5 5.5 0 0 0-3.8 1.5A5.5 5.5 0 0 0 2.8 8.1C2.7 9.6 2.7 14.4 2.8 15.9a5.5 5.5 0 0 0 1.5 3.8 5.5 5.5 0 0 0 3.8 1.5c1.5.1 6.3.1 7.8 0a5.5 5.5 0 0 0 3.8-1.5 5.5 5.5 0 0 0 1.5-3.8c.1-1.5.1-6.3 0-7.8m-2 9.4a3.1 3.1 0 0 1-1.8 1.8c-1.2.5-4.1.4-5.4.4s-4.2.1-5.4-.4a3.1 3.1 0 0 1-1.8-1.8c-.5-1.2-.4-4.1-.4-5.4s-.1-4.2.4-5.4a3.1 3.1 0 0 1 1.8-1.8c1.2-.5 4.1-.4 5.4-.4s4.2-.1 5.4.4a3.1 3.1 0 0 1 1.8 1.8c.5 1.2.4 4.1.4 5.4s.1 4.2-.4 5.4"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.9 8.8H3.9V21h3zM5.4 3.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5M21 21v-6.7c0-3.3-.7-5.8-4.55-5.8a4 4 0 0 0-3.6 2h-.05V8.8H9.9V21h3v-6c0-1.6.3-3.15 2.3-3.15s2 1.83 2 3.25V21z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22.5 8.1a2.7 2.7 0 0 0-1.9-1.9C18.9 5.7 12 5.7 12 5.7s-6.9 0-8.6.5A2.7 2.7 0 0 0 1.5 8.1 28 28 0 0 0 1 12a28 28 0 0 0 .5 3.9 2.7 2.7 0 0 0 1.9 1.9c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 23 12a28 28 0 0 0-.5-3.9M9.8 15.3V8.7l5.7 3.3z"/></svg>',
};

/**
 * Replace the social link text with an inline SVG glyph based on its href.
 * @param {Element} list the <ul> holding social links
 */
function decorateSocialIcons(list) {
  list.classList.add('footer-social');
  list.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const key = Object.keys(SOCIAL_ICONS).find((k) => href.includes(k));
    if (key) {
      a.setAttribute('aria-label', a.textContent.trim());
      a.textContent = '';
      a.innerHTML = SOCIAL_ICONS[key];
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment (dual-fetch: localhost then DA/EDS)
  const footerMeta = getMetadata('footer');
  let footerPath;
  if (footerMeta) {
    footerPath = new URL(footerMeta, window.location).pathname;
  } else {
    // No explicit `footer` metadata: load the footer that sits as a sibling of
    // the current page (e.g. /aetna/footer for /aetna/*, /cvs/footer for
    // /cvs/*), so each brand section gets its own footer without per-page
    // metadata. Mirrors the theme-by-path fallback in scripts.js.
    const dir = window.location.pathname.replace(/\/[^/]*$/, '');
    footerPath = `${dir}/footer`;
  }
  let fragment = await loadFragment(footerPath);
  // Fallbacks: site-root footer, then legacy /content/footer.
  if (!fragment) fragment = await loadFragment('/footer');
  if (!fragment) fragment = await loadFragment('/content/footer');

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Unwrap default-content-wrappers so each source section is a direct child.
  footer.querySelectorAll(':scope > div').forEach((section) => {
    const wrapper = section.querySelector(':scope > .default-content-wrapper');
    if (wrapper) {
      while (wrapper.firstChild) section.append(wrapper.firstChild);
      wrapper.remove();
    }
  });

  const sections = footer.querySelectorAll(':scope > div');

  // Section 0: brand + social icons.
  const brand = sections[0];
  if (brand) {
    brand.classList.add('footer-brand');
    const socialList = brand.querySelector('ul');
    if (socialList) decorateSocialIcons(socialList);
  }

  // Middle sections: link columns.
  const lastIndex = sections.length - 1;
  sections.forEach((section, i) => {
    if (i > 0 && i < lastIndex) section.classList.add('footer-links');
  });

  // Last section: bottom bar (copyright + language links).
  const bottom = sections[lastIndex];
  if (bottom && lastIndex > 0) bottom.classList.add('footer-bottom');

  // Group the link columns into a single row wrapper for layout.
  const columns = footer.querySelectorAll('.footer-links');
  if (columns.length) {
    const row = document.createElement('div');
    row.className = 'footer-columns';
    const firstCol = columns[0];
    firstCol.parentNode.insertBefore(row, firstCol);
    columns.forEach((col) => row.append(col));
  }

  block.append(footer);
}
