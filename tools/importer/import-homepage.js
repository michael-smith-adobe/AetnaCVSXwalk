/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsAudienceParser from './parsers/cards-audience.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/aetna-cleanup.js';
import sectionsTransformer from './transformers/aetna-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Aetna homepage - hero banner, audience selection cards (next best action), secondary audience cards, and legal notices disclaimer',
  urls: [
    'https://www.aetna.com/',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: [
        '#content__main > div.experiencefragment.section:nth-of-type(1) .phb__herobanner',
        '.phb.phb__herobanner',
      ],
    },
    {
      name: 'cards-audience',
      instances: [
        '#content__main > div.nextbestaction.section:nth-of-type(2) ul.cmp-nextbestaction__items',
        '#content__main > div.nextbestaction.section:nth-of-type(3) ul.cmp-nextbestaction__items',
        'ul.cmp-nextbestaction__items',
      ],
    },
  ],
  sections: [
    {
      id: 'rc1',
      name: 'Hero banner',
      selector: '#content__main > div.experiencefragment.section:nth-of-type(1)',
      style: null,
      blocks: ['hero-banner'],
      defaultContent: [],
    },
    {
      id: 'rc2',
      name: 'Audience selection intro + cards',
      selector: '#content__main > div.nextbestaction.section:nth-of-type(2)',
      style: null,
      blocks: ['cards-audience'],
      defaultContent: [
        '#content__main > div.nextbestaction.section:nth-of-type(2) .cmp-nextbestaction__headline',
      ],
    },
    {
      id: 'rc3',
      name: 'Secondary audience cards',
      selector: '#content__main > div.nextbestaction.section:nth-of-type(3)',
      style: null,
      blocks: ['cards-audience'],
      defaultContent: [],
    },
    {
      id: 'rc4',
      name: 'Legal notices',
      selector: '#content__main > div.experiencefragment.section:nth-of-type(4)',
      style: null,
      blocks: [],
      defaultContent: [
        '#content__main > div.experiencefragment.section:nth-of-type(4) .cmp-disclaimer',
      ],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-audience': cardsAudienceParser,
};

// TRANSFORMER REGISTRY - section transformer runs after cleanup (afterTransform hook)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * De-duplicates elements matched by multiple selectors.
 * @param {Document} document
 * @param {Object} template - PAGE_TEMPLATE
 * @returns {Array} block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by an earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path.
    // Strip trailing slash and .html; the homepage/root ('/') collapses to an
    // empty string, so fall back to '/index' — an empty path makes the importer
    // call path.resolve() with a non-absolute base, which crashes in-browser.
    const pathname = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html$/, '');
    const path = WebImporter.FileUtils.sanitizePath(pathname) || '/index';

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
