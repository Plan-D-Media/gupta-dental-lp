# Gupta Dental — 15% Off landing page

A standalone Google Ads landing page for Gupta Dental's two Kolkata clinics.
Plain HTML, CSS and vanilla JavaScript. No build step, no frameworks, no npm
dependencies. Every path is relative, so the folder works in any subdirectory.

---

## 1. Pending items — fill these in before the page goes live

| # | Item | Where | Status |
|---|---|---|---|
| 1 | **Six usual treatment prices** | `js/config.js` → `treatments[].usual` | **All `null`.** The page shows `₹____` in both columns until real numbers go in. |
| 2 | **Offer expiry date** | `js/config.js` → `offer.expiry` | Placeholder `2026-12-31`. Confirm the real last day. |
| 3 | **Offer terms line** | `js/config.js` → `offer.terms` | Draft wording — get the clinic to confirm. |
| 4 | **GTM container ID** | `js/config.js` → `gtmId` | **Empty.** No tag fires until this is set. See §6. |
| 5 | **WhatsApp numbers** | `js/config.js` → each clinic's `whatsapp` | Set to the two clinic phone numbers. **Confirm both are actually WhatsApp-enabled** before launch, or the button leads nowhere. |
| 6 | **Rating** | `js/config.js` → `rating` | `null`, so the badge is hidden. See §2 before filling this in. |
| 7 | **Patient videos** | `js/config.js` → `videos` | **Empty — no video files were in the project folder.** The whole video section is left out of the page. See §4. |
| 8 | **₹499 check-up line** | `js/config.js` → `fourthPoint` | Decide whether the ₹499 check-up still runs alongside the 15% offer. Edit or replace the text. |
| 9 | **Facebook / Instagram URLs** | `js/config.js` → `social` | Taken from the live site. Confirm they are current. |
| 10 | **Marigold price contrast** | design decision | Fails WCAG. See §7 — needs a client decision, not a code change. |

**Not pending** — these were found and are already wired up:

- **Webhook URL** — reused from the live `/book-appointment/` page, so leads land in
  the same Google Sheet. No new Apps Script deployment needed.
- **FAQ answers 3–6** — copied word for word from the live page.
- Both addresses, phone numbers, opening hours, directions and map URLs.

---

## 2. A note on the rating

The live `/book-appointment/` page shows **"5.0 rating from 450+ patient reviews"**.
That figure has **not** been copied onto this page. `rating` is `null`, so the badge
is hidden entirely.

Fill it in only with a number the clinic can evidence from its own Google Business
Profile:

```js
rating: { text: "5.0 from 450+ Google reviews" }
```

The badge then appears as the first item in the hero trust strip. Leave it `null`
and nothing is shown — no gap, no placeholder.

---

## 3. Editing the page

**Everything editable lives in `js/config.js`.** You should not need to touch the
HTML, CSS or `main.js` for routine changes.

### Prices

Enter the **usual** (pre-discount) price as a plain number. The discounted price is
always calculated — never type it by hand.

```js
{ key: "root-canal", label: "Root canal treatment", usual: 6000, need: "Root canal treatment" },
```

With `offer.percent: 15` and `offer.rounding: 1`, ₹6,000 displays as **₹5,100**.
Set `rounding: 10` or `100` to round the discounted figure to the nearest ten or
hundred rupees. Leave `usual: null` and that row shows `₹____` in both columns.

### The offer and its expiry

```js
offer: { percent: 15, expiry: "2026-12-31", terms: "…", rounding: 1 }
```

The offer is valid **up to and including** the expiry date, in Asia/Kolkata time.
The day after it passes, the page automatically:

- hides **both** 15% OFF badges,
- hides the **"With 15% off"** column and the strike-through on the usual prices,
- changes the price board heading to **"Our treatment prices"**,
- drops the offer from the WhatsApp messages and FAQ 1,
- logs a console warning.

The page can never display an expired offer. This was tested by setting the expiry
to a past date — all of the above fired correctly.

### Opening hours

`hours` is an array, **index 0 = Sunday** through **6 = Saturday**. Use `null` for a
closed day:

```js
hours: [ {open:"10:00",close:"21:00"}, …, null, … ]   // null = closed that day
```

The hero "Open today" pill, the per-clinic status lines in the urgent-care band and
the chooser all read from this and are worked out live in Asia/Kolkata time,
whatever timezone the visitor is in. Nothing about opening hours is hard-coded.

---

## 4. Patient videos

**No video files were supplied in the project folder**, so section 4.8 of the brief
could not be built with real footage. Rather than ship empty players or stock
footage, the section is omitted until `config.videos` is filled in.

To add them:

1. Put the two `.mp4` files in `assets/video/`.
2. Put a poster image for each in `assets/img/`. To pull a frame from a video:
   `ffmpeg -i assets/video/patient-1.mp4 -ss 00:00:01 -frames:v 1 assets/img/poster-1.jpg`
3. Fill in the array:

```js
videos: [
  { src: "assets/video/patient-1.mp4", poster: "assets/img/poster-1.jpg",
    width: 720, height: 1280, type: "video/mp4" },
  { src: "assets/video/patient-2.mp4", poster: "assets/img/poster-2.jpg",
    width: 720, height: 1280, type: "video/mp4" }
]
```

The section then appears with `preload="none"` on both players — no video data is
downloaded until the visitor presses play.

The live site references `patient-review-1.mp4` and `patient-review-2.mp4`; those
files are the ones to copy over.

---

## 5. URL parameters for the paid team

Add these to the **final URL** of an ad or ad group. They can be combined.

### `?t=` — treatment match

Pre-selects the matching option in **both** booking forms and puts a marigold left
border on the matching price-board row. **The H1 never changes.** Unknown values are
ignored silently.

| Value | Pre-selects | Highlights price row |
|---|---|---|
| `?t=root-canal` | Root canal treatment | yes |
| `?t=crown` | Crown or bridge | yes |
| `?t=scaling` | Scaling & polishing | yes |
| `?t=filling` | Tooth filling | yes |
| `?t=implant` | Dental implant / missing teeth | yes |
| `?t=whitening` | Teeth whitening | yes |
| `?t=braces` | Braces or clear aligners | no row |
| `?t=child` | Child's dental visit | no row |

### `?clinic=` — location match

For location-split ad groups. Pre-selects the clinic everywhere on the page: both
form dropdowns, the clinic card, every Call button, the sticky bar and every
WhatsApp link.

| Value | Clinic |
|---|---|
| `?clinic=kankurgachi` | Phoolbagan / Kankurgachi |
| `?clinic=sevenTanks` | Seven Tanks / South Dum Dum |

**Example final URL:**

```
https://guptasdental.com/15-off/?t=implant&clinic=sevenTanks
```

### Campaign tracking

`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`,
`gbraid` and `wbraid` are read from the URL on landing, held in `sessionStorage`
for the session, and attached to **every** form submission — including one made
after the visitor has clicked around the page.

---

## 6. Tracking

### Turning it on

Put the container ID in `js/config.js`:

```js
gtmId: "GTM-XXXXXXX",
```

While it is `""` **no GTM snippet is written at all** — no request, no console
noise. The container is injected by `js/main.js` as its first action, from a
deferred script, so it never blocks the first paint.

There is also a commented-out `<noscript>` GTM block near the top of `<body>` on
both pages. It only does anything with JavaScript switched off — and this page's
forms need JavaScript — so it is left commented by default. Uncomment it and paste
the same ID if your setup needs image-based tags.

### dataLayer events

| Event | Fires on | Parameters |
|---|---|---|
| `generate_lead` | Successful form submit | `clinic`, `treatment`, `form_location` (`hero` / `footer`), `phone` |
| `click_call` | **Every** `tel:` link on the page | `clinic`, `click_location` |
| `click_whatsapp` | Every WhatsApp link | `clinic`, `click_location` |
| `price_row_click` | Tapping a price-board row | `treatment` |
| `concern_chip_click` | Tapping a concern chip | `concern` |

`click_location` values: `header`, `hero`, `sticky`, `urgent`, `clinic_card`,
`footer`, `float`, `chooser`, `form_error`, `thank_you`.

Call tracking was called out as a weak spot on this account, so **every** call
button fires `click_call` — verified: 14 call links across 7 distinct locations,
each carrying a clinic.

`phone` on `generate_lead` is the normalised 10-digit number, ready for Enhanced
Conversions. Map it to the user-provided-data field in GTM; it is **not** hashed
client-side — GTM does that.

### Conversion page

`thank-you.html` is the Google Ads conversion page. It is `noindex`, carries the
same GTM container, and is only reachable after a successful submit.

A honeypot hit shows the visitor the success state but sends **nothing** to the
webhook and fires **no** `generate_lead` — so bot traffic cannot pollute your
conversion data.

---

## 7. Accessibility and contrast

Measured ratios for every text/background pair in the design system:

| Text | Background | Ratio | WCAG AA |
|---|---|---|---|
| Ink teal `#0B3B39` | Porcelain `#F5F7F6` | 11.49:1 | pass |
| Ink teal `#0B3B39` | White `#FFFFFF` | 12.36:1 | pass |
| Charcoal `#16211F` | Porcelain | 15.35:1 | pass |
| Charcoal `#16211F` | White | 16.52:1 | pass |
| Ink teal on button | Marigold `#F0A032` | 5.76:1 | pass |
| White | Ink teal band | 12.36:1 | pass |
| Marigold `#F0A032` | Ink teal band | 5.76:1 | pass |
| Ink teal | WhatsApp green `#25D366` | 6.23:1 | pass |
| **Marigold `#F0A032`** | **White (price figures)** | **2.15:1** | **FAIL** |
| ~~White~~ | ~~WhatsApp green~~ | ~~1.98:1~~ | avoided — see below |

### The two findings

**1. Marigold prices on white fail at 2.15:1.** Large text needs 3:1; this is well
under. It is the only accessibility failure on the page and the only reason the
Lighthouse accessibility score is 97 rather than 100.

The design system is fixed by the brief, so **this has not been changed.** It needs
a client decision. The options, in order of preference:

- Use a darker marigold **for the price figures only**, keeping the bright marigold
  for buttons and the offer badge: **`#D48210`** gives exactly 3.00:1 (AA for large
  text), **`#AA670C`** gives 4.51:1 (AA for all text). Both keep the same hue and
  saturation, so they still read as the brand accent.
- Or set the price figures in ink teal `#0B3B39` (12.36:1) and let the strike-through
  on the usual price carry the contrast.
- Or accept it as a documented exception.

To apply a fix, change one value in `css/styles.css`:

```css
.price-now { color: #D48210; }   /* was var(--marigold) */
```

**2. White on WhatsApp green is only 1.98:1**, so the WhatsApp buttons use **ink teal
text on WhatsApp green (6.23:1)** instead. The green itself is unchanged, as the
brief requires.

### Everything else

- Semantic landmarks, exactly one `<h1>`, logical heading order.
- A skip link to the booking form.
- Every field has a real `<label>`, not just a placeholder.
- Inline errors at 15px with `aria-describedby` and `aria-invalid`. No `alert()`.
- Visible marigold 2px focus rings everywhere.
- `prefers-reduced-motion` respected — smooth scrolling and all reveals are disabled.
- The price board is a real `<table>` with explicit ARIA roles, so it still reads as
  a table to a screen reader even where it is restyled into cards on mobile.
- **No text anywhere on either page is below 15px** (verified by scanning every
  rendered element).
- Clinic cards expose a real "Choose this clinic" button carrying `aria-pressed`,
  rather than an invalid `role="button"` on an `<article>`.

---

## 8. What was tested

Verified in Chrome against a local server with gzip and cache headers, matching how
Hostinger serves the files.

**Lighthouse (mobile):**

| | Score |
|---|---|
| Performance | **100** |
| Accessibility | **97** (the marigold price contrast above) |
| Best Practices | **100** |
| SEO | 63 — **expected and correct**, because the page is `noindex` by design |

LCP **1.2s** · FCP **0.8s** · CLS **0** · TBT **10ms** · Speed Index **0.8s**
(Desktop: Performance 100, Accessibility 97, Best Practices 100.)

**Layout** — 360, 375, 390, 414, 768, 1024, 1280 and 1440px. No horizontal scroll,
no clipping or overflow at any width.

**Form position on mobile** — the booking form starts at **432px** at both 375×667
and 390×844, well inside the first screen. At 375×667 the first screen shows the
logo, Call button, eyebrow, live "open now" pill, H1, the 15% OFF badge, the form
heading and the first two fields.

**Price board** — all six rows map to the right form option; rows are 85px tall on
desktop and 106px on mobile (brief asked for 44px minimum, 56px target). The 15%
maths was checked against test prices, including the rounding edge case
₹9,999 → ₹8,499. With prices `null`, both columns show `₹____`.

**Concern chips** — all eight map to the correct dropdown option in both forms.

**URL parameters** — every `?t=` value pre-selects in both forms and highlights the
right row; unknown values are ignored and the H1 never changes. `?clinic=` syncs
both dropdowns, the card, every call link and every WhatsApp link.

**Validation** — `12345` and `+91 5000000000` are rejected with an inline message;
`9876543210`, `+91 98765 43210` and `098765 43210` all normalise to `9876543210`.

**Submission** — payload carries 18 fields including all eight ad parameters and an
IST timestamp; sent as `text/plain` JSON with `mode: "no-cors"` (no CORS preflight,
which is what the existing Apps Script expects); redirects to `thank-you.html` with
clinic and treatment; fires exactly one `generate_lead`.

**Failure path** — on a network error the visitor stays on the page, sees both
clinic phone numbers, the button is re-enabled, and **nothing they typed is
cleared**.

**Honeypot** — shows the success state, makes no network call, fires no conversion.

**Offer expiry** — set to a past date, both badges and the discount column
disappeared, the heading changed, and the console warning fired. Restored after.

**Clinic selection** — syncs in both directions between the two cards, both
dropdowns, all 14 call links, every WhatsApp link and the sticky bar; persists in
`sessionStorage`. With nothing selected, Call opens the two-clinic chooser.

**Sticky bar** — hides whenever either form is on screen, returns when it is not.

**Maps** — confirmed not loaded on page load; only the holder scrolled near the
viewport injected its iframe.

**Console** — no errors or warnings on either page, across three URL variations.

### Not verified

- **Real-device testing on iOS Safari, Samsung Internet and Firefox.** The code
  avoids everything that usually breaks them — no `<dialog>` (the chooser is a plain
  overlay, so iOS 15.0–15.3 is fine), 16px form fields so iOS does not zoom on focus,
  `env(safe-area-inset-bottom)` on the sticky bar, no optional chaining or modern
  syntax — but it was tested in Chrome only.
- **A live end-to-end form submission** to the Google Sheet. Submissions were
  intercepted in testing so as not to post junk rows into the clinic's real sheet.
  Do this once after upload — see §10.

---

## 9. Files

```
2nd lp/
  index.html              the landing page
  thank-you.html          conversion page (noindex)
  css/styles.css          full stylesheet (critical CSS is inlined in each page's head)
  js/config.js            EVERY editable value
  js/main.js              all page logic
  assets/img/             optimised images (WebP + fallback)
  assets/video/           empty — patient videos go here
  README.md               this file

  dr-ayon-gupta.png       ORIGINAL — untouched
  dr-ayon-gupta.jpg       ORIGINAL — untouched
  dr-ayon-gupta.webp      ORIGINAL — untouched
  logo.png                ORIGINAL — untouched
  favicon.png             ORIGINAL — untouched
```

The five original files in the root are left exactly as they were. Every resized or
converted copy lives in `assets/img/`. The originals are not referenced by the page
and can be left out of the upload if you prefer.

### Which asset is used where

| File | Source | Used for |
|---|---|---|
| `assets/img/hero-dr-ayon-gupta.webp` / `.jpg` | cropped from `dr-ayon-gupta.png` | Hero portrait. 816×544, `fetchpriority="high"`, never lazy-loaded. 12 KB as WebP. |
| `assets/img/dr-ayon-gupta.webp` / `.jpg` | cropped from `dr-ayon-gupta.png` | "The dentist you will actually be seeing" section. 800×1000, lazy. 30 KB as WebP. |
| `assets/img/logo.webp` / `.png` | `logo.png` | Header on both pages. 280×172. |
| `assets/img/favicon.png` | `favicon.png` | Favicon and Apple touch icon on both pages. |

Both doctor crops come from the 983×1601 PNG master, which is the highest-quality
original. The hero crop stays above the purple band in the original photo, so the
hero sits on clean white.

**There is no clinic interior photograph in the project folder.** The brief asked for
a real clinic or doctor photo in the hero; the doctor portrait is used, since no
clinic photo exists and the brief rules out stock imagery. **A real photo of either
clinic's reception or surgery would be a worthwhile addition** — drop it in
`assets/img/` and swap the `<picture>` block in the hero.

No SVG logo was supplied, so the PNG is used.

Images were converted with ffmpeg (`libwebp`). ImageMagick and `cwebp` are not
installed on this machine; note that on Windows, `convert` on the PATH is the
Microsoft filesystem utility, **not** ImageMagick.

---

## 10. Deploying to Hostinger

1. **Pick the subdirectory**, e.g. `/15-off/`. The final URL will be
   `https://guptasdental.com/15-off/`.
2. **Fill in `js/config.js` first** — at minimum the six prices, the real expiry
   date and the GTM ID (§1).
3. **Zip the contents of this folder** — the files themselves, not the `2nd lp`
   folder. The zip should open onto `index.html`, `css/`, `js/` and `assets/`.
   You can leave out the five original images in the root; nothing links to them.
4. In **Hostinger → File Manager**, go to `public_html`, create the subdirectory,
   upload the zip into it and **Extract** there.
5. Check that `index.html` sits at `public_html/15-off/index.html` — not nested in a
   second folder. Every path on the page is relative, so it works at any depth as
   long as `css/`, `js/` and `assets/` sit beside `index.html`.
6. **Open the page over HTTPS** and confirm the logo, the hero photo, the fonts and
   the live "open now" pill all appear.
7. **Submit one real test booking end to end.** Use a real mobile number you can
   answer. Confirm:
   - the browser lands on `thank-you.html` with the clinic and treatment in the URL,
   - **a new row appears in the clinic's Google Sheet** with the right clinic,
     treatment and 10-digit number,
   - `generate_lead` fires in GTM Preview,
   - the clinic actually receives the lead.
   Then delete the test row from the sheet.
8. **Test one call click and one WhatsApp click** on a real phone, and confirm
   `click_call` and `click_whatsapp` appear in GTM Preview.
9. In Google Ads, set the **final URL** to the page plus any `?t=` / `?clinic=`
   parameters (§5), and set the **conversion** to the `thank-you.html` page view or
   the `generate_lead` event.

### After uploading

- The page is `noindex, follow` on purpose, so it will not compete with the organic
  site. Do not remove that tag.
- Gzip and caching come from Hostinger's default `.htaccess`. The Lighthouse scores
  above were measured with both enabled; without compression, performance drops by
  roughly 13 points.
