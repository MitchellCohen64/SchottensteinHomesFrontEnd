# Floor plan documentation

`missing-floor-plans.txt` lists every active community floor plan that does not have a brochure configured in the website.

`missing-inventory-floor-plans.txt` lists inventory home designs that cannot reuse a configured brochure from any of their communities.

The inventory catalog currently contains 32 unique designs. A brochure is available for 31 of them; only the design in `missing-inventory-floor-plans.txt` remains unavailable.

`missing-inventory-virtual-tours.txt` lists inventory home designs that have no matching tour on `virtual-tours.html`. Designs ending in `II` reuse the base design's tour when one is available.

The list is generated conceptually by comparing the active plans in `src/data/basePricing.js` with the brochure mappings in `src/main.js`. Each entry uses this format:

```text
house name - community
```

As of October 12, 2026, the website catalog contains 64 community/plan combinations. Of those, 62 have configured brochure PDFs and 2 are missing.
