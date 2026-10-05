// Gera os ícones do app a partir de um único desenho: o mesmo "TrendingUp" do Lucide (licença ISC)
// usado como logo no cabeçalho, em azul-acinzentado (cor primária do tema claro).
//
// Uso: PW_CHANNEL=chrome node scripts/generate-icons.mjs   (ou: npm run icons)
// Saída em public/: icon.svg, icon-192.png, icon-512.png, apple-icon.png, favicon.ico
import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

// Mesmas cores do logo do cabeçalho (--primary / --primary-foreground de src/app/globals.css):
// tema claro = azul médio com glifo branco; tema escuro = azul claro com glifo escuro.
const LIGHT = { bg: '#4a6785', fg: '#ffffff' }
const DARK = { bg: '#8fa8c2', fg: '#0f1114' }

const svg = (rx, { adaptive = false } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${
  adaptive
    ? `
  <style>
    .bg { fill: ${LIGHT.bg} }
    .fg { stroke: ${LIGHT.fg} }
    @media (prefers-color-scheme: dark) { .bg { fill: ${DARK.bg} } .fg { stroke: ${DARK.fg} } }
  </style>`
    : ''
}
  <rect${adaptive ? ' class="bg"' : ` fill="${LIGHT.bg}"`} width="32" height="32" rx="${rx}"/>
  <g${adaptive ? ' class="fg"' : ` stroke="${LIGHT.fg}"`} transform="translate(4 4)" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 7h6v6"/>
    <path d="m22 7-8.5 8.5-5-5L2 17"/>
  </g>
</svg>
`

// Cantos arredondados para o ícone do navegador/PWA; quadrado cheio no apple-icon (o iOS aplica a máscara).
const rounded = svg(7)
const square = svg(0)

// O SVG do navegador acompanha o esquema de cores do sistema, como o logo do cabeçalho.
// Os PNG e o .ico são estáticos (versão clara).
writeFileSync('public/icon.svg', svg(7, { adaptive: true }))

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined })
const page = await browser.newPage()

async function png(source, size) {
  await page.setViewportSize({ width: size, height: size })
  const uri = `data:image/svg+xml;base64,${Buffer.from(source).toString('base64')}`
  await page.setContent(`<body style="margin:0;background:transparent"><img src="${uri}" width="${size}" height="${size}" style="display:block"></body>`)
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } })
}

writeFileSync('public/icon-192.png', await png(rounded, 192))
writeFileSync('public/icon-512.png', await png(rounded, 512))
writeFileSync('public/apple-icon.png', await png(square, 180))

// favicon.ico: contêiner ICO com PNGs de 16, 32 e 48 px
const sizes = [16, 32, 48]
const images = []
for (const s of sizes) images.push(await png(rounded, s))
await browser.close()

const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reservado
header.writeUInt16LE(1, 2) // tipo: ícone
header.writeUInt16LE(images.length, 4)
let offset = 6 + 16 * images.length
const entries = images.map((data, i) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(sizes[i], 0) // largura
  e.writeUInt8(sizes[i], 1) // altura
  e.writeUInt16LE(1, 4) // planos
  e.writeUInt16LE(32, 6) // bits por pixel
  e.writeUInt32LE(data.length, 8)
  e.writeUInt32LE(offset, 12)
  offset += data.length
  return e
})
writeFileSync('public/favicon.ico', Buffer.concat([header, ...entries, ...images]))

console.log('ícones gerados em public/')
