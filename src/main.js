import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import standardLogoUrl from '../media/SH_logo.png'
import whiteLogoUrl from '../media/SH_logo_white.png'

const header = document.querySelector('.site-header')
const headerLogo = header?.querySelector('.brand img')
const isHomePage = document.body.classList.contains('home-page')

const updateHeader = () => {
  const isScrolled = window.scrollY > 40
  header?.classList.toggle('is-scrolled', isScrolled)

  if (isHomePage && headerLogo) {
    headerLogo.src = isScrolled ? standardLogoUrl : whiteLogoUrl
  }
}

updateHeader()
window.addEventListener('scroll', updateHeader, { passive: true })

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

if (featuredCommunitySlides.length > 1 && featuredCommunityPrevious && featuredCommunityNext) {
  let activeFeaturedCommunity = 0

  const showFeaturedCommunity = (index) => {
    activeFeaturedCommunity = Math.max(0, Math.min(index, featuredCommunitySlides.length - 1))

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

  featuredCommunityPrevious.addEventListener('click', () => {
    showFeaturedCommunity(activeFeaturedCommunity - 1)
  })

  featuredCommunityNext.addEventListener('click', () => {
    showFeaturedCommunity(activeFeaturedCommunity + 1)
  })

  showFeaturedCommunity(0)
}

const mapElement = document.querySelector('#communities-map')

if (mapElement) {
  const isHomeMap = mapElement.dataset.mapStyle === 'illustrated'

  const communities = [
    { name: 'Jerome Village Aster', address: '6971 Aster Way, Plain City', coords: [40.1930731, -83.1743563] },
    { name: 'The Cottages at Verbena', address: '11738 Verbena Place, Plain City', coords: [40.18376, -83.19973] },
    { name: 'The Reserve at New California', address: '10171 Jeffrey Pine Drive, Plain City', coords: [40.15765, -83.24662] },
    { name: 'Glacier Pointe', address: '8798 Eliot Drive, Plain City', coords: [40.1449718, -83.2051174] },
    { name: 'Renner Park', address: '6186 Renner Park Drive, Columbus', coords: [39.9832, -83.172859] },
    { name: 'Holton Run', address: '4840 Citation Court, Grove City', coords: [39.865303, -83.097641], markerCoords: [39.872, -83.108] },
    { name: 'Hickory Creek', address: '3899 Orders Road, Grove City', coords: [39.8603495, -83.0980086], markerCoords: [39.854, -83.088] },
    { name: 'The Retreat at Hickory Lakes', address: '12445 Ault Road, Pickerington', coords: [39.9154859, -82.7277241] }
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

  const pinIcon = L.divIcon({
    className: `community-pin${isHomeMap ? ' is-pushpin' : ''}`,
    html: isHomeMap
      ? '<svg viewBox="0 0 36 48" aria-hidden="true"><ellipse cx="18" cy="45" rx="11" ry="2"></ellipse><path d="M11 4h14v4l-3 3v9l6 5v4H8v-4l6-5v-9l-3-3V4Zm6 25h2v14l-1 3-1-3V29Z"></path></svg>'
      : '<svg viewBox="0 0 32 40" aria-hidden="true"><path d="M16 39S30 24.4 30 14A14 14 0 1 0 2 14c0 10.4 14 25 14 25Z"></path><circle cx="16" cy="14" r="5"></circle></svg>',
    iconSize: isHomeMap ? [36, 48] : [32, 40],
    iconAnchor: isHomeMap ? [18, 46] : [16, 40],
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
    const marker = L.marker(markerPosition, { icon: pinIcon }).addTo(map)
    marker.bindTooltip(`<strong>${community.name}</strong><span>${community.address}</span><i>→</i>`, {
      direction: 'top',
      className: 'community-tooltip',
      opacity: 1,
      offset: [0, isHomeMap ? -5 : -13]
    })
    marker.on('mouseover', () => marker.openTooltip())
    marker.on('click', () => marker.openTooltip())
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
}

const filterPills = document.querySelectorAll('.filter-pill')
const communityCards = document.querySelectorAll('.community-card')

const placeholderHouseIcon = `
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M7 30 32 9l25 21-4 5-5-4v24H16V31l-5 4-4-5Zm17 19h16V34H24v15Z"></path>
  </svg>
`

communityCards.forEach((card) => {
  const media = card.querySelector('.community-card-media')
  const image = media?.querySelector('img')
  const communityName = card.querySelector('h3')?.textContent.trim() ?? 'community'

  if (!media || !image) return

  image.classList.add('community-card-slide', 'is-active')

  const redPlaceholder = document.createElement('div')
  redPlaceholder.className = 'community-card-slide community-card-placeholder is-red'
  redPlaceholder.setAttribute('role', 'img')
  redPlaceholder.setAttribute('aria-label', `Placeholder for ${communityName} image 2`)
  redPlaceholder.innerHTML = placeholderHouseIcon

  const bluePlaceholder = document.createElement('div')
  bluePlaceholder.className = 'community-card-slide community-card-placeholder is-blue'
  bluePlaceholder.setAttribute('role', 'img')
  bluePlaceholder.setAttribute('aria-label', `Placeholder for ${communityName} image 3`)
  bluePlaceholder.innerHTML = placeholderHouseIcon

  const dots = document.createElement('div')
  dots.className = 'community-card-dots'
  dots.setAttribute('role', 'group')
  dots.setAttribute('aria-label', `${communityName} photos`)

  const slides = [image, redPlaceholder, bluePlaceholder]
  let activeSlide = 0

  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length
    slides.forEach((item, slideIndex) => item.classList.toggle('is-active', slideIndex === activeSlide))
    dots.querySelectorAll('.community-card-dot').forEach((item, dotIndex) => {
      item.classList.toggle('is-active', dotIndex === activeSlide)
      item.setAttribute('aria-pressed', dotIndex === activeSlide ? 'true' : 'false')
    })
  }

  slides.forEach((slide, index) => {
    if (index > 0) media.append(slide)

    const dot = document.createElement('button')
    dot.type = 'button'
    dot.className = `community-card-dot${index === 0 ? ' is-active' : ''}`
    dot.setAttribute('aria-label', `Show ${communityName} image ${index + 1}`)
    dot.setAttribute('aria-pressed', index === 0 ? 'true' : 'false')

    dot.addEventListener('click', () => showSlide(index))

    dots.append(dot)
  })

  const previous = document.createElement('button')
  previous.type = 'button'
  previous.className = 'community-card-arrow is-previous'
  previous.setAttribute('aria-label', `Show previous ${communityName} photo`)
  previous.innerHTML = '<span aria-hidden="true">‹</span>'
  previous.addEventListener('click', () => showSlide(activeSlide - 1))

  const next = document.createElement('button')
  next.type = 'button'
  next.className = 'community-card-arrow is-next'
  next.setAttribute('aria-label', `Show next ${communityName} photo`)
  next.innerHTML = '<span aria-hidden="true">›</span>'
  next.addEventListener('click', () => showSlide(activeSlide + 1))

  media.append(dots, previous, next)
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
