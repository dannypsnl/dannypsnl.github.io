---
title: "Phoneix 安裝與啟動"
categories:
  - cs
tags:
  - phoenix
  - elixir
  - web
---

這幾天好不容易有機會試玩 Elixir 的神奇框架 Phoenix

首先要用 mix 下載 phoenix

```bash
$ mix archive.install https://github.com/phoenixframework/archives/raw/master/phx_new.ez
```

另外也需要 node, npm 等相依

預設使用 postgreSQL 作為資料庫

Phoenix 與 Rails 相同，都是由框架為你產生基礎模板的設計，指令如下：

```bash
$ mix phx.new hello
```

接著會跑出整串的安裝過程，所有問題都按 y ，Phoenix 會為你安裝需要的相依還有 js 等等，等待結束之後進入目錄 `$ cd hello`

預設的資料庫 Database 是 `專案名稱_dev` ，所以現在用 ecto 創建一個 db 吧

```bash
$ mix ecto.create
```

> p.s. 這裡有個問題是你必須先在 `port: 5432` 上跑一個 postgre ，否則會跑出一連串的錯誤，因為 phoenix 會不斷嘗試連接資料庫

> 我的做法是用 Docker 跑起一個開發用的 Postgre 資料庫

Docker command:

```bash
$ docker run --rm --name dev-postgre -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:10.3
```

為了讓電腦環境更乾淨你可以選擇用 docker 建立 phoenix 的開發環境，再將資料庫 link 進開發容器之中，檔案掛 volume 即可

最後啟動伺服器

```bash
$ mix phx.server
```

到 `http://localhost:4000` 看你的網頁

之後再深入研究 Phoenix 的其他特性，XD

### References:

- [Postgre Docker](https://docs.docker.com/samples/library/postgres/)
- [Phoenix Doc](https://hexdocs.pm/phoenix/overview.html)
