/* ============================================================
   Gupta Dental — thank-you page
   THIS IS THE ONLY PLACE generate_lead IS FIRED.

   thank-you.html's inline <head> script has already read the URL,
   whitelisted the values and set window.__TY. Nothing here trusts
   the query string directly.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.GD_CONFIG || {};
  var TY  = window.__TY || { clinic: "", treatment: "", offer: "" };

  var $ = function (s) { return document.querySelector(s); };

  var clinics = CFG.clinics || {};
  var c = clinics[TY.clinic] || null;

  /* Treatment key -> the approved label. */
  var treatmentLabel = "";
  (CFG.treatments || []).forEach(function (t) {
    if (t.key === TY.treatment) treatmentLabel = t.label;
  });

  /* ------------------------------------------------------------
     1. generate_lead — fired once, here, and nowhere else.
     ------------------------------------------------------------ */
  (function fireLead() {
    var params = {
      clinic: c ? c.formValue : "",
      treatment: treatmentLabel,
      offer: TY.offer || ""
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: "generate_lead" }, params));

    if (typeof window.gtag === "function") {
      window.gtag("event", "generate_lead", params);
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", params);
    }
  })();

  /* ------------------------------------------------------------
     2. What the visitor asked for
     ------------------------------------------------------------ */
  var detail = $("#ty-detail");
  if (detail && (c || treatmentLabel)) {
    detail.hidden = false;
    var cl = $("#ty-clinic-line");
    var tl = $("#ty-treatment-line");
    if (cl) {
      if (c) { cl.textContent = "Clinic: "; cl.appendChild(strong(c.name)); }
      else cl.hidden = true;
    }
    if (tl) {
      if (treatmentLabel) { tl.textContent = "You asked about: "; tl.appendChild(strong(treatmentLabel)); }
      else tl.hidden = true;
    }
  }

  function strong(text) {
    var s = document.createElement("strong");
    s.textContent = text;
    return s;
  }

  /* ------------------------------------------------------------
     3. Call and WhatsApp for the clinic they chose
     ------------------------------------------------------------ */
  var callBtn = $("#ty-call"), waBtn = $("#ty-wa"), callLabel = $("#ty-call-label");
  var target = c || clinics[Object.keys(clinics)[0]] || null;

  if (target && callBtn) {
    callBtn.href = "tel:" + target.tel;
    if (callLabel) callLabel.textContent = "Call " + target.name + " · " + target.phoneDisplay;
  } else if (callBtn) {
    callBtn.hidden = true;
  }

  if (target && waBtn && target.whatsapp) {
    var msg = "Hi, I have just requested an appointment at Gupta Dental, " + target.name + ".";
    if (treatmentLabel) msg += " I need help with: " + treatmentLabel + ".";
    waBtn.href = "https://wa.me/" + target.whatsapp + "?text=" + encodeURIComponent(msg);
  } else if (waBtn) {
    waBtn.hidden = true;
  }

  function track(name, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, params || {}));
  }

  if (callBtn) callBtn.addEventListener("click", function () {
    track("click_to_call", { clinic: target ? target.formValue : "", click_location: "thank_you" });
  });
  if (waBtn) waBtn.addEventListener("click", function () {
    track("whatsapp_click", { clinic: target ? target.formValue : "", click_location: "thank_you" });
  });

  /* ------------------------------------------------------------
     4. Footer text from config
     ------------------------------------------------------------ */
  var copy = $("#ty-copy");
  if (copy && CFG.copyright) copy.textContent = CFG.copyright;

})();
