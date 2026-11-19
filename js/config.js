/* ============================================================
   Gupta Dental — 15% Off landing page
   CONFIG — every editable value lives in this file.
   Edit this file only; index.html and main.js read from it.

   Anything marked PENDING below needs a real value before launch.
   See README.md -> "Pending items".
   ============================================================ */

window.GD_CONFIG = {

  /* ---------------------------------------------------------
     1. THE OFFER
     --------------------------------------------------------- */
  offer: {
    /* Discount percentage. Used for the badge text AND the price maths. */
    percent: 15,

    /* PENDING — last day the offer is valid, ISO format YYYY-MM-DD.
       The offer is treated as valid UP TO AND INCLUDING this date,
       in Asia/Kolkata time.
       After it passes, the page automatically:
         - hides both 15% OFF badges
         - hides the "With 15% off" price column
         - changes the price board heading to "Our treatment prices"
       so the page can never show an expired offer. */
    expiry: "2026-12-31",

    /* PENDING — confirm exact wording with the client.
       Shown under the price board and used as the default FAQ 1 answer. */
    terms: "Offer applies to the treatment fee at both clinics and cannot be combined with any other offer.",

    /* Rounding for the discounted price, in rupees.
       1 = nearest rupee, 10 = nearest ten, 100 = nearest hundred. */
    rounding: 1
  },

  /* ---------------------------------------------------------
     2. HEADLINE
     --------------------------------------------------------- */
  /* Keep numbers out of the H1 — the offer badge carries the 15%. */
  h1: "The treatment you have been putting off now costs less.",

  /* ---------------------------------------------------------
     3. PRICE BOARD
     PENDING — all six "usual" prices.
     Enter the usual (pre-discount) price in rupees as a plain number,
     e.g. 6000. Leave as null to show the ₹____ placeholder.
     The discounted price is CALCULATED, never typed here.
     --------------------------------------------------------- */
  treatments: [
    { key: "root-canal", label: "Root canal treatment", usual: null, need: "Root canal treatment" },
    { key: "crown",      label: "Crown",                usual: null, need: "Crown or bridge" },
    { key: "scaling",    label: "Scaling & polishing",  usual: null, need: "Scaling & polishing" },
    { key: "filling",    label: "Tooth filling",        usual: null, need: "Tooth filling" },
    { key: "implant",    label: "Dental implant",       usual: null, need: "Dental implant / missing teeth" },
    { key: "whitening",  label: "Teeth whitening",      usual: null, need: "Teeth whitening" }
  ],

  /* ---------------------------------------------------------
     4. CLINICS
     hours: index 0 = Sunday ... 6 = Saturday.
     Use null for a closed day. Times are 24-hour "HH:MM", Asia/Kolkata.
     The "Open today" pill is calculated live from these values.
     --------------------------------------------------------- */
  clinics: {
    kankurgachi: {
      key: "kankurgachi",
      /* Short name used in the header pill and buttons */
      shortName: "Phoolbagan",
      /* Name used in the live "Open today" pill in the hero */
      pillName: "Kankurgachi",
      /* Full name used in the clinic card heading and the form dropdown */
      name: "Phoolbagan / Kankurgachi",
      /* Value submitted in the form + sent to the webhook */
      formValue: "Phoolbagan",
      address: "P-87, CIT Road, near Phoolbagan Police Station, Phool Bagan, Kolkata 700054",
      landmark: "Two minutes from Phoolbagan Police Station, on the CIT Road side.",
      hoursLine: "Open all 7 days, 10:00 AM to 9:00 PM",
      phoneDisplay: "+91 90385 95251",
      tel: "+919038595251",
      /* PENDING — confirm this number is WhatsApp-enabled. Digits only, with country code. */
      whatsapp: "919038595251",
      hours: [
        { open: "10:00", close: "21:00" }, /* Sun */
        { open: "10:00", close: "21:00" }, /* Mon */
        { open: "10:00", close: "21:00" }, /* Tue */
        { open: "10:00", close: "21:00" }, /* Wed */
        { open: "10:00", close: "21:00" }, /* Thu */
        { open: "10:00", close: "21:00" }, /* Fri */
        { open: "10:00", close: "21:00" }  /* Sat */
      ],
      directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Gupta%20Dental%2C%20P-87%2C%20CIT%20Road%2C%20Phool%20Bagan%2C%20Kolkata%20700054",
      mapEmbedUrl: "https://www.google.com/maps?q=Gupta%20Dental%2C%20P-87%2C%20CIT%20Road%2C%20Phool%20Bagan%2C%20Kolkata%20700054&output=embed"
    },

    sevenTanks: {
      key: "sevenTanks",
      shortName: "Seven Tanks",
      pillName: "Dum Dum Seven Tanks",
      name: "Seven Tanks / South Dum Dum",
      formValue: "Seven Tanks",
      address: "122/1D, South Sinthee Road, 50ft Road, Seven Tanks Welfare Association, South Dum Dum, Kolkata 700030",
      landmark: "On the 50ft Road stretch of South Sinthee Road, near the Seven Tanks crossing.",
      hoursLine: "Open 6 days, 10:00 AM to 9:00 PM. Closed Thursday.",
      phoneDisplay: "+91 84200 22591",
      tel: "+918420022591",
      /* PENDING — confirm this number is WhatsApp-enabled. Digits only, with country code. */
      whatsapp: "918420022591",
      hours: [
        { open: "10:00", close: "21:00" }, /* Sun */
        { open: "10:00", close: "21:00" }, /* Mon */
        { open: "10:00", close: "21:00" }, /* Tue */
        { open: "10:00", close: "21:00" }, /* Wed */
        null,                              /* Thu — closed */
        { open: "10:00", close: "21:00" }, /* Fri */
        { open: "10:00", close: "21:00" }  /* Sat */
      ],
      directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Gupta%20Dental%2C%20122%2F1D%2C%20South%20Sinthee%20Road%2C%20South%20Dum%20Dum%2C%20Kolkata%20700030",
      mapEmbedUrl: "https://www.google.com/maps?q=Gupta%20Dental%2C%20122%2F1D%2C%20South%20Sinthee%20Road%2C%20South%20Dum%20Dum%2C%20Kolkata%20700030&output=embed"
    }
  },

  /* ---------------------------------------------------------
     5. LEAD CAPTURE
     Taken from the live /book-appointment/ page — same Google
     Apps Script, so leads land in the same sheet.
     --------------------------------------------------------- */
  webhookUrl: "https://script.google.com/macros/s/AKfycbxRVnohSvsxKbBE6veh1zNSv8P2azvo9g-NviWmTYQMilxIuSDQOmzqBxdSic0Wf11OAQ/exec",

  /* ---------------------------------------------------------
     6. TRACKING
     PENDING — real GTM container ID, format GTM-XXXXXXX.
     Leave as an empty string "" and NO GTM snippet is written to
     the page at all (no broken requests, no console errors).
     --------------------------------------------------------- */
  gtmId: "",

  /* ---------------------------------------------------------
     7. RATING
     PENDING — leave null to hide the rating badge completely.
     Only fill this in with a figure the clinic can evidence from
     its own Google Business Profile.
     Example: { text: "5.0 from 450+ Google reviews" }
     --------------------------------------------------------- */
  rating: null,

  /* ---------------------------------------------------------
     8. "Four things" — fourth point
     Kept here because it mentions the ₹499 check-up, which may
     not run alongside the 15% offer. Edit or replace freely.
     --------------------------------------------------------- */
  fourthPoint: {
    title: "We say when you do not need treatment.",
    body: "Plenty of people walk out of the ₹499 check-up having been told to come back in six months."
  },

  /* ---------------------------------------------------------
     9. PATIENT VIDEOS
     PENDING — no video files were supplied in the project folder.
     Drop the two .mp4 files into assets/video/ and their poster
     images into assets/img/, then fill this array in. While it is
     empty the whole video section is left out of the page.
       { src: "assets/video/patient-1.mp4",
         poster: "assets/img/poster-1.jpg",
         label: "Patient review", width: 720, height: 1280 }
     --------------------------------------------------------- */
  videos: [],

  /* ---------------------------------------------------------
     10. FOOTER
     --------------------------------------------------------- */
  email: "gdfclinic@gmail.com",
  social: {
    facebook: "https://www.facebook.com/share/1K2yXch2f9/",
    instagram: "https://www.instagram.com/guptas_dental"
  },
  copyright: "© 2026 Gupta Dental"
};
