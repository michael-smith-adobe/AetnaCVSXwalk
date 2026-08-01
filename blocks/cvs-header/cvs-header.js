/*
 * CVS-style header — mirrors the cvs.com header layout:
 *   Row 1 (brand bar, white): logo · store selector · centered search · Sign in · Cart
 *   Row 2 (quick links bar, white with bottom border): red "Menu" button + horizontal link row
 * Reads all copy/links from the nav fragment (content-first); builds controls in JS.
 */

/** Move a fragment section's inner content out of its default-content-wrapper. */
function unwrap(section) {
  if (!section) return;
  const wrapper = section.querySelector(':scope > .default-content-wrapper');
  if (wrapper) {
    while (wrapper.firstChild) section.append(wrapper.firstChild);
    wrapper.remove();
  }
}

/** Build the centered search form (control lives in JS per the fragment contract). */
function buildSearch() {
  const form = document.createElement('form');
  form.className = 'cvs-search';
  form.setAttribute('role', 'search');
  form.action = 'https://www.cvs.com/search';
  form.innerHTML = `
    <input type="search" name="searchTerm" aria-label="Search CVS or ask a question"
      placeholder="Search CVS or ask a question" autocomplete="off">
    <button type="submit" aria-label="Submit Search"></button>`;
  return form;
}

/**
 * Decorate the header block as a CVS.com-style header.
 * @param {Element} block the header block element
 * @param {Element} fragment the loaded nav fragment (main element)
 */
export default async function decorate(block, fragment) {
  block.textContent = '';

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'cvs-nav';
  nav.setAttribute('aria-label', 'Main navigation');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const sections = nav.querySelectorAll(':scope > div');
  const [utility, brand, quicklinks] = sections;
  [utility, brand, quicklinks].forEach(unwrap);

  // ---- Brand row ----
  const brandRow = document.createElement('div');
  brandRow.className = 'cvs-brand';

  // Logo (from brand section's first paragraph/link)
  const logo = brand?.querySelector('p');
  if (logo) {
    logo.classList.add('cvs-logo');
    brandRow.append(logo);
  }

  // Store selector (brand section's "Find a store" link → button-like control)
  const storeLink = brand?.querySelector('ul a');
  if (storeLink) {
    storeLink.classList.add('cvs-store');
    brandRow.append(storeLink);
  }

  // Centered search
  brandRow.append(buildSearch());

  // Account actions (from utility section: Sign in, Cart)
  const actions = document.createElement('div');
  actions.className = 'cvs-actions';
  utility?.querySelectorAll('a').forEach((a) => {
    const label = a.textContent.trim().toLowerCase();
    if (label.includes('sign')) a.classList.add('cvs-signin');
    if (label.includes('cart')) {
      a.classList.add('cvs-cart');
      // icon-only with a count badge, like cvs.com; keep label for screen readers
      a.setAttribute('aria-label', `${a.textContent.trim()}, 0 items`);
      const badge = document.createElement('span');
      badge.className = 'cvs-cart-badge';
      badge.textContent = '0';
      a.append(badge);
    }
    actions.append(a);
  });
  brandRow.append(actions);

  // ---- Quick links row ----
  const linksRow = document.createElement('div');
  linksRow.className = 'cvs-quicklinks';

  const menuButton = document.createElement('button');
  menuButton.type = 'button';
  menuButton.className = 'cvs-menu-button';
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-controls', 'cvs-quicklinks-list');
  menuButton.textContent = 'Menu';

  const list = quicklinks?.querySelector('ul');
  if (list) {
    list.id = 'cvs-quicklinks-list';
    list.classList.add('cvs-quicklinks-list');
  }

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', open ? 'false' : 'true');
    document.body.classList.toggle('cvs-menu-open', !open);
  });

  linksRow.append(menuButton);
  if (list) linksRow.append(list);

  // Assemble: replace the raw sections with our two structured rows.
  nav.textContent = '';
  nav.append(brandRow, linksRow);

  const wrapper = document.createElement('div');
  wrapper.className = 'cvs-nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);

  // Close the mobile menu when resizing up to desktop.
  const isDesktop = window.matchMedia('(min-width: 900px)');
  isDesktop.addEventListener('change', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('cvs-menu-open');
  });
}
