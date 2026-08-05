import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const header = document.querySelector('.site-header')

const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 40)
}

updateHeader()
window.addEventListener('scroll', updateHeader, { passive: true })

const mapElement = document.querySelector('#communities-map')

if (mapElement) {
  const isHomeMap = Boolean(mapElement.closest('.communities-map-section'))

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
      offset: [0, -5]
    })
    marker.on('mouseover', () => marker.openTooltip())
    marker.on('click', () => marker.openTooltip())
    return marker
  })

  if (isHomeMap) {
    map.fitBounds(homeImageBounds)
    map.setMaxBounds([[-6, -6], [106, 106]])
  } else {
    map.fitBounds(L.featureGroup(markers).getBounds(), { padding: [65, 65] })
  }
}

const filterPills = document.querySelectorAll('.filter-pill')
const communityCards = document.querySelectorAll('.community-card')

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
