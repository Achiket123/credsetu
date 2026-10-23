# CREDSETU ASSIGNMENT
This is Money Lending Application using React Native (Expo) as Frontend and Nodejs, Postgresql and Express as Backend.

There are minor Integration Test for Backend using jest library.
The images are stored as bytes in postgres as storing it in the user device may reduce the storage cost of the server but can get deleted as well.

## To start the app 
```
Create .env file with the following fields in the credsetu_backend folder

PORT=8080
DATABASE_URL=postgresql://<user>:<password>@<hostname>:<port>/<database>
DB_HOST=<host>
DB_PORT=<port>
DB_USER=<user>
DB_PASSWORD=<password>
DB_NAME=<database>
JWT_SECRET=<supersecret_credsetu_key_2026>

Create .env file with the following fields in the credsetu_frontend 
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

## To Run the Backend
```
cd credsetu_backend
npm run dev
```
## To Run the Frontend on Android and IOS
```
cd credsetu_frontend
npx expo run
# Choose you preferred Device
```
## To Run the Frontend on Browser
```
cd credsetu_frontend
npx expo start --web
```
