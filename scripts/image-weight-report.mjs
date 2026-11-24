import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { communityPlanData, inventoryPlans } from '../src/data/basePricing.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html')).sort()
const mainSource = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8')

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

const planImages = new Map()
for (const match of mainSource.matchAll(/'([^']+)':\s*new URL\('\.\.\/media\/([^']+)'/g)) {
  const [fullMatch, plan, relativePath] = match
  const beforeMatch = mainSource.slice(0, match.index)
  const communityMatch = [...beforeMatch.matchAll(/^  '([^']+)': \{$/gm)].at(-1)
  if (!communityMatch || !fullMatch) continue
  const community = communityMatch[1]
  if (!planImages.has(community)) planImages.set(community, new Map())
  planImages.get(community).set(plan, `media/${relativePath}`)
}

const normalizeLocalPath = (url) => {
  if (!url || /^(?:https?:|data:|mailto:|tel:|#)/.test(url)) return null
  return decodeURIComponent(url.split(/[?#]/)[0]).replace(/^\//, '').replaceAll('/', path.sep)
}

const cssImagesFor = (html) => {
  const images = []
  if (html.includes('class="hero-slideshow"')) {
    images.push(
      'media/home-hero/carroll-ii-hero.webp',
      'media/Renders/Holton_Run/Madison.webp',
      'media/Renders/Aster_in_Jerome_Village/Franklin_II.webp',
      'media/Renders/Holton_Run/Fayette.webp',
      'media/Renders/Aster_in_Jerome_Village/Erie_II.webp',
      'media/section2_img.webp',
      'media/design-center/hero.webp',
    )
  }
  if (html.includes('class="final-cta-image"')) images.push('media/finalCTAImg.webp')
  return images
}

const renderImagesFor = (file) => {
  const slug = file.replace(/\.html$/, '')
  if (communityPlanData[slug]) {
    const community = communityNames[slug]
    return communityPlanData[slug]
      .map(({ name }) => planImages.get(community)?.get(`The ${name}`))
      .filter(Boolean)
  }

  if (file === 'inventory-homes.html' || file === 'virtual-tours.html') {
    return inventoryPlans.map(({ name }) => {
      for (const images of planImages.values()) {
        const match = images.get(`The ${name}`) || images.get(`The ${name.replace(/ II$/, '')}`)
        if (match) return match
      }
      return null
    }).filter(Boolean)
  }

  return []
}

const report = htmlFiles.map((file) => {
  const html = fs.readFileSync(path.join(root, file), 'utf8')
  const imagePaths = new Set([
    ...[...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map((match) => normalizeLocalPath(match[1])).filter(Boolean),
    ...cssImagesFor(html).map((image) => image.replaceAll('/', path.sep)),
    ...renderImagesFor(file).map((image) => image.replaceAll('/', path.sep)),
  ])
  const bytes = [...imagePaths].reduce((total, imagePath) => {
    const absolutePath = path.join(root, imagePath)
    return total + (fs.existsSync(absolutePath) ? fs.statSync(absolutePath).size : 0)
  }, 0)
  return { page: file, images: imagePaths.size, bytes, megabytes: Number((bytes / 1024 / 1024).toFixed(2)) }
})

console.log(JSON.stringify(report, null, 2))
