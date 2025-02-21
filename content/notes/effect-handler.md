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

# 應對一：複製整個 `k` 的記憶體內容

我跟朋友討論之後他提出一種方法：另一個 thread 要捕獲 `k` 必須複製整個 `k` 的記憶體內容，這種方法就可以避免在資料損壞的 stack 上繼續運作。
這個方法很實務，對理論沒有修改。
