---
title: "S-expression, macro and develop"
date: "Mon May 10 23:03:09 UTC 2021"
categories:
  - cs
tags:
  - racket
  - clojure
  - macro
  - sexp
---

這篇文章是從我在 Clojure Taiwan 的分享 [clojure isn't lisp enough](https://www.meetup.com/Clojure-tw/events/277419019/) 改編而來的。由於演講與文章的差異，編排會略有不同，但主旨仍然是 macro 系統與開發方式之間的交互影響。

這篇文章前段的兩大主角分別是 Racket 和 Clojure。Clojure 是 2007 年從 Lisp 家族分支出的不可變範式（也有人說函數式，但對我來說函數式僅需要 first-class function 即可）語言。Lisp 在 1975 年有了一群人把 dynamic scoping 改掉，並稱為 scheme 的分支語言。這個分支語言又在之後多了一個實驗分支 PLT scheme，最後 PLT scheme 改名 Racket。

### 善用 S-expression

要引出我們的主題，得從怎樣才算是 Lisp 開始，各家有各家的說法，因此有了 **Lisp 九宮格**的梗圖。首先我們從 Clojure 開始談起。

Clojure 的語法相較於傳統的 Lisp 更加的依賴 parser，下面我們舉三個例子，Racket 作為對照組。

<table>
<tr>
<th></th><th>Clojure</th><th>Racket</th>
</tr>
<tr>
<td>conditional</td>
<td>

```clojure
(condp = n
  [0 1
   1 1
   (+ (fib (- n 1))
      (fib (- n 2)))])
```

</td>
<td>

```racket
(match n
  [0 1]
  [1 1]
  [else (+ (fib (- n 1))
           (fib (- n 2)))])
```

</td>
</tr>
<tr>
<td>let</td>
<td>

```clojure
(let [x n
      y 2]
  (+ x y))
```

</td>
<td>

```racket
(let ([x n]
      [y 2])
  (+ x y))
```

</td>
</tr>
<tr>
<td>map</td>
<td>

```clojure
{:a 1
 :b 2
 :c 3}
```

</td>
<td>

```racket
#hash((a . 1)
      (b . 2)
      (c . 3))
```

</td>
</tr>
</table>

乍一看似乎沒什麼問題，Clojure 的語法甚至看起來比較簡潔。真正的問題要到了刪除部分程式的時候才會顯現。

#### 第一組案例

```clojure
(condp = n
  [0 1
   1 1
   (+ (fib (- n 1))
      (fib (- n 2)))])
```

假設我們忘了寫第一個 branch 的 expression。

```clojure
(condp = n
  [0
   1 1
   (+ (fib (- n 1))
      (fib (- n 2)))])
```

假設我們忘了寫第二個 branch 的 pattern。

```clojure
(condp = n
  [0 1
     1
   (+ (fib (- n 1))
      (fib (- n 2)))])
```

以上兩種情況語義竟然是一樣的，並且沒有出現應有的錯誤報告。同樣的情況 Racket 會報告：`match: expected at least one expression on the right-hand side in: ((0))` 跟 `match: expected at least one expression on the right-hand side in: ((1))`，並明確標出錯誤位置。

#### 第二組案例

```clojure
(let [x n
      y 2]
  (+ x y))
```

假設我們忘了寫 `2`。

```clojure
(let [x n
      y ]
  (+ x y))
```

Clojure 會給出匪夷所思的錯誤訊息：`[x n y] - failed: even-number-of-forms? at: [:bindings] spec: :clojure.core.specs.alpha/bindings`。Racket 則會說：`let: bad syntax (not an identifier and expression for a binding) in: (y)`，順便標出出錯的 binding。

#### 第三組案例

```clojure
{:a 1
 :b 2
 :c 3}
```

假設少寫 `2`，Clojure 會持續不斷的希望你知道什麼是 even number of forms：`Map literal must contain an even number of forms`

```clojure
{:a 1
 :b
 :c 3}
```

Racket 則是指出語法錯誤。

### 差別在哪？

其實事情很簡單，Clojure 的作者並不明白 S-expression 的好處，沒有善用 S-expression 卻又抄了一部分 Lisp。S-expression 要嘛你就全都用，每個語義分隔都用 S-expression 完成；要嘛就有足夠好的 parsing 並報錯的能力。Clojure 缺乏後半部分，所以即使以下程式碼寫得出來（善用 S-expression 的 let form），還是會栽在報錯能力不夠好的問題上。

```clojure
(defmacro let
  [bindings & body]
  (doseq [bind bindings]
    (assert (= (-> bind count) 2) "invalid binding"))
  `((fn ~@(map first bindings)
      body)
    ~@(map second bindings)))
```

要進一步探討，就要問下面的問題。

### 什麼是 macro？

什麼是 macro？不同的語言給出了不同的解答。

對 C 語言來說，macro 就只是文字替換的機制。前面我們費心討論的問題到這裡根本沒有意義，反正 C macro 只能保障寫得出來，不保障產出的程式正確。

對 C++ 的 Template 來說，macro 就是 meta substitution。跟 C 的文字替換其實沒有太大分別，不過有一些小技巧可以提供還可以的錯誤報告。

到了 Clojure 這個程度，我們認為 macro 其實就是 compile-time function。錯誤報告的能力也有了，因此也是 syntax validator，但缺乏定位錯誤的能力（C++ 反而有相應功能）。

Racket 模型中語言是由多個 phase 組成的，phase 0 就是 runtime，phase 1, 2, 3... 都是 compile-time，數字越大越先執行。因此所謂的 macro 不過就是前一個 phase 裡的 function。

Lisp 的 f-expr 後來有個 [formal 改進版本](https://web.wpi.edu/Pubs/ETD/Available/etd-090110-124904/unrestricted/jshutt.pdf)，叫做 vau operator，這個 operator 定義出來的東西跟 $\lambda$ 很像，只是多一個參數拿環境。換句話說這樣的語言有 first-class environment。

到此我們知道 macro 有多種樣態，但萬變不離核心：製造「新」語法甚至「新」語義。

### Racket macro 進化史

前面說了這麼多，那 Racket/Scheme 又擁有怎樣的能力呢？1975 年最早的 `syntax-rules` 其實只有完成新語法的能力，並不能做更多事情。

```racket
(define-syntax let
  (syntax-rules ()
    [(_ ([var rhs] ...) body)
     ((λ (var ...) body)
      rhs ...)]))
```

到了 1988 年，`syntax-case` 引入了驗證語法的概念。

```racket
(define-syntax (let stx)
  (syntax-case stx ()
    [(_ ([var rhs] ...) body)
     (not (check-duplicate-identifier (syntax->list #'(var ...))))
     #'((λ (var ...) body)
        rhs ...)]))
```

我們可以用 `raise-syntax-error` 稍加改進

```racket
(define-syntax (let stx)
  (syntax-case stx ()
    [(_ ([var rhs] ...) body)
     (begin
       (for ([var (syntax->list #'(var ...))])
         (unless (identifier? var)
           (raise-syntax-error 'not-identifier "expected identifier" stx var)))
       (let ([dup (check-duplicate-identifier (syntax->list #'(var ...)))])
         (when dup
           (raise-syntax-error 'dup "duplicate variable name" stx))))
     #'((λ (var ...) body)
        rhs ...)]))
```

但這樣實在太麻煩也太醜了，所以 1993 年加入了 `syntax-parse`。

```racket
(define-syntax (let stx)
  (syntax-parse stx
    [(_ ([var:id rhs:expr] ...) body:expr)
     (check-duplicate-identifier (syntax->list #'(var ...)))
     #'((λ (var ...) body)
        rhs ...)]))
```

其中 `var:id` 會自動檢查 `var` 是不是 `identifer?`，也就不需要像 `syntax-case` 那樣大費周章只是為了驗證語法的類型。`id` 是 `syntax-class`，我們其實可以自己定義。

```racket
(define-syntax (let stx)
  (define-syntax-class binding
    #:description "binding pair"
    (pattern [var:id rhs:expr]))
  (define-syntax-class distinct-bindings
    #:description "sequence of binding pairs"
    (pattern (b*:binding ...)
             #:fail-when (check-duplicate-identifier (syntax->list #'(b*.var ...))) "duplicate variable name"
             #:with (var ...) #'(b*.var ...)
             #:with (rhs ...) #'(b*.rhs ...)))
  (syntax-parse stx
    [(_ d:distinct-bindings body:expr)
     #'((λ (d.var ...) body)
        d.rhs ...)]))
```

`syntax-parse` 這個名字其實已經說明了很多：這是一個完整的 parsing 工具。它甚至有 error selection 機制。

### Racket macro 現代模型

正如前一節所述，Racket macro 並不是突然就這麼厲害的，其中經過多年中許多人的改進才成為今天的樣貌。其中最重要的要屬 1986 年的 Hygienic Expansion，這是第一個解決 macro 展開後與目標環境變數衝突的機制。

但 1986 年的 Hygienic Expansion 有一些問題，這時的 Hygienic 是靠簡單的 renaming 實現的。

1. 不善應付遞迴定義的環境，假設 macro 引用到自己，正確實作的難度就很高，展開的 macro 也很笨重又難以反追蹤原本的程式
2. 面對 hygiene bending(e.g. `datum->syntax`) 沒有效率又很難實作

直到 2016 年的 [Binding as Sets of Scopes](https://www.cs.utah.edu/plt/publications/popl16-f.pdf) 才提出了新的模型：Scope sets。

其模型概念非常簡單：

- 為綁定處如 `let`、`lambda` 等 scope 生成新標籤，這些標籤必須獨一無二
- 內層擁有外層的標籤（lambda 捨棄上層標籤除外）。把當前層所有標籤連結到參考
- 參考往外尋找綁定處參考，擁有最大子集的綁定就是當前應該參照到的定義
- syntax 擁有的是一個標籤函數，端看展開位置(`eval`)決定函數要帶入什麼

```racket
(let ([x 1])  ; x{let1}
  (lambda (x) ; x{lambda1}
    x))       ; x{let1, lamdba1}
```

上面列出了各個 identifier 的 scope sets 做為參考。希望有助於理解 scope sets 的概念。

### Macro 與開發

到此，我們可以總結：macro 就是 compiler。而目前 macro 目前在開發上還有很多的問題。因為僅是創造出新語法是不夠的，新語法還必須是容易開發的。這本來是顯而易見的，在 compiler 上人人如此追求，等到了 macro 這邊，大家卻又忘了這麼一回事。寫不出好的 compiler 就寫不出好的 macro，而僅僅是白費力氣。

macro 總得來說最差勁的地方就是重構與 code navigation。沒有人知道怎麼重構一個新的語法，也不知道怎麼提示使用者補全它。也沒辦法跳到用 macro 定義的定義處。其中一個可行的方向是讓 macro 的作者提供相關的資訊，也是我接下來的計畫之一。racket 在這方面只能算是解決了一半，macro 作者可以利用 compile to define 或是提供 missing reference 提供跳到定義的功能，但補全還是空白一片。

然而還有更難解的問題，racket 的 first-class class 就是典型的例子。在保持 class 跟 racket 本身可以同時使用的前提下，寫不出可以不污染環境又可以跳到 method 定義的 class。因為 `new` 擦掉了 phase 1 的資訊，然而以 phase 0 帶資訊給 `send` 沒辦法提供 class information（被擦掉了）。這種困境顯然不只會出現在 class，而是任何具備擦除的 form，然而我們又不總是可以去修改 base language。

### 總結

希望讀者有更了解 macro，並且明白什麼時候該用，什麼時候不該。做出明智的判斷是每個開發者每天都會面對的挑戰 XD。
