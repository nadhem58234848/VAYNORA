---
name: brand-identity-harb
description: Keep every visual and written piece on-brand for «حرب النفس» and VAYNORA: colors, fonts, logo use, tone of voice, words to use and avoid, and how sub-brands fit. Use for any design, carousel, cover, product, packaging, page or naming decision.
---

# Branding & identity (البراندينغ والهوية)

## Brand architecture
- **«حرب النفس»** = umbrella identity (the war against the self). Don't cite the weak "الجهاد الأكبر" hadith; use «والمجاهد من جاهد نفسه في طاعة الله» (authentic, Ahmad/Tirmidhi; verify wording before quoting). Slogan: **«اصنع من الألم قوة»**.
- **ناظم = the face**: personal account nadhem_elaashek. Write the name in Arabic as «ناظم», never «نذهم».
- **«معركة الخلوات»** = one battle inside the war (the book on private sins/addiction). Not the whole brand.
- **VAYNORA** = a mindset and a community (Nadhem's definition, 2026-10-16) for people who want to break free from addiction, develop themselves and return to Allah. Its expressions: the community, the clothing, the future training hall. VAY content speaks as a community ("نحن"، "إخوتي في المعركة"), not as a brand selling; IG vaynora_ with character VAY. VAYNORA and «حرب النفس» share ONE visual identity.
- Products (book, 21-day challenge, apps «حرب النفس» and warrior, compression shirt, 90-day program) all sit under this identity.

## Visual identity
OFFICIAL REFERENCE: brand guide https://nadhem58234848.github.io/VAYNORA/brand/ (source: repo brand/ and /mnt/project-files/brand/: logos SVG/PNG, brand.css + tokens.json color scales, 7 content templates, Cairo fonts). It wins over anything below if they differ.
- **v1.1 (2026-10-16, from Nadhem's 338K checklist post, wins over v1.0):** primary **Crimson #8E1D20** for plates/banners, check boxes, the thin rule and print-like accents; **Signal #C81E1E** for the emblem and the one red keyword on dark; background **Night #0D0D0D**; text **Bone #F4F1EC**. Plates and boxes: crimson, radius ~10px. Wordmark = **VAYNORA in classic serif (Gelasio), wide tracking, with a thin crimson rule above it**; use the files in brand/v1.1/ (svg/png, kit ZIP), never retype it. Retired: the monoline Λ wordmark. Still valid from v1.0: Red 400 #E0262B keyword on photos, Red 600 #A6192E = Pantone 187 C for print, shirt highlight #DC303C, gradients Ember/Night/Blade. Red is for ONE key word or element, not everything.
- Lockups: emblem (Signal) + crimson rule + Bone wordmark on Night; on light: Crimson emblem + black wordmark. Horizontal lockup for headers. Reference images: brand/v1.1/identity-v1.1.png and logo-wordmark.png.
- **Content templates v1.2 (2026-10-16, flat style chosen by Nadhem):** https://nadhem58234848.github.io/VAYNORA/brand/content/ (source brand/src/content_templates.py + content_render.js; copy in /mnt/project-files/brand/src/). Backgrounds are FLAT: black #0B0B0B with a 12px red #C81E1E stripe on the right edge, or full red #C81E1E with black text (last slide of every carousel: save/CTA). NO gradients, NO glow, NO photo backgrounds (Nadhem rejected them); photos go in a rounded card. Shared parts: counter in an outlined box top-left, brand top-right (Nadhem: emblem + «حرب النفس»; VAY: serif VAYNORA), progress dashes bottom-left (current one red), italic handle bottom-right, number in a red outlined circle, grey #333 divider before a red punchline. 13 templates: Nadhem carousel (title cover, number cover, inner, checklist, red CTA), posts (challenge checklist + photo card, red quote), stories (daily tip + poll + «الرابط في البايو», red challenge day X/21), VAY carousel (image-card cover, image+text, text slide, red save slide). Old renderers (render_carousel.py, render_story.py) are superseded.
- Font: **Cairo** (ExtraBold 800 for headlines and captions, Regular for body). Headlines/captions stay Cairo; the serif is ONLY for the VAYNORA wordmark. Captions: white with black outline, 2-3 words per line, keyword red, no card behind.
- Logo: the VAYNORA emblem (symmetrized version; source in project uploads). Keep clear space, never stretch, never recolor outside black/white/brand red. Watermark @nadhem_elaashek small on content.
- Imagery: dark, high-contrast, real (Nadhem, studio, prayer mat, training, night city, Fajr light). Mood: discipline, struggle, quiet strength. No cheesy stock smiles, no glamorized sin, no women's photos in ads or content, no music-instrument visuals.
- Formats: reels 9:16 (1080x1920), carousels 4:5 (1080x1350, render_carousel.py, text centered), stories 1080x1920 (render_story.py).

## Verbal identity (tone of voice)
- Language: Tunisian darija for talking; فصحى only for Quran, hadith and formal book text.
- Voice: a brother who went through it. Honest, direct, warm, never preachy or shaming. Strong but humble ("نبني"، not "أنا وصلت").
- Brand vocabulary: حرب، معركة، محارب، الصبر، النفس، الانضباط، الفجر، القوة، الألم، نبني، نرجعو.
- Avoid: clichés ("بدايتك موش نهايتك"), exaggerated claims, fake urgency, graphic words about sin, fear-mongering, insulting the viewer, claiming religious authority.
- Emoji: few; 🤍 and ⚔️ fit the brand. No laughing faces on serious topics.
- Religious accuracy: salaf/athari stance; every verse/hadith authentic and cited.

## Consistency checklist (run before delivering any piece)
1. Black + red + white only, Cairo font, one red keyword?
2. Logo/handle present and not distorted?
3. Darija, short lines, brother tone, no clichés?
4. Fits «اصنع من الألم قوة» (pain turned into strength), not shame or showing off?
5. Clear which sub-brand/product it serves and what the CTA is?
6. Nothing invented about Nadhem's story; religious text sourced?

## Naming & new products
New names must sound like part of the war: Arabic first, short, strong (e.g. «حرب النفس»، «معركة الخلوات»، «محارب»). Check the name isn't already a big brand on Instagram before using it. Latin name only for VAYNORA products.
