// TEST 2 page-specific JS — horizontal scroll-snap "Featured Homes" slider controls.
// Scoped to .test2-page only; queries are all rooted within it so this cannot
// affect any other page on the site.

const page = document.querySelector('.test2-page')

if (page) {
  const slider = page.querySelector('.t2-slider')
  const prevBtn = page.querySelector('.t2-slider-prev')
  const nextBtn = page.querySelector('.t2-slider-next')

  if (slider && prevBtn && nextBtn) {
    const getStep = () => {
      const tile = slider.querySelector('.t2-tile')
      if (!tile) return slider.clientWidth
      const style = window.getComputedStyle(slider)
      const gap = parseFloat(style.columnGap || style.gap || '0') || 0
      return tile.getBoundingClientRect().width + gap
    }

    prevBtn.addEventListener('click', () => {
      slider.scrollBy({ left: -getStep(), behavior: 'smooth' })
    })

    nextBtn.addEventListener('click', () => {
      slider.scrollBy({ left: getStep(), behavior: 'smooth' })
    })
  }
}
