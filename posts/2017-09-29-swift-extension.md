---
title: "Swift --extension概念入門"
categories:
  - cs
tags:
  - swift
  - extension
---

雖然 apple 在`extension`的文件中註記了

> NOTE<br>
> If you define an extension to add new functionality to an existing type, the new functionality will be available on all existing instances of that type, even if they were created before the extension was defined.

這樣的事實

你仍然不應該在不是定義`extension`的地方使用該屬性，這樣的分散性會導致未來的維護困難重重

- 在 goto 被視作優良設計的年代，我們問「所以究竟是從哪裡來？是執行了 a 區塊還是 b 區塊再執行我？」

- 在 callback 盛行的時候，我們問「究竟什麼時後執行了 callback？」

- 在共時的世界，我們問「是誰改變了狀態？」

每個設計都是一種抉擇，抉擇之後必然有其優勢與劣勢，問題在於如何善用優勢，而不是造成更多問題

`extension`啊`extension`，你比都定義在`class`好？

讓我們看看傳統的`class`如何做一個`cm => m`

```swift
class Meter {
  var _v = 0
  init(v: Double) {
    _v = v
  }
  var cm: Double { return _v/100.0 }
}

let onehundredCm = Meter(100).cm
```

這個實作語意不明，究竟是 100 公尺轉換成公分，還是公分變公尺？

如果我們想要更加明確的語意，就需要定義大量的輔助類別

例如：

```swift
class cm {
    var _v: Double
    var cm: Double { return _v }
    init(v: Double) {
        _v = v
    }
    func toM() -> Meter {
        return Meter(_v/100.0)
    }
}
let onehundredCm = cm(100).toM().m
let oneMeter = Meter(1).toCM().cm
```

不但複雜，而且可讀性依然有限

那`extension`呢？(以下做法來自 apple developer 網站的簡化)

```swift
extension Double {
  var m: Double { return self }
  var cm: Double { return self/100.0 }
}
let onehundredCm = 100.0.cm
```

哇，看起來好多了，對吧！

請考慮

```swift
let n = 100.0.cm.cm
// Oops，這是什麼鬼？
```

`extension`讓我們能對原生型別進行改動，但也使客戶端需要有更好的意志克制自己亂用的衝動

在 effective C++中，Scott Meyer 提到，類別的所有介面都應該是透過方法

他的論點如下：

> 如果你的介面有一個變數，那麼使用者可以對它進行改動，而這個改動可能並非你設計此型別時考慮過的使用順序(這也是 C 語言的弱點所在，它仰仗使用者知道自己在幹嘛，雖然通常不是那樣)，進而導致無解的 bug，而這個 bug 導致使用者不用你的程式庫了！即便這不是你的問題，然而你仍要為此負責

而方法的更多優點是，你可能會驗證傳入的值，再進行對值的改動，而使用方法做為介面者，可以在完全不影響客戶端程式碼的情況下完成新設計，此論點確實值得一試

回到 extension

```swift
let IWalk = 30.0.km + 20.0.m
```

`extension`給了你很好的彈性來設計一門優良的限定領域語言，而這不需要太複雜的技術與知識，只需要簡單的加上幾個屬性

再回到一開始的狀況，事實上，對於該問題，只使用`extension`或`類別`都是錯的

混用才能達成我們心目中的效果

例如：

```swift
extension Double {
    var cm: CM { return CM(self) }
}
class CM {
    var _v: Double
    func toM() -> Double {
        return Meter(_v/100)._v
    }
    init(v: Double) {
        _v = v
    }
}
```

使用起來就像

```swift
let onehundredCm = 100.cm.toM()
```

少了一些彈性，但是出現奇怪行為的機會也因此下降，更重要的是盡量不要擴展基本型別，這件事帶來的壞處往往大於好處

那麼`extension`適合哪些狀況呢？

第一，利用此特性可以減少你需要打的字，而且能夠提升程式碼的可理解性，例如替容器型別定義`subscript`運算子

第二，限定於此情此景的函數解決方案，例如在一個解析器裡，只有在印出錯誤訊息時，我們才會關心錯誤發生在哪，這時候再定義一個`positionFormat`函數格式化輸出

第三，型別定義太過冗長，這時在同一個檔案裡用`extension`替函數分組也是不錯的寫法

好吧，你問為什麼特化解法寫在`extension`，你就這麼確定其他地方用不上？

當然不是，只是其他地方用上的時候，把`extension`移到型別定義的檔案中就好

這時就變成了 3 的情況啦
