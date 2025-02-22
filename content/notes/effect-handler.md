---
title: effect handler 應該如何反應？
date: 2025-02-19
tags:
  - cs
  - plt
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
這個方法很實務，對理論沒有修改。所有這類複製都有很大的執行代價。

# 應對二：runtime 禁止

下面這個 chez scheme 的程式是會卡住的。

```scheme
(import (chezscheme))

(define handler-key (gensym))
(define th #f)

(define x 0)

(define (sub)
  (define n
    (call/cc (lambda (k)
      (define abort (continuation-marks-first (current-continuation-marks) handler-key))
      (abort k))))
  (set! x (+ x n)))

(write x)
(newline)

(with-continuation-mark
  handler-key (lambda (resume)
    (set! th (fork-thread (lambda () (resume 20))))
    (resume 10))
  (sub))

(write x)
(newline)
(thread-join th)
```

這個方法的缺點是損壞的方式很不穩定。
