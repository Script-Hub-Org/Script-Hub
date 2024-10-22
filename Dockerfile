# 使用官方的 Node.js 镜像作为基础镜像
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8964 8965

# 定义运行命令
CMD [ "node", "service.js" ]
