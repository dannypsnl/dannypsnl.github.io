---
title: "Nginx 安裝與啟動"
categories:
  - cs
tags:
  - nginx
  - web
---

這篇只是隨便紀錄一下好不容易終於弄懂的 Nginx ，首先各個平台安裝方式應該直接上網查詢

[官網下載頁](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)

最基本的啟動方式通常是 `/usr/bin/nginx` ，不過各平台可能有差異，應以實際位置為主

## 指令

```bash
$ nginx -s stop # shut down nginx
$ nginx -s reload # reload configure, if you edit the configure & want to use it, this is what you want
```

## 設定流程

把設定檔放在 `sites-available/` 下，請根據系統到 Nginx 的設定檔目錄中尋找這個目錄

> p.s. 舉例來說，我在 gcloud 上的 Ubuntu 主機中 Nginx 設定檔目錄在 `/etc/nginx`

寫好設定檔之後再到 `sites-enabled` 目錄中，建立 link 指向 `site-available` 中的設定檔

最後 reload 套用新的設定

## 設定檔內容

這邊我也沒有深入研究，需要什麼再想是我的習慣，而且軟體總是有新的變動，所以這裡我只介紹基本的東西，
更進階的 Nginx 用法應該直接看官方文件

接著看一段簡單的設定檔

```nginx
upstream service_stream {
	server 127.0.0.1:8080;
}

server {
	listen 80;
	location / {
		proxy_pass http://service_stream;
	}
}
```

`upstream` 抽象了服務跟實際的伺服器的連結，這裡可以看到用一段 ip 取代直接建立一個監聽 80 port 的伺服器，
這讓網路服務模型更具有擴展性，而軟體最應該關注的就是擴展能力

`upstream` 不處理網路服務，而是設定處理網路服務的服務器(`server`)，所以稱之為上游

`server` 去聆聽真實的網路請求，然後把資訊轉給 `upstream` ，這裡是代理服務，所以用 `proxy_pass`

`listen` 決定了聆聽哪些 port ，`location` 決定把哪些路由導向哪個服務

End
