---
title: "最後一次抱怨 Go"
categories:
  - cs
tags:
  - golang
  - language
---

一如標題這是我最後一次去寫對 Go 的公開抱怨，而這不是因為我終於能夠接受它了，而是對其設計與文化感到徹底的失望。有些人可能知道我對這門語言曾經抱持的過度熱愛，我甚至寫過數個盡情發揮 meta programming 技巧的程式庫與多篇包含模式、concurrency、測試等等的介紹文章。當時我缺乏對語言設計的認識，可以說是抱持對 Google 的憧憬(而這當然也已經不存在了)、對語法與創造者們的宣言而對它抱持信心，在現在來看是可笑的。在這裏我先說結論，我不會再抱怨 Go 並不是拒絕使用它，已經用了的專案就那樣了，語言好不好跟專案好不好完全是兩回事，已經參與的專案與工作當然會繼續做，只是不會再推人去學 Go 或是優先考慮用 Go 去開發新的專案，而我們也必須先有個共識是所有的語言都有其缺陷與不好用的地方，這些東西有的是設計失誤(極少，雖然接下來要說的就是一連串的設計失誤)、有的是 trade-off、更多的是社群相關專案的支援度好不好(包含但不只是開發工具，也包含特定領域的程式庫支援，像寫 ML 不用 Python 的很少)等問題

正式開始噴之前我必須承認 Go 仍然擁有一些優勢以及我欣賞的東西，這裡面包含了其指令自身，`go` 是我用過的指令裡面功能最齊全的，`go build`, `go install`, `go get` 等工具讓開發成為了一件開心的事情，我不用像使用 Python 時要考慮各種工具(我跑了 `virtualenv` 了嗎？套件管理是不是用 `pip` 呢？)，更不用說 JavaScript 那套煩人的工具鏈(像是 [babel](https://babeljs.io/) 怎麼設才能用我們最新的 es xxxx)，或是像 C++  那樣大量的 dependency 要一直等它編譯好，甚至要自己手動編譯。Go 相比於 C 是一個進步，自動記憶體管理確實是個好東西，C++ 不去用 smart pointer 我也會寫出記憶體存取錯誤；`context` 也是一個很好的抽象，除了尚未建立完善的使用守則之外可說是相當方便的設計

那麼接著我就開始列舉現存的與即將被引入的各式設計問題吧

### error handling 與變數重用

我們可以用 `v, err := f()` 得到值 `v` 與錯誤 `err`，許多人宣稱與 Java 那些用 exception 的機制比起來好處是我們必須去處理錯誤。這個說法不完全正確，Java 是有強迫你去處理錯誤的！請注意一下 checked exception 的用途就是你必須處理錯誤或是不負責任的把它上拋，但另一些用 exception 的語言選擇放棄這個好用的設計，所以這個說法算是對了一半。但要注意 C# 也有人寫了用註釋輔助的 checked exception，任何腦子清楚的團隊最後應該都會使用類似的工具，就像從 stackoverflow 上看到的：

> Well, except if you think `Will fail under some circumstances` is how you'd like to describe your API.

所以我對他們的結論存疑，不幸的是即使單純看 Go 本身都能夠對這個結論存疑：

```go
err := foo()
err = bar()
if err != nil {
	// handle error
}
```

Go 對這裡的處理實際上是這樣的，`err`  被 `foo()` 創造了出來，它被 `bar()` 修改，它有被 `if err` 這裡用上，所以這個變數有被用到，額... 來思考一下這是什麼意思，換句話說 error 在 Go 裡完全就是個普通的變數，語意檢查完全不在乎你有沒有處理錯誤，雖然我們在乎。我知道有些人會抗辯這是 UNIX 哲學之類的，說它不是試圖阻止蠢人做蠢事，對這種信教者我沒辦法說什麼；而另一群稍微正常點的人會質疑你怎麼會寫出這樣的程式碼，這其實有兩個可能

1. 過大的函數
2. error 就只是個值的看法

關於過大的函數，有時候這是合理的，函數並不應該按照長度拆分，當一個抽象就是那麼複雜的時候試圖去減少該函數的表象複雜度其實很蠢，好的嘗試是去想更好的抽象方式，而隨意拆分它反而會讓錯誤的設計被大量的拆分隱藏，可以說是在自我欺騙。而且 NASA 以及 code complete 中的某些研究指出函數並非越小就越少 bug 與許多人的認知不同相當值得注意

關於第二點它是怎麼促成問題的呢？error is value 這個想法初出現的時候我還興奮了一下子，它的概念是這樣的，error 既然只是個值那我們就能夠小小改造一下 error flow

```go
type Foo struct {
    err error
}

func (f *Foo) foo() {
	if f.err != nil {
		return
    }
    f.err = doFoo()
}
func (f *Foo) bar() {
	if f.err != nil {
		return
    }
    f.err = doBar()
}
// 分隔
f := &Foo{}
f.foo()
f.bar()
if f.err != nil {
	// handle error
}
```

看起來很精巧而且沒有問題？問題可大了，試試不寫 `if f.err != nil` 看看，這不就忽略了前一個錯誤了嗎？現在想想如果這段程式是驗證客戶資料再讓他做跟錢有關的操作，現在等於沒驗證的客戶也繼續操作下去，不被開除才有鬼。然而真正的問題在於這問題本來是不存在的(在 exception 存在之後)，Go 卻兩手歡迎這項錯誤的設計回來(這幾乎都是上一代設計的語言才存在的問題居然在 2009 年被重現)。而這只能依靠工程師的小心或靜態分析工具，但這個問題對靜態分析工具來說特別麻煩，尤其是如果你還想分析一下 dependencies 的話，想想還是算了，我們還是當所有程式庫都知道用什麼靜態分析工具解決這個問題好了

而更糟糕的是因為 error 真的沒有得到語意檢查的特別對待，下面那段程式碼是真的出現在某大公司開出來的 API 的：

```go
// 說明一下第一個 nil 是這個 API 回傳 pointer to structure 的 nil
// 第二個 nil 是 Go 裡不回傳 error 的“慣例”
return nil, http.StatusNotFound, nil
```

根據該程式庫工程師的回覆他們認為 request 得到 `http.StatusNotFound` 是作為“正常”結果的，對第一個我們想得到的值我們得再檢查一次是不是 `nil`，當然後來他們承認這是個違反慣例的作法並且修改為回傳 `nil, http.StatusNotFound, err`，舉這個例子不是想要說他們不對，事實上這只是認知的差別，真正的問題是 Go 模糊了錯誤跟正常的分野，使得溝通成本的上升(現在我們得知道開發者到底是忘記慣例還是不認為這麼做合理)

這種“慣例”根本就只是在浪費時間，如果真的要看怎麼不用 exception 的語法的話，Haskell 跟 Rust 那一派的 Either/Result, Maybe/Option 才是更好的作法，藉由型別強制使用前必須處理可能的錯誤(雖說這跟 exception 可說是一樣的機制)

所以說問題根本不是 `if err` 要重複寫，這種用個 code snippet 就能解決的問題根本算不上問題(GoLand 裡打 `err` 就會自動出現 `if err` 的生成模板了)，而是 Go 的 error handling 整體上給了各種讓 error check 失效的方式，而這並不是我們原本想要的

小結：Go 並沒有保證錯誤會被處理

### cgo

cgo 是另一個令人失望的決定，它不僅是缺乏可移植性，也與 Go 的其他部分格格不入。一段用上 cgo  的程式庫難以用 `go get` 來取得，而連結性更是讓人感到煩躁，我的實際使用經驗是一個用了 cgo 的 dependency 等同要求我們要自己為它準備另一套編譯環境，而且 cgo 會為每一份 go 檔案連結一次 c dynamic library，換句話說重複符號成了不可避免的事(只要我們使用的程式庫沒有完全包好導致我們需要自己去呼叫 C library，不幸的是其實還蠻常發生的)；另外就算這些都不是問題，要是我們使用的程式庫有選擇編譯的選項的話(更討厭的是有用 Makefile 控制的)，就必須去複製程式庫的編譯選項(這代表的是我們要根據不同版本準備不同的建置環境，而且要認識到現在我們可沒法用 `go build`)，因為 go 沒有厲害到知道要去認 Makefile 的編譯選項，也就是說我們只能在自己的程式庫裡重複 dependency 準備的環境，要是兩個用上 cgo 的程式庫之間有配置衝突的話就更煩人了

小結：cgo 完全不是個適合與 C 協作的模型，它把大量的細節操作責任上拋到 application 的開發者身上，傳統的 external 抽象並沒有什麼問題是嚴重到需要用 cgo 取代的，反而是 cgo 製造了更多的問題

### 多回傳值

多回傳值也就在一開始看起來不錯而已，很快地開發者就會認識到除了回傳 `v, err` 根本就不應該有多回傳值，這是一個修改難度的問題。當我們需要將一段程式如下

```go
func xxx() (X, Y) {
	//...
}
```

修改為

```go
func xxx() (X, Y, Z) {
	//...
}
```

這不只是修改函數簽名這麼簡單而已，也意味著所有呼叫點都受到了影響，現在他們全都要加上一個新的變數。可以想想用 structure 包覆的話怎麼會有這個問題，多回傳值隱藏了設計上我們對函數的回傳值沒有清楚認知的問題

事實上這個問題也不是 Go 專屬，許多函數式語言的 pattern matching 亦沒有考慮到省略值的情況導致了類似的問題，使得多餘的修改存在

小結：多回傳值乍看方便實為設計失誤，導致使用者需要修改呼叫點

### 泛型的爭論

應該幾乎每個 Go 的使用者都看過甚至參與過對泛型的爭論，就結果而言 Go 團隊最後還是認識到了泛型的必要性然後開始了一些設計，然而這帶來了一些新問題，他們引入了 `contract` 這個概念，毫無疑問的與現存的 `interface` 具備功能上的衝突，如下案例，`contract` 比 `interface` 這個抽象更好，無疑的這裏可以讓 `[]T` 不必轉型為 `[]fmt.Stringer`，且真正重要的是不需要重新配置 `slice`

```go
contract stringer(T) {
	T String() string
}

func Stringify(type T stringer)(s []T) (ret []string) {
	for _, v := range s {
		ret = append(ret, v.String())
	}
	return ret
}
```

但 `contract` 有幾個讓人迷惑的地方

```go
contract Sequence(T) {
	T string, []byte
}
```

這意味著 `T` 只能是 `string` 或 `[]byte`，但這實在沒辦法說服我這是試圖讓程式庫跟調用方解耦，顯然使用者無法擴展 `Sequence` 去使用任何可能存在的改進方案

```go
type Graph (type Node, Edge G) struct {
	// ...
}

contract G(Node, Edge) {
	Node Edges() []Edge
	Edge Nodes() (from Node, to Node)
}

func New (type Node, Edge G) (nodes []Node) *Graph(Node, Edge) {
	// ...
}

func (g *Graph(Node, Edge)) ShortestPath(from, to Node) []Edge {
	// ...
}
```

這裏 `G` 神奇的接收了兩個型別參數，但如果想要讓 `Node` 符合多個 `contract` 呢？我是看不出來他們能怎麼放，顯然這又是一個試圖在語法上與其他語言做區別而硬搞出來的奇怪設計

要說怎麼改的話，我認為就直接把 `contract` 拆出去獨立就好了：

```go
contract stringer(T) {
	T String() string
}

func Stringify(type T)(s []T) (ret []string) where stringer(T) {
	for _, v := range s {
		ret = append(ret, v.String())
	}
	return ret
}
```

用 `where` 作為分隔符來避免與回傳值語法衝突，如果真的要 `contract` 的話這漾總比不知道怎麼符合多個 `contract` 好，我大概可以看出來他們想讓語法縮短，但語法複雜比起不一致性根本就是小問題罷了

在[官方 draft](https://github.com/golang/proposal/blob/master/design/go2draft-contracts.md#passing-parameters-to-a-contract)裡同樣討論了這個問題，雖然是稍微不太一樣的情況，可惜的是他們只是換個方式繼續歪打：

```go
func MapAndPrint(type E, M stringer(M))(s []E, f(E) M) []string {
	r := make([]string, len(s))
	for i, v := range s {
		r[i] = f(v).String()
	}
	return r
}
```

這段 `M` 符合 `stringer`，而下面的程式 `E`, `M` 都符合 `stringer`

```go
func MapAndPrint(type E, M stringer)(s []E, f(E) M) []string {
	r := make([]string, len(s))
	for i, v := range s {
		r[i] = f(v).String()
	}
	return r
}
```

我就不贅述這些天知道他們到底有沒有使用過的語法了，接下去的 draft 已經開始描述實作方式了，我們就祈禱最後官方還是有想清楚他們到底設計了什麼好了

### 文化

應該很多人都知道[Go is Google's language, not ours](https://utcc.utoronto.ca/~cks/space/blog/programming/GoIsGooglesLanguage)，在評論結果的好壞之前我們得正視問題並不在結果，而是可能的方案不斷被一言堂否決的情況，Go core team 不是為社群服務，而是為 Google 服務

雖然 Go 不斷形塑作為 UNIX 精神後繼者的樣貌，但 Go 絕非 UNIX 文化，Go 的目標是令所有開發人員平庸，因為你不可能用 Go 簡化你的工作，這不是它的目的，Go 的目的是讓你的產出跟同事的沒什麼不同，進一步的降低公司的成本(如果真的有的話)。Go 根本不在乎工程師們，它的設計原則是要讓每個人都能被替換掉，這可能是 Google 需要的，但我們真的要想想我們是不是真的想讓重複的勞動取代有價值的抽象思考。用實驗去理解如此缺乏抽象能力的語言是不是真的能夠讓開發成本下降

這些才是我真正想說明的，Go 只不過是這種文化下的產物，是對“大神”崇拜帶來的無腦現象。工程本不該有崇拜與派別的區分，一個人再厲害也是有極限的，尊重跟合作才能帶來更好的成果，我希望看過這些，我們能夠達成語言只是工具，而不同的思考才是人的價值，進而尊重團隊的每個成員

期許我們會在語言設計上導入與 UX 一樣的實驗，實際驗證功能是否真的幫助了使用者，而不只是依靠開發者的名聲。為了不再盲目崇拜
