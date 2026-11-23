/* ============================================================
   Gupta Dental — 15% Off landing page
   Vanilla JS, no dependencies, no build step.
   Every editable value comes from js/config.js.

   LEAD CONTRACT — this must match the live /book-appointment/ page,
   because both post to the same Google Apps Script:
     - POST, body JSON.stringify(payload)
     - Content-Type: text/plain;charset=utf-8  (a "simple" request, so the
       browser skips the CORS preflight Apps Script cannot answer).
       NEVER application/json.
     - NO mode:"no-cors" — the response has to be readable.
     - The visitor only reaches the thank-you page when the script
       answers {"status":"ok"}.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.GD_CONFIG;
  if (!CFG) { console.error("[GD] js/config.js did not load — the page cannot be set up."); return; }

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ?debug=1 turns on the lead-payload log. Off for every real visitor. */
  var DEBUG = new URLSearchParams(window.location.search).get("debug") === "1";

  /* ------------------------------------------------------------
     Google Tag Manager.
     Written only when a container ID is set in js/config.js — with
     gtmId: "" nothing is requested and nothing is logged.
     ------------------------------------------------------------ */
  (function () {
    window.dataLayer = window.dataLayer || [];
    var id = String(CFG.gtmId || "").trim();
    if (!id) return;
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var first = document.getElementsByTagName("script")[0];
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(id);
    first.parentNode.insertBefore(s, first);
  })();

  /* ============================================================
     1. TRACKING
        Event names: click_to_call, whatsapp_click, generate_lead,
        symptom_chip_click, price_row_click.
        generate_lead is NOT fired here — it fires once, on the
        thank-you page, from js/thank-you.js.
     ============================================================ */
  function track(eventName, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
  }

  /* ============================================================
     2. ATTRIBUTION — read ONCE from the landing URL, held in memory
        for the life of the page, sent with every submission.
     ============================================================ */
  var ATTRIBUTION = (function () {
    var p = new URLSearchParams(window.location.search);
    var get = function (k) { return (p.get(k) || "").trim(); };
    return {
      gclid:        get("gclid"),
      fbclid:       get("fbclid"),
      utm_source:   get("utm_source"),
      utm_medium:   get("utm_medium"),
      utm_campaign: get("utm_campaign"),
      utm_term:     get("utm_term"),
      utm_content:  get("utm_content"),
      gbraid:       get("gbraid"),
      wbraid:       get("wbraid"),
      referrer:     document.referrer || ""
    };
  })();

  /* ============================================================
     3. CLINICS
     ============================================================ */
  var CLINICS = CFG.clinics || {};
  var CLINIC_KEYS = Object.keys(CLINICS);

  function clinic(key) { return CLINICS[key] || null; }

  /* "Phoolbagan" / "Seven Tanks" (the option value) -> the URL key */
  function keyFromFormValue(v) {
    for (var i = 0; i < CLINIC_KEYS.length; i++) {
      if (CLINICS[CLINIC_KEYS[i]].formValue === v) return CLINIC_KEYS[i];
    }
    return "";
  }

  /* ?clinic=kankurgachi / phoolbagan / dumdum / seventanks -> the URL key */
  function keyFromAlias(raw) {
    var v = String(raw || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
    if (!v) return "";
    if (CLINICS[v]) return v;
    for (var i = 0; i < CLINIC_KEYS.length; i++) {
      var c = CLINICS[CLINIC_KEYS[i]];
      var list = (c.aliases || []).map(function (a) { return String(a).toLowerCase(); });
      if (list.indexOf(v) > -1 || list.indexOf(v.replace(/-/g, "")) > -1) return CLINIC_KEYS[i];
    }
    return "";
  }

  /* ============================================================
     4. TREATMENTS — label <-> key, for ?t= and the thank-you page
     ============================================================ */
  var TREATMENTS = CFG.treatments || [];

  function labelForKey(raw) {
    var k = String(raw || "").trim().toLowerCase();
    if (!k) return "";
    var alias = (CFG.treatmentAliases || {})[k];
    if (alias) k = alias;
    for (var i = 0; i < TREATMENTS.length; i++) {
      if (TREATMENTS[i].key === k) return TREATMENTS[i].label;
    }
    return "";
  }

  function keyForLabel(label) {
    for (var i = 0; i < TREATMENTS.length; i++) {
      if (TREATMENTS[i].label === label) return TREATMENTS[i].key;
    }
    return "";
  }

  /* ============================================================
     5. HERO — Google rating cards
     ============================================================ */
  function paintRatings() {
    var holder = $("#rating-cards");
    if (!holder) return;
    var list = CFG.ratings || [];
    if (!list.length) { holder.hidden = true; return; }

    holder.innerHTML = "";

    list.forEach(function (r) {
      var card = document.createElement(r.url ? "a" : "div");
      card.className = "rating-card";
      if (r.url) {
        card.href = r.url;
        card.target = "_blank";
        card.rel = "noopener";
        card.setAttribute("aria-label",
          "Google rating " + r.value + " out of 5 for " + r.clinic + ", based on " + r.count + ". Opens Google in a new tab.");
      }

      var filled = Math.round(parseFloat(r.value) || 0);
      var stars = "";
      for (var i = 1; i <= 5; i++) {
        stars += '<svg class="ico ' + (i <= filled ? "on" : "off") + '" aria-hidden="true"><use href="#i-star"></use></svg>';
      }

      card.innerHTML =
        '<span class="rc-top">' +
          '<span class="rc-g" aria-hidden="true"><svg class="ico"><use href="#i-g"></use></svg></span>' +
          '<span class="rc-value">' + r.value + "</span>" +
          '<span class="rc-stars" aria-hidden="true">' + stars + "</span>" +
        "</span>" +
        '<span class="rc-clinic">' + r.clinic + "</span>" +
        '<span class="rc-count">' + r.count + "</span>" +
        '<span class="sr-only">Google rating ' + r.value + " out of 5 for " + r.clinic +
        ", based on " + r.count + ".</span>";

      holder.appendChild(card);
    });
  }

  /* ============================================================
     5b. OFFER EXPIRY
         The figures in config.prices are the prices AFTER the 15% off.
         Once the offer ends they are not prices the clinic can honour,
         and there is no usual price on file to fall back to, so the whole
         pricing section is left out rather than shown out of date.
     ============================================================ */
  var OFFER = CFG.offer || {};

  var OFFER_EXPIRED = (function () {
    var expiry = String(OFFER.expiry || "").trim();
    if (!expiry) return false;
    var today;
    try {
      /* en-CA gives YYYY-MM-DD, so a plain string compare is enough. */
      today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
      }).format(new Date());
    } catch (e) {
      today = new Date().toISOString().slice(0, 10);
    }
    return today > expiry;
  })();

  /* ============================================================
     6. PRICE LIST — the prices after 15% off, straight from config.
        No discount is calculated anywhere on this page.
     ============================================================ */
  function paintPrices() {
    var list = $("#price-list");
    if (!list) return;

    if (OFFER_EXPIRED) {
      console.warn("[GD] The 15% offer expired on " + OFFER.expiry +
                   ". The prices in js/config.js are post-offer prices, so the pricing " +
                   "section has been left out. Add a 'usual' price to each treatment in " +
                   "js/config.js and clear offer.expiry to bring it back.");
      var section = $("#prices");
      if (section) section.remove();
      var pill = $("#price-pill");
      if (pill) pill.remove();
      /* The chip repeats the offer dates and scrolls to a section that is
         no longer there, so it goes too. */
      var chip = $("#offer-chip");
      if (chip) chip.remove();
      return;
    }

    list.innerHTML = "";

    (CFG.prices || []).forEach(function (row) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "price-row";
      btn.setAttribute("data-treat", row.key);
      btn.setAttribute("data-need", row.need);

      /* A usual price is only ever shown when one has been entered in
         config. It is never worked out backwards from the offer price. */
      var usual = row.usual ? String(row.usual).trim() : "";

      btn.setAttribute("aria-label", row.label + ", starting from " + row.price +
        (usual ? ", usually " + usual : "") + " after the 15% off. Request a consultation.");

      btn.innerHTML =
        '<span class="pr-name">' + row.label + "</span>" +
        '<span class="pr-fig"><span class="pr-from">Starting from</span>' +
        (usual ? '<span class="pr-usual">' + usual + "</span>" : "") +
        '<span class="pr-price">' + row.price + "</span></span>" +
        '<svg class="ico pr-chev" aria-hidden="true"><use href="#i-chevron"></use></svg>';

      btn.addEventListener("click", function () {
        track("price_row_click", { treatment: row.need, treatment_key: row.key });
        sendToForm(row.need, "#book-card");
      });

      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  /* ============================================================
     6b. FIND YOUR NEAREST CLINIC
         Cards come from config. The Google Maps iframe is NOT part of
         the page until the section is within 200px of the viewport —
         nothing is requested from Google on page load.
     ============================================================ */
  function paintVisit() {
    var grid = $("#visit-grid");
    if (!grid) return;

    var order = (CFG.visitOrder || CLINIC_KEYS).filter(function (k) { return !!clinic(k); });
    if (!order.length) { var sec = $("#visit"); if (sec) sec.remove(); return; }

    grid.innerHTML = "";

    order.forEach(function (key) {
      var c = clinic(key);

      var card = document.createElement("article");
      card.className = "visit-card";

      var map = document.createElement("div");
      map.className = "visit-map";
      if (c.mapEmbedUrl) {
        map.setAttribute("data-map", c.mapEmbedUrl);
        map.setAttribute("data-map-title", "Map of Gupta Dental, " + c.name);
      } else {
        map.hidden = true;           /* no URL in config, no empty frame */
      }

      var body = document.createElement("div");
      body.className = "visit-body";

      var dir = c.directionsUrl
        ? '<a href="' + c.directionsUrl + '" class="btn btn-ink" target="_blank" rel="noopener" ' +
          'data-directions data-clinic="' + key + '">' +
          '<svg class="ico" aria-hidden="true"><use href="#i-pin"></use></svg>Get directions</a>'
        : "";

      body.innerHTML =
        "<h3>" + c.name + "</h3>" +
        '<p class="visit-address">' + c.address + "</p>" +
        '<p class="visit-hours"><svg class="ico" aria-hidden="true"><use href="#i-clock"></use></svg>' +
          c.hoursLine + "</p>" +
        '<div class="btn-row">' + dir +
          '<a href="tel:' + c.tel + '" class="btn btn-ink" data-clinic="' + key + '" data-loc="visit">' +
          '<svg class="ico" aria-hidden="true"><use href="#i-phone"></use></svg>Call</a>' +
        "</div>";

      card.appendChild(map);
      card.appendChild(body);
      grid.appendChild(card);
    });

    initMaps();
  }

  function injectMap(holder) {
    if (holder.getAttribute("data-loaded")) return;
    holder.setAttribute("data-loaded", "1");

    var frame = document.createElement("iframe");
    frame.src = holder.getAttribute("data-map");
    frame.title = holder.getAttribute("data-map-title") || "Map";
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer-when-downgrade";
    frame.setAttribute("allowfullscreen", "");
    holder.appendChild(frame);
  }

  function initMaps() {
    var holders = $$(".visit-map[data-map]");
    if (!holders.length) return;

    if (!("IntersectionObserver" in window)) {
      /* No observer: loading="lazy" on the iframe still holds the request
         back until the frame is near the viewport. */
      holders.forEach(injectMap);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        injectMap(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: "200px 0px" });

    holders.forEach(function (h) { io.observe(h); });
  }

  /* ============================================================
     6c. HEADER HEIGHT
         Published as --header-h so the sticky columns and every
         scroll-margin-top follow the real header, whatever the logo
         and the viewport do to it.
     ============================================================ */
  function trackHeaderHeight() {
    var header = $("#site-header");
    if (!header) return;
    var apply = function () {
      document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
    };
    apply();
    window.addEventListener("resize", apply);
    if ("ResizeObserver" in window) new ResizeObserver(apply).observe(header);
    /* The logo settles the header's height once it has decoded. */
    var logo = header.querySelector("img");
    if (logo && !logo.complete) logo.addEventListener("load", apply);
  }

  /* ============================================================
     7. CONFIG-DRIVEN TEXT
     ============================================================ */
  function paintConfigText() {
    var mail = $("#footer-email");
    if (mail && CFG.email) { mail.textContent = CFG.email; mail.href = "mailto:" + CFG.email; }

    var copy = $("#footer-copy");
    if (copy && CFG.copyright) copy.textContent = CFG.copyright;

    var chip = $("#offer-chip span");
    if (chip && CFG.offer && CFG.offer.chip) chip.textContent = CFG.offer.chip;

    /* Social icons are only written when a real URL is set — never "#". */
    var social = $("#social-list");
    if (social) {
      var links = [
        { url: (CFG.social || {}).facebook, icon: "#i-fb", label: "Gupta Dental on Facebook" },
        { url: (CFG.social || {}).instagram, icon: "#i-ig", label: "Gupta Dental on Instagram" }
      ].filter(function (s) { return s.url && String(s.url).trim(); });

      if (!links.length) { social.remove(); }
      else {
        links.forEach(function (s) {
          var li = document.createElement("li");
          li.innerHTML = '<a href="' + s.url + '" target="_blank" rel="noopener" aria-label="' + s.label + '">' +
                         '<svg class="ico" aria-hidden="true"><use href="' + s.icon + '"></use></svg></a>';
          social.appendChild(li);
        });
      }
    }
  }

  /* ============================================================
     8. CLINIC SELECTION — drives every Call and WhatsApp button
     ============================================================ */
  var selected = null;

  function waLink(key) {
    var c = clinic(key);
    if (!c || !c.whatsapp) return "";
    var msg = "Hi, I would like to request an appointment at Gupta Dental, " + c.name + ".";
    var need = currentTreatment();
    if (need) msg += " I need help with: " + need + ".";
    return "https://wa.me/" + c.whatsapp + "?text=" + encodeURIComponent(msg);
  }

  function currentTreatment() {
    var sel = $("[data-need-select]");
    return sel && sel.value ? sel.value : "";
  }

  function applySelection(key, opts) {
    opts = opts || {};
    var c = key ? clinic(key) : null;
    selected = c ? key : null;

    if (selected) { try { sessionStorage.setItem("gd_clinic", selected); } catch (e) {} }

    /* Both forms' Preferred clinic field stays in step. */
    if (c) {
      $$("[data-clinic-select]").forEach(function (sel) {
        if (opts.source === sel) return;
        if (sel.value !== c.formValue) sel.value = c.formValue;
      });
    }

    /* Call buttons that follow the selection. */
    $$("[data-call-selected]").forEach(function (a) {
      a.setAttribute("href", c ? "tel:" + c.tel : "#");
      if (c) a.setAttribute("data-clinic", key); else a.removeAttribute("data-clinic");
    });

    /* WhatsApp buttons that follow the selection. */
    $$("[data-wa-selected]").forEach(function (a) {
      var link = c ? waLink(key) : "";
      a.setAttribute("href", link || "#");
    });

    /* Per-clinic WhatsApp buttons (the pain-today band). */
    $$("[data-wa][data-clinic]").forEach(function (a) {
      var link = waLink(a.getAttribute("data-clinic"));
      if (link) a.setAttribute("href", link); else a.removeAttribute("href");
    });
  }

  function restoreSelection() {
    var fromUrl = keyFromAlias(new URLSearchParams(window.location.search).get("clinic"));
    if (fromUrl) { applySelection(fromUrl); return; }

    var saved = null;
    try { saved = sessionStorage.getItem("gd_clinic"); } catch (e) {}
    applySelection(saved && clinic(saved) ? saved : null);
  }

  /* ============================================================
     9. CLINIC CHOOSER — opened by any Call button with no clinic set
     ============================================================ */
  var chooser = $("#chooser");
  var chooserReturn = null;

  function openChooser(mode, loc) {
    if (!chooser) return;
    var list = $("#chooser-list");
    if (!list) return;

    list.innerHTML = "";
    CLINIC_KEYS.forEach(function (key) {
      var c = clinic(key);
      var a = document.createElement("a");

      if (mode === "wa") {
        var link = waLink(key);
        if (link) { a.href = link; a.target = "_blank"; a.rel = "noopener"; }
        a.setAttribute("data-wa", "");
      } else {
        a.href = "tel:" + c.tel;
        a.setAttribute("data-call", "");
      }
      a.setAttribute("data-clinic", key);
      a.setAttribute("data-loc", loc || "chooser");
      a.innerHTML = '<span class="cn">' + c.name + "</span>" +
                    '<span class="cp">' + c.phoneDisplay + "</span>";

      a.addEventListener("click", function () { applySelection(key); closeChooser(); });
      list.appendChild(a);
    });

    chooserReturn = document.activeElement;
    chooser.hidden = false;
    document.body.style.overflow = "hidden";
    var first = list.querySelector("a");
    if (first) first.focus();
  }

  function closeChooser() {
    if (!chooser) return;
    chooser.hidden = true;
    document.body.style.overflow = "";
    if (chooserReturn && chooserReturn.focus) chooserReturn.focus();
  }

  if (chooser) {
    chooser.addEventListener("click", function (e) {
      if (e.target === chooser || e.target.hasAttribute("data-close-chooser")) closeChooser();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !chooser.hidden) closeChooser();
    });
  }

  /* ============================================================
     10. SEND THE VISITOR TO A FORM, PRE-FILLED
     ============================================================ */
  function setNeed(need) {
    if (!need) return;
    $$("[data-need-select]").forEach(function (sel) { sel.value = need; });
    applySelection(selected);
  }

  function nearestFormCard() {
    var cards = $$(".form-card");
    if (!cards.length) return null;
    var card = cards[0];
    var mid = window.scrollY + window.innerHeight / 2, best = Infinity;
    cards.forEach(function (c) {
      var d = Math.abs(c.getBoundingClientRect().top + window.scrollY - mid);
      if (d < best) { best = d; card = c; }
    });
    return card;
  }

  function sendToForm(need, targetSel) {
    var card = targetSel ? $(targetSel) : null;
    if (!card) card = nearestFormCard();
    if (!card) return;

    setNeed(need);

    card.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
    card.classList.add("is-flash");
    window.setTimeout(function () { card.classList.remove("is-flash"); }, 1200);

    var name = card.querySelector('input[name="name"]');
    if (name) window.setTimeout(function () { name.focus({ preventScroll: true }); }, REDUCED ? 0 : 420);
  }

  /* ============================================================
     11. FORMS — one set of validation and submission code,
         shared by both forms on the page.
     ============================================================ */

  /* Strip spaces, dashes and brackets, then a leading +91 / 91 / 0.
     The result has to match /^[6-9]\d{9}$/. */
  function normMobile(raw) {
    var v = String(raw || "").replace(/[\s\-()]/g, "");
    if (v.indexOf("+91") === 0) v = v.slice(3);
    else if (v.length === 12 && v.indexOf("91") === 0) v = v.slice(2);
    else if (v.length === 11 && v.charAt(0) === "0") v = v.slice(1);
    return v.replace(/\D/g, "");
  }

  function setError(input, message) {
    var field = input.closest(".field");
    if (!field) return;
    field.classList.toggle("has-error", !!message);
    var err = field.querySelector(".err");
    if (err) err.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function initForm(form) {
    var formLocation = form.getAttribute("data-form-location") || "booking";
    var nameI   = form.querySelector('input[name="name"]');
    var mobileI = form.querySelector('input[name="mobile"]');
    var clinicS = form.querySelector('select[name="clinic"]');
    var needS   = form.querySelector('select[name="treatment"]');
    var honey   = form.querySelector('input[name="hp"]');
    var btn     = form.querySelector("[data-submit]");
    var fail    = form.querySelector("[data-form-error]");
    var btnHTML = btn ? btn.innerHTML : "";
    var sending = false;

    [nameI, mobileI, clinicS].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", function () { setError(el, ""); });
      el.addEventListener("change", function () { setError(el, ""); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;

      var ok = true;

      var nameV = (nameI.value || "").trim();
      if ((nameV.match(/[A-Za-z]/g) || []).length < 2) {
        setError(nameI, "Please enter your name."); ok = false;
      } else setError(nameI, "");

      var mobileV = normMobile(mobileI.value);
      if (!/^[6-9]\d{9}$/.test(mobileV)) {
        setError(mobileI, "Enter a 10-digit mobile number starting with 6, 7, 8 or 9."); ok = false;
      } else setError(mobileI, "");

      if (!clinicS.value) {
        setError(clinicS, "Please choose a clinic."); ok = false;
      } else setError(clinicS, "");

      if (!ok) {
        var firstBad = form.querySelector(".field.has-error input, .field.has-error select");
        if (firstBad) firstBad.focus();
        return;
      }

      var treatmentV = needS && needS.value ? needS.value : "Not sure yet";
      var clinicKey = keyFromFormValue(clinicS.value);

      /* ------------------------------------------------------
         THE PAYLOAD. Keys, names and order are the contract the
         Google Apps Script behind this webhook reads. Do not
         rename or reorder them without changing the script.
         ------------------------------------------------------ */
      var payload = {
        name:         nameV,
        mobile:       mobileV,                       /* 10 digits, normalised */
        clinic:       clinicS.value,                 /* "Phoolbagan" | "Seven Tanks" */
        treatment:    treatmentV,
        offer:        (CFG.offer && CFG.offer.key) || "discount-15",
        source:       (CFG.offer && CFG.offer.source) || "landing-page-15off",
        page:         window.location.href,
        gclid:        ATTRIBUTION.gclid,
        fbclid:       ATTRIBUTION.fbclid,
        utm_source:   ATTRIBUTION.utm_source,
        utm_medium:   ATTRIBUTION.utm_medium,
        utm_campaign: ATTRIBUTION.utm_campaign,
        utm_term:     ATTRIBUTION.utm_term,
        referrer:     ATTRIBUTION.referrer,
        hp:           honey ? honey.value : "",      /* always sent; the script handles spam */
        /* additions, after hp */
        utm_content:  ATTRIBUTION.utm_content,
        gbraid:       ATTRIBUTION.gbraid,
        wbraid:       ATTRIBUTION.wbraid,
        form_location: formLocation
      };

      if (!CFG.webhookUrl) { console.error("[GD] No webhookUrl set in js/config.js."); fail_(); return; }

      sending = true;
      if (fail) { fail.hidden = true; fail.textContent = ""; }
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      btn.innerHTML = '<span class="spin" aria-hidden="true"></span>Sending…';

      var done = false;
      var ctrl = ("AbortController" in window) ? new AbortController() : null;
      var timer = window.setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);

      function redirectToThankYou() {
        if (done) return; done = true;
        window.clearTimeout(timer);

        /* generate_lead is fired once, on the thank-you page. */
        var qs = "clinic=" + encodeURIComponent(clinicKey) +
                 "&t=" + encodeURIComponent(keyForLabel(treatmentV)) +
                 "&offer=" + encodeURIComponent(payload.offer);
        window.location.href = "thank-you.html?" + qs;
      }

      function fail_(reason) {
        if (done) return; done = true;
        window.clearTimeout(timer);
        sending = false;
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
        btn.innerHTML = btnHTML;
        if (fail) {
          fail.textContent = CFG.formError || "Your request didn't go through. Please try again.";
          fail.hidden = false;
        }
        if (reason) console.error("[GD] Lead not accepted:", reason);
        /* Nothing the visitor typed is ever cleared. */
      }

      var opts = {
        method: "POST",
        body: JSON.stringify(payload),
        /* A "simple" request, so the browser skips the CORS preflight that
           Apps Script cannot answer. NEVER application/json. */
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      };
      if (ctrl) opts.signal = ctrl.signal;

      /* The payload holds the visitor's name and mobile number, so it is
         only ever logged when the page is opened with ?debug=1. */
      if (DEBUG) console.log("[GD] lead payload", payload);

      fetch(CFG.webhookUrl, opts)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.status === "ok") redirectToThankYou();
          else fail_(data);
        })
        .catch(fail_);
    });
  }

  /* ============================================================
     12. AD-TO-PAGE MESSAGE MATCH  (?t= and ?clinic=)
         ?clinic= is handled in restoreSelection().
     ============================================================ */
  function applyDeepLink() {
    var t = new URLSearchParams(window.location.search).get("t");
    if (!t) return;

    var label = labelForKey(t);
    if (!label) return;                 /* unknown values are ignored */

    $$("[data-need-select]").forEach(function (sel) { sel.value = label; });

    var row = $('.price-row[data-need="' + label.replace(/"/g, '\\"') + '"]');
    if (row) row.classList.add("is-target");
  }

  /* ============================================================
     13. STICKY BAR — out of the way whenever a form is on screen
     ============================================================ */
  function initSticky() {
    var bar = $("#sticky-bar"), chip = $("#offer-chip");
    if (!bar || !("IntersectionObserver" in window)) return;

    var visible = new WeakMap();
    var cards = $$(".form-card");
    var badge = $("#offer-badge");
    var heroCta = $(".h-cta-book");

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible.set(en.target, en.isIntersecting); });
      var anyForm = cards.some(function (c) { return visible.get(c); });
      /* The bar also stands down over the hero, where it would otherwise
         cover the hero's own Request button on a 375x667 screen. */
      var heroCtaUp = !!visible.get(heroCta);
      bar.classList.toggle("is-hidden", anyForm || heroCtaUp);
      /* The chip repeats the hero badge word for word. */
      chip && chip.classList.toggle("is-hidden", anyForm || heroCtaUp || !!visible.get(badge));
    }, { threshold: 0.12 });

    cards.forEach(function (c) { io.observe(c); });
    if (badge) io.observe(badge);
    if (heroCta) io.observe(heroCta);
  }

  /* ============================================================
     14. SUBTLE REVEAL — below the fold only
     ============================================================ */
  function initReveal() {
    if (REDUCED || !("IntersectionObserver" in window)) {
      $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     15. EVENT WIRING
     ============================================================ */
  function initEvents() {

    /* --- concern cards --- */
    $$("[data-concern]").forEach(function (card) {
      card.addEventListener("click", function () {
        var need = card.getAttribute("data-concern");
        var label = card.querySelector(".cc-label");
        track("symptom_chip_click", {
          concern: label ? label.textContent.trim() : need,
          treatment: need
        });
        sendToForm(need, "#book-card");
      });
    });

    /* --- dropdown changes select the clinic for the whole page --- */
    $$("[data-clinic-select]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var key = keyFromFormValue(sel.value);
        applySelection(key || null, { source: sel });
      });
    });

    /* --- treatment change keeps both forms and WhatsApp in step --- */
    $$("[data-need-select]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        $$("[data-need-select]").forEach(function (o) { if (o !== sel) o.value = sel.value; });
        applySelection(selected);
      });
    });

    /* --- the chooser --- */
    $$("[data-open-chooser]").forEach(function (b) {
      b.addEventListener("click", function () { openChooser("call", b.getAttribute("data-loc")); });
    });

    /* --- Call / WhatsApp with no clinic chosen yet: ask first --- */
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-call-selected], [data-wa-selected]");
      if (!el) return;
      var href = el.getAttribute("href") || "#";
      if (!selected || href === "#") {
        e.preventDefault();
        openChooser(el.hasAttribute("data-wa-selected") ? "wa" : "call", el.getAttribute("data-loc"));
      }
    });

    /* --- tracking on every call and WhatsApp link, wherever it is --- */
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      var loc = a.getAttribute("data-loc") || "";

      if (a.hasAttribute("data-directions")) {
        track("click_directions", { clinic: a.getAttribute("data-clinic") || "" });
      } else if (href.indexOf("tel:") === 0) {
        track("click_to_call", { clinic: a.getAttribute("data-clinic") || selected || "", click_location: loc });
      } else if (href.indexOf("wa.me") > -1) {
        track("whatsapp_click", { clinic: a.getAttribute("data-clinic") || selected || "", click_location: loc });
      }
    });

    /* --- every "request your appointment" control goes to a form --- */
    $$("[data-book]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        var href = el.getAttribute("href") || "";
        sendToForm("", href === "#book" ? "#book-card" : null);
      });
    });

    /* --- offer chip scrolls to the prices --- */
    var chip = $("#offer-chip");
    if (chip) chip.addEventListener("click", function () {
      var target = $(chip.getAttribute("data-scroll-to"));
      if (target) target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
    });

    /* --- header shadow on scroll --- */
    var header = $("#site-header");
    if (header) {
      var onScroll = function () { header.classList.toggle("is-stuck", window.scrollY > 8); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ============================================================
     16. GO
     ============================================================ */
  trackHeaderHeight();
  paintConfigText();
  paintRatings();
  paintPrices();
  paintVisit();
  restoreSelection();
  applyDeepLink();
  $$("[data-lead-form]").forEach(initForm);
  initEvents();
  initSticky();
  initReveal();

})();
