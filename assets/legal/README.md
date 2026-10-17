# App legal pages

Every NoSky app gets the same folder at the site root, named with the app's lowercase slug:

```
/<app>/
  index.html        About + support page (use as the App Store "Support URL")
  privacy.html      Privacy Policy shell  → https://noskystudios.ng/<app>/privacy.html
  terms.html        Terms of Service shell → https://noskystudios.ng/<app>/terms.html
  i18n/
    languages.json  Language codes the app ships, in switcher order, e.g. ["en"]
    en.json         The documents themselves (meta, ui, privacy, terms). English is authoritative.
    <code>.json     One file per extra language, same keys and section ids as en.json
```

The pages are empty shells. `assets/legal/legal.js` loads `i18n/<lang>.json` and renders it, so
the wording lives only in the JSON. Apps can link with `?lang=<code>` to open in the user's
language; unknown codes fall back to the base language, then English. With a single language the
picker hides itself.

## Adding an app

1. Copy `anatomy/` (English-only) or `kelora/` (multilingual) to `/<app>/`.
2. In the three HTML files, replace the app name and slug (title, meta, canonical, og:url,
   kicker, doc links, `data-app`, noscript summary).
3. Rewrite `i18n/en.json` from what the app actually does: every network host, every
   permission, storage, purchases, deletion. Keep the shared sections (who we are, children,
   rights, governing law, warranty, liability, general, contact) as they are.
4. Set `meta.effectiveDate` and bump `meta.version` whenever the wording changes.
5. Link `/<app>/privacy.html` and `/<app>/terms.html` from the app and App Store Connect.
