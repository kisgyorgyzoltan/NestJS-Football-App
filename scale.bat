cd backend
npm run build
pm2 start dist/main.js --name "nestjs-app" -i 2
pm2 list