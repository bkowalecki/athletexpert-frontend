module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,svg,json}',
  ],
  swSrc: 'src/service-worker.js',
  swDest: 'build/service-worker.js',
  maximumFileSizeToCacheInBytes: 5000000, // (optional) 5MB limit
};
