---
layout: post
title: "Introduction Of Char Recognizing -- Lexer Tech"
categories: compiler lexer rust
tags:
  - compiler
  - lexer
  - rust
---

> 此篇使用Rust作為演示實際程式碼的語言

說到Lexer技術，大家應該都會想到正規表達式，但是為什麼是正規表達式呢？
所以我們要介紹整個掃描並辨識字詞的技術與原理

最簡單的辨識單字技術是大家都能直接想出來的方法，就是character-by-character演算法

其技術原理非常簡潔，如果要辨識`new`，我們會怎麼做呢？

<script src="https://gist.github.com/dannypsnl/53e8b814c7407e8621fbe05d45e7cb67.js"></script>

可以看出為什麼每個人都想得出來吧！因為整個CBC的邏輯就是完全符合的字串就是我們要的字串

但是問題來了，如果我們想要辨識`night`怎麼辦呢？每個我們想要的字串都寫一個辨識程式的話，那不是很浪費空間跟時間嗎？
所以我們需要縮減程式，如何縮減？

我們可以很輕鬆的發現其實`new`與`night`的第一個字元都是`n`，所以我們可以把程式變成：

<script src="https://gist.github.com/dannypsnl/097fe61c1bbbf7835cbd14336fc66cda.js"></script>

這樣的簡化對問題的根源沒有幫助，但是引出了重點，我們可以有多種線路的選擇，那麼能不能讓多種線路移至同樣地狀態呢？
答案當然是可以的。為了說明清楚我在說什麼，讓我們用圖來描述`is_new`做了什麼：

<div id="state_machine_graphic_of_new"></div>

`s0`是我們的初始狀態，紅色代表接受狀態，所謂接受狀態你也可以說是辨識成功，一般來說我們會省略錯誤狀態，你只要找不到對應的`edge`我們就會移至錯誤狀態

那麼我們再看與規則`night`結合後的圖

```
   n     e     w
s0 -> s1 -> s2 -> s3(sª)
         i     g     h     t
         -> s4 -> s5 -> s6 -> s7(sª)
```

所以所謂的多種線路移至同一狀態是什麼意思呢？假設我們要辨識一個英文單字，我們只需要是`a..z`(不管大小寫)都接受，所以圖就是：

```
   a     a
s0 -> s1 -> s1 -> ... -> s1
   b
   -> s1
   c
   -> s1
   ...
   ...
   ...
   z
   -> s1
```

可以發現模式是重複而無限的，所以我們可以簡化成：

```
  a..z
s0 -> s1 <--
      |    | a..z
       \__/
```

ps. 這裡的`s1`就是`sª`

那麼這樣的狀態圖要如何實作呢？

<script src="https://gist.github.com/dannypsnl/301605038c23d828acc1447ced5f9cf4.js"></script>

就跟圖一樣需要用個迴圈處理重複的工作，當然你也可以用遞迴的方式實作：

<script src="https://gist.github.com/dannypsnl/12fe67d584857d1810f5d460f77d12af.js"></script>

看完思想跟實作之後，讓我們深入了解數學定義吧！
我們稱這種辨識技術為`有限狀態自動機`(`Finite Automata`)，其數學式由五個元組組成。
分別是：`S`, `∑`, `∂`, `s0`, `sª`

`S`代表所有狀態的集合(包含錯誤狀態)，`∑`代表所有邊界標籤的聯集，`∂`代表所有轉換函數的集合，`s0`是初始狀態，`sª`是接受狀態

以一開始的`new`為例：

```
S = {s0, s1, s2, s3, se}
∑ = {n, e, w}
∂ = {
     n
  s0 -> s1,
     e 
  s1 -> s2,
     w
  s2 -> s3,
}
s0 = s0
Sª = {s3}
```

很明顯的，FA的表示法非常麻煩，那麼就回到大家熟悉的正規表達式了。
我不贅述怎麼寫正規表達式，有很多專門介紹正規表達式的文章了

以`Antlr`的`new`為例：

```antlr4
NEW: 'new';
```

`'`中就是正規表達式了

像上面辨識單字的程式可以表示成

```antlr4
WORD: [a-zA-Z]+;
```

`[]`中是字元集，`+`表示至少match一個

關於Lexer，可以算是告一段落，哪天應該會寫一下Parser那的技術

總結一下，我們今天學到的是狀態機的概念與各種常見實作，如果真的弄懂的話，手刻一個自己的Lexer應該不是難事，如果有任何疑難都可以在下面留言，我會盡力回答

### References:

#### [Engineering a compiler](https://www.elsevier.com/books/engineering-a-compiler/cooper/978-0-12-088478-0)
- Author: Keith D. Cooper & Linda Torczon
- ISBN: 978-0-12-088478-0

#### [Programming Rust](http://shop.oreilly.com/product/0636920040385.do)
- Author: Jim Blandy & Jason Orendorff
- ISBN: 978-1-491-92728-1

#### [Compilers: principles, techniques, and tools: 2E](https://www.amazon.com/Compilers-Principles-Techniques-Tools-2nd/dp/0321486811)
- Author: Alfred V. Aho & Monica S. Lam & Ravi Sethi & Jeffrey D. Ullman
- ISBN: 978-986-154-936-1(Traditional Chinese Version)


<script>

d3.select("#state_machine_graphic_of_new")
  .style("background-color", "#e8e8e8")
  .style("font-size", "18px")
  .append("svg")
var svg = d3.select("#state_machine_graphic_of_new > svg");
function newline(svg, x1, y1, x2, y2) {
  svg
  .append("line")
  .attr("x1", x1)
  .attr("y1", y1)
  .attr("x2", x2)
  .attr("y2", y2)
  .style("stroke", "black")
  .style("stroke-width", "2px")
}
function newcircle(svg, r, x, y, color) {
  svg.append("circle")
    .attr("r", r)
    .attr("cx", x)
    .attr("cy", y)
    .style("fill", color)
}
function newtext(svg, x, y, text) {
  svg.append("text")
    .attr("x", x)
    .attr("y", y)
    .text(text)
}

newtext(svg, 53, 70, "n")
newline(svg, 30, 80, 90, 80)

newtext(svg, 115, 70, "e")
newline(svg, 90, 80, 150, 80)

newtext(svg, 175, 70, "w")
newline(svg, 150, 80, 210, 80)

newcircle(svg, 20, 30, 80, "gray")
newtext(svg, 18, 88, "s0")

newcircle(svg, 20, 90, 80, "gray")
newtext(svg, 80, 88, "s1")

newcircle(svg, 20, 150, 80, "gray")
newtext(svg, 140, 88, "s2")

newcircle(svg, 20, 210, 80, "red")
newtext(svg, 199, 88, "s3")
</script>