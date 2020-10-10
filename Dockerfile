# выбираем базовый образ (операционная система + набор инструментов)
# node.js 14 версии
FROM node:14

# создаём директорию /app и все дальнейшие операции производим в ней
WORKDIR /app

# копируем файлы со списком зависимостей
COPY package.json package.json
# COPY package-lock.json package-lock.json
COPY yarn.lock yarn.lock

# устанавливаем зависимости
RUN yarn
# RUN npm install

# копируем все файлы проекта в /app
COPY . /app/

# выводим список всех файлов в директории /app (для теста)
# RUN ls -la

ENV PORT=3000
# ENV GOOGLE_API_KEY

# при запуске образа будет выполняться эта команда:
ENTRYPOINT [ "yarn", "start" ]


# сборка образа:
# docker build -t olyanik/gsproxy .

# запуск контейнера из образа:
# docker run --rm -it --env-file .env -p 8100:8000 --name gsproxy olyanik/gsproxy