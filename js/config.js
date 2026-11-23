/* ============================================================
   Gupta Dental — 15% Off landing page
   CONFIG — every editable value lives in this file.
   Edit this file only; index.html, main.js and thank-you.js read from it.

   Anything marked PENDING below needs a real value before launch.
   See README.md -> "Pending items".
   ============================================================ */

window.GD_CONFIG = {

  /* ---------------------------------------------------------
     1. THE OFFER
     --------------------------------------------------------- */
  offer: {
    /* The key sent to the Apps Script in the "offer" field.
       PENDING — confirm "discount-15" exists in the script's OFFERS block. */
    key: "discount-15",

    /* The value sent in the "source" field. */
    source: "landing-page-15off",

    /* Badge copy, exactly as approved. */
    badge: "15% OFF every treatment · Until 31 December 2026",

    /* Chip copy above the mobile sticky bar. */
    chip: "15% off · Until 31 December 2026",

    /* Last day the offer is valid, ISO YYYY-MM-DD, Asia/Kolkata.
       The prices in prices[] below are the prices AFTER the 15% off, so
       once this date passes they are no longer valid. The whole pricing
       section and the offer pill are then left out of the page and a
       warning is logged.
       BEFORE THE OFFER ENDS: get the clinic's usual (pre-offer) prices
       and fill in the "usual" field on each treatment, so the section can
       stay up with honest prices. See README -> "Prices". */
    expiry: "2026-12-31"
  },

  /* ---------------------------------------------------------
     2. GOOGLE RATINGS (hero)
     value / count are the figures the clinic can evidence from its
     own Google Business Profile.
     PENDING — url: the clinic's Google Maps reviews link. While a url
     is "" the card is plain text; set it and the card becomes a link
     that opens in a new tab.
     --------------------------------------------------------- */
  ratings: [
    { clinic: "Kankurgachi (Phoolbagan)", value: "4.9", count: "437 reviews", url: "" },
    { clinic: "Dum Dum Seven Tanks",      value: "4.8", count: "418 reviews", url: "" }
  ],

  /* ---------------------------------------------------------
     3. PRICES
     price = the starting price AFTER the 15% off, as approved.
     These are display strings. NOTHING is calculated on the page —
     no discount is ever applied to these figures.

     usual = PENDING, the clinic's usual (pre-offer) starting price,
     also as a display string, e.g. "₹5,900". Leave it null and the row
     shows the offer price on its own. Fill it in and the row shows the
     usual price struck through in front of it.

     need = the option pre-selected in both booking forms when the
     row is tapped (must match a label in treatments below).
     --------------------------------------------------------- */
  prices: [
    { key: "root-canal", label: "Root Canal Treatment (RCT)",   price: "₹5,000",  usual: null, need: "Root canal treatment" },
    { key: "crown",      label: "Dental Crown",                 price: "₹5,999",  usual: null, need: "Crown or bridge" },
    { key: "scaling",    label: "Teeth Scaling and Polishing",  price: "₹1,499",  usual: null, need: "Teeth scaling and polishing" },
    { key: "filling",    label: "Tooth Filling",                price: "₹1,199",  usual: null, need: "Tooth filling" },
    { key: "implant",    label: "Dental Implant",               price: "₹19,999", usual: null, need: "Dental implant or missing teeth" },
    { key: "whitening",  label: "Professional Teeth Whitening", price: "₹3,999",  usual: null, need: "Teeth whitening" },
    { key: "laser-gum",  label: "Laser Gum Treatment",          price: "₹9,999",  usual: null, need: "Bleeding or swollen gums" }
  ],

  /* ---------------------------------------------------------
     4. TREATMENT OPTIONS — "What can we help with?"
     label = the option value AND what is sent as "treatment".
     key   = used for the ?t= deep link and the thank-you page.
     --------------------------------------------------------- */
  treatments: [
    { key: "root-canal", label: "Root canal treatment" },
    { key: "crown",      label: "Crown or bridge" },
    { key: "scaling",    label: "Teeth scaling and polishing" },
    { key: "filling",    label: "Tooth filling" },
    { key: "implant",    label: "Dental implant or missing teeth" },
    { key: "whitening",  label: "Teeth whitening" },
    { key: "toothache",  label: "Toothache" },
    { key: "laser-gum",  label: "Bleeding or swollen gums" },
    { key: "broken",     label: "Broken or chipped tooth" },
    { key: "braces",     label: "Braces or clear aligners" },
    { key: "dentures",   label: "Dentures" },
    { key: "child",      label: "Child's dental visit" },
    { key: "checkup",    label: "Routine check-up" },
    { key: "unsure",     label: "Not sure yet" }
  ],

  /* Extra ?t= spellings that point at an option above. */
  treatmentAliases: {
    "rct": "root-canal",
    "gums": "laser-gum",
    "gum": "laser-gum",
    "bridge": "crown",
    "aligners": "braces"
  },

  /* ---------------------------------------------------------
     5. CLINICS
     key      — used in the URL (?clinic= and the thank-you page)
     formValue— the option value, and what is sent as "clinic"
     --------------------------------------------------------- */
  clinics: {
    phoolbagan: {
      key: "phoolbagan",
      name: "Kankurgachi",
      formValue: "Phoolbagan",
      optionLabel: "Kankurgachi",
      address: "P-87, CIT Road, near Phoolbagan Police Station, Phool Bagan, Kolkata 700054",
      hoursLine: "Open until 9 PM, every day",
      phoneDisplay: "+91 90385 95251",
      tel: "+919038595251",
      /* PENDING — confirm this number is WhatsApp-enabled. Digits only, with country code. */
      whatsapp: "919038595251",
      /* Extra ?clinic= spellings that select this clinic. */
      aliases: ["kankurgachi", "phoolbagan", "phool-bagan", "cit-road"],

      /* "Find your nearest clinic". The iframe is only injected once the
         section is near the viewport — it is never requested on page load.
         Both URLs can be swapped for the exact Google Business Profile
         links when they are to hand. */
      mapEmbedUrl: "https://www.google.com/maps?q=Gupta%20Dental%2C%20P-87%2C%20CIT%20Road%2C%20Phool%20Bagan%2C%20Kolkata%20700054&output=embed",
      directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Gupta%20Dental%2C%20P-87%2C%20CIT%20Road%2C%20near%20Phoolbagan%20Police%20Station%2C%20Phool%20Bagan%2C%20Kolkata%20700054"
    },

    seventanks: {
      key: "seventanks",
      name: "Dum Dum Seven Tanks",
      formValue: "Seven Tanks",
      optionLabel: "Dum Dum Seven Tanks",
      address: "122/1D, South Sinthee Road, 50ft Road, Seven Tanks Welfare Association, South Dum Dum, Kolkata 700030",
      hoursLine: "Open until 9 PM, closed Thursdays",
      phoneDisplay: "+91 84200 22591",
      tel: "+918420022591",
      /* PENDING — confirm this number is WhatsApp-enabled. Digits only, with country code. */
      whatsapp: "918420022591",
      aliases: ["seventanks", "seven-tanks", "dumdum", "dum-dum", "southdumdum"],

      mapEmbedUrl: "https://www.google.com/maps?q=Gupta%20Dental%2C%20122%2F1D%2C%20South%20Sinthee%20Road%2C%20South%20Dum%20Dum%2C%20Kolkata%20700030&output=embed",
      directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Gupta%20Dental%2C%20122%2F1D%2C%20South%20Sinthee%20Road%2C%2050ft%20Road%2C%20Seven%20Tanks%20Welfare%20Association%2C%20South%20Dum%20Dum%2C%20Kolkata%20700030"
    }
  },

  /* ---------------------------------------------------------
     5b. "FIND YOUR NEAREST CLINIC" — card order, left to right.
     --------------------------------------------------------- */
  visitOrder: ["seventanks", "phoolbagan"],

  /* ---------------------------------------------------------
     6. LEAD CAPTURE
     The same Google Apps Script the live /book-appointment/ page
     posts to, so leads land in the same sheet and trigger the same
     emails. The payload contract lives in js/main.js — do not change
     the field names without changing the script too.
     --------------------------------------------------------- */
  webhookUrl: "https://script.google.com/macros/s/AKfycbxRVnohSvsxKbBE6veh1zNSv8P2azvo9g-NviWmTYQMilxIuSDQOmzqBxdSic0Wf11OAQ/exec",

  /* ---------------------------------------------------------
     7. TRACKING
     PENDING — real GTM container ID, format GTM-XXXXXXX.
     Leave as an empty string "" and NO GTM snippet is written to
     the page at all (no broken requests, no console errors).
     Nothing is tracked until this is filled in.
     --------------------------------------------------------- */
  gtmId: "",

  /* ---------------------------------------------------------
     8. FORM COPY
     --------------------------------------------------------- */
  formError: "Your request didn't go through. Please try again, or call us directly on +91 90385 95251 (Kankurgachi) or +91 84200 22591 (Dum Dum Seven Tanks).",

  /* ---------------------------------------------------------
     9. FOOTER
     social: leave a URL as "" and that icon is left out of the page.
     No link is ever written as "#".
     --------------------------------------------------------- */
  email: "gdfclinic@gmail.com",
  social: {
    facebook: "https://www.facebook.com/share/1K2yXch2f9/",
    instagram: "https://www.instagram.com/guptas_dental"
  },
  copyright: "© 2026 Gupta Dental. All rights reserved."
};
