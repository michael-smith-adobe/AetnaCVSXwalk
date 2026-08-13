# Article Content Fragment Model

The `article` block renders an AEM **Content Fragment** selected via its
`reference` (aem-content) field — the Universal Editor content picker
("Content Advisor"). Build the CF Model below in AEM author, then create
article CFs against it; authors select one and its fields populate the page.

## CF Model fields (build these in AEM: Tools → General → Content Fragment Models)

Model title: **Article**

| Field label | Data type            | Property name | Notes |
|-------------|----------------------|---------------|-------|
| Title       | Single line text     | `title`       | Rendered as the article title (h1). |
| Author      | Single line text     | `author`      | Byline — rendered first, in the brand accent color. |
| Date        | Date and time        | `date`        | Timing — rendered next to the author in the byline. |
| Banner      | Content reference    | `banner`      | Hero/banner image (points at a DAM asset). |
| Body        | Multi line text (rich text) | `body` | Article body copy; supports headings, paragraphs, quotes, links. |

## Delivery convention (how the fields map to rendered HTML)

Content Fragments published to Edge Delivery are delivered as HTML. The
`article` block fetches that HTML and maps it by document order:

1. **title** → first heading → `.article-title`
2. **author** + **date** → the paragraphs between the title and the banner →
   grouped into `.article-byline` (author first/accented, date second)
3. **banner** → first image → `.article-banner` (full-width, rounded hero)
4. **body** → remaining content → `.article-body-text` (plus any h2/h3 and
   links styled by the block). For pull quotes, author a **Quote block** in the
   body rather than a raw blockquote element — raw blockquote is not a supported
   CF authoring construct and will block content sync.

All styling is driven by the brand design tokens (`--brand-purple`,
`--link-color`, `--text-color`, heading/body size vars), so the same CF renders
in the current brand palette — purple on `body.aetna`, red on `body.cvs`.

## What lives where

- **This repo (EDS side):** the `article` block (picker + rendering + styling)
  and this model spec. ✅ buildable here.
- **AEM author:** the CF Model registration and the CF instances themselves.
  Create those in AEM; the block's aem-content picker will then list them.

See `content/content-fragments/articles/choosing-a-health-plan.plain.html` for
a local fixture that mirrors a delivered CF (used for preview verification).
