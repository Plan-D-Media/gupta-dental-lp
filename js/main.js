/* ============================================================
   Gupta Dental — 15% Off landing page
   Vanilla JS, no dependencies, no build step.
   Every editable value comes from js/config.js.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.GD_CONFIG;
  if (!CFG) { console.error("[GD] js/config.js did not load — the page cannot be set up."); return; }

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

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     1. TIME — everything is worked out in Asia/Kolkata,
        whatever timezone the visitor's device is in.
     ============================================================ */
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function istNow() {
    var parts = {};
    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    } catch (e) {
      var d = new Date();
      parts = { weekday: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],
                year: String(d.getFullYear()),
                month: String(d.getMonth() + 1).padStart(2, "0"),
                day: String(d.getDate()).padStart(2, "0"),
                hour: String(d.getHours()).padStart(2, "0"),
                minute: String(d.getMinutes()).padStart(2, "0") };
    }
    var dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.weekday];
    var hour = parseInt(parts.hour, 10) % 24;
    return {
      dow: dow,
      mins: hour * 60 + parseInt(parts.minute, 10),
      iso: parts.year + "-" + parts.month + "-" + parts.day
    };
  }

  function toMins(hhmm) {
    var bits = String(hhmm).split(":");
    return parseInt(bits[0], 10) * 60 + parseInt(bits[1] || "0", 10);
  }

  /* "21:00" -> "9 PM", "10:30" -> "10:30 AM" */
  function fmtTime(hhmm) {
    var bits = String(hhmm).split(":");
    var h = parseInt(bits[0], 10), m = parseInt(bits[1] || "0", 10);
    var ap = h >= 12 ? "PM" : "AM";
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return m === 0 ? h12 + " " + ap : h12 + ":" + String(m).padStart(2, "0") + " " + ap;
  }

  /* "2026-12-31" -> "31 December 2026" */
  function fmtDate(iso) {
    var p = String(iso).split("-");
    if (p.length !== 3) return iso;
    var months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
    return parseInt(p[2], 10) + " " + months[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  /* ============================================================
     2. OFFER STATE
        After the expiry date the page must never show the offer.
     ============================================================ */
  var NOW = istNow();
  var OFFER = CFG.offer || {};
  var OFFER_EXPIRED = !OFFER.expiry || NOW.iso > String(OFFER.expiry);

  if (OFFER_EXPIRED) {
    console.warn("[GD] The " + (OFFER.percent || 0) + "% offer expired on " +
      (OFFER.expiry || "(no expiry date set)") + ". Offer badges and the discount column are hidden. " +
      "Set a new offer.expiry in js/config.js to bring it back.");
  }

  var OFFER_LABEL = OFFER.percent + "% OFF till " + fmtDate(OFFER.expiry);

  /* ============================================================
     3. CLINIC HELPERS
     ============================================================ */
  var CLINICS = CFG.clinics || {};
  var CLINIC_KEYS = Object.keys(CLINICS);

  function clinic(key) { return CLINICS[key] || null; }

  /* Is this clinic open right now, and if not, when does it open? */
  function statusOf(key) {
    var c = clinic(key);
    if (!c || !c.hours) return { open: false, unknown: true };
    var today = c.hours[NOW.dow];

    if (today) {
      var o = toMins(today.open), cl = toMins(today.close);
      if (NOW.mins >= o && NOW.mins < cl) return { open: true, closeAt: today.close };
      if (NOW.mins < o) return { open: false, opensToday: true, openAt: today.open };
      return { open: false, doneForToday: true };
    }

    for (var i = 1; i <= 7; i++) {
      var d = (NOW.dow + i) % 7, h = c.hours[d];
      if (h) return { open: false, closedToday: true, nextDow: d, openAt: h.open, daysAhead: i };
    }
    return { open: false, closedToday: true };
  }

  function whenPhrase(s) {
    if (s.opensToday) return "opens " + fmtTime(s.openAt);
    if (s.closedToday) return "closed today";
    if (s.doneForToday) return "closed now";
    return "closed";
  }

  function nextOpenPhrase(s) {
    if (!s || !s.openAt) return "";
    if (s.opensToday) return "Opens " + fmtTime(s.openAt);
    if (s.daysAhead === 1) return "Opens " + fmtTime(s.openAt) + " tomorrow";
    if (s.daysAhead) return "Opens " + DAY_NAMES[s.nextDow] + " " + fmtTime(s.openAt);
    return "";
  }

  /* The hero "Open today" pill — always calculated, never hard-coded. */
  function heroStatusText() {
    if (CLINIC_KEYS.length < 2) return { text: "", open: false };

    var a = CLINIC_KEYS[0], b = CLINIC_KEYS[1];
    var sa = statusOf(a), sb = statusOf(b);
    var na = clinic(a).pillName || clinic(a).shortName;
    var nb = clinic(b).pillName || clinic(b).shortName;

    if (sa.open && sb.open) {
      return {
        open: true,
        text: sa.closeAt === sb.closeAt
          ? "Both clinics open now, till " + fmtTime(sa.closeAt)
          : "Both clinics open now"
      };
    }
    if (sa.open) return { open: true, text: na + " open now · " + nb + " " + whenPhrase(sb) };
    if (sb.open) return { open: true, text: nb + " open now · " + na + " " + whenPhrase(sa) };

    /* Neither is open — show the soonest opening. */
    var soonest = null;
    [sa, sb].forEach(function (s) {
      if (!s.openAt) return;
      var rank = s.opensToday ? 0 : (s.daysAhead || 9);
      if (!soonest || rank < soonest.rank) soonest = { rank: rank, s: s };
    });
    return { open: false, text: soonest ? nextOpenPhrase(soonest.s) : "Closed right now" };
  }

  function paintStatus() {
    var hero = heroStatusText();
    var pill = $("#status-pill"), txt = $("#status-text");
    if (pill && txt) {
      txt.textContent = hero.text;
      pill.setAttribute("data-open", hero.open ? "true" : "false");
    }

    $$("[data-status-for]").forEach(function (el) {
      var s = statusOf(el.getAttribute("data-status-for"));
      var label = s.open ? "Open now, till " + fmtTime(s.closeAt) : (nextOpenPhrase(s) || "Closed today");
      el.setAttribute("data-open", s.open ? "true" : "false");
      var span = el.querySelector("span:last-child");
      if (span) span.textContent = label;
    });
  }

  /* ============================================================
     4. MONEY
     ============================================================ */
  function rupees(n) {
    try { return "₹" + Number(n).toLocaleString("en-IN"); }
    catch (e) { return "₹" + n; }
  }

  function discounted(usual) {
    var step = Number(OFFER.rounding) > 0 ? Number(OFFER.rounding) : 1;
    var raw = Number(usual) * (1 - Number(OFFER.percent) / 100);
    return Math.round(raw / step) * step;
  }

  /* ============================================================
     5. PRICE BOARD
     ============================================================ */
  function paintPrices() {
    var byKey = {};
    (CFG.treatments || []).forEach(function (t) { byKey[t.key] = t; });

    $$(".price-row").forEach(function (row) {
      var t = byKey[row.getAttribute("data-treat")];
      var usualEl = $("[data-usual]", row), nowEl = $("[data-now]", row);
      if (!t || !usualEl || !nowEl) return;

      row.setAttribute("data-need", t.need || "");

      if (t.usual === null || t.usual === undefined || isNaN(Number(t.usual))) {
        usualEl.textContent = "₹____";
        nowEl.textContent = "₹____";
      } else {
        usualEl.textContent = rupees(t.usual);
        nowEl.textContent = rupees(discounted(t.usual));
      }

      /* After expiry there is no discount column at all. */
      if (OFFER_EXPIRED) {
        var cell = nowEl.closest("td");
        if (cell) cell.hidden = true;
        usualEl.style.textDecoration = "none";
      }
    });

    if (OFFER_EXPIRED) {
      var th = $("#th-offer"); if (th) th.hidden = true;
      var h = $("#price-heading"); if (h) h.textContent = "Our treatment prices";
      var intro = $("#price-intro");
      if (intro) intro.textContent = "Our usual treatment prices. Tap a treatment to book it.";
    }
  }

  /* ============================================================
     6. TEXT DRIVEN BY CONFIG
     ============================================================ */
  function paintConfigText() {
    var h1 = $("#h1"); if (h1 && CFG.h1) h1.textContent = CFG.h1;

    /* Offer badges — exactly two on the page, both hidden once expired. */
    $$("[data-offer-date]").forEach(function (el) { el.textContent = fmtDate(OFFER.expiry); });
    $$(".offer-badge .pct").forEach(function (el) { el.textContent = OFFER.percent + "% OFF"; });

    var heroBadge = $("#offer-badge-hero"), chip = $("#offer-chip");
    if (heroBadge) heroBadge.hidden = OFFER_EXPIRED;
    if (chip) {
      chip.hidden = OFFER_EXPIRED;
      var chipText = chip.querySelector("span");
      if (chipText && !OFFER_EXPIRED) {
        chipText.innerHTML = OFFER.percent + "% OFF · Till " + fmtDate(OFFER.expiry);
      }
    }

    var terms = $("#offer-terms");
    if (terms) terms.textContent = OFFER_EXPIRED ? "" : (OFFER.terms || "");

    /* "Four things", fourth point */
    var ft = $("#fourth-title"), fb = $("#fourth-body");
    if (ft && CFG.fourthPoint) ft.textContent = CFG.fourthPoint.title || "";
    if (fb && CFG.fourthPoint) fb.textContent = CFG.fourthPoint.body || "";

    /* FAQ 1 — built from the offer so it can never contradict the badge */
    var a1 = $("#faq-a1");
    if (a1) {
      a1.textContent = OFFER_EXPIRED
        ? "This offer has ended. Call either clinic for current prices — your treatment plan and its cost are always given to you in writing before anything starts."
        : "The " + OFFER.percent + "% comes off the treatment fee for every treatment at both clinics, until " +
          fmtDate(OFFER.expiry) + ". " + (OFFER.terms || "");
    }

    /* Rating — shown only when a real figure is set in config */
    var rb = $("#rating-badge");
    if (rb) {
      if (CFG.rating && CFG.rating.text) { rb.textContent = CFG.rating.text; rb.hidden = false; }
      else { rb.hidden = true; }
    }

    /* Footer */
    var mail = $("#footer-email");
    if (mail && CFG.email) { mail.textContent = CFG.email; mail.href = "mailto:" + CFG.email; }
    var fb2 = $("#social-fb"), ig = $("#social-ig");
    if (fb2) { if (CFG.social && CFG.social.facebook) fb2.href = CFG.social.facebook; else fb2.closest("li").hidden = true; }
    if (ig)  { if (CFG.social && CFG.social.instagram) ig.href = CFG.social.instagram; else ig.closest("li").hidden = true; }
    var cp = $("#footer-copy"); if (cp && CFG.copyright) cp.textContent = CFG.copyright;

    /* Directions links */
    $$("[data-directions]").forEach(function (a) {
      var c = clinic(a.getAttribute("data-directions"));
      if (c && c.directionsUrl) a.href = c.directionsUrl;
    });
  }

  /* ============================================================
     7. ATTRIBUTION — read once on landing, kept for the session,
        sent with every submission.
     ============================================================ */
  var ATTR_KEYS = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content",
                   "gclid","gbraid","wbraid"];

  var ATTRIBUTION = (function () {
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem("gd_attr") || "{}") || {}; } catch (e) { stored = {}; }

    var params = new URLSearchParams(window.location.search);
    var fresh = {}, sawAny = false;
    ATTR_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v) { fresh[k] = v; sawAny = true; }
    });

    /* A fresh ad click overwrites; otherwise keep what the session already has. */
    var out = sawAny ? fresh : stored;
    ATTR_KEYS.forEach(function (k) { if (!out[k]) out[k] = ""; });

    if (sawAny) { try { sessionStorage.setItem("gd_attr", JSON.stringify(out)); } catch (e) {} }
    return out;
  })();

  /* ============================================================
     8. TRACKING
     ============================================================ */
  function track(eventName, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
  }

  /* ============================================================
     9. CLINIC SELECTION — drives the whole page
     ============================================================ */
  var selected = null;

  function waLink(key, treatment) {
    var c = clinic(key);
    if (!c || !c.whatsapp) return "#";
    var msg = "Hi, I would like to book an appointment at " + (c.shortName || c.name);
    if (!OFFER_EXPIRED) msg += " with the " + OFFER.percent + "% off offer.";
    else msg += ".";
    if (treatment) msg += " " + treatment;
    return "https://wa.me/" + c.whatsapp + "?text=" + encodeURIComponent(msg);
  }

  function currentTreatment() {
    var sel = $("[data-need-select]");
    return sel && sel.value ? sel.value : "";
  }

  function applySelection(key, opts) {
    opts = opts || {};
    if (key && !clinic(key)) return;
    selected = key || null;

    if (selected) { try { sessionStorage.setItem("gd_clinic", selected); } catch (e) {} }

    /* clinic cards + their "Choose this clinic" buttons */
    $$("[data-clinic-card]").forEach(function (card) {
      var on = card.getAttribute("data-clinic-card") === selected;
      card.classList.toggle("is-selected", on);
      var btn = card.querySelector("[data-select-clinic]");
      if (btn) {
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.textContent = on ? "Selected clinic" : "Choose this clinic";
      }
    });

    /* both clinic dropdowns */
    if (!opts.fromSelect) {
      $$("[data-clinic-select]").forEach(function (sel) { sel.value = selected || ""; });
    } else {
      $$("[data-clinic-select]").forEach(function (sel) {
        if (sel !== opts.source) sel.value = selected || "";
      });
    }

    /* every "call the selected clinic" link */
    var c = selected ? clinic(selected) : null;
    $$("[data-call-selected]").forEach(function (a) {
      a.setAttribute("href", c ? "tel:" + c.tel : "#");
    });
    $$("[data-wa-selected]").forEach(function (a) {
      a.setAttribute("href", c ? waLink(selected, currentTreatment()) : "#");
    });
  }

  function restoreSelection() {
    var fromUrl = new URLSearchParams(window.location.search).get("clinic");
    if (fromUrl && clinic(fromUrl)) { applySelection(fromUrl); return; }

    var saved = null;
    try { saved = sessionStorage.getItem("gd_clinic"); } catch (e) {}
    if (saved && clinic(saved)) applySelection(saved);
    else applySelection(null);
  }

  /* ============================================================
     10. CLINIC CHOOSER (used when nothing is selected yet)
     ============================================================ */
  var chooser = $("#chooser");
  var chooserReturn = null;

  function openChooser(mode, loc) {
    if (!chooser) return;
    var list = $("#chooser-list");
    var title = $("#chooser-title");
    if (title) title.textContent = mode === "wa" ? "Message which clinic?" : "Call which clinic?";

    list.innerHTML = "";
    CLINIC_KEYS.forEach(function (key) {
      var c = clinic(key);
      var s = statusOf(key);
      var a = document.createElement("a");
      a.href = mode === "wa" ? waLink(key, currentTreatment()) : "tel:" + c.tel;
      if (mode === "wa") { a.target = "_blank"; a.rel = "noopener"; a.setAttribute("data-wa", ""); }
      else { a.setAttribute("data-call", ""); }
      a.setAttribute("data-clinic", key);
      a.setAttribute("data-loc", loc || "chooser");
      a.innerHTML = '<span class="cn">' + (c.name || c.shortName) + "</span>" +
                    '<span class="cp">' + c.phoneDisplay + " · " +
                    (s.open ? "open now" : (nextOpenPhrase(s) || "closed today")) + "</span>";
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
     11. SEND THE VISITOR TO A FORM, PRE-FILLED
     ============================================================ */
  function sendToForm(need, targetId) {
    var card = targetId ? $(targetId) : null;
    if (!card) {
      /* nearest form to where the visitor is now */
      var cards = $$(".form-card");
      card = cards[0];
      var mid = window.scrollY + window.innerHeight / 2, best = Infinity;
      cards.forEach(function (c) {
        var d = Math.abs(c.getBoundingClientRect().top + window.scrollY - mid);
        if (d < best) { best = d; card = c; }
      });
    }
    if (!card) return;

    if (need) $$("[data-need-select]").forEach(function (sel) { sel.value = need; });

    card.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });

    card.classList.add("is-flash");
    window.setTimeout(function () { card.classList.remove("is-flash"); }, 1200);

    var name = card.querySelector('input[name="name"]');
    if (name) window.setTimeout(function () { name.focus({ preventScroll: true }); }, REDUCED ? 0 : 420);

    /* keep the WhatsApp message in step with the chosen treatment */
    applySelection(selected);
  }

  /* ============================================================
     12. FORMS — one set of validation and submission code,
         used by both forms on the page.
     ============================================================ */
  function normPhone(raw) {
    var v = String(raw || "").replace(/[^\d+]/g, "");
    if (v.indexOf("+91") === 0) v = v.slice(3);
    else if (v.length === 12 && v.indexOf("91") === 0) v = v.slice(2);
    v = v.replace(/^\+/, "");
    if (v.length === 11 && v.charAt(0) === "0") v = v.slice(1);
    return v;
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
    var location = form.getAttribute("data-form-location") || "hero";
    var card = form.closest(".form-card");
    var nameI = form.querySelector('input[name="name"]');
    var phoneI = form.querySelector('input[name="phone"]');
    var clinicS = form.querySelector('select[name="clinic"]');
    var needS = form.querySelector('select[name="treatment"]');
    var honey = form.querySelector('input[name="company"]');
    var btn = form.querySelector("[data-submit]");
    var sending = false;

    [nameI, phoneI, clinicS].forEach(function (el) {
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

      var phoneV = normPhone(phoneI.value);
      if (!/^[6-9]\d{9}$/.test(phoneV)) {
        setError(phoneI, "Enter a 10-digit mobile number starting with 6, 7, 8 or 9."); ok = false;
      } else setError(phoneI, "");

      if (!clinicS.value) {
        setError(clinicS, "Please choose a clinic."); ok = false;
      } else setError(clinicS, "");

      if (!ok) {
        var firstBad = form.querySelector(".field.has-error input, .field.has-error select");
        if (firstBad) firstBad.focus();
        return;
      }

      if (!needS.value) needS.value = "Not sure / something else";

      var clinicKey = clinicS.value;
      var c = clinic(clinicKey) || {};
      var treatment = needS.value;

      /* Honeypot: a bot filled the hidden field. Show the success state,
         but send nothing and record no conversion. */
      if (honey && honey.value.trim() !== "") {
        window.location.href = "thank-you.html?clinic=" + encodeURIComponent(clinicKey) +
                               "&treatment=" + encodeURIComponent(treatment);
        return;
      }

      var payload = {
        name: nameV,
        phone: phoneV,
        clinic: c.formValue || clinicKey,
        treatment: treatment,
        form_location: location,
        offer: OFFER_EXPIRED ? "" : OFFER_LABEL,
        page_url: window.location.href,
        referrer: document.referrer || "",
        timestamp: new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" }) + " IST",
        user_agent: navigator.userAgent
      };
      ATTR_KEYS.forEach(function (k) { payload[k] = ATTRIBUTION[k] || ""; });

      sending = true;
      if (card) card.classList.remove("is-failed");
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      btn.innerHTML = '<span class="spin" aria-hidden="true"></span>Booking…';

      var done = false;
      var ctrl = ("AbortController" in window) ? new AbortController() : null;
      var timer = window.setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);

      function succeed() {
        if (done) return; done = true;
        window.clearTimeout(timer);

        track("generate_lead", {
          clinic: payload.clinic,
          treatment: payload.treatment,
          form_location: location,
          phone: payload.phone       /* normalised, for Enhanced Conversions via GTM */
        });

        window.location.href = "thank-you.html?clinic=" + encodeURIComponent(clinicKey) +
                               "&treatment=" + encodeURIComponent(treatment);
      }

      function failed() {
        if (done) return; done = true;
        window.clearTimeout(timer);
        sending = false;
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
        btn.textContent = "Book My Appointment";
        if (card) card.classList.add("is-failed");
        /* Nothing the visitor typed is ever cleared. */
      }

      var opts = {
        method: "POST",
        mode: "no-cors",
        /* text/plain keeps this a "simple" request, so the browser skips the
           CORS preflight that Apps Script cannot answer. The body is JSON,
           which is what the existing Apps Script already expects. */
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      };
      if (ctrl) opts.signal = ctrl.signal;

      if (!CFG.webhookUrl) { console.error("[GD] No webhookUrl set in js/config.js."); failed(); return; }

      fetch(CFG.webhookUrl, opts).then(succeed).catch(failed);
    });
  }

  /* ============================================================
     13. AD-TO-PAGE MESSAGE MATCH  (?t= and ?clinic=)
     ============================================================ */
  var T_MAP = {
    "root-canal": { need: "Root canal treatment",            row: "root-canal" },
    "crown":      { need: "Crown or bridge",                 row: "crown" },
    "scaling":    { need: "Scaling & polishing",             row: "scaling" },
    "filling":    { need: "Tooth filling",                   row: "filling" },
    "implant":    { need: "Dental implant / missing teeth",  row: "implant" },
    "whitening":  { need: "Teeth whitening",                 row: "whitening" },
    "braces":     { need: "Braces or clear aligners",        row: null },
    "child":      { need: "Child's dental visit",            row: null }
  };

  function applyDeepLink() {
    var t = new URLSearchParams(window.location.search).get("t");
    if (!t) return;
    var map = T_MAP[String(t).toLowerCase()];
    if (!map) return;   /* unknown values are ignored, the H1 never changes */

    $$("[data-need-select]").forEach(function (sel) { sel.value = map.need; });

    if (map.row) {
      var row = $('.price-row[data-treat="' + map.row + '"]');
      if (row) row.classList.add("is-target");
    }
  }

  /* ============================================================
     14. MAPS — never loaded with the page
     ============================================================ */
  function loadMap(holder) {
    if (holder.getAttribute("data-loaded") === "1") return;
    var c = clinic(holder.getAttribute("data-map"));
    if (!c || !c.mapEmbedUrl) return;
    holder.setAttribute("data-loaded", "1");
    holder.innerHTML = "";
    var f = document.createElement("iframe");
    f.src = c.mapEmbedUrl;
    f.loading = "lazy";
    f.title = "Map to Gupta Dental, " + (c.shortName || c.name);
    f.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    f.setAttribute("allowfullscreen", "");
    holder.appendChild(f);
  }

  function initMaps() {
    var holders = $$(".map-holder");
    if (!holders.length) return;

    holders.forEach(function (h) {
      var btn = h.querySelector("[data-show-map]");
      if (btn) btn.addEventListener("click", function () { loadMap(h); });
    });

    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { loadMap(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: "200px" });
    holders.forEach(function (h) { io.observe(h); });
  }

  /* ============================================================
     15. STICKY BAR — out of the way whenever a form is on screen
     ============================================================ */
  function initSticky() {
    var bar = $("#sticky-bar"), chip = $("#offer-chip");
    if (!bar || !("IntersectionObserver" in window)) return;

    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        visible[en.target.id || en.target.getAttribute("data-form-location")] = en.isIntersecting;
      });
      var anyForm = Object.keys(visible).some(function (k) { return visible[k]; });
      bar.classList.toggle("is-hidden", anyForm);
      if (chip) chip.classList.toggle("is-hidden", anyForm);
    }, { threshold: 0.12 });

    $$(".form-card").forEach(function (c) { io.observe(c); });
  }

  /* ============================================================
     16. PATIENT VIDEOS — only when config supplies real files
     ============================================================ */
  function initVideos() {
    var section = $("#videos"), grid = $("#video-grid");
    var list = CFG.videos || [];
    if (!section || !grid || !list.length) return;   /* stays hidden */

    list.forEach(function (v) {
      var wrap = document.createElement("div");
      wrap.className = "video-card";
      var vid = document.createElement("video");
      vid.setAttribute("preload", "none");          /* nothing downloads until play */
      vid.setAttribute("controls", "");
      vid.setAttribute("playsinline", "");
      if (v.poster) vid.setAttribute("poster", v.poster);
      if (v.width) vid.setAttribute("width", v.width);
      if (v.height) vid.setAttribute("height", v.height);
      var src = document.createElement("source");
      src.src = v.src; src.type = v.type || "video/mp4";
      vid.appendChild(src);
      wrap.appendChild(vid);
      grid.appendChild(wrap);
    });
    section.hidden = false;
  }

  /* ============================================================
     17. FAQ JSON-LD — generated from what is actually on the page,
         so the markup can never drift from the visible answers.
     ============================================================ */
  function initFaqSchema() {
    var items = $$("#faq details").map(function (d) {
      var q = d.querySelector("summary"), a = d.querySelector(".answer");
      if (!q || !a) return null;
      var text = (a.textContent || "").trim();
      if (!text) return null;
      return {
        "@type": "Question",
        "name": (q.textContent || "").trim(),
        "acceptedAnswer": { "@type": "Answer", "text": text }
      };
    }).filter(Boolean);

    if (!items.length) return;
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": items
    });
    document.head.appendChild(s);
  }

  /* ============================================================
     18. SUBTLE REVEAL — below the fold only
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
     19. EVENT WIRING
     ============================================================ */
  function initEvents() {

    /* --- price rows --- */
    $$("[data-price-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = btn.closest(".price-row");
        var need = row ? row.getAttribute("data-need") : "";
        track("price_row_click", { treatment: need || (row && row.getAttribute("data-treat")) || "" });
        sendToForm(need, "#book");
      });
    });

    /* --- concern chips --- */
    $$("[data-concern]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var need = chip.getAttribute("data-concern");
        track("concern_chip_click", { concern: (chip.textContent || "").trim() });
        sendToForm(need, "#book");
      });
    });

    /* --- clinic cards select the clinic for the whole page ---
       The card body is a convenience target for mouse and touch. Keyboard and
       screen-reader users get the real "Choose this clinic" button inside it,
       which is what carries aria-pressed. */
    $$("[data-clinic-card]").forEach(function (card) {
      var key = card.getAttribute("data-clinic-card");

      var btn = card.querySelector("[data-select-clinic]");
      if (btn) btn.addEventListener("click", function () { applySelection(key); });

      card.addEventListener("click", function (e) {
        if (e.target.closest("a") || e.target.closest("button")) return;  /* let real controls work */
        applySelection(key);
      });
    });

    /* --- dropdown changes select the clinic too --- */
    $$("[data-clinic-select]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        applySelection(sel.value || null, { fromSelect: true, source: sel });
      });
    });

    /* --- treatment change keeps the WhatsApp message current --- */
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

    /* --- "call / WhatsApp the selected clinic": ask first if nothing is selected --- */
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-call-selected], [data-wa-selected]");
      if (!el) return;
      if (!selected) {
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

      if (href.indexOf("tel:") === 0) {
        track("click_call", {
          clinic: a.getAttribute("data-clinic") || selected || "",
          click_location: loc
        });
      } else if (href.indexOf("wa.me") > -1 || a.hasAttribute("data-wa") || a.hasAttribute("data-wa-selected")) {
        if (href !== "#") {
          track("click_whatsapp", {
            clinic: a.getAttribute("data-clinic") || selected || "",
            click_location: loc
          });
        }
      }
    });

    /* --- per-clinic WhatsApp buttons --- */
    $$("[data-wa]").forEach(function (a) {
      var key = a.getAttribute("data-clinic");
      if (!key) return;
      a.setAttribute("href", waLink(key, currentTreatment()));
      a.setAttribute("target", "_blank");
    });

    /* --- "Book" links put the cursor in the form --- */
    $$("[data-book]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        sendToForm("", a.getAttribute("href") === "#book-2" ? "#book-2" : null);
      });
    });

    /* --- offer chip scrolls to the price board --- */
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
     20. GO
     ============================================================ */
  paintConfigText();
  paintStatus();
  paintPrices();
  restoreSelection();
  applyDeepLink();
  $$("[data-lead-form]").forEach(initForm);
  initEvents();
  initMaps();
  initSticky();
  initVideos();
  initFaqSchema();
  initReveal();

  /* keep the open/closed pill honest on a long-lived tab */
  window.setInterval(function () { NOW = istNow(); paintStatus(); }, 60000);

})();
