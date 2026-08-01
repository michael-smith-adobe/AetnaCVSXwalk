/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Aetna section breaks + section metadata.
 *
 * Driven by payload.template.sections (page-templates.json). For each section:
 *   - inserts an <hr> before the section element when it is not the first
 *     section (one <hr> per section boundary = sections.length - 1),
 *   - creates a "Section Metadata" block after the section element when the
 *     section has a `style` value.
 *
 * Runs in afterTransform only. Section selectors come from the template
 * (verified against migration-work/cleaned.html): the 4 homepage sections are
 * the hero experiencefragment, two nextbestaction card sections, and the
 * legal-notices experiencefragment, all direct children of #content__main.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;

  const doc = element.ownerDocument;

  // Process in reverse so inserting nodes does not shift not-yet-processed sections.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    const sectionEl = element.querySelector(section.selector);
    if (!sectionEl) continue;

    // Section Metadata block (only when a style is defined for the section).
    if (section.style) {
      const smBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(smBlock);
    }

    // Section break before every section except the first.
    if (i > 0) {
      sectionEl.before(doc.createElement('hr'));
    }
  }
}
