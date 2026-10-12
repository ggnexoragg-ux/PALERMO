export default function manifest() {
  return {
    id: '/',
    name: 'Palermo Online',
    short_name: 'Palermo',
    description: 'Play Palermo Online with friends.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#08070d',
    theme_color: '#08070d',
    icons: [
      { src: '/palermo-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
    ]
  }
}
