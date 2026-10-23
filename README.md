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
## Demo

[🎥 Watch Demo Video](https://drive.google.com/file/d/1oKzs0TE2rV07zDj97IhXi8vUld5bx4g7/view?usp=sharing)

### Screenshots

<table>
  <tr>
    <td align="center">
      <img width="250" alt="MiniLedger screenshot 1" src="https://github.com/user-attachments/assets/c819d85e-4329-445e-b4fa-07af2cea771c" />
      <br />Screenshot 1
    </td>
    <td align="center">
      <img width="250" alt="MiniLedger screenshot 2" src="https://github.com/user-attachments/assets/df51a15f-5819-4432-862d-715529c64351" />
      <br />Screenshot 2
    </td>
    <td align="center">
      <img width="250" alt="MiniLedger screenshot 3" src="https://github.com/user-attachments/assets/9f58dafb-266c-4ff7-8bd7-0c6b2e65fd88" />
      <br />Screenshot 3
    </td>
  </tr>
  <tr>
    <td align="center">
      <img width="250" alt="MiniLedger screenshot 4" src="https://github.com/user-attachments/assets/bb8819c8-81f1-4050-b3f3-b23cb0dbe7ce" />
      <br />Screenshot 4
    </td>
    <td align="center">
      <img width="250" alt="MiniLedger screenshot 5" src="https://github.com/user-attachments/assets/6d8babe6-7f2c-4a2b-bdbb-5239a29eff03" />
      <br />Screenshot 5
    </td>
    <td align="center">
      <img width="250" alt="MiniLedger screenshot 6" src="https://github.com/user-attachments/assets/c5667a3d-e104-4d75-ba4c-9a4dcc923ea8" />
      <br />Screenshot 6
    </td>
  </tr>
</table>






