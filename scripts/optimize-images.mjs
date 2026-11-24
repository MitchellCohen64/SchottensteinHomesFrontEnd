import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mediaRoot = path.join(root, 'media')
const targetBytes = 300_000
const initialQuality = 78

const walk = async (directory) => (await Promise.all((await fs.readdir(directory, { withFileTypes: true })).map(async (entry) => {
  const absolutePath = path.join(directory, entry.name)
  return entry.isDirectory() ? walk(absolutePath) : absolutePath
}))).flat()

const isRaster = (file) => /\.(?:jpe?g|png)$/i.test(file)
const isFullWidth = (relativePath) => /(?:home-hero|amenities|hero\.|section2_|finalCTA|kitchen_|energy-efficiency[\\/](?:gallery|hero)|design-center)/i.test(relativePath)
const shouldOptimize = async (file) => {
  const relativePath = path.relative(root, file)
  if (!isRaster(file)) return false
  if (/^media[\\/]Renders[\\/]/i.test(relativePath)) return true
  return (await fs.stat(file)).size > targetBytes
}

const encodeUnderTarget = async (source, destination, maxWidth) => {
  const metadata = await sharp(source).metadata()
  let width = Math.min(metadata.width || maxWidth, maxWidth)
  let quality = initialQuality
  let buffer

  while (true) {
    buffer = await sharp(source)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer()
    if (buffer.length <= targetBytes || (quality <= 58 && width <= Math.min(maxWidth, 1400))) break
    if (quality > 62) quality -= 4
    else width = Math.round(width * 0.88)
  }

  await fs.writeFile(destination, buffer)
  const outputMetadata = await sharp(buffer).metadata()
  return { bytes: buffer.length, width: outputMetadata.width, height: outputMetadata.height, quality }
}

const files = await walk(mediaRoot)
const sources = []
for (const file of files) {
  if (await shouldOptimize(file)) sources.push(file)
}

const replacements = new Map()
const results = []
for (const source of sources) {
  const relativeSource = path.relative(root, source).replaceAll('\\', '/')
  const relativeDestination = relativeSource.replace(/\.(?:jpe?g|png)$/i, '.webp')
  const destination = path.join(root, relativeDestination)
  const maxWidth = isFullWidth(relativeSource) ? 2000 : 900
  const beforeBytes = (await fs.stat(source)).size
  const output = await encodeUnderTarget(source, destination, maxWidth)
  replacements.set(relativeSource, relativeDestination)
  results.push({ source: relativeSource, output: relativeDestination, beforeBytes, ...output })
}

const sourceFiles = [
  ...(await fs.readdir(root)).filter((file) => file.endsWith('.html')).map((file) => path.join(root, file)),
  path.join(root, 'src/main.js'),
  path.join(root, 'src/style.css'),
]

for (const sourceFile of sourceFiles) {
  let contents = await fs.readFile(sourceFile, 'utf8')
  for (const [before, after] of replacements) {
    contents = contents
      .replaceAll(`/${before}`, `/${after}`)
      .replaceAll(`../${before}`, `../${after}`)
  }
  await fs.writeFile(sourceFile, contents)
}

const heroSources = new Set([
  '/media/home-hero/testHero1.webp',
  '/media/design-center/hero.webp',
  '/media/energy-efficiency/hero.webp',
  '/media/home-hero/heroHomeImg2.webp',
])

for (const heroSource of heroSources) {
  const absolutePath = path.join(root, heroSource.replace(/^\//, ''))
  try {
    const metadata = await sharp(absolutePath).metadata()
    if ((metadata.width || 0) <= 1000) continue
    const responsivePath = absolutePath.replace(/\.webp$/, '-1000.webp')
    await sharp(absolutePath).resize({ width: 1000, withoutEnlargement: true }).webp({ quality: initialQuality, effort: 6 }).toFile(responsivePath)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

const localImageMetadata = async (source) => {
  const absolutePath = path.join(root, source.replace(/^\//, ''))
  try {
    return await sharp(absolutePath).metadata()
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

for (const htmlFile of sourceFiles.filter((file) => file.endsWith('.html'))) {
  let html = await fs.readFile(htmlFile, 'utf8')
  const tags = [...html.matchAll(/<img\b[^>]*>/g)]
  for (const match of tags.reverse()) {
    let tag = match[0]
    const source = tag.match(/\bsrc="([^"]+)"/)?.[1]
    if (!source) continue

    let width
    let height
    if (source.startsWith('https://i.ytimg.com/')) {
      width = 900
      height = 540
    } else if (source.startsWith('/')) {
      const metadata = await localImageMetadata(source)
      width = metadata?.width
      height = metadata?.height
    }

    if (path.basename(htmlFile) === 'home-details.html' && source === '/media/home-hero/heroHomeImg2.webp') {
      width = 900
      height = 540
    }
    if (!/\bwidth="/.test(tag) && width) tag = tag.replace('<img', `<img width="${width}"`)
    if (!/\bheight="/.test(tag) && height) tag = tag.replace('<img', `<img height="${height}"`)
    if (!/\bdecoding="/.test(tag)) tag = tag.replace('<img', '<img decoding="async"')

    const isHeaderLogo = source === '/media/SH_logo.png'
    const isHero = heroSources.has(source)
    if (!isHeaderLogo && !isHero && !/\bloading="/.test(tag)) tag = tag.replace('<img', '<img loading="lazy"')
    if (isHero) {
      tag = tag.replace('<img', '<img fetchpriority="high"')
      if (!/\bsrcset="/.test(tag)) {
        const responsiveSource = source.replace(/\.webp$/, '-1000.webp')
        const srcset = width > 1000 ? `${responsiveSource} 1000w, ${source} ${width}w` : `${source} ${width}w`
        tag = tag.replace(/\bsrc="[^"]+"/, `src="${source}" srcset="${srcset}" sizes="100vw"`)
      }
    }

    html = `${html.slice(0, match.index)}${tag}${html.slice(match.index + match[0].length)}`
  }
  await fs.writeFile(htmlFile, html)
}

console.log(JSON.stringify({ optimized: results.length, results }, null, 2))
