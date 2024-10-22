# 使用轻量的 Node.js Alpine 版本作为基础镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /usr/src/app

COPY package*.json ./

# 安装所有依赖
RUN npm install --production
RUN npm install koa --save

COPY . .

EXPOSE 8964 8965

CMD ["node", "service.js"]
