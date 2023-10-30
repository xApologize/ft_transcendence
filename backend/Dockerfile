FROM python:3.9.18-slim-bullseye

RUN apt-get update && apt-get install -y dumb-init

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1

ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip

COPY requirements.txt .

RUN pip install -r requirements.txt

ENTRYPOINT ["dumb-init", "./start.sh"]