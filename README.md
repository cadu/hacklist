# Hacklist - Your Hackathon Whitelist

Project developed for the Encode x Polygon Hackathon - Jun/2022

Installing

# Backend

$ cd backend

$ cp .env.example .env.local

$ pnpm i

$ pnpm exec hardhat compile

$ pnpm exec hardhat run scripts/deploy.js

`Copy contract address and paste it on .env.local inside frontend directory`

# Frontend

$ cd ../frontend

$ cp .env.example .env.local

$ npm i

$ npm run dev
