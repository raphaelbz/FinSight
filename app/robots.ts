import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://finsight.fr'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/api/auth/*'
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/_next/',
          '/private/'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/login'
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
} 