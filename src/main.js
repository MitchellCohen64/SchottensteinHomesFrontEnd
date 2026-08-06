import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import standardLogoUrl from '../media/SH_logo.png'
import whiteLogoUrl from '../media/SH_logo_white.png'

const header = document.querySelector('.site-header')
const headerLogo = header?.querySelector('.brand img')
const isHomePage = document.body.classList.contains('home-page')

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
    { name: 'Jerome Village Aster', address: '6971 Aster Way, Plain City', coords: [40.1930731, -83.1743563], href: '/jerome-village-aster.html' },
    { name: 'The Cottages at Verbena', address: '11738 Verbena Place, Plain City', coords: [40.18376, -83.19973], href: '/cottages-at-verbena.html' },
    { name: 'The Reserve at New California', address: '10171 Jeffrey Pine Drive, Plain City', coords: [40.15765, -83.24662], href: '/reserve-at-new-california.html' },
    { name: 'Glacier Pointe', address: '8798 Eliot Drive, Plain City', coords: [40.1449718, -83.2051174], href: '/glacier-pointe.html' },
    { name: 'Renner Park', address: '6186 Renner Park Drive, Columbus', coords: [39.9832, -83.172859], href: '/renner-park.html' },
    { name: 'Holton Run', address: '4840 Citation Court, Grove City', coords: [39.865303, -83.097641], markerCoords: [39.872, -83.108], href: '/holton-run.html' },
    { name: 'Hickory Creek', address: '3899 Orders Road, Grove City', coords: [39.8603495, -83.0980086], markerCoords: [39.854, -83.088], href: '/hickory-creek.html' },
    { name: 'The Retreat at Hickory Lakes', address: '12445 Ault Road, Pickerington', coords: [39.9154859, -82.7277241], href: '/retreat-at-hickory-lakes.html' }
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
    marker.bindTooltip(`<strong>${community.name}</strong><span>${community.address}</span>`, {
      direction: 'top',
      className: 'community-tooltip',
      opacity: 1,
      offset: [0, isHomeMap ? -5 : -13]
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
  previous.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6"></path></svg>'
  previous.addEventListener('click', () => showSlide(activeSlide - 1))

  const next = document.createElement('button')
  next.type = 'button'
  next.className = 'community-card-arrow is-next'
  next.setAttribute('aria-label', `Show next ${communityName} photo`)
  next.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6 6 6-6 6"></path></svg>'
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

const inventoryCatalog = [
  ['The Chester', 500000, 2, 2, 1], ['The Hanover', 380000, 2, 3, 2],
  ['The Harmony', 460000, 2, 2, 1], ['The Reed', 510000, 3, 3, 2],
  ['The Springfield', 480000, 3, 3, 2], ['The York', 490000, 2, 2, 1],
  ['The Addison', 550000, 4, 3.5, 2], ['The Columbia', 440000, 3, 2, 1],
  ['The Knox', 490000, 3, 2, 1], ['The Athens', 390000, 3, 2.5, 2],
  ['The Benton', 430000, 4, 2.5, 2], ['The Franklin', 490000, 3, 2.5, 2],
  ['The Harrison', 430000, 4, 2.5, 2], ['The Hayes', 460000, 3, 2.5, 2],
  ['The Hudson', 430000, 4, 2.5, 2], ['The Jefferson', 490000, 4, 2.5, 2],
  ['The Madison', 490000, 4, 2.5, 2], ['The Richland', 470000, 4, 2.5, 2],
  ['The Stillwater', 450000, 3, 2.5, 2], ['The Stillwater Plus', 470000, 3, 2.5, 2],
  ['The Vinton', 490000, 4, 2.5, 2], ['The Fayette', 490000, 3, 2, 1],
  ['The Seneca', 540000, 4, 2.5, 2], ['The Carroll II', 540000, 3, 2.5, 2],
  ['The Erie II', 580000, 4, 2.5, 2], ['The Franklin II', 550000, 3, 2.5, 2],
  ['The Knox II', 540000, 3, 2, 1], ['The Madison II', 550000, 4, 2.5, 2],
  ['The Seneca II', 590000, 4, 2.5, 2], ['The Summit II', 580000, 4, 2.5, 2],
  ['The Trumbull II', 580000, 4, 2.5, 2], ['The Vinton II', 570000, 4, 2.5, 2],
  ['The Erie', 610000, 4, 2.5, 2],
]

const homeTourVideos = {
  'The Hayes': 'dlAZMudQ_Cs',
  'The Chester': 'VDvCNmqHTb4',
  'The Concord': 'r49qznPEVGM',
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

const inventoryGrid = document.querySelector('[data-inventory-catalog]')
if (inventoryGrid) {
  const inventoryCommunity = (name) => {
    if (['The Chester', 'The Hanover', 'The Harmony', 'The Reed', 'The Springfield', 'The York'].includes(name)) return 'The Cottages at Verbena'
    if (['The Addison', 'The Columbia', 'The Knox'].includes(name)) return 'Glacier Pointe'
    if (['The Seneca'].includes(name)) return 'Holton Run'
    if (name.endsWith(' II')) return 'Jerome Village Aster'
    if (name === 'The Erie') return 'The Reserve at New California'
    return 'Hickory Creek'
  }

  inventoryCatalog.forEach(([name, price, beds, baths, stories]) => {
    const card = document.createElement('article')
    card.className = 'plan-card'
    card.dataset.community = inventoryCommunity(name)
    card.innerHTML = `
      <h3>${name}</h3>
      <p class="plan-card-price">From $${price.toLocaleString()}</p>
      <div class="plan-card-specs">
        <span>${beds} Beds</span><span>${baths} Baths</span><span>${stories} ${stories === 1 ? 'Story' : 'Stories'}</span>
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

  const media = document.createElement('div')
  media.className = 'plan-card-media'
  media.innerHTML = '<img src="/media/home-hero/heroHomeImg2.png" alt="Temporary home exterior placeholder" />'

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

  ;[...specs.children].forEach((spec) => {
    const text = spec.textContent
    if (/Sq Ft/i.test(text)) {
      card.dataset.sqft = text.replace(/\s*Sq Ft\s*/i, '').trim()
      spec.remove()
      return
    }
    const icon = /Beds/i.test(text) ? planSpecIcons.beds
      : /Baths/i.test(text) ? planSpecIcons.baths
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
      stories: specValue('Stor'),
      sqft: card.dataset.sqft || '???',
      community,
    })
    window.location.href = `/home-details.html?${params}`
  })
  const tourVideo = tourVideoFor(title.textContent.trim())
  if (tourVideo) {
    actions.lastElementChild.addEventListener('click', () => {
      sessionStorage.setItem('openHomeVirtualTour', 'true')
      actions.firstElementChild.click()
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
  const tourVideo = tourVideoFor(details.name)
  const tourSection = homeDetails.querySelector('[data-detail-tour]')
  const tourFrame = homeDetails.querySelector('[data-detail-tour-frame]')
  if (tourVideo && tourSection && tourFrame) {
    tourFrame.src = `https://www.youtube-nocookie.com/embed/${tourVideo}`
    tourFrame.title = `${details.name} virtual tour`
    tourSection.hidden = false
    if (sessionStorage.getItem('openHomeVirtualTour') === 'true') {
      sessionStorage.removeItem('openHomeVirtualTour')
      requestAnimationFrame(() => tourSection.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
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
    <p class="plan-result-count" aria-live="polite">Showing ${cards.length} floor plans</p>
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
  const filterTrigger = controls.querySelector('.plan-filter-trigger')
  const sortTrigger = controls.querySelector('.plan-sort-trigger')
  const filterPanel = controls.querySelector('.plan-filter-panel')
  const sortPanel = controls.querySelector('.plan-sort-panel')
  const minRange = controls.querySelector('.plan-price-min')
  const maxRange = controls.querySelector('.plan-price-max')
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
    resultCount.textContent = `Showing ${visible} ${visible === 1 ? 'floor plan' : 'floor plans'}`
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

  controls.querySelector('.plan-clear-filters').addEventListener('click', () => {
    minRange.value = priceFloor
    maxRange.value = priceCeiling
    bedsFilter.value = ''
    bathsFilter.value = ''
    storiesFilter.value = ''
    readyOnlyFilter.checked = false
    updateRange()
    applyPlanFilters()
  })

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
