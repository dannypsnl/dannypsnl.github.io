---
title: "NOTE: Racket GUI 避免重複開啟視窗"
date: "Sat Mar  6 14:54:50 UTC 2021"
categories:
  - cs
tags:
  - note
  - racket
  - gui
---

首先用 `define/augment` 往 `on-close` 附加一些額外的控制程式碼

```racket
(define open? #f)

(define custom-frame%
  (class frame%
    (super-new [label "test"]
               [width 300] [height 300])

    (define/augment (on-close)
      (set! open? #f))

    (set! open? #t)))
```

接著設計一個只有當 flag 被設定好時才會開啟視窗（`frame`）的函數

```racket
(define (show-it!)
  (unless open?
    (define f (new custom-frame%))
    (send f show #t)
    (send f center)))
```

最後就可以得到重複觸發也不會重複開啟的視窗啦！

```racket
(show-it!)
(show-it!)
```
