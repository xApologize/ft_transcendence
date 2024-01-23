FROM python:3.12.1-slim-bullseye

RUN apt-get update && apt-get install -y dumb-init

RUN apt-get install -y netcat

WORKDIR /usr/src/init

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1

ENV PYTHONUNBUFFERED 1

ENV DJANGO_SETTINGS_MODULE src.settings

RUN pip install --upgrade pip

COPY . .

RUN pip install -r requirements.txt

ENTRYPOINT ["dumb-init", "./start.sh"]