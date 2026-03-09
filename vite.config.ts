import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
				navigateFallback: 'index.html',
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts',
							expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }
						}
					},
					{
						urlPattern: /^\//,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'app-pages',
							expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }
						}
					}
				]
			},
			manifest: {
				name: 'Burrow',
				short_name: 'Burrow',
				theme_color: '#06060A',
				background_color: '#06060A',
				display: 'standalone',
				scope: '/',
				start_url: '/',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			}
		})
	]
});
