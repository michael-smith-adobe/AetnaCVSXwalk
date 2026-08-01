import { getMetadata, loadCSS } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Close all open dropdown/megamenu panels in a nav row.
 * @param {Element} scope element whose descendant triggers should be collapsed
 * @param {Element} [except] a trigger <li> to leave open
 */
function closeAllPanels(scope, except = null) {
  scope.querySelectorAll('.nav-has-panel[aria-expanded="true"]').forEach((li) => {
    if (li !== except) {
      li.setAttribute('aria-expanded', 'false');
      const btn = li.querySelector(':scope > .nav-trigger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });
  const overlay = document.querySelector('.nav-overlay');
  const anyOpen = scope.querySelector('.nav-has-panel[aria-expanded="true"]');
  if (overlay) overlay.classList.toggle('is-visible', !!anyOpen);
  document.body.classList.toggle('nav-panel-open', !!anyOpen);
}

/**
 * Wire a trigger <li> (one that contains a nested <ul> panel) for click toggling.
 * The trigger's text label becomes a button; the nested content becomes the panel.
 * @param {Element} li the list item that owns a panel
 * @param {Element} nav the root nav element
 */
function decorateTrigger(li, nav) {
  const panel = li.querySelector(':scope > ul');
  if (!panel) return;
  li.classList.add('nav-has-panel');
  li.setAttribute('aria-expanded', 'false');

  // Wrap the trigger's own label (everything except the panel) in a button.
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-trigger';
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');
  Array.from(li.childNodes).forEach((node) => {
    if (node === panel) return;
    button.append(node);
  });
  li.prepend(button);
  panel.classList.add('nav-panel');

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = li.getAttribute('aria-expanded') === 'true';
    closeAllPanels(nav, open ? null : li);
    li.setAttribute('aria-expanded', open ? 'false' : 'true');
    button.setAttribute('aria-expanded', open ? 'false' : 'true');
    const overlay = document.querySelector('.nav-overlay');
    if (overlay) overlay.classList.toggle('is-visible', !open);
    document.body.classList.toggle('nav-panel-open', !open);
  });
}

/**
 * Build the inline search form for the brand bar.
 * Content-free control created in JS per the nav.plain.html contract.
 */
function buildSearch() {
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = 'https://www.aetna.com/search.html';
  form.innerHTML = `
    <input type="search" name="q" aria-label="Search" placeholder="Search" autocomplete="off">
    <button type="submit" aria-label="search"></button>`;
  return form;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/content/nav';
  let fragment = await loadFragment(navPath);
  if (!fragment) fragment = await loadFragment('/content/nav');

  // When the page uses the CVS theme, render the CVS.com-style header instead
  // of the shared Aetna 3-row header. Keeps this block generic and reusable.
  if (document.body.classList.contains('cvs')) {
    await loadCSS(`${window.hlx.codeBasePath}/blocks/cvs-header/cvs-header.css`);
    const { default: decorateCvsHeader } = await import('../cvs-header/cvs-header.js');
    await decorateCvsHeader(block, fragment);
    return;
  }

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Three source rows: utility bar, brand bar, main nav.
  // loadFragment wraps each row's content in a .default-content-wrapper; unwrap it
  // so our row selectors operate on the ul/p directly.
  const rows = nav.querySelectorAll(':scope > div');
  const rowClasses = ['nav-utility', 'nav-brand', 'nav-main'];
  rows.forEach((row, i) => {
    if (rowClasses[i]) row.classList.add(rowClasses[i]);
    const wrapper = row.querySelector(':scope > .default-content-wrapper');
    if (wrapper) {
      while (wrapper.firstChild) row.append(wrapper.firstChild);
      wrapper.remove();
    }
  });

  const utility = nav.querySelector('.nav-utility');
  const brand = nav.querySelector('.nav-brand');
  const main = nav.querySelector('.nav-main');

  // Brand: strip button styling from the logo link, add search box.
  if (brand) {
    brand.querySelectorAll('a.button').forEach((a) => {
      a.className = '';
      const bc = a.closest('.button-container');
      if (bc) bc.className = '';
    });
    brand.append(buildSearch());
  }

  // Wire triggers (any <li> that owns a nested <ul>) in the utility and main rows.
  [utility, main].forEach((row) => {
    if (!row) return;
    row.querySelectorAll(':scope > ul > li').forEach((li) => {
      if (li.querySelector(':scope > ul')) decorateTrigger(li, nav);
    });
  });

  // Overlay backdrop shown when any panel is open (matches source).
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.addEventListener('click', () => closeAllPanels(nav));
  block.append(overlay);

  // Close panels on Escape and on outside click.
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeAllPanels(nav);
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllPanels(nav);
  });

  // Hamburger for mobile.
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';
  hamburger.addEventListener('click', () => {
    const open = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', open ? 'false' : 'true');
    hamburger.setAttribute('aria-expanded', open ? 'false' : 'true');
    hamburger.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    document.body.classList.toggle('nav-mobile-open', !open);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(hamburger, nav);
  block.append(navWrapper);

  // Reset state when crossing the desktop/mobile breakpoint.
  isDesktop.addEventListener('change', () => {
    closeAllPanels(nav);
    nav.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('nav-mobile-open');
  });
}
