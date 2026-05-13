import { MetadataRoute } from 'next';

const baseUrl = 'https://project-immortal.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/employee/', '/student/', '/login/', '/verify-email/', '/admin-login/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
