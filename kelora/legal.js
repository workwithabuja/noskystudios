/* Kelora legal pages — client-side i18n renderer.
 *
 * One HTML shell per document (privacy.html / terms.html) reads ?lang=<code>,
 * loads i18n/<code>.json, and renders the localized document in place. English
 * is the authoritative version; every other language carries a convenience
 * banner. Falls back exact -> base-language -> English. No build step, no
 * dependencies — plain static files.
 */
(function () {
  "use strict";

  // The languages Kelora ships, in the order they appear in the switcher.
  // Codes match the app's own localization set exactly, so ?lang=<appLanguage>
  // always resolves to a real file.
  var LANGS = [
    ["en", "English"],
    ["ar", "العربية"],
    ["bn", "বাংলা"],
    ["ca", "Català"],
    ["cs", "Čeština"],
    ["da", "Dansk"],
    ["de", "Deutsch"],
    ["el", "Ελληνικά"],
    ["es", "Español"],
    ["es-MX", "Español (México)"],
    ["fi", "Suomi"],
    ["fr", "Français"],
    ["fr-CA", "Français (Canada)"],
    ["gu", "ગુજરાતી"],
    ["he", "עברית"],
    ["hi", "हिन्दी"],
    ["hr", "Hrvatski"],
    ["hu", "Magyar"],
    ["id", "Bahasa Indonesia"],
    ["it", "Italiano"],
    ["ja", "日本語"],
    ["kn", "ಕನ್ನಡ"],
    ["ko", "한국어"],
    ["ml", "മലയാളം"],
    ["mr", "मराठी"],
    ["ms", "Bahasa Melayu"],
    ["nb", "Norsk bokmål"],
    ["nl", "Nederlands"],
    ["or", "ଓଡ଼ିଆ"],
    ["pa", "ਪੰਜਾਬੀ"],
    ["pl", "Polski"],
    ["pt-BR", "Português (Brasil)"],
    ["pt-PT", "Português (Portugal)"],
    ["ro", "Română"],
    ["ru", "Русский"],
    ["sk", "Slovenčina"],
    ["sl", "Slovenščina"],
    ["sv", "Svenska"],
    ["ta", "தமிழ்"],
    ["te", "తెలుగు"],
    ["th", "ไทย"],
    ["tr", "Türkçe"],
    ["uk", "Українська"],
    ["ur", "اردو"],
    ["vi", "Tiếng Việt"],
    ["zh-Hans", "简体中文"],
    ["zh-Hant", "繁體中文"]
  ];
  var CODES = LANGS.map(function (l) { return l[0]; });
  var RTL = { ar: 1, he: 1, ur: 1 };

  var root = document.getElementById("legal-root");
  var DOC = root.getAttribute("data-doc"); // "privacy" | "terms"
  var OTHER = DOC === "privacy" ? "terms" : "privacy";

  // ---- language resolution ------------------------------------------------
  function requestedLang() {
    var q = new URLSearchParams(window.location.search).get("lang");
    if (q) return q;
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language;
    return nav || "en";
  }

  // Resolve a requested tag to a shipped file: exact, then base language
  // (fr-CA -> fr), then the first shipped variant of that base (pt -> pt-BR),
  // then English.
  function resolve(tag) {
    if (!tag) return "en";
    if (CODES.indexOf(tag) !== -1) return tag;
    var base = tag.split("-")[0].toLowerCase();
    if (CODES.indexOf(base) !== -1) return base;
    for (var i = 0; i < CODES.length; i++) {
      if (CODES[i].split("-")[0].toLowerCase() === base) return CODES[i];
    }
    return "en";
  }

  // ---- safe inline rendering ---------------------------------------------
  // Escape everything, then turn [label](url) into links. No other HTML from
  // the JSON is trusted.
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function inline(s) {
    return esc(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, label, url) {
      var safe = url.trim();
      // Only allow known-safe schemes.
      if (!/^(https?:|mailto:|privacy\.html|terms\.html)/i.test(safe)) return esc(label);
      var ext = /^https?:/i.test(safe) ? ' target="_blank" rel="noopener noreferrer"' : "";
      return '<a href="' + esc(safe) + '"' + ext + ">" + label + "</a>";
    });
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // ---- rendering ----------------------------------------------------------
  function render(data, activeCode) {
    var meta = data.meta || {};
    var ui = data.ui || {};
    var doc = data[DOC] || {};
    var dir = meta.dir || (RTL[activeCode] ? "rtl" : "ltr");

    document.documentElement.setAttribute("lang", meta.lang || activeCode);
    document.documentElement.setAttribute("dir", dir);
    document.title = (doc.title || DOC) + " — Kelora | NoSky Studios";

    root.innerHTML = "";

    // Convenience banner for non-English translations.
    if (meta.convenienceNote) {
      root.appendChild(el("div", "legal-note", inline(meta.convenienceNote)));
    }

    // Header: title, subtitle, meta line.
    var head = el("div", "legal-head");
    head.appendChild(el("h1", null, esc(doc.title || "")));
    if (doc.subtitle) head.appendChild(el("p", "legal-lede", inline(doc.subtitle)));
    var metaBits = [];
    if (meta.effectiveDate) metaBits.push(esc((ui.effectiveLabel || "Effective") + ": " + meta.effectiveDate));
    if (meta.version) metaBits.push(esc((ui.versionLabel || "Version") + " " + meta.version));
    if (metaBits.length) head.appendChild(el("p", "legal-meta", metaBits.join(" · ")));
    root.appendChild(head);

    var sections = doc.sections || [];

    // "On this page" table of contents.
    if (sections.length) {
      var toc = el("nav", "legal-toc");
      toc.setAttribute("aria-label", ui.onThisPage || "On this page");
      toc.appendChild(el("p", "legal-toc-label", esc(ui.onThisPage || "On this page")));
      var ol = el("ol");
      sections.forEach(function (s) {
        var li = el("li");
        var a = el("a");
        a.setAttribute("href", "#" + s.id);
        a.textContent = s.h;
        li.appendChild(a);
        ol.appendChild(li);
      });
      toc.appendChild(ol);
      root.appendChild(toc);
    }

    // Sections.
    sections.forEach(function (s) {
      var sec = el("section", "legal-section");
      sec.id = s.id;
      sec.appendChild(el("h2", null, esc(s.h)));
      (s.body || []).forEach(function (p) { sec.appendChild(el("p", null, inline(p))); });
      if (s.list && s.list.length) {
        var ul = el("ul");
        s.list.forEach(function (item) { ul.appendChild(el("li", null, inline(item))); });
        sec.appendChild(ul);
      }
      (s.after || []).forEach(function (p) { sec.appendChild(el("p", null, inline(p))); });
      root.appendChild(sec);
    });

    // Cross-link to the other document, preserving language.
    var cross = el("div", "legal-cross");
    var crossLabel = DOC === "privacy" ? (ui.readTerms || "Read the Terms of Service") : (ui.readPrivacy || "Read the Privacy Policy");
    var a2 = el("a", "button secondary");
    a2.setAttribute("href", OTHER + ".html?lang=" + encodeURIComponent(activeCode));
    a2.textContent = crossLabel;
    cross.appendChild(a2);
    root.appendChild(cross);

    // Footer contact line.
    var contact = el("p", "legal-contact");
    contact.innerHTML =
      esc(meta.company || "NoSky Studios Ltd") +
      (meta.rc ? " (" + esc(meta.rc) + ")" : "") +
      (meta.country ? ", " + esc(meta.country) : "") + ". " +
      inline("[" + (meta.privacyEmail || "privacy@noskystudios.ng") + "](mailto:" + (meta.privacyEmail || "privacy@noskystudios.ng") + ")");
    root.appendChild(contact);

    updateSwitcher(activeCode, ui);
    updateNavLinks(activeCode, ui);
  }

  // Populate the top-of-page in-document links (Privacy | Terms) with lang.
  function updateNavLinks(activeCode, ui) {
    var pv = document.querySelector("[data-doc-link=privacy]");
    var tm = document.querySelector("[data-doc-link=terms]");
    if (pv) { pv.href = "privacy.html?lang=" + encodeURIComponent(activeCode); if (ui.privacyLink) pv.textContent = ui.privacyLink; }
    if (tm) { tm.href = "terms.html?lang=" + encodeURIComponent(activeCode); if (ui.termsLink) tm.textContent = ui.termsLink; }
  }

  var switcher, switcherLabel;
  function buildSwitcher() {
    switcher = document.getElementById("legal-lang");
    switcherLabel = document.getElementById("legal-lang-label");
    LANGS.forEach(function (l) {
      var opt = document.createElement("option");
      opt.value = l[0];
      opt.textContent = l[1];
      switcher.appendChild(opt);
    });
    switcher.addEventListener("change", function () {
      go(switcher.value, true);
    });
  }
  function updateSwitcher(activeCode, ui) {
    if (switcher) switcher.value = activeCode;
    if (switcherLabel && ui.languageLabel) switcherLabel.textContent = ui.languageLabel;
  }

  // ---- load + navigate ----------------------------------------------------
  var cache = {};
  function load(code) {
    if (cache[code]) return Promise.resolve(cache[code]);
    return fetch("i18n/" + code + ".json", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("missing " + code);
      return r.json();
    }).then(function (json) { cache[code] = json; return json; });
  }

  function go(requested, push) {
    var code = resolve(requested);
    load(code).then(function (data) {
      render(data, code);
      var url = new URL(window.location.href);
      url.searchParams.set("lang", code);
      if (push) history.pushState({ lang: code }, "", url);
      else history.replaceState({ lang: code }, "", url);
      window.scrollTo(0, 0);
    }).catch(function () {
      if (code !== "en") go("en", push);
    });
  }

  window.addEventListener("popstate", function () {
    go(requestedLang(), false);
  });

  buildSwitcher();
  go(requestedLang(), false);
})();
