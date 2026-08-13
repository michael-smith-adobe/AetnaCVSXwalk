/**
 * Text Styles block.
 *
 * A showcase/utility block that lets authors apply a named text style to a
 * rich-text sample. Each row has two cells: cell 1 = the style keyword (from
 * the model's "style" select), cell 2 = the rich-text content. The keyword
 * becomes a `text-style-<keyword>` class on the row, and the per-style CSS is
 * written in terms of the brand design tokens (--brand-purple, --text-color,
 * etc.) so the SAME style renders in the current brand's palette — purple on
 * body.aetna, red on body.cvs — with no content or block-code changes.
 */

const KNOWN_STYLES = [
  'eyebrow',
  'display',
  'headline',
  'lead',
  'body',
  'emphasis',
  'quote',
  'fineprint',
];

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    // Two-cell authoring: [style keyword, content]. Fall back gracefully if a
    // row only has content (treated as default "body").
    const styleCell = cells.length > 1 ? cells[0] : null;
    const contentCell = cells.length > 1 ? cells[1] : cells[0];
    if (!contentCell) return;

    const keyword = (styleCell ? styleCell.textContent : '').trim().toLowerCase();
    const style = KNOWN_STYLES.includes(keyword) ? keyword : 'body';

    contentCell.classList.add('text-style', `text-style-${style}`);
    // Drop the keyword cell so only the styled content renders.
    if (styleCell) styleCell.remove();
  });
}
