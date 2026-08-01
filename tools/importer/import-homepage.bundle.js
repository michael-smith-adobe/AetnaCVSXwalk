/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const heading = element.querySelector('h1.phb__titlewrapper, .phb__titlewrapper, h1, [class*="title"]');
    const paragraph = element.querySelector('.phb__subcopy, [class*="subcopy"], .rte-component-wraper');
    const image = element.querySelector('.phb__image img, [class*="image"] img, img');
    if (!heading && !paragraph && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(image);
      cells.push([imageCell]);
    }
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (heading) textCell.appendChild(heading);
    if (paragraph) textCell.appendChild(paragraph);
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-audience.js
  function parse2(element, { document }) {
    const items = Array.from(element.querySelectorAll(":scope > li, li.cmp-nextbestaction__item"));
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((li) => {
      const icon = li.querySelector(".cmp-nextbestaction__item--top-icon img, img.cq-dd-image, img");
      let imageCell = "";
      if (icon) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:image "));
        frag.appendChild(icon);
        imageCell = frag;
      }
      const heading = li.querySelector('.cmp-nextbestaction__item--top-headline h3, h3, [class*="headline"] h3');
      const description = li.querySelector(".cmp-nextbestaction__item--body p, .rte-component-wraper p, p");
      let textCell = "";
      if (heading || description) {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createComment(" field:text "));
        if (heading) frag.appendChild(heading);
        if (description) frag.appendChild(description);
        textCell = frag;
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-audience", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/aetna-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".modal__wrapper",
        "#onetrust-consent-sdk",
        "#kampyleButtonContainer",
        "#MDigitalInvitationWrapper"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        ".skip__link",
        "#ZN_bCr1Fe9iQOHCKzz",
        "#opensNewWindow",
        "#content-end",
        "iframe",
        "link",
        "noscript",
        "source"
      ]);
    }
  }

  // tools/importer/transformers/aetna-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;
      if (section.style) {
        const smBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(smBlock);
      }
      if (i > 0) {
        sectionEl.before(doc.createElement("hr"));
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Aetna homepage - hero banner, audience selection cards (next best action), secondary audience cards, and legal notices disclaimer",
    urls: [
      "https://www.aetna.com/"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: [
          "#content__main > div.experiencefragment.section:nth-of-type(1) .phb__herobanner",
          ".phb.phb__herobanner"
        ]
      },
      {
        name: "cards-audience",
        instances: [
          "#content__main > div.nextbestaction.section:nth-of-type(2) ul.cmp-nextbestaction__items",
          "#content__main > div.nextbestaction.section:nth-of-type(3) ul.cmp-nextbestaction__items",
          "ul.cmp-nextbestaction__items"
        ]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Hero banner",
        selector: "#content__main > div.experiencefragment.section:nth-of-type(1)",
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "rc2",
        name: "Audience selection intro + cards",
        selector: "#content__main > div.nextbestaction.section:nth-of-type(2)",
        style: null,
        blocks: ["cards-audience"],
        defaultContent: [
          "#content__main > div.nextbestaction.section:nth-of-type(2) .cmp-nextbestaction__headline"
        ]
      },
      {
        id: "rc3",
        name: "Secondary audience cards",
        selector: "#content__main > div.nextbestaction.section:nth-of-type(3)",
        style: null,
        blocks: ["cards-audience"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "Legal notices",
        selector: "#content__main > div.experiencefragment.section:nth-of-type(4)",
        style: null,
        blocks: [],
        defaultContent: [
          "#content__main > div.experiencefragment.section:nth-of-type(4) .cmp-disclaimer"
        ]
      }
    ]
  };
  var parsers = {
    "hero-banner": parse,
    "cards-audience": parse2
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const pathname = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "");
      const path = WebImporter.FileUtils.sanitizePath(pathname) || "/index";
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
