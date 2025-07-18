module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-class-properties',
    'react-native-web/babel',
  ],
  env: {
    web: {
      presets: [
        ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] } }],
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
      plugins: [
        '@babel/plugin-transform-class-properties',
        'react-native-web/babel',
      ],
    },
  },
};