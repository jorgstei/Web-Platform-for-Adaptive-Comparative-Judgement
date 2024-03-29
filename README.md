<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
***
***
***
*** To avoid retyping too much info. Do a search and replace for the following:
*** jorgstei, Web-Platform-for-Adaptive-Comparative-Judgement, twitter_handle, email, project_title, project_description
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![CCO License][license-shield]][license-url]

<!-- ABOUT THE PROJECT -->

## About The Project

### Built With

- [Svelte](https://svelte.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Express](https://expressjs.com/)
- [Axios](https://www.npmjs.com/package/axios)
- [Cors](https://www.npmjs.com/package/cors)
- [Svelte-Materialify](https://svelte-materialify.vercel.app/)

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

Docker  
Docker-Compose  
node  
npm  

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/jorgstei/Web-Platform-for-Adaptive-Comparative-Judgement.git
   ```
2. Install NPM packages for client
   ```sh
   cd client
   npm install
   ```
3. Install NPM packages for server
   ```sh
   cd server
   npm install
   ```
4. Make necessary changes in docker-compose.yml (ports and volumes for the services)
5. Create a .env file for MongoDB and a .env file for REST-API server
   ```sh
    cp ./mongodb/default.env ./mongodb/.env;
    cp ./server/default.env ./server/.env
   ```
6. Fill out  /server/.env and /mongodb/.env
7. Change /client/rollup.config.js such that apiBasePath is set to the correct server-adress
8. Change /client/package.json "scripts.prod" to point to the correct certificate and key
9. Add the domain to the list of allowed origins for CORS in /server/server.js
10. Make ./build.sh runable
    ```sh
    chmod +x ./build.sh
    ```
11. Run
    ```sh
    .build.sh
    ```
12. Ensure that all services are running by running
    ```sh
    docker.ps
    ```
    


 

<!-- LICENSE -->

## License

Distributed under the Creative Commons (by-nc-sa) License.

<!-- CONTACT -->

## Contact

Project Link: [https://github.com/jorgstei/Web-Platform-for-Adaptive-Comparative-Judgement](https://github.com/jorgstei/Web-Platform-for-Adaptive-Comparative-Judgement)

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

- Supervisor:
- [Olav Skundberg](https://www.ntnu.no/ansatte/olav.skundberg)

- Product owners:
- [Tore Alexander Forebregd](https://www.ntnu.no/ansatte/tore.a.forbregd)
- [Hermund André Torkildsen](https://www.ntnu.no/ansatte/hermund.a.torkildsen)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/jorgstei/Web-Platform-for-Adaptive-Comparative-Judgement.svg?style=for-the-badge
[contributors-url]: https://github.com/jorgstei/Web-Platform-for-Adaptive-Comparative-Judgement/contributors
[forks-shield]: https://img.shields.io/github/forks/skelletore/064bachelor2021.svg?style=for-the-badge
[forks-url]: https://github.com/jorgstei/Web-Platform-for-Adaptive-Comparative-Judgement/network/members
[stars-shield]: https://img.shields.io/github/stars/skelletore/064bachelor2021.svg?style=for-the-badge
[stars-url]: https://github.com/jorgstei/Web-Platform-for-Adaptive-Comparative-Judgement/stargazers
[issues-shield]: https://img.shields.io/github/issues/skelletore/064bachelor2021.svg?style=for-the-badge
[issues-url]: https://github.com/jorgstei/Web-Platform-for-Adaptive-Comparative-Judgement/issues
[license-shield]: https://img.shields.io/badge/license-CC%20(by--nc--sa)-green?style=for-the-badge
[license-url]: https://creativecommons.org/licenses/by-nc-sa/4.0/en/legalcode
