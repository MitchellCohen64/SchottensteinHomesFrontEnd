// Test 6 — Coldwell Banker Global Luxury concept
// Scoped entirely to .test6-page. Powers the "Explore Our Communities"
// horizontal scroll-snap slider: prev/next arrows, dot indicators, and a
// small caption row synced to whichever slide is currently in view.

if (document.querySelector('.test6-page')) {
  const slider = document.getElementById('t6-slider')

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.t6-slide'))
    const prevButton = document.querySelector('[data-t6-prev]')
    const nextButton = document.querySelector('[data-t6-next]')
    const dots = Array.from(document.querySelectorAll('[data-t6-dots] .t6-dot'))
    const metaTag = document.querySelector('[data-t6-meta-tag]')
    const metaType = document.querySelector('[data-t6-meta-type]')
    const metaPrice = document.querySelector('[data-t6-meta-price]')
    const metaLink = document.querySelector('[data-t6-meta-link]')

    const getSlideWidth = () => {
      if (!slides.length) return 0
      const style = window.getComputedStyle(slider)
      const gap = parseFloat(style.columnGap || style.gap || '0') || 0
      return slides[0].getBoundingClientRect().width + gap
    }

    const scrollToIndex = (index) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, index))
      slider.scrollTo({ left: clamped * getSlideWidth(), behavior: 'smooth' })
    }

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        slider.scrollBy({ left: -getSlideWidth(), behavior: 'smooth' })
      })
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        slider.scrollBy({ left: getSlideWidth(), behavior: 'smooth' })
      })
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => scrollToIndex(index))
    })

    const updateActiveSlide = () => {
      const step = getSlideWidth()
      if (!step) return

      const index = Math.round(slider.scrollLeft / step)
      const clamped = Math.max(0, Math.min(slides.length - 1, index))
      const active = slides[clamped]
      if (!active) return

      dots.forEach((dot, i) => {
        const isActive = i === clamped
        dot.classList.toggle('is-active', isActive)
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false')
      })

      if (metaTag) metaTag.textContent = active.dataset.tag || ''
      if (metaType) metaType.textContent = active.dataset.type || ''
      if (metaPrice) metaPrice.textContent = active.dataset.price || ''
      if (metaLink) {
        metaLink.textContent = ''
        metaLink.append(`View ${active.dataset.name} `)
        const arrow = document.createElement('span')
        arrow.setAttribute('aria-hidden', 'true')
        arrow.textContent = '→'
        metaLink.append(arrow)
        metaLink.setAttribute('href', active.dataset.href || '/communities.html')
      }
    }

    let scrollTimer
    slider.addEventListener(
      'scroll',
      () => {
        window.clearTimeout(scrollTimer)
        scrollTimer = window.setTimeout(updateActiveSlide, 90)
      },
      { passive: true }
    )

    window.addEventListener('resize', updateActiveSlide)

    updateActiveSlide()
  }
}
