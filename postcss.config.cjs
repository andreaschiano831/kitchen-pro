cd /workspaces/kitchen-pro/kitchen-pro
printf '%s\n' \
'module.exports = {' \
'  plugins: {' \
'    "@tailwindcss/postcss": {},' \
'    autoprefixer: {},' \
'  },' \
'};' > postcss.config.cjs
