FROM node:21 AS build

WORKDIR /usr/src/app

# 라이브러리 설치에 필요한 파일만 복사하기
COPY package*.json ./

# 라이브러리 설치
RUN npm ci

# 소스코드 복사
COPY . .

# 소스코드 빌드
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]