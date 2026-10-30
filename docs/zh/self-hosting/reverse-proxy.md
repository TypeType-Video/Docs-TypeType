# 反向代理与 HTTPS

真正部署时，你要在整套部署前面放一个反向代理，并在自己的域名上通过 HTTPS 提供服务。你始终只需要暴露**网页**容器（`HOST_PORT_WEB`，默认 `8082`）；它已经在内部把 `/api/` 代理给服务器，包括 WebSocket 升级、SABR 媒体、下载和大文件上传。

## 开始之前 {#before-you-start}

1. 把一条 DNS 记录（例如 `watch.example.com`）指向你的服务器。
2. 把这个源加入 `.env` 中的 `ALLOWED_ORIGINS`，然后重新应用：

   ```sh
   # .env
   ALLOWED_ORIGINS=https://watch.example.com
   ```

   ```sh
   docker compose up -d
   ```

## 方案 A - Caddy（推荐） {#option-a---caddy-recommended}

Caddy 会自动获取并续期 TLS 证书。三行的 `Caddyfile` 就够了：

```text
watch.example.com {
    reverse_proxy localhost:8082
}
```

Caddy 开箱即用地转发 WebSocket 和正确的请求头。这就是你需要的全部。

## 方案 B - nginx {#option-b---nginx}

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name watch.example.com;

    # ssl_certificate ... (用 certbot 获取证书)

    client_max_body_size 2g;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

使用 [certbot](https://certbot.eff.org/) 获取并续期证书。

::: warning 保留升级请求头和请求体大小
应用会接收大文件上传：备份导入最大可达 512 MB。如果把 `client_max_body_size` 设得很小，导入就会失败。上面的设置（包括升级请求头）与自带的网页容器所期望的一致。
:::

## 方案 C - Traefik {#option-c---traefik}

这些示例假定你已经有一套 Traefik，其中有一个监听 443 端口的 `websecure` 入口点，并且在 Traefik 的静态配置中配置了 [ACME 证书解析器](https://doc.traefik.io/traefik/reference/install-configuration/tls/certificate-resolvers/acme/)。请把 `YOUR_CERT_RESOLVER` 换成该解析器的名称，把 `watch.example.com` 换成你的域名。Traefik 用这个解析器获取并续期 TLS 证书；下面的片段不会创建它。

把 Traefik 和 TypeType 的网页服务（`typetype`）接入同一个 Docker 网络。示例使用一个已有的、名为 `proxy` 的外部网络；请换成你的 Traefik 网络的名称。同时让网页服务保留在它原有的 `default` 网络中，这样它仍然能访问 TypeType 服务器。

如果使用 Traefik 的 Docker 提供者，把下面的内容合并到你的 Compose 配置中：

```yaml
services:
  typetype:
    networks:
      - default
      - proxy
    labels:
      traefik.enable: "true"
      traefik.docker.network: "proxy"
      traefik.http.services.typetype.loadbalancer.server.port: "80"
      traefik.http.routers.typetype.service: "typetype"
      traefik.http.routers.typetype.entrypoints: "websecure"
      traefik.http.routers.typetype.rule: "Host(`watch.example.com`)"
      traefik.http.routers.typetype.tls: "true"
      traefik.http.routers.typetype.tls.certresolver: "YOUR_CERT_RESOLVER"

networks:
  proxy:
    external: true
```

或者保持同样的网络接入方式，改用 Traefik 的文件提供者和下面这份动态 YAML 配置来代替标签：

```yaml
http:
  routers:
    typetype:
      entryPoints:
        - websecure
      rule: 'Host(`watch.example.com`)'
      service: typetype
      tls:
        certResolver: YOUR_CERT_RESOLVER

  services:
    typetype:
      loadBalancer:
        servers:
          - url: http://typetype:80
```

网页容器在 80 端口提供明文 HTTP；HTTPS 由 Traefik 终止。请根据你选择的示例，在 Traefik 中启用 Docker 提供者或文件提供者。

## 域名之后的下载 {#downloads-behind-a-domain}

受支持的部署通过 `/api/downloader/...` 提供下载文件。Server 会跟随 Garage 的内部重定向并把结果传输出去，所以正常的部署不需要为 Garage 准备第二个公开的主机名。

只有当你有意使用带公开 S3 端点的自定义 Downloader 配置时，才需要单独暴露 Garage。在这种拓扑下，请按照对象存储的文档保护该端点，并保管好访问凭据。
