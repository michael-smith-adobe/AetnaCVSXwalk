/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Aetna site-wide cleanup.
 *
 * Removes non-authorable site shell/chrome and third-party widgets so the
 * import contains only page-level authorable content (hero banner, audience
 * cards, and legal-notices disclaimer under #content__main).
 *
 * All selectors below were verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / interstitials / consent + feedback widgets that block parsing.
    // Verified in cleaned.html:
    //   line 1153 <div class="modal__wrapper">        (AMA/interstitial dialogs)
    //   line 1823 <div id="onetrust-consent-sdk">     (OneTrust consent SDK)
    //   line 2068 <span id="kampyleButtonContainer">  (Medallia/Kampyle feedback button)
    //   line 2075 <span id="MDigitalInvitationWrapper"> (feedback invitation modal)
    WebImporter.DOMUtils.remove(element, [
      '.modal__wrapper',
      '#onetrust-consent-sdk',
      '#kampyleButtonContainer',
      '#MDigitalInvitationWrapper',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (header/footer are auto-populated in EDS) and
    // leftover tracking/utility elements. Verified in cleaned.html:
    //   line 8    <header>
    //   line 928  <footer>
    //   line 7    <a class="skip__link" href="#content__main">
    //   line 2    <div id="ZN_bCr1Fe9iQOHCKzz"> (site-intercept placeholder)
    //   line 1810 <span id="opensNewWindow"> (screen-reader utility text)
    //   line 1813 <div id="content-end"> (empty analytics anchor)
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '.skip__link',
      '#ZN_bCr1Fe9iQOHCKzz',
      '#opensNewWindow',
      '#content-end',
      'iframe',
      'link',
      'noscript',
      'source',
    ]);
  }
}
