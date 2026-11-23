# Gupta Dental — 15% Off landing page (v3)

A single Google Ads landing page for Gupta Dental, Kolkata, plus its thank-you page.
Pure HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies —
upload the folder and it runs.

- `index.html` — the landing page
- `thank-you.html` — the conversion page leads land on
- `js/config.js` — **every editable value lives here**

---

## 1. Pending items — fill these in before the page goes live

| # | Item | Where | What is needed |
|---|---|---|---|
| 1 | **GTM container ID** | `js/config.js` → `gtmId` | Format `GTM-XXXXXXX`. While it is `""` **no tracking loads at all** — no GTM, no Google Ads conversion, no Meta pixel. The page works, but nothing is measured. This is the one item that blocks the ads going live. |
| 2 | **Google review URLs** | `js/config.js` → `ratings[].url` | The Google Maps reviews link for each clinic. While a `url` is `""` the rating card is plain text; set it and the card becomes a link that opens Google in a new tab. |
| 3 | **WhatsApp numbers** | `js/config.js` → `clinics.*.whatsapp` | Confirm **both** numbers are WhatsApp-enabled. If one is not, clear that value and the WhatsApp buttons for that clinic are left out rather than sending people to a dead chat. |
| 4 | **`discount-15` in the Apps Script** | the Google Apps Script, `OFFERS` block | Every lead is sent with `offer: "discount-15"` and `source: "landing-page-15off"`. Confirm the script recognises that offer key, otherwise the column may land empty. |
| 5 | **Usual (pre-offer) prices** | `js/config.js` → `prices[].usual` | **Needed before 31 December 2026.** The figures on the page are the prices *after* the 15% off, and no pre-offer prices are on file. On 1 January 2027 the whole pricing section therefore removes itself (see §5, "Prices"). Get the clinic's usual starting prices, enter them as `usual`, and the section can stay up with honest before-and-after figures. |

Also worth confirming with the client: the two Google ratings shown in the hero
(**4.9 from 437 reviews** at Kankurgachi, **4.8 from 418 reviews** at Dum Dum Seven Tanks)
must match what the Google Business Profiles actually show on the day the ads start.

---

## 2. Lead capture — the contract

Both forms post to the same Google Apps Script the client's own
`guptasdental.com/book-appointment/` page uses, so leads land in the same sheet and
trigger the same emails (`gdfclinic@gmail.com`, `plandleadtest@gmail.com`).

**Endpoint** — `js/config.js` → `webhookUrl`.

**The request:**

```js
fetch(ENDPOINT, {
  method: "POST",
  body: JSON.stringify(payload),
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  signal: ctrl.signal                      // AbortController, 12-second timeout
})
  .then(res => res.json())
  .then(data => (data && data.status === "ok") ? redirectToThankYou() : fail())
  .catch(fail);
```

Three rules that must not be broken:

1. **`Content-Type` is `text/plain;charset=utf-8`, never `application/json`.** Anything
   else makes this a non-simple request, the browser sends a CORS preflight, and Apps
   Script cannot answer it.
2. **No `mode: "no-cors"`.** An opaque response cannot be read, so a failed lead would
   look like a success and the visitor would be sent to the thank-you page anyway.
3. **The visitor only reaches the thank-you page when the script answers
   `{"status":"ok"}`.** Anything else shows the error message and keeps what they typed.

**The payload** — these keys, in this order, with these exact names:

```
name, mobile, clinic, treatment, offer, source, page,
gclid, fbclid, utm_source, utm_medium, utm_campaign, utm_term,
referrer, hp, utm_content, gbraid, wbraid, form_location
```

| Key | Value |
|---|---|
| `mobile` | Normalised to 10 digits. Spaces, `-` and `()` are stripped, then a leading `+91`, `91` or `0`. Must match `/^[6-9]\d{9}$/`. |
| `clinic` | The option **value** — `Phoolbagan` or `Seven Tanks`. Never the display label. |
| `treatment` | The option label, e.g. `Root canal treatment`. |
| `offer` | `discount-15` |
| `source` | `landing-page-15off` |
| `page` | `location.href` |
| `hp` | The honeypot field. **Always sent, even when empty** — the Apps Script decides what is spam, not the page. |
| attribution | Read **once** from the landing URL and held in memory for the life of the page. |
| last four | `utm_content`, `gbraid`, `wbraid` and `form_location` are additions, and sit after `hp`. |

**On success** the visitor goes to
`thank-you.html?clinic=<phoolbagan|seventanks>&t=<treatment key>&offer=discount-15`.

**On failure** the button comes back, everything typed is kept, and this appears under
the form (`js/config.js` → `formError`):

> Your request didn't go through. Please try again, or call us directly on
> +91 90385 95251 (Kankurgachi) or +91 84200 22591 (Dum Dum Seven Tanks).

### Debugging a lead

Open the page with `?debug=1` and the exact payload is logged to the browser console
just before it is sent. Without that flag nothing is logged, because the payload holds
the visitor's name and mobile number.

---

## 3. Tracking

Nothing loads until `gtmId` is set in `js/config.js`. Once it is, the GTM snippet is
written on both pages.

### dataLayer events

| Event | Fires when | Parameters |
|---|---|---|
| `click_to_call` | any `tel:` link is clicked | `clinic`, `click_location` |
| `whatsapp_click` | any `wa.me` link is clicked | `clinic`, `click_location` |
| `price_row_click` | a price row is tapped | `treatment`, `treatment_key` |
| `symptom_chip_click` | a concern card is tapped | `concern`, `treatment` |
| `click_directions` | a **Get directions** button is clicked | `clinic` |
| `generate_lead` | **the thank-you page loads** | `clinic`, `treatment`, `offer` |

`generate_lead` fires in exactly one place — `js/thank-you.js` — so it can never be
double-counted. It pushes to `dataLayer`, and also calls `gtag("event", …)` and
`fbq("track", "Lead", …)` if either is present on the page.

### Conversion page

`thank-you.html` is the Google Ads conversion page. Its inline `<head>` script reads the
query string once, whitelists every value against a fixed list and hands the result to
`js/thank-you.js` as `window.__TY`. Nothing downstream reads `location.search`, so
nothing from the URL can reach the page as markup.

Note the treatment parameter is **`t`**, not `treatment`.

---

## 4. URL parameters for the paid team

### `?t=` — treatment match

Pre-selects "What can we help with?" in **both** forms and highlights the matching price
row. Unknown values are ignored; nothing else on the page changes.

| `?t=` | Pre-selects |
|---|---|
| `root-canal` | Root canal treatment |
| `crown` | Crown or bridge |
| `scaling` | Teeth scaling and polishing |
| `filling` | Tooth filling |
| `implant` | Dental implant or missing teeth |
| `whitening` | Teeth whitening |
| `laser-gum` | Bleeding or swollen gums |
| `braces` | Braces or clear aligners |
| `child` | Child's dental visit |
| `toothache` | Toothache |

Also accepted, via `treatmentAliases` in `js/config.js`: `rct`, `gums`, `gum`, `bridge`,
`aligners`. Three more keys exist for the remaining dropdown options and can be used the
same way: `broken`, `dentures`, `checkup`, `unsure`.

### `?clinic=` — location match

Pre-selects the clinic in both forms and points every Call and WhatsApp button at it.

| `?clinic=` | Selects |
|---|---|
| `phoolbagan`, `kankurgachi`, `phool-bagan`, `cit-road` | Kankurgachi |
| `seventanks`, `seven-tanks`, `dumdum`, `dum-dum`, `southdumdum` | Dum Dum Seven Tanks |

Unknown values are ignored. A clinic the visitor picks is remembered in `sessionStorage`
for the rest of their session.

### Campaign tracking

`gclid`, `fbclid`, `gbraid`, `wbraid`, `utm_source`, `utm_medium`, `utm_campaign`,
`utm_term` and `utm_content` are read from the landing URL and sent with every lead.

They can be combined freely:

```
?t=implant&clinic=dumdum&utm_source=google&utm_medium=cpc&gclid=…
```

---

## 5. Editing the page

Everything a non-developer should need is in `js/config.js`.

### Prices

`prices[]`. Every figure is a **fixed display string**. No discount is calculated
anywhere on the page, and none ever should be.

```js
{ key: "root-canal", label: "Root Canal Treatment (RCT)", price: "₹5,000", usual: null, need: "Root canal treatment" }
```

- **`price` is the price *after* the 15% off.** That is what the section is labelled as:
  "Prices after 15% off, until 31 December 2026".
- **`usual` is the clinic's usual, pre-offer starting price, and is `null`** because we
  do not have those figures. **Never work one out backwards from the offer price.** Fill
  it in as a display string (`"₹5,900"`) and the row shows it struck through in front of
  the offer price; leave it `null` and the row shows the offer price alone.
- `need` is the dropdown option the row pre-selects, and must match a `label` in
  `treatments[]` exactly.

**What happens when the offer ends.** `offer.expiry` is `2026-12-31`. Once the date in
Asia/Kolkata passes it, the `price` figures are no longer prices the clinic can honour,
and there is nothing to fall back on, so `js/main.js` removes the whole pricing section,
the offer pill and the mobile offer chip, and logs a console warning. The page can never
show an expired offer price.

To keep the section alive past that date, add a `usual` price to every treatment, update
the caption and the notes, and move `offer.expiry` on.

### Treatment options

`treatments[]` drives the `?t=` deep link and the thank-you page. The `label` is both the
option value and what is sent as `treatment`.

If you add an option, add it in **three** places: `treatments[]` in `js/config.js`, the
two `<select name="treatment">` lists in `index.html`, and the `TREATMENTS` whitelist in
the inline `<head>` script of `thank-you.html`.

### Clinics

`clinics.phoolbagan` and `clinics.seventanks`. `key` is what appears in the URL,
`formValue` is the option value and what is sent as `clinic`, `name` is what visitors see.

### The offer

`offer.badge` and `offer.chip` are the visible copy. `offer.key` and `offer.source` are
what the Apps Script receives. The dates in the FAQ, the price notes and the hero are
written into `index.html` directly, because they are approved client copy — if the offer
is extended, search `index.html` for `31 December 2026`.

### Footer social links

`social.facebook` and `social.instagram`. Clear a URL to `""` and that icon is left out.
No link is ever written as `#`.

---

## 6. Design system

| Token | Hex | Used for |
|---|---|---|
| Ink teal | `#0B3B39` | Headings, dark bands, **Call** buttons, footer |
| Porcelain | `#F5F7F6` | Page background |
| Enamel | `#FFFFFF` | Cards, forms |
| Tint | `#EAF1F0` | Card fills, icon tiles, soft bands |
| Marigold | `#F0A032` | **Booking buttons and the offer badge only** |
| Charcoal | `#16211F` | Body text |
| WhatsApp | `#25D366` | WhatsApp buttons only |

The button hierarchy is deliberate and is a conversion fix: **marigold means book**,
**ink teal means call**, **green means WhatsApp**. Nothing else uses marigold. If Call
buttons are ever made orange again, they will compete with the booking buttons.

Fraunces 600 for headings and prices, Public Sans 400/600 for everything else. Body text
is 17px on mobile and 18px on desktop, and **nothing on the page is set below 15px**.
Container 1180px with 24px gutters; sections 88px top and bottom on desktop, 56px on
mobile. Cards are 16px radius with a 1px `rgba(11,59,57,.10)` hairline; the soft shadow
is reserved for the hero photo and the form cards. Icons are inline Lucide-style SVG in
48px tint tiles — no emojis and no icon font.

One motion rule: a 200ms fade-up on scroll, nothing above the fold, and nothing at all
when `prefers-reduced-motion` is set.

---

## 7. Page order

1. Hero — a welcome from Dr. Ayon Gupta, the offer badge, "Why visit Gupta Dental", the
   two Google rating cards, and his photo
2. Booking — copy on the left, the form card on the right (form first on mobile)
3. Prices — the copy and notes on the left, the price card on the right
4. What brings you in today? — eight tappable concern cards
5. Treatments available at both clinics
6. Meet Dr. Ayon Gupta
7. Why patients choose Gupta Dental
8. Dealing with dental pain today? — the ink-teal band
9. Answers before you book — the FAQ on the left, the second booking form on the right
10. Find your nearest clinic — a map, address, hours and buttons per clinic

Plus the footer, the mobile sticky bar with its offer chip, the desktop WhatsApp button,
and the clinic chooser.

**Removed in v3:** the patient videos section and the "Both clinics" map section. They
are not in the approved content. Their assets are still in the folder. (v3.1 brought
maps back, in the new §10, as a per-clinic card rather than a single wide map.)

### Two-column sections

Sections 3 and 9 are both `grid` with `align-items: start`, and nothing above the grid,
so the two columns start at exactly the same height. The shorter column is `position:
sticky` at `--stick-top`, which is the header's real height plus 32px.

`--header-h` is published onto `:root` by `js/main.js` from the header's measured
`offsetHeight`, and kept up to date through a `ResizeObserver` and the logo's `load`. The
stylesheet carries measured fallbacks (70px mobile, 96px desktop) so the offsets are
right even before the script runs. Form cards use the same variable for their
`scroll-margin-top`.

A sticky column can only travel the difference between its own height and the row's
height. In §3 the two columns are close in height, so the left column holds for about
120px and then moves with the card. In §9 the form holds for as long as the FAQ is
taller, which is most of the time once a visitor opens a second question.

### Behaviour worth knowing

- The mobile sticky bar and the offer chip stand down whenever a form card is on screen,
  and over the hero, where the bar would otherwise cover the hero's own Request button on
  a 375×667 screen. The chip also hides while the hero offer badge — which it repeats
  word for word — is visible.
- The two Google Maps iframes are **not** part of the page on load. `js/main.js` injects
  them when §10 comes within 200px of the viewport, and each iframe also carries
  `loading="lazy"` and a `title`. Nothing is requested from Google until a visitor scrolls
  that far. Both `mapEmbedUrl` and `directionsUrl` live in `js/config.js` per clinic, so
  they can be swapped for the exact Google Business Profile links later.
- Any Call button with no clinic selected opens the clinic chooser first. Choosing a
  clinic dials it, remembers it, and syncs both forms' Preferred clinic field.
- Both forms share one set of validation and submission code (`initForm` in `js/main.js`).
  Changing one changes both.

---

## 8. What was tested

Checked in Chrome against a local server, at 360px, 375×667, 390px, 768px and 1440px.

- **Two live leads** were sent end to end, both named `TEST Plan D` on mobile
  `9999999999`. **Delete both rows from the sheet.**
  - v3, from the booking form: Kankurgachi, Root canal treatment → `status: "ok"`, landed
    on `thank-you.html?clinic=phoolbagan&t=root-canal&offer=discount-15`.
  - v3.1, from the form inside the merged FAQ section: Dum Dum Seven Tanks, Teeth
    whitening → `status: "ok"`, landed on
    `thank-you.html?clinic=seventanks&t=whitening&offer=discount-15`.
  - Both times `generate_lead` was the only event in `dataLayer`.
- The payload's keys and their order were confirmed against the contract above, with
  `+91 99999-99999` normalising to ten digits.
- With a deliberately wrong endpoint: no redirect, the error copy appears, the button
  comes back, and every field keeps what was typed.
- All seven price rows and all eight concern cards pre-select the right option in **both**
  forms.
- Every `?t=` and `?clinic=` value above, plus unknown values, which are ignored.
- 375×667: the offer badge, both rating cards and the Request button all sit on the first
  screen, with nothing covering them.
- 1440px: the pricing columns both start at y=1771, and the FAQ H2 and the form card both
  start at y=5941. Both shorter columns compute to `position: sticky` at `top: 128px`.
- 390px: the pricing section reads eyebrow → H2 → intro → price card → notes, the FAQ
  comes before its form, and Dum Dum Seven Tanks comes before Kankurgachi.
- All seven prices render unchanged and are labelled as prices after the 15% off. No
  `usual` price is shown, because none is on file.
- With `offer.expiry` temporarily set to yesterday: the pricing section, the offer pill
  and the mobile offer chip all disappeared and the console warning appeared. The date
  was then set back to `2026-12-31`.
- Both maps are absent on load and appear only once §10 is scrolled near. Each Get
  directions button opens the right clinic in a new tab and fires `click_directions`.
- No horizontal scroll and no text under 15px at any width tested. No console errors.

### Not verified

- Safari and Firefox (Chrome only).
- Real phone hardware — the mobile sizes were tested at those viewport widths in Chrome.
- Whether the lead reached the Google Sheet and the two email addresses. The script
  answered `ok`; the sheet itself was not opened.
- Whether `discount-15` is a key the Apps Script's `OFFERS` block recognises.
- Whether both numbers are WhatsApp-enabled.

---

## 9. Files

```
index.html              the landing page
thank-you.html          the conversion page
css/styles.css          the whole stylesheet
js/config.js            every editable value
js/main.js              the landing page's behaviour
js/thank-you.js         the thank-you page, and the only generate_lead
README.md               this file
assets/img/
  hero-dr-ayon-gupta.jpg / .webp     the hero photo (800x1000)
  dr-ayon-gupta.jpg / .webp          the 96px avatar in "Meet Dr. Ayon Gupta"
  clinic-treatment-room.jpg / .webp  booking section, left photo (900x675)
  clinic-consultation-room.jpg/.webp booking section, right photo (900x675)
  logo.png / .webp                   the header logo
  favicon.png
```

The loose `dr-ayon-gupta.*`, `logo.png` and `favicon.png` in the folder root are leftovers
from the first build. Nothing references them; the page uses the copies in `assets/img/`.

The two clinic photos in the booking section come from the originals
`PHOTO-2025-03-12-23-51-41 3.jpg` (treatment room) and
`PHOTO-2025-03-12-23-51-41 18.jpg` (consultation room), which are still in the folder
root. They are 2268x4032 portrait phone shots, so each was cropped to 4:3 around the part
of the room worth showing and resized to 900px wide — the cards display them in a roughly
4:3 landscape box. Neither file name says which clinic it is, so the alt text describes
the room without naming a location. If the client can say which clinic each belongs to,
the alt text is worth updating.

A note on the hero photo: it is a studio shot on a **white and purple** backdrop, not the
plain white one the design assumed. The photo therefore sits in a white card with a soft
shadow over a tint arch that peeks out above it, rather than blending into the card.
A cut-out of the subject on a transparent background would look better here, if one exists.

---

## 10. Deploying

Upload the whole folder as-is. There is nothing to build and nothing to install.

1. Set `gtmId` in `js/config.js`.
2. If you want the GTM `<noscript>` fallback, uncomment the block near the top of
   `<body>` in **both** HTML files and paste the same container ID in.
3. Upload.
4. Open the live page, submit one test lead, and confirm it reaches the sheet.
5. Delete the test row.

`index.html` and `thank-you.html` are both `noindex, follow` — they are paid-traffic
pages and should not compete with guptasdental.com in organic search. Remove the
`robots` meta tag only if that changes.
