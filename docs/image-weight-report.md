# Image weight report

Measured from source assets referenced by each page, including generated plan-card images and page-specific CSS backgrounds. Duplicate references on the same page are counted once. External YouTube thumbnails and map tiles are excluded.

| Page | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| 404.html | 0.03 MB | 0.03 MB | 0% |
| about.html | 1.56 MB | 0.92 MB | 41% |
| communities.html | 2.96 MB | 0.92 MB | 69% |
| contact.html | 1.03 MB | 0.10 MB | 90% |
| cottages-at-verbena.html | 12.21 MB | 0.34 MB | 97% |
| design-center.html | 2.78 MB | 0.97 MB | 65% |
| energy-efficiency.html | 3.40 MB | 0.35 MB | 90% |
| glacier-pointe.html | 101.99 MB | 1.48 MB | 99% |
| hickory-creek.html | 69.92 MB | 1.23 MB | 98% |
| holton-run.html | 15.78 MB | 0.28 MB | 98% |
| home-details.html | 2.31 MB | 0.17 MB | 93% |
| index.html | 2.14 MB | 0.53 MB | 75% |
| inventory-homes.html | 184.74 MB | 2.47 MB | 99% |
| jerome-village-aster.html | 59.79 MB | 0.88 MB | 99% |
| renner-park.html | 74.28 MB | 1.15 MB | 98% |
| reserve-at-new-california.html | 57.92 MB | 0.73 MB | 99% |
| retreat-at-hickory-lakes.html | 85.05 MB | 1.37 MB | 98% |
| virtual-tours.html | 184.74 MB | 2.47 MB | 99% |

The one-time optimizer starts at WebP quality 78 and only lowers quality or dimensions when necessary to keep an individual output below 300 KB. Run `npm run report:images` to regenerate the current raw measurements.
