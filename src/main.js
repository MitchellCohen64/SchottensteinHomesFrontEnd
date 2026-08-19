import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import standardLogoUrl from '../media/SH_logo.png'
import { renderRennerTracedLots } from './components/RennerTracedLots.js'
import { communityPlanData, inventoryPlans } from './data/basePricing.js'

const header = document.querySelector('.site-header')
const headerLogo = header?.querySelector('.brand img')
const isHomePage = document.body.classList.contains('home-page')

const rennerLotTracer = document.querySelector('[data-renner-lot-tracer]')
if (rennerLotTracer) renderRennerTracedLots(rennerLotTracer.querySelector('.site-plan-overlay'))

if (import.meta.env.DEV && rennerLotTracer && new URLSearchParams(window.location.search).get('traceLots') === '1') {
  import('./components/RennerLotTracer.js').then(({ mountRennerLotTracer }) => mountRennerLotTracer(rennerLotTracer))
}

if (isHomePage) {
  const revealSections = document.querySelectorAll('body.home-page > section')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Tall stacked sections (esp. .home-intro) need less of themselves on screen
  // before revealing on narrow viewports, or content reads as blank while scrolling.
  const isNarrowViewport = window.matchMedia('(max-width: 700px)').matches
  const revealDelayStep = isNarrowViewport ? 50 : 85
  const revealDelayCap = isNarrowViewport ? 4 : 6
  const introRevealThreshold = isNarrowViewport ? 0.15 : 0.4

  revealSections.forEach((section) => {
    const items = section.querySelectorAll([
      'h2',
      'h3',
      'p',
      '.home-intro-card',
      '.home-intro-image',
      '.featured-community-slide.is-active > img',
      '.featured-community-controls',
      '.communities-map',
      '.offer-card',
      '.final-cta-image',
      '.final-cta-button',
    ].join(', '))

    ;[...items]
      .filter((item) => !item.matches('.home-intro-title'))
      .forEach((item, index) => {
      item.classList.add('home-reveal-item')
      item.style.setProperty('--reveal-delay', `${Math.min(index, revealDelayCap) * revealDelayStep}ms`)
    })

    const titleLines = [...section.querySelectorAll('.home-intro-title-line > span')]
    titleLines.forEach((line, index) => {
      line.classList.add('home-reveal-title-line')
      line.style.setProperty('--reveal-delay', `${index * 500}ms`)
    })
  })

  if (reduceMotion) {
    revealSections.forEach((section) => section.classList.add('is-revealed'))
  } else {
    document.body.classList.add('home-reveal-enabled')
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const revealThreshold = entry.target.classList.contains('home-intro') ? introRevealThreshold : 0.08
        if (entry.intersectionRatio < revealThreshold) return
        entry.target.classList.add('is-revealed')
        revealObserver.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: [0.08, introRevealThreshold] })

    revealSections.forEach((section) => revealObserver.observe(section))
  }
}

document.querySelectorAll('.nav-group > .nav-label, .dropdown button, .hero-drawer-nav button').forEach((control) => {
  const label = control.textContent.trim().replace(/\s+/g, ' ')
  if (label === 'HOMES' || label === 'Inventory Homes') {
    control.addEventListener('click', () => { window.location.href = '/inventory-homes.html' })
  }
})

const updateHeader = () => {
  const isScrolled = window.scrollY > 40
  header?.classList.toggle('is-scrolled', isScrolled)

  if (isHomePage && headerLogo) {
    headerLogo.src = standardLogoUrl
  }
}

updateHeader()
window.addEventListener('scroll', updateHeader, { passive: true })

if (header && !isHomePage) {
  const compactMenuTrigger = document.createElement('button')
  compactMenuTrigger.className = 'hero-menu-trigger site-menu-trigger'
  compactMenuTrigger.type = 'button'
  compactMenuTrigger.setAttribute('aria-label', 'Open menu')
  compactMenuTrigger.setAttribute('aria-controls', 'site-menu-drawer')
  compactMenuTrigger.setAttribute('aria-expanded', 'false')
  compactMenuTrigger.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>'
  header.append(compactMenuTrigger)

  document.body.insertAdjacentHTML('beforeend', `
    <div class="hero-menu-backdrop" aria-hidden="true"></div>
    <aside id="site-menu-drawer" class="hero-menu-drawer is-right" aria-label="Main menu" aria-hidden="true">
      <div class="hero-menu-drawer-header">
        <img src="/media/SH_logo.png" alt="Schottenstein Homes" />
        <button class="hero-menu-close" type="button" aria-label="Close menu">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <nav class="hero-drawer-nav" aria-label="Compact navigation">
        <section>
          <a class="hero-drawer-heading" href="/communities.html">Communities</a>
          <a href="/communities.html">View All Communities</a>
          <a href="/jerome-village-aster.html">Jerome Village Aster</a>
          <a href="/cottages-at-verbena.html">The Cottages at Verbena</a>
          <a href="/reserve-at-new-california.html">The Reserve at New California</a>
          <a href="/glacier-pointe.html">Glacier Pointe</a>
          <a href="/holton-run.html">Holton Run</a>
          <a href="/hickory-creek.html">Hickory Creek</a>
          <a href="/renner-park.html">Renner Park</a>
          <a href="/retreat-at-hickory-lakes.html">The Retreat at Hickory Lakes</a>
        </section>
        <section>
          <a class="hero-drawer-heading" href="/inventory-homes.html">Homes</a>
          <a href="/inventory-homes.html">Explore All Homes</a>
          <a href="/design-center.html">Design Center</a>
          <a href="/virtual-tours.html">Virtual Tours</a>
        </section>
        <section>
          <a class="hero-drawer-heading" href="/about.html">About</a>
          <a href="/about.html">About Us</a>
          <a href="/energy-efficiency.html">Energy Efficiency</a>
          <a href="/contact.html">Contact Us</a>
        </section>
        <a class="hero-drawer-login" href="https://www.homeinformationpackages.com/" target="_blank" rel="noopener noreferrer">Homeowner Login</a>
      </nav>
    </aside>`)
}

const heroMenuTrigger = document.querySelector('.hero-menu-trigger')
const heroMenuDrawer = document.querySelector('.hero-menu-drawer')
const heroMenuBackdrop = document.querySelector('.hero-menu-backdrop')
const heroMenuClose = document.querySelector('.hero-menu-close')

if (heroMenuTrigger && heroMenuDrawer && heroMenuBackdrop && heroMenuClose) {
  const setHeroMenuOpen = (isOpen) => {
    document.body.classList.toggle('is-hero-menu-open', isOpen)
    heroMenuTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
    heroMenuDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true')

    if (isOpen) heroMenuClose.focus()
    else heroMenuTrigger.focus()
  }

  heroMenuTrigger.addEventListener('click', () => setHeroMenuOpen(true))
  heroMenuClose.addEventListener('click', () => setHeroMenuOpen(false))
  heroMenuBackdrop.addEventListener('click', () => setHeroMenuOpen(false))

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('is-hero-menu-open')) {
      setHeroMenuOpen(false)
    }
  })
}

const heroSlides = document.querySelectorAll('.hero-slideshow .hero-slide')
const heroCommunityLabels = document.querySelectorAll('.hero-community-label span')

if (heroSlides.length > 1) {
  let activeHeroSlide = 0

  window.setInterval(() => {
    heroSlides[activeHeroSlide].classList.remove('is-active')
    heroCommunityLabels[activeHeroSlide]?.classList.remove('is-active')
    activeHeroSlide = (activeHeroSlide + 1) % heroSlides.length
    heroSlides[activeHeroSlide].classList.add('is-active')
    heroCommunityLabels[activeHeroSlide]?.classList.add('is-active')
  }, 5000)
}

const featuredCommunitySlides = [...document.querySelectorAll('.featured-community-slide')]
const featuredCommunityPrevious = document.querySelector('.featured-community-previous')
const featuredCommunityNext = document.querySelector('.featured-community-next')
const featuredCommunitySection = document.querySelector('.featured-communities')

if (featuredCommunitySlides.length > 1 && featuredCommunityPrevious && featuredCommunityNext) {
  let activeFeaturedCommunity = 0
  let featuredCommunityTimer
  let featuredCommunityRotationStarted = false
  const featuredCommunityInterval = 6000

  const showFeaturedCommunity = (index) => {
    activeFeaturedCommunity = (index + featuredCommunitySlides.length) % featuredCommunitySlides.length

    featuredCommunitySlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeFeaturedCommunity
      slide.classList.toggle('is-active', isActive)
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true')

      slide.querySelectorAll('a').forEach((link) => {
        link.tabIndex = isActive ? 0 : -1
      })
    })

    featuredCommunityPrevious.disabled = activeFeaturedCommunity === 0
    featuredCommunityNext.disabled = activeFeaturedCommunity === featuredCommunitySlides.length - 1
  }

  const startFeaturedCommunityTimer = () => {
    window.clearTimeout(featuredCommunityTimer)
    featuredCommunityTimer = window.setTimeout(() => {
      showFeaturedCommunity(activeFeaturedCommunity + 1)
      startFeaturedCommunityTimer()
    }, featuredCommunityInterval)
  }

  featuredCommunityPrevious.addEventListener('click', () => {
    showFeaturedCommunity(activeFeaturedCommunity - 1)
    if (featuredCommunityRotationStarted) startFeaturedCommunityTimer()
  })

  featuredCommunityNext.addEventListener('click', () => {
    showFeaturedCommunity(activeFeaturedCommunity + 1)
    if (featuredCommunityRotationStarted) startFeaturedCommunityTimer()
  })

  let featuredCommunityTouchStartX = 0
  let featuredCommunityTouchStartY = 0

  featuredCommunitySection?.addEventListener('touchstart', (event) => {
    featuredCommunityTouchStartX = event.touches[0].clientX
    featuredCommunityTouchStartY = event.touches[0].clientY
  }, { passive: true })

  featuredCommunitySection?.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - featuredCommunityTouchStartX
    const deltaY = touch.clientY - featuredCommunityTouchStartY

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) return

    showFeaturedCommunity(activeFeaturedCommunity + (deltaX < 0 ? 1 : -1))
    if (featuredCommunityRotationStarted) startFeaturedCommunityTimer()
  }, { passive: true })

  showFeaturedCommunity(0)

  const beginFeaturedCommunityRotation = () => {
    if (featuredCommunityRotationStarted) return
    featuredCommunityRotationStarted = true
    startFeaturedCommunityTimer()
  }

  if ('IntersectionObserver' in window && featuredCommunitySection) {
    const featuredCommunityObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      beginFeaturedCommunityRotation()
      featuredCommunityObserver.disconnect()
    }, { threshold: 0.2 })

    featuredCommunityObserver.observe(featuredCommunitySection)
  } else {
    beginFeaturedCommunityRotation()
  }
}

const mapElement = document.querySelector('#communities-map')

if (mapElement) {
  const isHomeMap = mapElement.dataset.mapStyle === 'illustrated'

  const communities = [
    { name: 'Jerome Village Aster', address: '6971 Aster Way, Plain City', price: 550, coords: [40.1930731, -83.1743563], href: '/jerome-village-aster.html' },
    { name: 'The Cottages at Verbena', address: '11738 Verbena Place, Plain City', price: 490, coords: [40.18376, -83.19973], href: '/cottages-at-verbena.html' },
    { name: 'The Reserve at New California', address: '10171 Jeffrey Pine Drive, Plain City', price: 620, coords: [40.15765, -83.24662], href: '/reserve-at-new-california.html' },
    { name: 'Glacier Pointe', address: '8798 Eliot Drive, Plain City', price: 450, coords: [40.1449718, -83.2051174], href: '/glacier-pointe.html' },
    { name: 'Renner Park', address: '6186 Renner Park Drive, Columbus', price: 410, coords: [39.9832, -83.172859], href: '/renner-park.html' },
    { name: 'Holton Run', address: '4840 Citation Court, Grove City', price: 480, coords: [39.865303, -83.097641], markerCoords: [39.872, -83.108], href: '/holton-run.html' },
    { name: 'Hickory Creek', address: '3899 Orders Road, Grove City', price: 410, coords: [39.8603495, -83.0980086], markerCoords: [39.854, -83.088], href: '/hickory-creek.html' },
    { name: 'The Retreat at Hickory Lakes', address: '12445 Ault Road, Pickerington', price: 470, coords: [39.9154859, -82.7277241], href: '/retreat-at-hickory-lakes.html' }
  ]

  const map = L.map(mapElement, {
    crs: isHomeMap ? L.CRS.Simple : L.CRS.EPSG3857,
    zoomControl: false,
    scrollWheelZoom: false,
    attributionControl: !isHomeMap
  })

  map.attributionControl?.setPrefix(false)

  mapElement.classList.toggle('is-home-map', isHomeMap)

  const homeImageBounds = [[0, 0], [100, 100]]

  if (isHomeMap) {
    L.imageOverlay('/media/columbus_map.png', homeImageBounds, {
      interactive: false
    }).addTo(map)
  } else {
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map)
  }

  if (!isHomeMap) {
    L.control.zoom({ position: 'bottomright' }).addTo(map)
  }

  const pinIcon = (community) => L.divIcon({
    className: `community-pin${isHomeMap ? ' is-pushpin' : ''}`,
    html: isHomeMap
      ? '<svg viewBox="0 0 36 48" aria-hidden="true"><ellipse cx="18" cy="45" rx="11" ry="2"></ellipse><path d="M11 4h14v4l-3 3v9l6 5v4H8v-4l6-5v-9l-3-3V4Zm6 25h2v14l-1 3-1-3V29Z"></path></svg>'
      : `<svg viewBox="0 0 32 40" aria-hidden="true"><path d="M16 39S30 24.4 30 14A14 14 0 1 0 2 14c0 10.4 14 25 14 25Z"></path><circle cx="16" cy="14" r="5"></circle></svg><span class="community-pin-price">$${community.price}s</span>`,
    iconSize: isHomeMap ? [36, 48] : [56, 62],
    iconAnchor: isHomeMap ? [18, 46] : [28, 52],
    tooltipAnchor: [0, -34]
  })

  const toHomeMapCoords = ([latitude, longitude]) => {
    const west = -84.05
    const east = -82.15
    const south = 39.4
    const north = 40.8

    return [
      ((latitude - south) / (north - south)) * 100,
      ((longitude - west) / (east - west)) * 100
    ]
  }

  const markers = communities.map((community) => {
    const markerPosition = isHomeMap
      ? toHomeMapCoords(community.coords)
      : community.markerCoords ?? community.coords
    const marker = L.marker(markerPosition, { icon: pinIcon(community) }).addTo(map)
    marker.bindTooltip(`<strong>${community.name}</strong><span>${community.address}</span>`, {
      direction: 'top',
      className: 'community-tooltip',
      opacity: 1,
      offset: [0, isHomeMap ? -5 : -13]
    })
    marker.on('tooltipopen', (event) => {
      const tooltip = event.tooltip.getElement()
      if (!tooltip) return

      tooltip.style.marginLeft = '0px'
      window.requestAnimationFrame(() => {
        const mapBounds = map.getContainer().getBoundingClientRect()
        const tooltipBounds = tooltip.getBoundingClientRect()
        const edgePadding = 12
        let horizontalShift = 0

        if (tooltipBounds.left < mapBounds.left + edgePadding) {
          horizontalShift = mapBounds.left + edgePadding - tooltipBounds.left
        } else if (tooltipBounds.right > mapBounds.right - edgePadding) {
          horizontalShift = mapBounds.right - edgePadding - tooltipBounds.right
        }

        tooltip.style.marginLeft = `${horizontalShift}px`
      })
    })
    marker.on('mouseover', () => marker.openTooltip())
    marker.on('click', () => {
      window.location.href = community.href
    })
    return marker
  })

  if (!isHomeMap) {
    const markersByName = new Map(communities.map((community, index) => [community.name, markers[index]]))

    document.querySelectorAll('.community-card').forEach((card) => {
      const communityName = card.querySelector('h3')?.textContent.trim()
      const marker = markersByName.get(communityName)

      if (!marker) return

      card.addEventListener('mouseenter', () => {
        marker.getElement()?.classList.add('is-highlighted')
        marker.setZIndexOffset(1000)
        marker.openTooltip()
      })

      card.addEventListener('mouseleave', () => {
        marker.getElement()?.classList.remove('is-highlighted')
        marker.setZIndexOffset(0)
        marker.closeTooltip()
      })
    })
  }

  if (isHomeMap) {
    map.fitBounds(homeImageBounds)
    map.setMaxBounds([[-6, -6], [106, 106]])
  } else {
    map.fitBounds(L.featureGroup(markers).getBounds(), { padding: [65, 65] })
  }

  const mapToggle = document.querySelector('.communities-map-toggle')
  mapToggle?.addEventListener('click', () => {
    const isVisible = mapToggle.getAttribute('aria-pressed') === 'true'
    mapToggle.setAttribute('aria-pressed', String(!isVisible))
    document.querySelector('.communities-browser')?.classList.toggle('is-map-hidden', isVisible)
    if (!isVisible) window.setTimeout(() => map.invalidateSize(), 220)
  })
}

const communityMapImage = document.querySelector('.community-page .about-intro-image img[src*="/community-maps/"]')

if (communityMapImage) {
  const lightbox = document.createElement('div')
  lightbox.className = 'community-map-lightbox'
  lightbox.hidden = true
  lightbox.innerHTML = `
    <div class="community-map-lightbox-backdrop" data-map-lightbox-close></div>
    <div class="community-map-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Enlarged community map">
      <button class="community-map-lightbox-close" type="button" aria-label="Close enlarged community map" data-map-lightbox-close>&times;</button>
      <img src="${communityMapImage.src}" alt="${communityMapImage.alt}" />
    </div>
  `
  document.body.append(lightbox)

  const closeButton = lightbox.querySelector('.community-map-lightbox-close')
  let closeTimer

  const openMapLightbox = () => {
    window.clearTimeout(closeTimer)
    lightbox.hidden = false
    document.body.classList.add('map-lightbox-open')
    window.requestAnimationFrame(() => {
      lightbox.classList.add('is-open')
      closeButton.focus()
    })
  }

  const closeMapLightbox = () => {
    lightbox.classList.remove('is-open')
    document.body.classList.remove('map-lightbox-open')
    communityMapImage.focus()
    closeTimer = window.setTimeout(() => {
      lightbox.hidden = true
    }, 260)
  }

  communityMapImage.tabIndex = 0
  communityMapImage.setAttribute('role', 'button')
  communityMapImage.setAttribute('aria-label', `${communityMapImage.alt}. Open larger view`)
  communityMapImage.addEventListener('click', openMapLightbox)
  communityMapImage.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openMapLightbox()
    }
  })

  lightbox.querySelectorAll('[data-map-lightbox-close]').forEach((control) => {
    control.addEventListener('click', closeMapLightbox)
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeMapLightbox()
  })
}

const filterPills = document.querySelectorAll('.filter-pill')
const communityCards = document.querySelectorAll('.community-card')
const communityFilterControl = document.querySelector('.community-filter-menu .community-control')
const communityFilterOptions = document.querySelector('.community-filter-options')
const communitySortControl = document.querySelector('.community-sort')
const communitySortOptions = document.querySelector('.community-sort-options')
const communityGrid = document.querySelector('.communities-grid')
const communityResultCount = document.querySelector('.communities-result-count')

const closeCommunityMenu = (control, menu) => {
  control?.setAttribute('aria-expanded', 'false')
  menu?.classList.remove('is-open')
}

const openCommunityMenu = (control, menu) => {
  control?.setAttribute('aria-expanded', 'true')
  menu?.classList.add('is-open')
}

const closeAllCommunityMenus = () => {
  closeCommunityMenu(communityFilterControl, communityFilterOptions)
  closeCommunityMenu(communitySortControl, communitySortOptions)
}

if (communityFilterControl || communitySortControl) {
  document.addEventListener('click', (event) => {
    const clickedInsideMenu = event.target.closest('.community-filter-menu, .community-sort-menu')
    if (!clickedInsideMenu) closeAllCommunityMenus()
  })

  window.addEventListener('scroll', closeAllCommunityMenus, true)
}

const placeholderHouseIcon = `
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M7 30 32 9l25 21-4 5-5-4v24H16V31l-5 4-4-5Zm17 19h16V34H24v15Z"></path>
  </svg>
`

const homePlaceholderUrl = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#eee9e2"/>
    <path fill="#8d2637" d="M244 292 400 161l156 131-25 31-31-25v148H300V298l-31 25-25-31Zm106 116h100v-94H350v94Z"/>
  </svg>
`)}`

communityCards.forEach((card) => {
  const media = card.querySelector('.community-card-media')
  const image = media?.querySelector('img')
  if (!media || !image) return
  image.classList.remove('community-card-slide', 'is-active')
})

document.querySelectorAll('.virtual-tours-page .video-card-gallery').forEach((card) => {
  const image = card.querySelector('img')
  if (!image) return
  image.classList.remove('community-card-slide', 'is-active')
})

if (filterPills.length && communityCards.length) {
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('is-active'))
      pill.classList.add('is-active')

      const filter = pill.dataset.filter
      communityCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.type === filter
        card.classList.toggle('is-hidden', !matches)
      })
    })
  })
}

if (communityFilterControl && communityFilterOptions) {
  let selectedPrice = 'all'
  let selectedHouseType = 'all'

  const applyCommunityFilters = () => {
    let visibleCount = 0
    communityCards.forEach((card) => {
      const price = Number(card.dataset.priceMin)
      const matchesType = selectedHouseType === 'all' || card.dataset.type === selectedHouseType
      const matchesPrice = selectedPrice === 'all'
        || (selectedPrice === 'under-500' && price < 500)
        || (selectedPrice === '500-550' && price >= 500 && price < 550)
        || (selectedPrice === '550-plus' && price >= 550)
      card.classList.toggle('is-hidden', !(matchesType && matchesPrice))
      if (matchesType && matchesPrice) visibleCount += 1
    })
    if (communityResultCount) {
      communityResultCount.textContent = `Showing results for ${visibleCount} ${visibleCount === 1 ? 'community' : 'communities'}`
    }
  }

  communityFilterControl.addEventListener('click', () => {
    const isOpen = communityFilterControl.getAttribute('aria-expanded') === 'true'
    closeCommunityMenu(communitySortControl, communitySortOptions)
    if (isOpen) closeCommunityMenu(communityFilterControl, communityFilterOptions)
    else openCommunityMenu(communityFilterControl, communityFilterOptions)
  })

  communityFilterOptions.querySelectorAll('[data-price], [data-house-type]').forEach((option) => {
    option.addEventListener('click', () => {
      const groupAttribute = option.hasAttribute('data-price') ? 'data-price' : 'data-house-type'
      communityFilterOptions.querySelectorAll(`[${groupAttribute}]`).forEach((item) => item.classList.remove('is-active'))
      option.classList.add('is-active')
      if (groupAttribute === 'data-price') selectedPrice = option.dataset.price
      else selectedHouseType = option.dataset.houseType
      applyCommunityFilters()
    })
  })
}

if (communitySortControl && communitySortOptions && communityGrid) {
  communitySortControl.addEventListener('click', () => {
    const isOpen = communitySortControl.getAttribute('aria-expanded') === 'true'
    closeCommunityMenu(communityFilterControl, communityFilterOptions)
    if (isOpen) closeCommunityMenu(communitySortControl, communitySortOptions)
    else openCommunityMenu(communitySortControl, communitySortOptions)
  })

  communitySortOptions.querySelectorAll('[data-sort]').forEach((option) => {
    option.addEventListener('click', () => {
      const sorters = {
        'price-asc': (a, b) => Number(a.dataset.priceMin) - Number(b.dataset.priceMin),
        'price-desc': (a, b) => Number(b.dataset.priceMin) - Number(a.dataset.priceMin),
        'designs-desc': (a, b) => Number(b.dataset.homeDesigns) - Number(a.dataset.homeDesigns),
        'move-ins-desc': (a, b) => Number(b.dataset.quickMoveIns) - Number(a.dataset.quickMoveIns),
      }
      const cards = [...communityCards].sort(sorters[option.dataset.sort])
      cards.forEach((card) => communityGrid.append(card))
      communitySortOptions.querySelectorAll('[data-sort]').forEach((item) => item.classList.remove('is-active'))
      option.classList.add('is-active')
      closeCommunityMenu(communitySortControl, communitySortOptions)
    })
  })
}

document.querySelectorAll('.faq-item').forEach((details) => {
  const summary = details.querySelector('summary')
  if (!summary) return

  let animation

  summary.addEventListener('click', (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    event.preventDefault()
    animation?.cancel()

    const startHeight = `${details.offsetHeight}px`

    if (details.open) {
      const endHeight = `${summary.offsetHeight}px`
      animation = details.animate({ height: [startHeight, endHeight] }, {
        duration: 320,
        easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      })
      details.classList.add('is-closing')
      animation.onfinish = () => {
        details.open = false
        details.classList.remove('is-closing')
        animation = null
      }
    } else {
      document.querySelectorAll('.faq-item[open]').forEach((openDetails) => {
        if (openDetails !== details) openDetails.querySelector('summary')?.click()
      })
      details.open = true
      const endHeight = `${details.offsetHeight}px`
      animation = details.animate({ height: [startHeight, endHeight] }, {
        duration: 320,
        easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      })
      animation.onfinish = () => { animation = null }
    }
  })
})

const planSpecIcons = {
  beds: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-7m18 7v-5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v5M6 11V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M3 16h18M5 21v-3m14 3v-3"></path></svg>',
  baths: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Zm3 0V6a3 3 0 0 1 6 0M5 20l-1 2m15-2 1 2"></path></svg>',
  area: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8l8-5 8 5v12H4Zm4 0v-6h8v6M3 10l9-6 9 6"></path></svg>',
  stories: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V7h16v13H4Zm4-9h8M8 15h8M8 19h8"></path></svg>',
}

const planSpecs = {
  Addison: [4, 3.5, 2], Athens: [3, 2.5, 2], Benton: [4, 2.5, 2],
  'Carroll II': [3, 2.5, 2], Chester: [2, 2, 1], Columbia: [3, 2, 1],
  Erie: [4, 2.5, 2], 'Erie II': [4, 2.5, 2], Fayette: [3, 2, 1],
  Franklin: [3, 2.5, 2], 'Franklin II': [3, 2.5, 2], Hanover: [2, 3, 2],
  Harrison: [4, 2.5, 2], Hayes: [3, 2.5, 2], Hudson: [4, 2.5, 2],
  Jefferson: [4, 2.5, 2], 'Jefferson II': [4, 2.5, 2], Knox: [3, 2, 1],
  'Knox II': [3, 2, 1], Madison: [4, 2.5, 2], 'Madison II': [4, 2.5, 2],
  Reed: [3, 3, 2], Richland: [4, 2.5, 2], Seneca: [4, 2.5, 2],
  'Seneca II': [4, 2.5, 2], Stillwater: [3, 2.5, 2], 'Stillwater Plus': [3, 2.5, 2],
  'Summit II': [4, 2.5, 2], 'Trumbull II': [4, 2.5, 2], Vinton: [4, 2.5, 2],
  'Vinton II': [4, 2.5, 2], York: [2, 2, 1],
}

const communityNames = {
  'jerome-village-aster': 'Jerome Village Aster',
  'cottages-at-verbena': 'The Cottages at Verbena',
  'glacier-pointe': 'Glacier Pointe',
  'hickory-creek': 'Hickory Creek',
  'holton-run': 'Holton Run',
  'renner-park': 'Renner Park',
  'retreat-at-hickory-lakes': 'The Retreat at Hickory Lakes',
  'reserve-at-new-california': 'The Reserve at New California',
}

const pageSlug = window.location.pathname.split('/').pop()?.replace(/\.html$/, '')
const pagePlans = communityPlanData[pageSlug]
const pagePlanGrid = document.querySelector('.offer-section .plan-grid:not([data-inventory-catalog])')

if (pagePlans && pagePlanGrid) {
  const existingCards = [...pagePlanGrid.querySelectorAll('.plan-card')]
  const existingByName = new Map(existingCards.map((card) => [card.querySelector('h3')?.textContent.trim(), card]))

  const cards = pagePlans.map((plan) => {
    const displayName = `The ${plan.name}`
    const fallbackName = displayName.replace(/ II$/, '')
    const existingCard = existingByName.get(displayName)
      || (plan.name === 'Jefferson II' ? existingByName.get(fallbackName) : null)
    const card = existingCard || document.createElement('article')
    card.classList.add('plan-card')

    if (!card.querySelector('h3')) card.insertAdjacentHTML('beforeend', '<h3></h3>')
    if (!card.querySelector('.plan-card-price')) card.insertAdjacentHTML('beforeend', '<p class="plan-card-price"></p>')
    if (!card.querySelector('.plan-card-specs')) card.insertAdjacentHTML('beforeend', '<div class="plan-card-specs"></div>')

    card.querySelector('h3').textContent = displayName
    card.querySelector('.plan-card-price').textContent = `From $${plan.price.toLocaleString('en-US')}`
    const specs = card.querySelector('.plan-card-specs')
    if (!existingCard && planSpecs[plan.name]) {
      const [beds, baths, stories] = planSpecs[plan.name]
      specs.innerHTML = `<span>${beds} Beds</span><span>${baths} Baths</span><span>${stories} ${stories === 1 ? 'Story' : 'Stories'}</span>`
    }
    let area = [...specs.children].find((spec) => /Sq Ft/i.test(spec.textContent))
    if (!area) {
      area = document.createElement('span')
      specs.append(area)
    }
    area.textContent = `${plan.sqft} Sq Ft`
    return card
  })

  pagePlanGrid.replaceChildren(...cards)
}

const homeTourVideos = {
  'The Hayes': 'dlAZMudQ_Cs',
  'The Chester': 'VDvCNmqHTb4',
  'The Erie': 'wex4pZnttPw',
  'The Franklin': 'aTDvFAywufw',
  'The Hanover': 'exIKm2N1H_c',
  'The Knox': 'ItrA4fKs6bI',
  'The Madison': 'lotboNqTBlY',
  'The Reed': '6-IWOpLS_j4',
  'The Richland': 'wPhrKOhiJt0',
  'The Seneca': 'Ev0Bgrbo6bA',
  'The Stillwater': 'kYaq_AY1mFw',
  'The Vinton': 'rgI5Ry2e490',
  'The York': '9gZypRrM-40',
}

const tourVideoFor = (name) => homeTourVideos[name] || homeTourVideos[name.replace(/\s+II$/i, '')]

const floorPlansByCommunity = {
  'Jerome Village Aster': {
    'The Carroll II': new URL('../media/Floor_Plans/Aster_in_Jerome_Village/AST CARROLL II Floor Plan Brochure 12.10.2024.pdf', import.meta.url).href,
    'The Erie II': new URL('../media/Floor_Plans/Aster_in_Jerome_Village/AST ERIE II Floor Plan Brochure 12.10.2024.pdf', import.meta.url).href,
    'The Franklin II': new URL('../media/Floor_Plans/Aster_in_Jerome_Village/AST FRANKLIN II Floor Plan Brochure 12.10.2024.pdf', import.meta.url).href,
    'The Knox II': new URL('../media/Floor_Plans/Aster_in_Jerome_Village/AST KNOX II Floor Plan Brochure 12.10.2024.pdf', import.meta.url).href,
    'The Madison II': new URL('../media/Floor_Plans/Aster_in_Jerome_Village/AST MADISON II Floor Plan Brochure 12.23.24.pdf', import.meta.url).href,
    'The Seneca II': new URL('../media/Floor_Plans/Aster_in_Jerome_Village/AST SENECA II Floor Plan Brochure 12.10.2024.pdf', import.meta.url).href,
    'The Trumbull II': new URL('../media/Floor_Plans/Aster_in_Jerome_Village/AST TRUMBULL II Floor Plan Brochure 12.10.2024.pdf', import.meta.url).href,
    'The Vinton II': new URL('../media/Floor_Plans/Aster_in_Jerome_Village/AST VINTON II Floor Plan Brochure 12.10.2024.pdf', import.meta.url).href,
  },
  'Glacier Pointe': {
    'The Addison': new URL('../media/Floor_Plans/Glacier_Pointe/GPT 4 Addison Floor Plan Brochure 11.2025.pdf', import.meta.url).href,
    'The Chester': new URL('../media/Floor_Plans/Glacier_Pointe/GPT 4 Chester  Floor Plan Brochure 1.22.2026.pdf', import.meta.url).href,
    'The Columbia': new URL('../media/Floor_Plans/Glacier_Pointe/GPT 4 Columbia  Floor Plan Brochure 1.15.2026.pdf', import.meta.url).href,
    'The Hanover': new URL('../media/Floor_Plans/Glacier_Pointe/GPT 4 Hanover Floor Plan Brochure 1.22.26.pdf', import.meta.url).href,
    'The Knox': new URL('../media/Floor_Plans/Glacier_Pointe/GPT 4 Knox Floor Plan Brochure 3.10.26.pdf', import.meta.url).href,
    'The Reed': new URL('../media/Floor_Plans/Glacier_Pointe/GPT 4 Reed Floor Plan Brochure 2.2.26.pdf', import.meta.url).href,
    'The York': new URL('../media/Floor_Plans/Glacier_Pointe/GPT 4 York Floor Plan Brochure 1.22.26.pdf', import.meta.url).href,
  },
  'Hickory Creek': {
    'The Athens': new URL('../media/Floor_Plans/Hickory_Creek/HCK Athens Floor Plan Brochure 9.4.25.pdf', import.meta.url).href,
    'The Benton': new URL('../media/Floor_Plans/Hickory_Creek/HCK Benton Floor Plan Brochure 8.2025.pdf', import.meta.url).href,
    'The Columbia': new URL('../media/Floor_Plans/Hickory_Creek/HCK Columbia Floor Plan Brochure 8.28.2025.pdf', import.meta.url).href,
    'The Fayette': new URL('../media/Floor_Plans/Hickory_Creek/HCK Fayette Floor Plan Brochure 9.25.pdf', import.meta.url).href,
    'The Franklin': new URL('../media/Floor_Plans/Hickory_Creek/HCK Franklin Floor Plan Brochure 9.25.pdf', import.meta.url).href,
    'The Harrison': new URL('../media/Floor_Plans/Hickory_Creek/HCK Harrison Floor Plan Brochure 9.25.pdf', import.meta.url).href,
    'The Hayes': new URL('../media/Floor_Plans/Hickory_Creek/HCK Hayes Floor Plan Brochure 9.25.pdf', import.meta.url).href,
    'The Hudson': new URL('../media/Floor_Plans/Hickory_Creek/HCK Hudson Floor Plan Brochure 9.25.pdf', import.meta.url).href,
    'The Jefferson': new URL('../media/Floor_Plans/Hickory_Creek/HCK Jefferson Floor Plan Brochure 9.25.pdf', import.meta.url).href,
    'The Madison': new URL('../media/Floor_Plans/Hickory_Creek/HCK Madison Floor Plan Brochure 9.25.pdf', import.meta.url).href,
    'The Richland': new URL('../media/Floor_Plans/Hickory_Creek/HCK Richland Floor Plan Brochure 9.25.pdf', import.meta.url).href,
    'The Stillwater': new URL('../media/Floor_Plans/Hickory_Creek/HCK Stillwater Floor Plan Brochure 9.25.pdf', import.meta.url).href,
    'The Stillwater Plus': new URL('../media/Floor_Plans/Hickory_Creek/HCK Stillwater Plus Floor Plan Brochure 9.25.pdf', import.meta.url).href,
    'The Vinton': new URL('../media/Floor_Plans/Hickory_Creek/HCK Vinton Floor Plan Brochure 9.25.pdf', import.meta.url).href,
  },
  'Holton Run': {
    'The Hayes': new URL('../media/Floor_Plans/Holton_Run/HLT Hayes Floor Plan Brochure 2.6.25.pdf', import.meta.url).href,
    'The Richland': new URL('../media/Floor_Plans/Holton_Run/HLT Richland Floor Plan Brochure 2.4.25.pdf', import.meta.url).href,
  },
  'Renner Park': {
    'The Athens': new URL('../media/Floor_Plans/Renner_Park/RPK Athens Floor Plan Brochure 5.19.25.pdf', import.meta.url).href,
    'The Benton': new URL('../media/Floor_Plans/Renner_Park/RPK Benton Floor Plan Brochure 8.11.2025.pdf', import.meta.url).href,
    'The Columbia': new URL('../media/Floor_Plans/Renner_Park/RPK Columbia Floor Plan Brochure 10.7.2024.pdf', import.meta.url).href,
    'The Fayette': new URL('../media/Floor_Plans/Renner_Park/RPK Fayette Floor Plan Brochure 10.10.24.pdf', import.meta.url).href,
    'The Franklin': new URL('../media/Floor_Plans/Renner_Park/RPK Franklin Floor Plan Brochure 10.14.24.pdf', import.meta.url).href,
    'The Hayes': new URL('../media/Floor_Plans/Renner_Park/RPK Hayes Floor Plan Brochure 10.11.24.pdf', import.meta.url).href,
    'The Hudson': new URL('../media/Floor_Plans/Renner_Park/RPK Hudson Floor Plan Brochure 10.15.24.pdf', import.meta.url).href,
    'The Madison': new URL('../media/Floor_Plans/Renner_Park/RPK Madison Floor Plan Brochure 10.15.24.pdf', import.meta.url).href,
    'The Richland': new URL('../media/Floor_Plans/Renner_Park/RPK Richland Floor Plan Brochure 10.15.2024.pdf', import.meta.url).href,
    'The Seneca': new URL('../media/Floor_Plans/Renner_Park/RPK Seneca Floor Plan Brochure 10.15.2024.pdf', import.meta.url).href,
    'The Stillwater': new URL('../media/Floor_Plans/Renner_Park/RPK Stillwater Floor Plan Brochure 10.15.24.pdf', import.meta.url).href,
    'The Stillwater Plus': new URL('../media/Floor_Plans/Renner_Park/Still_Water_plus_renner.pdf', import.meta.url).href,
    'The Vinton': new URL('../media/Floor_Plans/Renner_Park/RPK Vinton Floor Plan Brochure 11.25.24.pdf', import.meta.url).href,
  },
  'The Cottages at Verbena': {
    'The Reed': new URL('../media/Floor_Plans/The_Cottages_at_Verbena/CAV Reed Floor Plan Brochure 12.17.24.pdf', import.meta.url).href,
    'The York': new URL('../media/Floor_Plans/The_Cottages_at_Verbena/CAV York Floor Plan Brochure 1.27.25.pdf', import.meta.url).href,
  },
  'The Retreat at Hickory Lakes': {
    'The Fayette': new URL('../media/Floor_Plans/The_Retreat_At_Hickory_Lakes/6a4bc8329ef3f0614bf8f50a_RHL-Fayette-Floor-Plan-Brochure-PRINT-READY-6.5.2026-compressed.pdf', import.meta.url).href,
    'The Franklin': new URL('../media/Floor_Plans/The_Retreat_At_Hickory_Lakes/6a4bc841f5d8d339523880a8_RHL-Franklin-Floor-Plan-Brochure-PRINT-READY-6.5.2026-compressed.pdf', import.meta.url).href,
    'The Hayes': new URL('../media/Floor_Plans/The_Retreat_At_Hickory_Lakes/6a4bc818494b8d65067c1cfe_RHL-Hayes-Floor-Plan-Brochure-PRINT-READY-6.5.2026-compressed.pdf', import.meta.url).href,
    'The Hudson': new URL('../media/Floor_Plans/The_Retreat_At_Hickory_Lakes/6a4bc643b4336b9356eba41c_RHL-Hudson-Floor-Plan-Brochure-PRINT-READY-6.5.2026-compressed.pdf', import.meta.url).href,
    'The Jefferson': new URL('../media/Floor_Plans/The_Retreat_At_Hickory_Lakes/6a4bc59a58506f56c48d86df_RHL-Jefferson-Floor-Plan-Brochure-PRINT-READY-6.5.2026-compressed.pdf', import.meta.url).href,
    'The Madison': new URL('../media/Floor_Plans/The_Retreat_At_Hickory_Lakes/6a4bc59db46bda8ae74564e8_RHL-Madison-Floor-Plan-Brochure-PRINT-READY-6.5.2026-compressed.pdf', import.meta.url).href,
    'The Richland': new URL('../media/Floor_Plans/The_Retreat_At_Hickory_Lakes/6a4bc59db46bda8ae74564fb_RHL-Richland-Floor-Plan-Brochure-PRINT-READY-6.5.2026-compressed.pdf', import.meta.url).href,
    'The Stillwater': new URL('../media/Floor_Plans/The_Retreat_At_Hickory_Lakes/6a4bc5501d383992212af24f_RHL-Stillwater-Floor-Plan-Brochure-PRINT-ORDER-6.5.2026-compressed.pdf', import.meta.url).href,
    'The Stillwater Plus': new URL('../media/Floor_Plans/The_Retreat_At_Hickory_Lakes/6a4bc5219ef3f0614bf6db5a_RHL-Stillwater-Plus-Floor-Plan-Brochure-PRINT-READY-6.5.2026-compressed.pdf', import.meta.url).href,
    'The Vinton': new URL('../media/Floor_Plans/The_Retreat_At_Hickory_Lakes/6a4bc8c2f5d8d3395238df26_RHL-VINTON-Floor-Plan-Brochure-PRINT-READY-6.5.2026-compressed.pdf', import.meta.url).href,
  },
  'The Reserve at New California': {
    'The Erie': new URL('../media/Floor_Plans/The_Reserve_at_New_California/RNC Erie Floor Plan Brochure 10.10.24.pdf', import.meta.url).href,
    'The Franklin': new URL('../media/Floor_Plans/The_Reserve_at_New_California/RNC Franklin Floor Plan Brochure 4.17.25.pdf', import.meta.url).href,
    'The Jefferson II': new URL('../media/Floor_Plans/The_Reserve_at_New_California/RNC Jefferson Floor Plan Brochure 9.22.25.pdf', import.meta.url).href,
    'The Knox': new URL('../media/Floor_Plans/The_Reserve_at_New_California/RNC Knox Floor Plan Brochure 10.10.24.pdf', import.meta.url).href,
    'The Seneca': new URL('../media/Floor_Plans/The_Reserve_at_New_California/RNC Seneca Floor Plan Brochure 10.10.24.pdf', import.meta.url).href,
    'The Vinton': new URL('../media/Floor_Plans/The_Reserve_at_New_California/RNC Vinton Floor Plan Brochure 10.10.24.pdf', import.meta.url).href,
  },
}

// This derives the live missing list from the authoritative community catalog,
// so it stays accurate whenever another brochure is added above.
const missingFloorPlansByCommunity = Object.fromEntries(
  Object.entries(communityPlanData).map(([communitySlug, plans]) => [
    communityNames[communitySlug],
    plans
      .filter(({ name }) => !floorPlansByCommunity[communityNames[communitySlug]]?.[`The ${name}`])
      .map(({ name }) => `The ${name}`),
  ]),
)

const floorPlanFor = (name, community) => floorPlansByCommunity[community]?.[name] || null

const planImagesByCommunity = {
  'Jerome Village Aster': {
    'The Carroll II': new URL('../media/Renders/Aster_in_Jerome_Village/Carroll_II.jpg', import.meta.url).href,
    'The Erie II': new URL('../media/Renders/Aster_in_Jerome_Village/Erie_II.jpg', import.meta.url).href,
    'The Franklin II': new URL('../media/Renders/Aster_in_Jerome_Village/Franklin_II.jpg', import.meta.url).href,
    'The Knox II': new URL('../media/Renders/Aster_in_Jerome_Village/Knox_II.jpg', import.meta.url).href,
    'The Madison II': new URL('../media/Renders/Aster_in_Jerome_Village/Madison_II.jpg', import.meta.url).href,
    'The Seneca II': new URL('../media/Renders/Aster_in_Jerome_Village/Seneca_II.jpg', import.meta.url).href,
    'The Trumbull II': new URL('../media/Renders/Aster_in_Jerome_Village/Trumbull_II.jpg', import.meta.url).href,
    'The Vinton II': new URL('../media/Renders/Aster_in_Jerome_Village/Vinton_II.jpg', import.meta.url).href,
  },
  'The Cottages at Verbena': {
    'The Reed': new URL('../media/Renders/The_Cottages_at_Verbena/Reed.jpg', import.meta.url).href,
    'The York': new URL('../media/Renders/The_Cottages_at_Verbena/York.jpg', import.meta.url).href,
  },
  'Glacier Pointe': {
    'The Addison': new URL('../media/Renders/Glacier_Pointe/Addison.jpg', import.meta.url).href,
    'The Chester': new URL('../media/Renders/Glacier_Pointe/Chester.jpg', import.meta.url).href,
    'The Columbia': new URL('../media/Renders/Glacier_Pointe/Columbia.jpg', import.meta.url).href,
    'The Hanover': new URL('../media/Renders/Glacier_Pointe/Hanover.jpg', import.meta.url).href,
    'The Knox': new URL('../media/Renders/Glacier_Pointe/Knox.jpg', import.meta.url).href,
    'The Reed': new URL('../media/Renders/Glacier_Pointe/Reed.jpg', import.meta.url).href,
    'The York': new URL('../media/Renders/Glacier_Pointe/York.jpg', import.meta.url).href,
  },
  'Hickory Creek': {
    'The Athens': new URL('../media/Renders/Hickory_Creek/Athens.jpg', import.meta.url).href,
    'The Benton': new URL('../media/Renders/Hickory_Creek/Benton.jpg', import.meta.url).href,
    'The Columbia': new URL('../media/Renders/Hickory_Creek/Columbia.jpg', import.meta.url).href,
    'The Fayette': new URL('../media/Renders/Hickory_Creek/Fayette.jpg', import.meta.url).href,
    'The Franklin': new URL('../media/Renders/Hickory_Creek/Franklin.jpg', import.meta.url).href,
    'The Harrison': new URL('../media/Renders/Hickory_Creek/Harrison.png', import.meta.url).href,
    'The Hayes': new URL('../media/Renders/Hickory_Creek/Hayes.jpg', import.meta.url).href,
    'The Hudson': new URL('../media/Renders/Hickory_Creek/Hudson.jpg', import.meta.url).href,
    'The Jefferson': new URL('../media/Renders/Hickory_Creek/Jefferson.jpg', import.meta.url).href,
    'The Madison': new URL('../media/Renders/Hickory_Creek/Madison.jpg', import.meta.url).href,
    'The Richland': new URL('../media/Renders/Hickory_Creek/Richland.jpg', import.meta.url).href,
    'The Stillwater': new URL('../media/Renders/Hickory_Creek/Stillwater.png', import.meta.url).href,
    'The Stillwater Plus': new URL('../media/Renders/Hickory_Creek/Stillwater_Plus.png', import.meta.url).href,
    'The Vinton': new URL('../media/Renders/Hickory_Creek/Vinton.jpg', import.meta.url).href,
  },
  'Holton Run': {
    'The Fayette': new URL('../media/Renders/Holton_Run/Fayette.jpg', import.meta.url).href,
    'The Franklin': new URL('../media/Renders/Holton_Run/Franklin.jpg', import.meta.url).href,
    'The Hayes': new URL('../media/Renders/Holton_Run/Hayes.jpg', import.meta.url).href,
    'The Madison': new URL('../media/Renders/Holton_Run/Madison.jpg', import.meta.url).href,
    'The Richland': new URL('../media/Renders/Holton_Run/Richland.jpg', import.meta.url).href,
    'The Seneca': new URL('../media/Renders/Holton_Run/Seneca.jpg', import.meta.url).href,
    'The Vinton': new URL('../media/Renders/Holton_Run/Vinton.jpg', import.meta.url).href,
  },
  'Renner Park': {
    'The Athens': new URL('../media/Renders/Renner_Park/Athens.jpg', import.meta.url).href,
    'The Benton': new URL('../media/Renders/Renner_Park/Benton.jpg', import.meta.url).href,
    'The Columbia': new URL('../media/Renders/Renner_Park/Columbia.jpg', import.meta.url).href,
    'The Fayette': new URL('../media/Renders/Renner_Park/Fayette.jpg', import.meta.url).href,
    'The Franklin': new URL('../media/Renders/Renner_Park/Franklin.jpg', import.meta.url).href,
    'The Hayes': new URL('../media/Renders/Renner_Park/Hayes.jpg', import.meta.url).href,
    'The Hudson': new URL('../media/Renders/Renner_Park/Hudson.jpg', import.meta.url).href,
    'The Madison': new URL('../media/Renders/Renner_Park/Madison.jpg', import.meta.url).href,
    'The Richland': new URL('../media/Renders/Renner_Park/Richland.jpg', import.meta.url).href,
    'The Seneca': new URL('../media/Renders/Renner_Park/Seneca_II.jpg', import.meta.url).href,
    'The Stillwater': new URL('../media/Renders/Renner_Park/Stillwater.png', import.meta.url).href,
    'The Stillwater Plus': new URL('../media/Renders/Renner_Park/Stillwater_Plus.jpg', import.meta.url).href,
    'The Vinton': new URL('../media/Renders/Renner_Park/Vinton.jpg', import.meta.url).href,
  },
  'The Retreat at Hickory Lakes': {
    'The Fayette': new URL('../media/Renders/The_Retreat_at_Hickory_Lakes/Fayette.jpg', import.meta.url).href,
    'The Franklin': new URL('../media/Renders/The_Retreat_at_Hickory_Lakes/Franklin.jpg', import.meta.url).href,
    'The Hayes': new URL('../media/Renders/The_Retreat_at_Hickory_Lakes/Hayes.jpg', import.meta.url).href,
    'The Hudson': new URL('../media/Renders/The_Retreat_at_Hickory_Lakes/Hudson.jpg', import.meta.url).href,
    'The Jefferson': new URL('../media/Renders/The_Retreat_at_Hickory_Lakes/Jefferson.jpg', import.meta.url).href,
    'The Madison': new URL('../media/Renders/The_Retreat_at_Hickory_Lakes/Madison.jpg', import.meta.url).href,
    'The Richland': new URL('../media/Renders/The_Retreat_at_Hickory_Lakes/Richland.jpg', import.meta.url).href,
    'The Seneca': new URL('../media/Renders/The_Retreat_at_Hickory_Lakes/Seneca.jpg', import.meta.url).href,
    'The Stillwater': new URL('../media/Renders/The_Retreat_at_Hickory_Lakes/Stillwater.jpg', import.meta.url).href,
    'The Stillwater Plus': new URL('../media/Renders/The_Retreat_at_Hickory_Lakes/Stillwater_Plus.jpg', import.meta.url).href,
    'The Vinton': new URL('../media/Renders/The_Retreat_at_Hickory_Lakes/Vinton.jpg', import.meta.url).href,
  },
  'The Reserve at New California': {
    'The Erie': new URL('../media/Renders/The_Reserve_at_New_California/Erie.jpg', import.meta.url).href,
    'The Franklin': new URL('../media/Renders/The_Reserve_at_New_California/Franklin.jpg', import.meta.url).href,
    'The Jefferson II': new URL('../media/Renders/The_Reserve_at_New_California/Jefferson_II.jpg', import.meta.url).href,
    'The Knox': new URL('../media/Renders/The_Reserve_at_New_California/Knox.jpg', import.meta.url).href,
    'The Seneca': new URL('../media/Renders/The_Reserve_at_New_California/Seneca.jpg', import.meta.url).href,
    'The Vinton': new URL('../media/Renders/The_Reserve_at_New_California/Vinton.jpg', import.meta.url).href,
  },
}

const planImageFor = (name, community) => {
  const communityImages = planImagesByCommunity[community]
  if (communityImages) return communityImages[name] || null
  if (community === 'Multiple Communities' || community === 'Schottenstein Homes') {
    return Object.values(planImagesByCommunity).find((images) => images[name])?.[name] || null
  }
  return null
}

document.querySelectorAll('.virtual-tours-page .video-card').forEach((card) => {
  const name = card.querySelector('strong')?.textContent.trim()
  const image = card.querySelector('img')
  if (!name || !image) return

  const render = planImageFor(name, 'Multiple Communities')
  if (render) {
    image.src = render
    image.alt = `${name} exterior rendering`
  }

  const baseName = name.replace(/^The\s+/i, '')
  const plan = inventoryPlans.find(({ name: planName }) => planName === baseName)
    || inventoryPlans.find(({ name: planName }) => planName.replace(/\s+II$/i, '') === baseName)
  if (plan) {
    const price = document.createElement('em')
    price.className = 'video-card-price'
    price.textContent = `Starting at $${plan.price.toLocaleString('en-US')}`
    card.querySelector('small')?.before(price)
  }
})

const inventoryGrid = document.querySelector('[data-inventory-catalog]')
if (inventoryGrid) {
  inventoryPlans.forEach(({ name, price, sqft, communities }) => {
    const [beds, baths, stories] = planSpecs[name] || []
    const card = document.createElement('article')
    card.className = 'plan-card'
    card.dataset.community = communities.length === 1 ? communityNames[communities[0]] : 'Multiple Communities'
    card.innerHTML = `
      <h3>The ${name}</h3>
      <p class="plan-card-price">From $${price.toLocaleString()}</p>
      <div class="plan-card-specs">
        ${beds ? `<span>${beds} Beds</span><span>${baths} Baths</span><span>${stories} ${stories === 1 ? 'Story' : 'Stories'}</span>` : ''}
        <span>${sqft} Sq Ft</span>
      </div>`
    inventoryGrid.append(card)
  })
}

document.querySelectorAll('.plan-card').forEach((card) => {
  const title = card.querySelector('h3')
  const price = card.querySelector('.plan-card-price')
  const specs = card.querySelector('.plan-card-specs')
  if (!title || !price || !specs) return

  card.querySelector('.plan-card-icon')?.remove()

  const planName = title.textContent.trim()
  const planCommunity = card.dataset.community || document.querySelector('.page-title h1')?.textContent.trim()
  const planImage = planImageFor(planName, planCommunity)
  const media = document.createElement('div')
  media.className = 'plan-card-media'
  media.innerHTML = `<img src="${planImage || homePlaceholderUrl}" alt="${planImage ? `${planName} exterior rendering` : `No exterior rendering available for ${planName}`}" />`

  if (['The Chester', 'The Franklin'].includes(title.textContent.trim())) {
    card.classList.add('is-move-in-ready')
    media.insertAdjacentHTML('beforeend', '<span class="plan-card-ready-banner">Move-In Ready</span>')
  }

  const body = document.createElement('div')
  body.className = 'plan-card-body'

  const heading = document.createElement('div')
  heading.className = 'plan-card-heading'

  const titleGroup = document.createElement('div')
  const planType = [...specs.children].some((spec) => /1 Story/i.test(spec.textContent)) ? 'Ranch Home' : 'Single Family Home'
  const type = document.createElement('span')
  type.className = 'plan-card-type'
  type.textContent = planType
  titleGroup.append(title, type)
  if (card.dataset.community) {
    const community = document.createElement('span')
    community.className = 'plan-card-community'
    community.textContent = card.dataset.community
    titleGroup.append(community)
  }

  heading.append(titleGroup)

  const areaSpec = [...specs.children].find((spec) => /Sq Ft/i.test(spec.textContent))
  const storySpec = [...specs.children].find((spec) => /Stor(?:y|ies)/i.test(spec.textContent))
  if (areaSpec) card.dataset.sqft = areaSpec.textContent.replace(/\s*Sq Ft\s*/i, '').trim()
  if (storySpec) card.dataset.stories = storySpec.textContent.match(/[\d.]+/)?.[0] || ''
  if (areaSpec && storySpec) storySpec.textContent = areaSpec.textContent

  ;[...specs.children].forEach((spec) => {
    const text = spec.textContent
    if (spec === areaSpec) {
      spec.remove()
      return
    }
    const icon = /Beds/i.test(text) ? planSpecIcons.beds
      : /Baths/i.test(text) ? planSpecIcons.baths
        : /Sq Ft/i.test(text) ? planSpecIcons.area
          : planSpecIcons.stories
    spec.insertAdjacentHTML('afterbegin', icon)
    spec.childNodes[spec.childNodes.length - 1].textContent = text.replace(/\s*(Beds?|Baths?|Stories?|Sq Ft)\s*/i, ' $1').trim()
  })

  price.textContent = price.textContent.replace(/^From\s+/i, 'Starting at ').replace(/s\b/i, '')

  const actions = document.createElement('div')
  actions.className = 'plan-card-actions'
  actions.innerHTML = '<button type="button">View Details</button><button type="button">Virtual Tour</button>'
  actions.firstElementChild.addEventListener('click', () => {
    const specValue = (label) => [...specs.children].find((spec) => new RegExp(label, 'i').test(spec.textContent))?.textContent.match(/[\d.]+/)?.[0] || '???'
    const community = card.dataset.community || document.querySelector('.page-title h1')?.textContent.trim() || 'Schottenstein Homes'
    const params = new URLSearchParams({
      name: title.textContent.trim(),
      price: price.textContent.replace(/^Starting at\s*/i, ''),
      beds: specValue('Beds'),
      baths: specValue('Baths'),
      stories: card.dataset.stories || specValue('Stor'),
      sqft: card.dataset.sqft || '???',
      community,
    })
    window.location.href = `/home-details.html?${params}`
  })
  const tourVideo = tourVideoFor(title.textContent.trim())
  if (tourVideo) {
    actions.lastElementChild.addEventListener('click', () => {
      window.open(`https://www.youtube.com/watch?v=${tourVideo}`, '_blank', 'noopener,noreferrer')
    })
  } else {
    actions.lastElementChild.hidden = true
  }

  body.append(heading, specs, price, actions)
  card.append(media, body)
})

const homeDetails = document.querySelector('[data-home-details]')
if (homeDetails) {
  const params = new URLSearchParams(window.location.search)
  const details = {
    name: params.get('name') || 'Home Design',
    price: params.get('price') || 'Contact for Pricing',
    beds: params.get('beds') || '???',
    baths: params.get('baths') || '???',
    stories: params.get('stories') || '???',
    sqft: params.get('sqft') || '???',
    community: params.get('community') || 'Schottenstein Homes',
  }
  document.title = `${details.name} | Schottenstein Homes`
  homeDetails.querySelector('[data-detail-name]').textContent = details.name
  homeDetails.querySelector('[data-detail-community]').textContent = details.community
  homeDetails.querySelector('[data-detail-price]').textContent = `Starting at ${details.price}`
  homeDetails.querySelector('[data-detail-beds]').textContent = `${details.beds} Bedrooms`
  homeDetails.querySelector('[data-detail-baths]').textContent = `${details.baths} Baths`
  homeDetails.querySelector('[data-detail-sqft]').textContent = `${details.sqft} Square Feet`
  homeDetails.querySelector('[data-detail-stories]').textContent = `${details.stories} ${details.stories === '1' ? 'Story' : 'Stories'}`
  homeDetails.querySelector('[data-tour-home]').value = details.name

  const detailImage = planImageFor(details.name, details.community)
  const detailHeroImage = homeDetails.querySelector('.home-detail-hero img')
  if (detailHeroImage) {
    detailHeroImage.src = detailImage || homePlaceholderUrl
    detailHeroImage.alt = detailImage
      ? `${details.name} exterior rendering`
      : `No exterior rendering available for ${details.name}`
  }

  const tourVideo = tourVideoFor(details.name)
  const tourResource = homeDetails.querySelector('[data-detail-tour-resource]')
  const tourLink = homeDetails.querySelector('[data-detail-tour-link]')
  if (tourVideo && tourResource && tourLink) {
    tourLink.href = `https://www.youtube.com/watch?v=${tourVideo}`
    tourLink.hidden = false
    tourResource.hidden = false
  }

  const floorPlan = floorPlanFor(details.name, details.community)
  const floorPlanLink = homeDetails.querySelector('[data-detail-floor-plan-link]')
  const floorPlanUnavailable = homeDetails.querySelector('[data-detail-floor-plan-unavailable]')
  if (floorPlan && floorPlanLink && floorPlanUnavailable) {
    floorPlanLink.href = floorPlan
    floorPlanLink.hidden = false
    floorPlanUnavailable.hidden = true
  }
}

document.querySelectorAll('.plan-grid').forEach((grid) => {
  const cards = [...grid.querySelectorAll('.plan-card')]
  if (!cards.length) return

  cards.forEach((card) => {
    card.dataset.price = card.querySelector('.plan-card-price')?.textContent.replace(/[^0-9]/g, '') || '0'
    card.querySelectorAll('.plan-card-specs span').forEach((spec) => {
      const value = Number.parseFloat(spec.textContent)
      if (/Beds/i.test(spec.textContent)) card.dataset.beds = value
      if (/Baths/i.test(spec.textContent)) card.dataset.baths = value
      if (/Stor/i.test(spec.textContent)) card.dataset.stories = value
    })
  })

  const prices = cards.map((card) => Number(card.dataset.price))
  const priceFloor = Math.floor(Math.min(...prices) / 10000) * 10000
  const priceCeiling = Math.ceil(Math.max(...prices) / 10000) * 10000
  const valuesFor = (key) => [...new Set(cards.map((card) => Number(card.dataset[key])).filter(Boolean))].sort((a, b) => a - b)
  const optionMarkup = (key, label) => `<option value="">Any ${label}</option>${valuesFor(key).map((value) => `<option value="${value}">${value} ${label}</option>`).join('')}`

  const controls = document.createElement('div')
  controls.className = 'plan-browser-controls'
  controls.innerHTML = `
    <div class="plan-result-summary">
      <p class="plan-result-count" aria-live="polite">Showing ${cards.length} floor plans</p>
      <button class="plan-result-clear" type="button" aria-label="Clear all filters" title="Clear all filters" hidden>&times;</button>
    </div>
    <div class="plan-control-buttons">
      <div class="plan-control-menu">
        <button class="plan-control-button plan-filter-trigger" type="button" aria-expanded="false">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"></path></svg><span>Filter</span>
        </button>
        <div class="plan-control-panel plan-filter-panel">
          <fieldset class="plan-price-filter">
            <legend>Price Range</legend>
            <output>$${priceFloor.toLocaleString()} – $${priceCeiling.toLocaleString()}</output>
            <div class="plan-range-slider">
              <div class="plan-range-track"></div>
              <input class="plan-price-min" type="range" min="${priceFloor}" max="${priceCeiling}" step="10000" value="${priceFloor}" aria-label="Minimum price" />
              <input class="plan-price-max" type="range" min="${priceFloor}" max="${priceCeiling}" step="10000" value="${priceCeiling}" aria-label="Maximum price" />
            </div>
          </fieldset>
          <div class="plan-select-filters">
            <label>Beds<select class="plan-beds-filter">${optionMarkup('beds', 'Beds')}</select></label>
            <label>Baths<select class="plan-baths-filter">${optionMarkup('baths', 'Baths')}</select></label>
            <label>Stories<select class="plan-stories-filter">${optionMarkup('stories', 'Stories')}</select></label>
          </div>
          <label class="plan-ready-filter">
            <input class="plan-ready-only" type="checkbox" />
            <span>Move-In Ready Only</span>
          </label>
          <button class="plan-clear-filters" type="button">Clear Filters</button>
        </div>
      </div>
      <div class="plan-control-menu">
        <button class="plan-control-button plan-sort-trigger" type="button" aria-expanded="false">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14m0 0-3-3m3 3 3-3M14 7h5M14 12h4M14 17h3"></path></svg><span>Sort</span>
        </button>
        <div class="plan-control-panel plan-sort-panel">
          <button type="button" data-plan-sort="asc">Price: Low to High</button>
          <button type="button" data-plan-sort="desc">Price: High to Low</button>
        </div>
      </div>
    </div>`

  const controlsHost = document.querySelector('.inventory-page .page-title-inner')
  if (grid.matches('[data-inventory-catalog]') && controlsHost) controlsHost.append(controls)
  else grid.before(controls)

  const resultCount = controls.querySelector('.plan-result-count')
  const resultClearButton = controls.querySelector('.plan-result-clear')
  const filterTrigger = controls.querySelector('.plan-filter-trigger')
  const sortTrigger = controls.querySelector('.plan-sort-trigger')
  const filterPanel = controls.querySelector('.plan-filter-panel')
  const sortPanel = controls.querySelector('.plan-sort-panel')
  const minRange = controls.querySelector('.plan-price-min')
  const maxRange = controls.querySelector('.plan-price-max')

  const updateResultCount = (text) => {
    if (resultCount.textContent === text) return
    resultCount.textContent = text
    resultCount.classList.remove('is-updating')
    void resultCount.offsetWidth
    resultCount.classList.add('is-updating')
  }
  const priceOutput = controls.querySelector('.plan-price-filter output')
  const rangeTrack = controls.querySelector('.plan-range-track')
  const bedsFilter = controls.querySelector('.plan-beds-filter')
  const bathsFilter = controls.querySelector('.plan-baths-filter')
  const storiesFilter = controls.querySelector('.plan-stories-filter')
  const readyOnlyFilter = controls.querySelector('.plan-ready-only')

  const closePlanMenus = () => {
    filterTrigger.setAttribute('aria-expanded', 'false')
    sortTrigger.setAttribute('aria-expanded', 'false')
    filterPanel.classList.remove('is-open')
    sortPanel.classList.remove('is-open')
  }

  const updateRange = () => {
    if (Number(minRange.value) > Number(maxRange.value)) {
      if (document.activeElement === minRange) minRange.value = maxRange.value
      else maxRange.value = minRange.value
    }
    const range = priceCeiling - priceFloor || 1
    const left = ((Number(minRange.value) - priceFloor) / range) * 100
    const right = ((Number(maxRange.value) - priceFloor) / range) * 100
    rangeTrack.style.setProperty('--range-left', `${left}%`)
    rangeTrack.style.setProperty('--range-right', `${100 - right}%`)
    priceOutput.textContent = `$${Number(minRange.value).toLocaleString()} – $${Number(maxRange.value).toLocaleString()}`
  }

  const applyPlanFilters = () => {
    let visible = 0
    cards.forEach((card) => {
      const matches = Number(card.dataset.price) >= Number(minRange.value)
        && Number(card.dataset.price) <= Number(maxRange.value)
        && (!bedsFilter.value || card.dataset.beds === bedsFilter.value)
        && (!bathsFilter.value || card.dataset.baths === bathsFilter.value)
        && (!storiesFilter.value || card.dataset.stories === storiesFilter.value)
        && (!readyOnlyFilter.checked || card.classList.contains('is-move-in-ready'))
      card.classList.toggle('is-hidden', !matches)
      if (matches) visible += 1
    })

    const activeFilters = []
    if (bedsFilter.value) activeFilters.push(`${bedsFilter.value} ${Number(bedsFilter.value) === 1 ? 'bed' : 'beds'}`)
    if (bathsFilter.value) activeFilters.push(`${bathsFilter.value} ${Number(bathsFilter.value) === 1 ? 'bath' : 'baths'}`)
    if (storiesFilter.value) activeFilters.push(`${storiesFilter.value} ${Number(storiesFilter.value) === 1 ? 'story' : 'stories'}`)
    if (Number(minRange.value) !== priceFloor || Number(maxRange.value) !== priceCeiling) {
      activeFilters.push(`priced $${Number(minRange.value).toLocaleString()}–$${Number(maxRange.value).toLocaleString()}`)
    }
    if (readyOnlyFilter.checked) activeFilters.push('Move-In Ready')

    const formattedFilters = activeFilters.length < 2
      ? activeFilters[0] || ''
      : activeFilters.length === 2
        ? `${activeFilters[0]} and ${activeFilters[1]}`
        : `${activeFilters.slice(0, -1).join(', ')}, and ${activeFilters.at(-1)}`
    const filterSummary = formattedFilters ? ` with ${formattedFilters}` : ''
    updateResultCount(`Showing ${visible} ${visible === 1 ? 'floor plan' : 'floor plans'}${filterSummary}`)
    resultClearButton.hidden = activeFilters.length === 0
  }

  filterTrigger.addEventListener('click', () => {
    const shouldOpen = !filterPanel.classList.contains('is-open')
    closePlanMenus()
    if (shouldOpen) {
      filterPanel.classList.add('is-open')
      filterTrigger.setAttribute('aria-expanded', 'true')
    }
  })

  sortTrigger.addEventListener('click', () => {
    const shouldOpen = !sortPanel.classList.contains('is-open')
    closePlanMenus()
    if (shouldOpen) {
      sortPanel.classList.add('is-open')
      sortTrigger.setAttribute('aria-expanded', 'true')
    }
  })

  ;[minRange, maxRange].forEach((range) => range.addEventListener('input', () => {
    updateRange()
    applyPlanFilters()
  }))
  ;[bedsFilter, bathsFilter, storiesFilter].forEach((select) => select.addEventListener('change', applyPlanFilters))
  readyOnlyFilter.addEventListener('change', applyPlanFilters)

  const clearPlanFilters = () => {
    minRange.value = priceFloor
    maxRange.value = priceCeiling
    bedsFilter.value = ''
    bathsFilter.value = ''
    storiesFilter.value = ''
    readyOnlyFilter.checked = false
    updateRange()
    applyPlanFilters()
  }

  controls.querySelector('.plan-clear-filters').addEventListener('click', clearPlanFilters)
  resultClearButton.addEventListener('click', clearPlanFilters)

  sortPanel.querySelectorAll('[data-plan-sort]').forEach((option) => option.addEventListener('click', () => {
    const direction = option.dataset.planSort
    cards.sort((a, b) => direction === 'asc' ? Number(a.dataset.price) - Number(b.dataset.price) : Number(b.dataset.price) - Number(a.dataset.price))
    cards.forEach((card) => grid.append(card))
    sortPanel.querySelectorAll('button').forEach((button) => button.classList.remove('is-active'))
    option.classList.add('is-active')
    closePlanMenus()
  }))

  document.addEventListener('click', (event) => {
    if (!controls.contains(event.target)) closePlanMenus()
  })
  window.addEventListener('scroll', closePlanMenus, true)
  updateRange()
})

const revealElements = document.querySelectorAll('[data-reveal]')
if (revealElements.length) {
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })

    revealElements.forEach((element) => revealObserver.observe(element))
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'))
  }
}
