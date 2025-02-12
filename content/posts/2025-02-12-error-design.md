---
title: 錯誤處理的設計
date: 2025-02-12
---

從程式設計之初，我們就有錯誤處理的需求，常見的模式有幾種

# C/Go 語言的模式（錯誤就是值）

```go
func c() (int, error) {
  // ...
}
```

這種程式在使用時需要寫下大量的

```go
if err != nil {
  // handle it; or
  return err
}
```

# Java/Old C++ 的模式

就是一個 `throw` 語句把 exception 丟出去，具有 `try ... catch` 構造來處理錯誤

# Haskell/Rust 的模式

monadic 的語句，比如（取自官網）

```haskell
calculateLength :: ExceptT String IO Int
calculateLength = do
  liftIO $ putStrLn "Please enter a non-empty string: "
  s <- liftIO getLine
  if null s
    then throwError "The string was empty!"
    else return $ length s
```

這段程式的意思是擲出 `String` 作為錯誤，變換為 `IO` monad，回傳 `Int` 作為值。
Rust 則是用 `Result` 作為標記，寫 `xxx?` 就會被判斷為：如果 `xxx` 是 `Err(e)` 就 `return`，否則取出 `Ok(v)` 的 `v` 並繼續進行計算。

# 全都是 monad

可以去 [Introducing String Diagrams](https://www.cambridge.org/core/books/introducing-string-diagrams/36F8F1BCA0C61522283C2FED620EBC0D) 找 Klesli 的 string diagrams 來看。所謂的 $eta : I -> M$ 就是用來產出「沒有錯誤」，所以任何 pure computation 都從 $A -> B$ 升格為 $A -> M B$，由 $eta$ 給出 $M$ 的部分。
$mu : M times M -> M$ 用來判斷是否有錯誤，只要至少一邊 $M$ 有錯誤，那輸出的 $M$ 就有錯誤，是否急迫求值就決定會只有第一個錯誤出現，或是兩個都回報。

## Go Lift

這就是為什麽 Go lift 把 `error` 丟去一個中間結構然後代理運算可以運作，因為在代理函數裡面檢查 `err != nil` 就是急迫處理錯誤的部分，從而得到如

```go
w := NewErrorWrapper("tcp", "server:6666")

w.Then(func(network, host string) (net.Conn, error) {
    conn, err := net.Dial(network, host)
    return conn, err
}).Then(func(conn net.Conn) error {
    _, err := conn.Write([]byte{`command`})
    return err
}).Final(func(e error) {
    panic(e)
})
```

這樣的程式

# 跳轉

exception 的模型可以擴充為 continuation 跳轉模型，這樣做的好處就是泛化了這個系統，exception 的 `throw` 語意本來就是轉交控制權給上層並且不會 `resume` 回來。

[Compiler and Runtime Support for Continuation Marks](https://dl.acm.org/doi/abs/10.1145/3385412.3385981) 就有範例說明怎麼用 continuation 造出 exception 系統

```scheme
(define handler-key (gensym))

(define (throw exn)
  (define escape+handle
    (continuation-mark-set-first #f handler-key #f))
  (if escape+handle
    (escape+handle exn)
    (abort "unhandled exception")))

(define-syntax-rule (catch handler-proc body)
  ((call/cc
    (λ (k)
      (λ ()
        (with-continuation-mark
          handler-key (λ (exn) (k (λ () (handler-proc exn))))
          body))))))
```

## effect typing

跳轉模型的類型系統是 effect type system，就是在說明各種 abort (在 exception 中叫做 `throw`) 跳轉與 prompt (在 exception 中叫做 `catch`) 之間的 resume 協定。
[koka 文件](https://koka-lang.github.io/koka/doc/book.html#sec-resume)中有更多的說明。
