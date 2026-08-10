import { rennerParkTracedLots } from '../data/rennerParkTracedLots.js'

const SVG_NS = 'http://www.w3.org/2000/svg'
const statusLabels = {
  available: 'Available',
  unavailable: 'Unavailable',
  quickMoveIn: 'Quick Move-In',
  model: 'Model Home',
  sold: 'Sold',
  comingSoon: 'Coming Soon',
}

export function renderRennerTracedLots(svg) {
  if (!svg) return

  const group = document.createElementNS(SVG_NS, 'g')
  group.classList.add('renner-traced-lots')
  let selectedLot = null

  const panel = document.createElement('aside')
  panel.className = 'renner-lot-details'
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-modal', 'true')
  panel.setAttribute('aria-labelledby', 'renner-lot-home-name')
  panel.setAttribute('aria-live', 'polite')
  panel.setAttribute('aria-hidden', 'true')
  panel.innerHTML = `
    <button class="renner-lot-details-close" type="button" aria-label="Close lot details">&times;</button>
    <p class="renner-lot-details-kicker">Renner Park &middot; <span></span></p>
    <h3 id="renner-lot-home-name">The Benton</h3>
    <p class="renner-lot-details-status"></p>
    <p class="renner-lot-details-price">From $420,000s</p>
    <div class="renner-lot-details-specs">
      <span><strong>4</strong>Beds</span>
      <span><strong>2.5</strong>Baths</span>
      <span><strong>2</strong>Stories</span>
    </div>
    <a class="renner-lot-details-link" href="/home-details.html?name=The+Benton&price=%24420%2C000&beds=4&baths=2.5&stories=2&sqft=%3F%3F%3F&community=Renner+Park">View More Info</a>
  `
  const backdrop = document.createElement('div')
  backdrop.className = 'renner-lot-details-backdrop'

  const closePanel = ({ returnFocus = true } = {}) => {
    const previousLot = selectedLot
    selectedLot = null
    group.querySelectorAll('.renner-traced-lot').forEach((lotElement) => {
      lotElement.classList.remove('is-selected')
      lotElement.setAttribute('aria-pressed', 'false')
    })
    panel.classList.remove('is-open')
    backdrop.classList.remove('is-open')
    panel.setAttribute('aria-hidden', 'true')
    if (returnFocus) previousLot?.focus()
  }

  const selectLot = (lot, lotElement) => {
    selectedLot = lotElement
    group.querySelectorAll('.renner-traced-lot').forEach((element) => {
      const isSelected = element === lotElement
      element.classList.toggle('is-selected', isSelected)
      element.setAttribute('aria-pressed', isSelected ? 'true' : 'false')
    })
    panel.querySelector('.renner-lot-details-kicker span').textContent = `Lot ${lot.id}`
    panel.querySelector('.renner-lot-details-status').textContent = statusLabels[lot.status]
    panel.classList.add('is-open')
    backdrop.classList.add('is-open')
    panel.setAttribute('aria-hidden', 'false')
    panel.querySelector('.renner-lot-details-close').focus()
  }

  rennerParkTracedLots.forEach((lot) => {
    const lotElement = document.createElementNS(SVG_NS, 'g')
    lotElement.classList.add('renner-traced-lot')
    lotElement.setAttribute('data-status', lot.status)
    lotElement.setAttribute('role', 'button')
    lotElement.setAttribute('tabindex', '0')
    lotElement.setAttribute('aria-label', `Lot ${lot.id}, ${statusLabels[lot.status]}`)
    lotElement.setAttribute('aria-pressed', 'false')

    const polygon = document.createElementNS(SVG_NS, 'polygon')
    polygon.setAttribute('data-lot', lot.id)
    polygon.setAttribute('points', lot.points.map(([x, y]) => `${x},${y}`).join(' '))
    lotElement.append(polygon)
    lotElement.addEventListener('click', (event) => {
      event.stopPropagation()
      selectLot(lot, lotElement)
    })
    lotElement.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      selectLot(lot, lotElement)
    })
    group.append(lotElement)
  })

  svg.append(group)
  svg.removeAttribute('aria-hidden')
  document.body.append(backdrop, panel)
  panel.querySelector('.renner-lot-details-close').addEventListener('click', () => closePanel())
  backdrop.addEventListener('click', () => closePanel())
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && selectedLot) closePanel()
  })
}
