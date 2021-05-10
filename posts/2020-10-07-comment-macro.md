---
title: "廢到有剩 Macro: comment"
categories:
  - cs
tags:
  - racket
  - macro
---

我發現真正重要的內容通常需要長時間修改、反覆拿出來閱讀，所以目前的形式越來越不適合。因此以後 blog 這邊會逐漸廢人化，只有無聊透頂的技術相關或是日常才會發這裡 www。舉例：

```racket
(define-syntax-rule (comment ...) (void))
```

這在 **racket** 裡定義了一個什麼也不會做的語法，可以充當註釋

```racket
(comment give me money QAQ)
```
