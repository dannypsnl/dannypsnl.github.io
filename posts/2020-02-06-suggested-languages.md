---
title: "一些推薦去嘗試看看的程式語言"
categories:
  - cs
tags:
  - language
---

一如標題這篇是介紹程式語言的文章，比較特殊的是分類語言的方式主要是以能學到什麼觀念為重點。因此我不會去比較它們的範式(如 OOP, FP)或是語法的差別。另外順序跟重要度無關，每個數字標示的都是我推薦去嘗試看看的語言，而其中如果列出多個則代表擇一即可

我第一個推薦的類型是 Scheme/[Racket](https://racket-lang.org/)，Racket 是 Scheme 的平台跟語言變種，但就我目前所知應該沒什麼差異所以我就歸類為同一個語言了。這門語言的特點是一如所有 Lisp 家族，資料與程式之間的分界線相當模糊(這是很方便的特性)，也相當適合用來學習語言本身是怎麼建構的，功能強大的 [macro 系統](https://docs.racket-lang.org/guide/macros.html) 跟完善的環境設施可以讓我們實驗各式各樣的想法，另外也具有相當程度的科學輔助功能(像是這個 [畫 sin 函數的範例](https://docs.racket-lang.org/plot/intro.html#%28part._.Plotting_2.D_.Graphs%29) )。但要注意用這語言的人並不多，要有預期有問題很難找到人幫忙；同時不算太方便的開發工具會給編寫上帶來一些麻煩，得要一一克服。

第二個是 C，推薦它的理由是：在嵌入式設備環境裡沒有競爭者(但過幾年不好說，Rust 也在發展這塊)、適合用來深入學習馮·諾依曼架構、學會不要寫出有安全漏洞的 C 是很重要的、就算你不用 C 由於系統開的 API 以及其他語言寫的 API 幾乎都是 C call convention 所以還是躲不掉。最後套一句
[Matthew Might](http://matt.might.net/articles/what-cs-majors-should-know/) 大大說的：

> C is a terse and unforgiving abstraction of silicon.

雖然是有缺點但反正逃不掉所以還是不要介紹好了？

第三是 [Haskell](https://www.haskell.org/)，我要說明一下 Haskell 跟 Racket 算是同源，都是 lambda calculus 延伸出來的系統，但 Haskell 有個獨特的思考方式是它想要規範化副作用，藉由把對世界的影響抽象成 Monad 來達成這件事。而這種思考方式帶來的東西會是一件值得體驗的事物。強烈警告，它的模組系統很煩，而且用太多 type inference 是自虐。

接著是第四：Erlang/Elixir，Erlang 作為另一個思想奇特的語言，它的特點是 Let it crash 的哲學，這種想法鼓勵編寫者不去處理例外，而是只寫 happy path 讓會動的會動，讓不會動的重跑就好了。這可以說是與其神奇的運行環境 BEAM 脫不開關係，BEAM 可以隨時監控並重啟“行程”(這裏是指 Erlang 的而不是系統的行程)且不需要很多資源就能達成。而這樣的編寫哲學事實上也能應用在各種情況下，理解何時運用這種方式是我認為很重要的部分。Elixir 則是一個一樣運行在 BEAM 上由 Ruby 社群帶來的長得像 Ruby 的 Erlang。我個人是認為學哪個都可以。缺點也是身為超級小眾的語言，文件跟社群支持都有差，同時管理系統頗陽春，要做好大部分時間是在跟準備環境奮戰的準備。

再來五我推薦 [miniKanren](https://docs.racket-lang.org/minikanren/index.html) 與 Prolog，或是任一種邏輯編程工具，這可以讓我們稍微 mind blown 一下？關鍵是要去學習這種語言用起來有多爽，請試著讓寫出來的 API(無論是哪一種) 跟這玩意一樣好用！順帶一提 [The Reasoned Schemer, Second Edition](https://mitpress.mit.edu/books/reasoned-schemer-second-edition) 是很好的入門書籍

然後這裡是一些工作上比較可能出現的語言：C++, Java/Kotlin(Android), C#, Swift(iOS), Python, JavaScript/TypeScript(TypeScript 就是 JavaScript 加上型別系統)。

最後我要聲明語言比起工具更接近建築材料的地位，但無論如何不能取代編寫者的思考。不要去參與無聊的罵戰，也不要為了證明什麼浪費時間去用不方便的工具。這樣人生會好過多了。
