# SEO settings to paste into Framer

Framer's page titles, descriptions and social images can't be changed through the MCP connection, so they're written out here to paste in. The whole job takes about 10 minutes.

Live site: https://mragankbhikshu-portfolio.framer.website

## 1. Site-wide (Site Settings → General)

| Field | Paste this |
|---|---|
| Site title | Mragank Bhikshu · Product & Brand Designer |
| Description (fixes I14) | Product and brand designer at IIT Kharagpur. Case studies in AI assistants, hiring tools and ticketing UX, plus brand identities, posters and motion work. |
| Language | English |
| Social image (Open Graph) | A 1200 × 630 image showing your name and role over one strong piece, for example a screenshot of the spaceship bridge with Jenny. |
| Favicon | Your MB logo (the one already used in the nav) |

## 2. Per-page (Pages panel → page → Settings → SEO)

| Page | Title (under 60 characters) | Description (under 160 characters) |
|---|---|---|
| / (Home) | Mragank Bhikshu · Product & Brand Designer | Product and brand designer from IIT Kharagpur. AI assistant, HR portal and ticketing case studies, brand identities, posters and motion. |
| /about-me | About Mragank Bhikshu · Designer | Three internships, a 45+ person design team led at Kshitij, and the tools I design with. Experience at Sonepar India, PixyGrid and Optibase. |
| /portfolio-2 | Work Gallery · Mragank Bhikshu | Walk through five wings of work: posters, animation films, brand identities, product case studies and internship projects. |
| /contact-us | Contact · Mragank Bhikshu | Open to product and brand design internships. Write to mragankbhikshu@gmail.com or use the form. |
| /case-study/sparky-ai-assistant | Sparky AI Assistant · Product Case Study | How I designed Sonepar India's website assistant: answers from the catalogue, refuses to guess, and turns visitors into leads. Includes the admin hub. |
| /case-study/conductor-ticketing | Conductor Ticketing UI · Two Taps to a Ticket | A one-thumb ticketing screen for bus conductors, built for a moving bus and direct sun. Seven screens and a working prototype. |
| /case-study/hr-hiring-portal | HR Hiring Portal · UX Case Study | Replacing a paper observation form with a login-gated portal for about 500 candidates a year: roles, a state model, emails and reports. |
| /case-study/sparky-mascot-redesign | Sparky Mascot Redesign · Brand Case Study | Redesigning Sonepar India's mascot into an approved brand element, with films, event branding and campaigns. |
| /case-study/vaarahi-brand-identity | Vaarahi · Jewellery Brand Identity | A peacock and the letter V in one gold line, with deep green packaging, gift card and launch poster. |
| /case-study/altura-honey | Altura Honey · Branding & Packaging | Name, logo and hexagonal packaging for a wild Himalayan honey: a mountain, a bee and a honey drop in one mark. |
| /branding-1 | Merch Design Collection · Mragank Bhikshu | T-shirts, hoodies, fest gate designs and logo work for Kshitij, IIT Kharagpur and others. |

For pages you don't want in search (/thankyou-page, /free-lencing and the old /2d-animation/... detail pages), switch on **Hide from search engines** in their page settings, or delete them.

## 3. Structured data (Site Settings → General → Custom Code → End of `<head>`)

This tells Google who the site belongs to:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Mragank Bhikshu",
  "jobTitle": "Product & Brand Designer",
  "url": "https://mragankbhikshu-portfolio.framer.website",
  "email": "mailto:mragankbhikshu@gmail.com",
  "alumniOf": { "@type": "CollegeOrUniversity", "name": "Indian Institute of Technology Kharagpur" },
  "knowsAbout": ["Product design", "UX design", "Brand identity", "Motion design", "Design systems"]
}
</script>
```

Add your LinkedIn and Behance links as `"sameAs": ["https://…", "https://…"]` if you want them connected.

## 4. Already fixed in the components

- Each case study has one `h1` and real `h2` headings, so search engines can read the page structure.
- Gallery images have alt text (the piece's title), and decorative copies of tool names on the About shelf are marked `data-nosnippet`, so they don't appear in search snippets.
- All the case studies link to each other and back to the gallery, so crawlers can find every page from the Portfolio.

## 5. After publishing

1. Open Google Search Console, add the site, and submit `https://mragankbhikshu-portfolio.framer.website/sitemap.xml`. Framer generates this file.
2. Request indexing for the three product case studies first.
3. A custom domain (for example mragank.design) ranks and reads better than a framer.website address. It needs a paid Framer site plan, which also removes the badge (I18).
