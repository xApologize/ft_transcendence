# ft_transcendence

## About the project

This project is about doing something you’ve never done before.
Remind yourself the beginning of your journey in computer science.
Look at you now. Time to shine!

## Built with

-   [![bootstrap-logo]][bootstrap-url]
-   [![django-logo]][django-url]
-   [![js-logo]][js-url]
-   [![css-logo]][css-url]
-   [![html-logo]][html-url]
-   [![python-logo]][python-url]
-   [![three-js-logo]][three-js-url]
-   [![docker-logo]][docker-url]

# Getting started

## Prerequisite

To build this project you will need to have an instance of [Docker](https://www.docker.com/) running.

## Installation

1. Clone the repository
    ```
    git clone https://github.com/xApologize/ft_transcendence.git
    ```
2. Set the environment. The project come with a [tool](https://github.com/xApologize/ft_transcendence/blob/main/tools/env_maker.sh) that you can use to easily generate the .env file for the project.
      1. Additionally, if you are a 42 student and want to make use of the 42 OAuth to login, you will need to fill the .env file in the backend folder. The ```AUTH42_CLIENT``` and ```AUTH42_SECRET``` will be generated when you create your app in the intra. Fill the ```AUTH42_LINK``` with the url generated whe nyou created the app. ```AUTH42_REDIRECT_URI``` will need to be ```https://your-domain/callback```, you can also use localhost instead if you will be using locally.
  
3. Run the dockers with
   ```
   docker-compose up --build
   ```

## Credits
* [Dave](https://github.com/Producks), our Devops, Backend and Network security dev.
* [Florian](https://github.com/KayzaFlo), our Game design, Game dev and Game visual dev.
* [Jacob](https://github.com/Jalevesq), our Backend, Frontend and UI dev.
* [Jean-Benoit](https://github.com/xApologize), our Frontend and UIX dev.
* [Codepen](https://codepen.io/mattjroberts/pen/pazNdx), for the amazing animated background.






[bootstrap-logo]: https://img.shields.io/badge/Bootstrap-563d7c?style=flat&logo=bootstrap&logoColor=white
[bootstrap-url]: https://getbootstrap.com
[django-logo]: https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white
[django-url]: https://www.djangoproject.com/
[js-logo]: https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black
[js-url]: https://www.w3schools.com/js/
[css-logo]: https://img.shields.io/badge/CSS-1572B6?style=flat&logo=css3&logoColor=white
[css-url]: https://www.w3schools.com/css/
[html-logo]: https://img.shields.io/badge/HTML-E34F26?style=flat&logo=html5&logoColor=white
[html-url]: https://www.w3schools.com/html/
[python-logo]: https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white
[python-url]: https://www.python.org/
[three-js-logo]: https://img.shields.io/badge/Three.js-black?style=flat&logo=three.js&logoColor=white
[three-js-url]: https://threejs.org/
[docker-logo]: https://img.shields.io/badge/Docker-46a2f1.svg?logo=docker&logoColor=white
[docker-url]: https://www.docker.com/
