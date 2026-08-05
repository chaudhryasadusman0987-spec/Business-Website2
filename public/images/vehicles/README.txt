PAK OZ RENTALS — VEHICLE PHOTOS
================================

Add 3-4 photos per vehicle using these exact filenames:

  v1-main.jpg      v1-front.jpg
  v1-interior.jpg  v1-rear.jpg

Repeat for v2 through v16 (16 vehicles in total):

  v2-main.jpg  ... v2-rear.jpg
  v3-main.jpg  ... v3-rear.jpg
  ...
  v16-main.jpg ... v16-rear.jpg

Which vehicle is which number is set in
src/data/car-rental.ts (rentalVehicles), e.g.
  v1  = 2013 Toyota Prius Hatchback (346WSI)
  v16 = 2017 Toyota HiLux Ute       (816QU8)

Recommended: 800x600px JPG, under 200KB each.

  *-main.jpg  is shown on the listing card in the fleet grid.
  The other three appear in the detail modal gallery.

Missing files degrade gracefully: the card and gallery show a
"Photo coming soon" placeholder instead of a broken image, so you
can upload photos a few vehicles at a time.
