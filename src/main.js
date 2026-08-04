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
  const communities = [
    { name: 'Jerome Village Aster', address: '6971 Aster Way, Plain City', coords: [40.1930731, -83.1743563] },
    { name: 'The Cottages at Verbena', address: '11738 Verbena Place, Plain City', coords: [40.18376, -83.19973] },
    { name: 'The Reserve at New California', address: '10171 Jeffrey Pine Drive, Plain City', coords: [40.15765, -83.24662] },
    { name: 'Glacier Pointe', address: '8798 Eliot Drive, Plain City', coords: [40.1449718, -83.2051174] },
    { name: 'Renner Park', address: '6186 Renner Park Drive, Columbus', coords: [39.9832, -83.172859] },
    { name: 'Holton Run', address: '4840 Citation Court, Grove City', coords: [39.865303, -83.097641] },
    { name: 'Hickory Creek', address: '3899 Orders Road, Grove City', coords: [39.8603495, -83.0980086] },
    { name: 'The Retreat at Hickory Lakes', address: '12445 Ault Road, Pickerington', coords: [39.9154859, -82.7277241] }
  ]

  const map = L.map(mapElement, {
    zoomControl: false,
    scrollWheelZoom: false,
    attributionControl: true
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  const pinIcon = L.divIcon({
    className: 'community-pin',
    html: '<svg viewBox="0 0 32 40" aria-hidden="true"><path d="M16 39S30 24.4 30 14A14 14 0 1 0 2 14c0 10.4 14 25 14 25Z"></path><circle cx="16" cy="14" r="5"></circle></svg>',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    tooltipAnchor: [0, -34]
  })

  const markers = communities.map((community) => {
    const marker = L.marker(community.coords, { icon: pinIcon }).addTo(map)
    marker.bindTooltip(`<strong>${community.name}</strong><span>${community.address}</span><i>→</i>`, {
      direction: 'top',
      className: 'community-tooltip',
      opacity: 1,
      offset: [0, -5]
    })
    marker.on('mouseover', () => marker.openTooltip())
    return marker
  })

  map.fitBounds(L.featureGroup(markers).getBounds(), { padding: [65, 65] })
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
