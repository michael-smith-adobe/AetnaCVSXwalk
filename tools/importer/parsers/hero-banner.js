/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero. Source: https://www.aetna.com/
 * Generated: 2026-07-31
 *
 * Library convention (block-context/hero-banner/library-description.txt): 1-column block.
 *   Row 1: block name. Row 2: image (optional). Row 3: text (title + subheading + CTA) as richtext.
 * xwalk model (blocks/hero-banner/_hero-banner.json): image (reference) + collapsed imageAlt, text (richtext).
 * Selectors validated against block-context/hero-banner/source.html.
 */
export default function parse(element, { document }) {
  // INPUT extraction — validated selectors + fallbacks for cross-page variation.
  const heading = element.querySelector('h1.phb__titlewrapper, .phb__titlewrapper, h1, [class*="title"]');
  const paragraph = element.querySelector('.phb__subcopy, [class*="subcopy"], .rte-component-wraper');
  const image = element.querySelector('.phb__image img, [class*="image"] img, img');

  // Empty-block guard.
  if (!heading && !paragraph && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2 (1 cell): image — field:image. imageAlt collapses into the <img alt="">.
  if (image) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(image);
    cells.push([imageCell]);
  }

  // Row 3 (1 cell): text richtext — field:text. Heading + welcome paragraph (preserves <strong>).
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  if (paragraph) textCell.appendChild(paragraph);
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
