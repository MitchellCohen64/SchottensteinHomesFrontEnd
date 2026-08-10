const SVG_NS = 'http://www.w3.org/2000/svg'

const svgElement = (name, attributes = {}) => {
  const element = document.createElementNS(SVG_NS, name)
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
  return element
}

export function mountRennerLotTracer(wrapper) {
  const svg = wrapper.querySelector('.site-plan-overlay')
  if (!svg) return

  wrapper.classList.add('is-tracing-lots')

  const controls = document.createElement('div')
  controls.className = 'lot-tracer-controls'
  controls.setAttribute('aria-label', 'Development lot tracing controls')
  controls.innerHTML = `
    <strong>Lot Tracer</strong>
    <button type="button" data-tracer-start>Start Lot</button>
    <button type="button" data-tracer-undo disabled>Undo Point</button>
    <label class="lot-tracer-id">Lot number<input type="text" inputmode="numeric" data-tracer-id placeholder="e.g. 147" /></label>
    <button type="button" data-tracer-finish disabled>Finish Lot</button>
    <button type="button" data-tracer-clear disabled>Clear</button>`
  wrapper.before(controls)

  const draftLayer = svgElement('g', { class: 'lot-tracer-draft' })
  const completedLayer = svgElement('g', { class: 'lot-tracer-completed' })
  const draftLine = svgElement('polyline')
  draftLayer.append(draftLine)
  svg.append(completedLayer, draftLayer)

  const startButton = controls.querySelector('[data-tracer-start]')
  const undoButton = controls.querySelector('[data-tracer-undo]')
  const lotIdInput = controls.querySelector('[data-tracer-id]')
  const finishButton = controls.querySelector('[data-tracer-finish]')
  const clearButton = controls.querySelector('[data-tracer-clear]')
  let points = []
  let tracing = false

  const updateControls = () => {
    undoButton.disabled = points.length === 0
    clearButton.disabled = points.length === 0
    finishButton.disabled = points.length < 3
    startButton.textContent = tracing ? 'Restart Lot' : 'Start Lot'
  }

  const renderDraft = () => {
    draftLine.setAttribute('points', points.map(([x, y]) => `${x},${y}`).join(' '))
    draftLayer.querySelectorAll('circle').forEach((marker) => marker.remove())
    points.forEach(([x, y], index) => {
      const marker = svgElement('circle', { cx: x, cy: y, r: 18, 'data-point': index + 1 })
      draftLayer.append(marker)
    })
    updateControls()
  }

  const clearDraft = () => {
    points = []
    renderDraft()
  }

  const clientPointToSvg = (event) => {
    const matrix = svg.getScreenCTM()
    if (!matrix) return null
    const point = svg.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY
    const nativePoint = point.matrixTransform(matrix.inverse())
    return [Math.round(nativePoint.x), Math.round(nativePoint.y)]
  }

  startButton.addEventListener('click', () => {
    tracing = true
    clearDraft()
    console.info('[Renner lot tracer] Started a new lot. Click the map to add vertices.')
  })

  undoButton.addEventListener('click', () => {
    points.pop()
    renderDraft()
  })

  clearButton.addEventListener('click', clearDraft)

  finishButton.addEventListener('click', () => {
    if (points.length < 3) return
    const id = lotIdInput.value.trim()
    if (!id) {
      lotIdInput.setAttribute('aria-invalid', 'true')
      lotIdInput.focus()
      return
    }
    lotIdInput.removeAttribute('aria-invalid')

    const completedPoints = points.map(([x, y]) => [x, y])
    const polygon = svgElement('polygon', {
      points: completedPoints.map(([x, y]) => `${x},${y}`).join(' '),
      'data-lot': id,
    })
    completedLayer.append(polygon)

    const output = { id: /^\d+$/.test(id) ? Number(id) : id, points: completedPoints }
    console.log('[Renner lot tracer] Completed lot coordinates:')
    console.log(output)
    console.log(JSON.stringify(output, null, 2))

    tracing = false
    lotIdInput.value = ''
    clearDraft()
  })

  svg.addEventListener('click', (event) => {
    if (!tracing) return
    const point = clientPointToSvg(event)
    if (!point) return
    points.push(point)
    renderDraft()
    console.log(`[Renner lot tracer] Point ${points.length}: [${point[0]}, ${point[1]}]`)
  })

  updateControls()
  console.info('[Renner lot tracer] Development tracing mode enabled. Coordinates use the SVG 3058 × 4205 viewBox.')
}
