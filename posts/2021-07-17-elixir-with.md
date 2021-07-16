---
title: "不要誤用 with"
date: "Fri Jul 16 21:02:22 UTC 2021"
categories:
  - cs
tags:
  - elixir
---

`with` 身為一個多條件過濾器，許多人會像下面那樣誤用它。

```elixir
with ["Bearer" <> token] <- get_req_header(conn, "authorization"),
     {:ok, data} <- Authenicate.verify(token) do
  %{current_user: get_user(data)}
else
  %{}
end
```

然而正確的寫法應該是下面這樣。

```elixir
with ["Bearer" <> token] <- get_req_header(conn, "authorization") do
  {:ok, data} = Authenicate.verify(token)
  %{current_user: get_user(data)}
else
  %{}
end
```

其中的關鍵就在 `with` 會安心的吞掉錯誤，我們沒辦法判斷沒有拿到 `current_user` 究竟是因為沒有 `token` 或是 `token` 沒有通過驗證。第二種寫法就避開了這個問題，如果 `{:ok, data}` 比對失敗也會留下顯眼的紀錄，並且自動從錯誤中恢復。
