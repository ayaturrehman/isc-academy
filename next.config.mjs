/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/**': [
      './node_modules/.prisma/client/**/*.node',
    ],
  },
  outputFileTracingExcludes: {
    '/api/**': [
      './node_modules/@prisma/engines/**/*.node.*.node',
      './node_modules/@prisma/engines/**/libquery_engine-*',
      './node_modules/@prisma/engines/**/query-engine-*',
      './node_modules/@prisma/engines/**/schema-engine-*',
      './node_modules/@prisma/engines/**/prisma-fmt-*',
      './node_modules/.prisma/client/**/*.node.*.node',
    ],
  },
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

export default nextConfig;  
