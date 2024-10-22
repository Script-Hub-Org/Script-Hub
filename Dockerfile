
FROM node:18-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package*.json ./

# 安装生产依赖
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --no-frozen-lockfile

COPY . .

EXPOSE 9100 9101


# 使用 pnpm 启动服务
CMD ["pnpm", "service"]
