---
title: "strictly positive check"
date: "Sun May  2 10:24:48 UTC 2021"
categories:
  - cs
tags:
  - racket
  - type theory
  - theorem prover
  - strictly positive
---

## Why?

strictly positive 是 data type 中對 constructor 的一種特殊要求形成的屬性，這是因為如果一個語言可以定義出不是 strictly positive 的 data type，就可以在 type as logic 中定義出任意邏輯，形成不一致系統。

現在我們知道為什麼我們想知道一個 data type 是不是 strictly positive 了！

#### First Example: Not Bad

了解完 strictly positive 的必要性後，我們用例子來理解什麼是不一致的系統。這裏我假設讀者都已經知道 type as logic(program as proof) 是什麼玩意兒，所以不再贅述一次。第一個例子是 `not-bad`：

```haskell
data Bad
    bad : (Bad -> Bottom) -> Bad

notBad : Bad -> Bottom
notBad (bad f) = f (bad f)

isBad : Bad
isBad = bad notBad

absurd : Bottom
absurd = notBad isBad
```

`Bottom`($\bot$) 本來應該是不可能有任何元素的，即不存在 `x` 滿足 `x : Bottom` 這個 judgement，但我們卻成功的建構出 `notBad isBad : Bottom`。如此一來我們的型別對應到的邏輯系統就有了缺陷。

#### Second Example: Loop

現在我們關心一下第二個例子 `loop`：

```haskell
data Term
    abs : (Term -> Term) -> Term

app : Term -> Term -> Term
app (abs f) t = f t

w : Term
w = abs (\x -> app x x)

loop : Term
loop = app w w
```

`loop` 的計算永遠都不會結束，然而證明器用到的 dependent type theory 卻允許型別依賴 `loop` 這樣的值，因此就能寫出讓 type checker 無法停止的程式。換句話說，證明器仰賴的性質也就成了笑話。

事實上 `Term` 跟 `Bad` 的問題就是違反了 strictly positive 的性質，或許也有人已經發現了兩者 constructor 型別的相似之處。接下來我們來看為什麼這樣的定義會製造出不一致邏輯。

## 深入

首先我們需要理解以下兩條規則

1. $B \subseteq B'$ 蘊含 $(A \Rightarrow B) \subseteq (A \Rightarrow B')$
1. $A \subseteq A'$ 蘊含 $(A \Rightarrow B) \supseteq (A' \Rightarrow B)$

根據這兩條規則，我們說 arrow types $A \Rightarrow B$ 是 covariant in B 和 contravariant in A，或是說 A varies negatively 以及 B varies positively in $A \Rightarrow B$。

所以我們稱 $A$ 為 negative position、$B$ 為 positive position，最後擴展到 $\Pi$ type。

至此我們有足夠的資訊來實作了，讓我們來看怎麼完成吧！

## 實作

首先我們先訂出 data type 的語法框架，然後其中填上檢查程式：假設 constructor 會把其型別去糖，並假設有 `check` 函數。

```racket
(define-syntax-parser data
  [(_ name:id c*:constructor ...)
   (for ([c (attribute c*.desugar-type)])
     (check #'name c))
   #''ok])
```

接著補上型別依賴的語法，以及把型別帶來的隱式依賴展開，讓 `check` 檢查到完整的型別。注：這裏的實作其實不是有用到才展開，但剛好我們要舉的例子都沒有踩到這個問題，所以我懶得修正了，你自己實作的時候注意一下 lol。

```racket
(define-syntax-parser data
  ; ...
  [(_ (name:id d*:bind ...) c*:constructor ...)
   (for ([c (attribute c*.desugar-type)])
     (check #'name (foldr (λ (n r)
                            (n r))
                          c
                          (attribute d*.lam))))
   #''ok])
```

接著我們來看各個 `syntax-class` 的定義

- `pattern` 就語法
- `lam` 把 `bind` 展開成準 $\Pi$ type（需要 apply 後才是 $\Pi$ type）
- `desugar-type` 把前面的 `bind` 都套上最後的型別，完成展開

```racket
(begin-for-syntax
  (define-syntax-class type
    (pattern ty #:attr val (syntax->datum #'ty)))
  (define-syntax-class bind
    (pattern (name:id : ty:type)
             #:attr lam
             (λ (t)
               (Pi (syntax->datum #'name) (attribute ty.val) t))))
  (define-syntax-class constructor
    (pattern (name b*:bind ... : ty:type)
             #:attr desugar-type
             (foldr (λ (n r)
                      (n r))
                    (attribute ty.val)
                    (attribute b*.lam)))))
```

最後則是重頭戲：檢查。我們會假設 constructor 的 type 是 positive 來開始，規則如下：

1. 箭頭或是 $\Pi$ 的左邊跟箭頭或是 $\Pi$本身的屬性相反
   - 假設箭頭或是 $\Pi$本身是正，那左邊就是負
   - 假設箭頭或是 $\Pi$本身是負，那左邊就是正
2. 箭頭或是 $\Pi$ 的右邊跟箭頭或是 $\Pi$本身的屬性相同
3. endofunctor 不需要繼續檢查下去

```racket
(begin-for-syntax
  (struct Pi (name t1 t2) #:transparent)

  ; strictly positive check
  ; @name: name of data type
  ; @c: type of constructor
  (define (check name c [positive? #true])
    (define n (syntax->datum name))
    (define (check-left-right t1 t2)
      (cond
        ; endofunctors are positive
        [(equal? t1 t2) (void)]
        ; self at negative
        [(and (equal? (if (symbol? t1) t1 (first t1)) n)
              (not positive?))
         (raise-syntax-error 'negative "bad data type"
                             name)])
      (check name t1 (not positive?))
      (check name t2 positive?))
    (match c
      [(or (Pi _ t1 t2)
           `(-> ,t1 ,t2))
       (check-left-right t1 t2)]
      [x (void)]))
```

## 結語

文章到這邊告一段落，也解決了我這一年來對證明器實作的最大疑問之一！希望讀者有從程式及說明中理解為何需要這個檢查，以及如何自行實作，沒有浪費寶貴的人生 www。
