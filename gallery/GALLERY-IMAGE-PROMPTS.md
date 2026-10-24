# Exhibition Hall: image prompts

Seven images for the Portfolio page. Generate all of them with the same tool and settings so they read as one building.

## Settings for every image

- Aspect ratio 16:9, landscape. At least 2560 × 1440 px (3840 × 2160 is better).
- Same tool, same model and same style strength for all seven. If the tool supports a seed, reuse one seed.
- If the tool supports a reference image, generate the Entrance first and use it as the style reference for the other six.
- Save as PNG (or JPG at 90%+ quality), named as below.

## The shared room (why the rules matter)

The code hangs your real work on top of these backgrounds and crossfades between them as you walk. So:

- Camera: perfectly frontal, eye level (1.6 m), 35 mm lens, no tilt, no angle. The wall is flat and parallel to the image.
- Floor line: the wall meets the floor at 83% of the image height in every image (about 1195 px down on a 1440 px image).
- Ceiling: a black ceiling track with spotlights runs across the top 0–12% of every image.
- Centre safe zone: in the five wing images, the area from 18% to 82% across and 16% to 80% down must be empty wall. Real artwork slides through here.
- Edge zone: decoration only in the outer 18% on the left and right, and below the floor line.
- No text, letters, numbers, logos, people or watermarks anywhere.

---

## Style block (paste at the end of every prompt)

```
Photorealistic architectural interior photograph of a premium contemporary art gallery at night. Matte deep charcoal plaster walls (hex #141418) with a very fine natural plaster texture. Polished dark grey concrete floor with soft, slightly blurred reflections of the lights. Black ceiling track lighting with small cylindrical spotlights, warm 3000K museum light, narrow beams that leave soft oval light pools on the wall. Low-key cinematic lighting, deep but not crushed shadows, gentle falloff, faint atmospheric haze. Shot with a full-frame camera, 35 mm lens, f/8, eye level, perfectly frontal one-point view, wall parallel to the sensor, vertical lines perfectly straight, symmetrical composition. Ultra detailed, high dynamic range, subtle film grain, editorial architecture photography in the style of a luxury museum catalogue. No people, no text, no letters, no numbers, no logos, no signage, no watermark.
```

## Negative prompt (use if the tool has a field for it)

```
text, letters, words, numbers, typography, signage, labels with writing, logo, watermark, signature, people, person, visitor, hands, faces, tilted camera, dutch angle, perspective distortion, fisheye, wide-angle distortion, curved walls, objects in the centre of the wall, clutter, furniture in the middle, bright daylight, windows, white walls, pastel colours, cartoon, illustration, 3D render look, plastic, CGI, blurry, low resolution, jpeg artefacts, oversaturated, neon overload, lens flare
```

---

## 1. Entrance (first screen)

File: `gallery-entrance.png`

```
Wide frontal photograph of the entrance hall of a dark, exclusive contemporary art gallery at night, seen straight-on from the centre of the room.

COMPOSITION: The image is split into two zones. LEFT ZONE (0% to 45% of the width): a large, completely empty, smooth charcoal wall, evenly and softly lit by one wide, dim wash light, with no objects, no frames, no switches, no texture changes, reserved for a large headline. RIGHT ZONE (48% to 96% of the width): five picture frames hung on the wall in an elegant salon-style cluster, vertically centred between 18% and 76% of the image height.

THE FIVE FRAMES (all with thin 2 cm matte black wooden frames, a wide warm cream mat border (#ECE7DC) and a fine shadow on the wall behind them):
Frame 1, centre of the cluster, the largest, portrait 3:4: an abstract bold graphic event poster made of overlapping geometric shapes in hot pink (#FF4F8B), black and cream.
Frame 2, upper left of the cluster, medium, landscape 4:3: a cinematic film still of a dark theatre with a single electric blue (#2F9BFF) projector beam cutting through haze.
Frame 3, lower left of the cluster, small, square: a friendly round character mascot silhouette lit with warm orange (#FF8A2A) rim light on a dark background.
Frame 4, upper right of the cluster, medium, portrait: a minimal glowing app interface on a dark phone-shaped screen, abstract blocks and rounded cards in violet (#8B5CF6), no readable text.
Frame 5, lower right of the cluster, medium, landscape: a tidy collage of abstract social media cards and paper documents arranged on a grid, accent colour green (#3BD671), no readable text.
The frames are spaced 8 to 12 cm apart, aligned on a shared invisible centre line, slightly varied heights, like a curated salon wall.

LIGHTING: one narrow warm spotlight from the ceiling track aims at each frame, creating a soft oval pool of light on the wall around each one and a gentle glow on the cream mats; the accent colour of each artwork casts a very faint tint onto the wall nearby. The left headline wall is lit more softly and evenly, slightly darker than the frames.

DETAILS: a thin brushed brass picture rail runs horizontally across the full wall at 10% height. The black ceiling track with six small spotlights spans the top edge. At the bottom right, on the polished concrete floor, a long low black leather gallery bench, partly cropped by the right edge. The wall meets the floor at 83% of the image height; the floor shows soft reflections of the frames and light pools.

MOOD: quiet, exclusive, evening private view, inviting.

[STYLE BLOCK]
```

---

## 2. Poster Wing background

File: `wing-poster.png`

```
Wide frontal photograph of a long gallery wall in a room dedicated to graphic design posters, inside a dark contemporary art gallery at night.

COMPOSITION: CENTRE SAFE ZONE (18% to 82% of the width, 16% to 80% of the height): a completely empty, clean, smooth charcoal wall with nothing on it, no frames, no posters, no hooks, lit by five evenly spaced soft warm spotlight pools in a row at eye level, ready for artworks to be hung later. The wall meets the floor at 83% of the image height.

EDGE DECORATION (only in the outer 18% on each side, partly cropped by the image edges):
Left edge: a tall industrial black steel flat-file cabinet with wide shallow drawers, and on top of it a few loosely rolled poster prints tied with string, plus a large cutting mat leaning against the wall, all slightly out of focus.
Right edge: a tall black metal rack of hanging blank poster sheets clipped with bulldog clips, seen from the side, and a screen-printing squeegee resting on a stool; colours only black, cream and hot pink.

ACCENT: a thin neon tube line in hot pink (#FF4F8B) runs along the skirting where the wall meets the floor across the full width, glowing softly upward onto the bottom of the wall and reflecting as a pink streak in the polished concrete floor. A very subtle halftone dot pattern is faintly visible on the upper wall above 16% height only, barely noticeable.

LIGHTING: warm narrow track spotlights from the black ceiling track at the top edge, oval light pools on the wall, darker corners, pink glow only at floor level.

MOOD: an urban print studio meets a museum; bold, graphic, confident.

[STYLE BLOCK]
```

---

## 3. Animation Cinema background

File: `wing-cinema.png`

```
Wide frontal photograph of the front of a small, intimate private screening room inside a dark contemporary art gallery at night, seen from the middle of the seating rows looking straight at the front wall.

COMPOSITION: CENTRE SAFE ZONE (18% to 82% of the width, 14% to 76% of the height): a large, empty, very dark matte charcoal wall area where a projection screen will be placed later; do not draw a screen, a frame or any image on it, only a soft gradient of projector light. The floor line is at 83% of the image height.

PROJECTOR BEAM: a soft, wide electric blue (#2F9BFF) projector beam enters from the top centre and spreads down towards the centre safe zone, visible in light atmospheric haze, with tiny floating dust particles catching the light; the beam is gentle and translucent, not blinding.

EDGE DECORATION:
Far left and far right edges (outer 15%): heavy deep navy velvet theatre curtains, gathered and draped in tall folds, with a faint blue rim light on their edges, partly cropped by the image edges.
Bottom 0% to 15% of the image: the dark silhouettes of the backs of two rows of plush cinema seats with rounded headrests, seen from behind, low and dark, only their top edges catching a little blue light; they cover only the very bottom of the image.
Small warm amber step lights line the aisle on both sides at floor level.

LIGHTING: very low key, mostly darkness, the blue beam as the main light, warm step lights as small accents; a faint blue glow spills onto the wall around the centre area.

MOOD: hushed, cinematic, the moment just before a film starts.

[STYLE BLOCK, but replace "warm 3000K museum light" with "dim blue projector light and small warm aisle lights"]
```

---

## 4. Brand Studio background

File: `wing-brand.png`

```
Wide frontal photograph of a long wall in a creative brand design studio inside a dark contemporary art gallery at night.

COMPOSITION: CENTRE SAFE ZONE (18% to 82% of the width, 16% to 80% of the height): a completely empty, clean, smooth charcoal wall with nothing on it, lit by three large soft warm spotlight pools in a row at eye level, ready for artworks. The wall meets the floor at 83% of the image height.

EDGE DECORATION (outer 18% on each side, partly cropped, shallow depth of field so it is slightly soft):
Left edge: a wooden artist's easel holding a blank board turned slightly away, and behind it a cork pinboard covered with small paper colour swatch cards and rough pencil sketch thumbnails of character shapes; nothing readable, only shapes and colours.
Right edge: tall slim dark walnut shelves holding small matte vinyl designer toy figurines (abstract rounded characters without faces), a stack of fanned colour chip cards in oranges, blues and creams, and a small potted plant.

ACCENT: a warm orange (#FF8A2A) LED glow line along the skirting across the full width, reflected in the polished floor, plus a soft orange rim light on the edges of the shelf objects and the easel.

LIGHTING: warm track spotlights from the black ceiling track at the top; cosy warm pools; gentle shadows.

MOOD: warm, playful, crafted, where characters and brands are born.

[STYLE BLOCK]
```

---

## 5. Product Lab background

File: `wing-product.png`

```
Wide frontal photograph of a long wall in a futuristic product design lab inside a dark contemporary art gallery at night.

COMPOSITION: CENTRE SAFE ZONE (18% to 82% of the width, 16% to 80% of the height): an empty, smooth, very dark graphite wall with an extremely faint fine square grid pattern (5 cm squares, barely visible), softly and evenly lit, ready for floating device screens to be placed later; nothing on it. The wall meets the floor at 83% of the image height.

EDGE DECORATION (outer 18% on each side, partly cropped):
Left edge: two sleek frosted glass display plinths of different heights with softly glowing white tops, empty, and behind them a slim standing glass whiteboard with abstract wireframe sketches made only of rectangles, circles and connecting lines, no text, no numbers.
Right edge: a minimal white modular shelf with a few abstract devices (a blank tablet, a phone face down, a small round speaker) and a coiled cable, clean and orderly.

ACCENT: a thin violet (#8B5CF6) LED strip runs along the top edge where the wall meets the ceiling and another along the skirting, casting a cool violet glow on the wall edges and a violet reflection in the polished floor; a subtle cool blue ambient fill light.

LIGHTING: cooler and more even than the other rooms but still dark; small precise spotlights from the black ceiling track; crisp, clean shadows.

MOOD: precise, high-tech, calm, like a flagship tech store design lab after hours.

[STYLE BLOCK, but replace "warm 3000K museum light" with "neutral 4500K light with cool violet accents"]
```

---

## 6. Internship Archive background

File: `wing-archive.png`

```
Wide frontal photograph of a long wall in an elegant archive room inside a dark contemporary art gallery at night.

COMPOSITION: CENTRE SAFE ZONE (18% to 82% of the width, 16% to 80% of the height): a completely empty, clean, smooth charcoal wall, lit by four warm spotlight pools in a row at eye level, ready for framed work. The wall meets the floor at 83% of the image height.

EDGE DECORATION (outer 18% on each side, partly cropped):
Left edge: tall dark oak archive shelving filled with neat rows of matching dark grey archival storage boxes with small blank brass label holders (no writing), a few rolled documents tied with ribbon, and a leather-bound portfolio case.
Right edge: a dark oak reading desk with a vintage brass banker's lamp glowing warm, a closed leather notebook, a fountain pen and a small stack of folders; behind it more oak shelves fading into shadow.

ACCENT: a soft green (#3BD671) LED glow line along the skirting across the full width, reflected in the polished floor, plus a very subtle green tint in the shadows of the shelves.

LIGHTING: warm, slightly golden museum spotlights from the black ceiling track; the banker's lamp as a warm practical light; rich shadows.

MOOD: organised, professional, trustworthy; a quiet record of real client work.

[STYLE BLOCK]
```

---

## 7. Optional: wall switch (for "Switch on the gallery")

File: `switch.png`

The lights-off intro is done in code; this image only replaces the switch drawn in code.

```
A single vintage brass toggle light switch mounted on a small vertical rectangular brushed brass wall plate with two small flat-head screws, the toggle in the down (off) position, photographed perfectly front-on and centred, soft warm studio lighting with a gentle highlight on the brass, photorealistic product photography, ultra detailed, isolated on a fully transparent background (PNG with alpha channel), no background, no shadow, no text, no logo.
```

---

## Checklist before sending the images

- [ ] All 16:9, at least 2560 px wide
- [ ] The camera looks straight at the wall (vertical lines are vertical)
- [ ] The floor line is at roughly the same height in all seven
- [ ] The centre of each wing wall is empty
- [ ] No text, letters or logos anywhere (check the labels, boxes and whiteboards)
- [ ] Files saved in F:\framer\gallery\ with the names above
