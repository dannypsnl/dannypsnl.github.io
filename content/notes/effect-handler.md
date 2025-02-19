---
title: effect handler 應該如何反應？
date: 2025-02-19
tags:
  - cs
  - effect system
---

考慮以下程式

```ocaml
let xxx () =
  match k () with
  | effect A, k ->
    Thread.create (fun () -> continue k ()) ();
    continue k ()
```

假設是使用紀錄 `sp` 的方式實作，現在 thread 會在未知的時間點把 `sp` 設定成 `k`，而 `xxx` 會立即設定成 `k` 並繼續執行。
換句話說 thread 跟 `xxx` 會以未知的順序讓兩個計算實體對 `k` 的記憶體進行修改，這就是我想問的問題。
