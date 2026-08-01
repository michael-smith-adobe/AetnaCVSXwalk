/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-audience. Base: cards. Source: https://www.aetna.com/
 * Generated: 2026-07-31
 *
 * Library convention (block-context/cards-audience/library-description.txt): container block.
 *   Row 1: block name. Each subsequent row = one card with 2 cells:
 *     cell 1 = image/icon (field:image, imageAlt collapsed), cell 2 = text richtext (field:text)
 *     holding the linked heading + description. Empty cells must still be included.
 * xwalk child model (blocks/cards-audience/_cards-audience.json → card): image (reference) + text (richtext).
 * Selectors validated against block-context/cards-audience/source.html.
 */
export default function parse(element, { document }) {
  // Each <li> is one card. Fallbacks cover cross-page DOM variation.
  const items = Array.from(element.querySelectorAll(':scope > li, li.cmp-nextbestaction__item'));

  // Empty-block guard.
  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((li) => {
    // Cell 1: pictogram icon image — field:image (imageAlt collapses into <img alt>).
    const icon = li.querySelector('.cmp-nextbestaction__item--top-icon img, img.cq-dd-image, img');
    let imageCell = '';
    if (icon) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(' field:image '));
      frag.appendChild(icon);
      imageCell = frag;
    }

    // Cell 2: richtext — field:text. Linked heading (h3 > a) + description paragraph.
    const heading = li.querySelector('.cmp-nextbestaction__item--top-headline h3, h3, [class*="headline"] h3');
    const description = li.querySelector('.cmp-nextbestaction__item--body p, .rte-component-wraper p, p');
    let textCell = '';
    if (heading || description) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(' field:text '));
      if (heading) frag.appendChild(heading);
      if (description) frag.appendChild(description);
      textCell = frag;
    }

    // Both cells always included, even if empty (per library convention).
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-audience', cells });
  element.replaceWith(block);
}
