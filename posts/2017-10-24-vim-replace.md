---
title: "Vim replace"
categories:
  - cs
tags:
  - vim
---

在 Vim 中

找出文字並修改不是一件複雜的事

你只需要

`:Start, Ends/You want to replace/You want to get/g`

`:`是進入命令模式

`Start`和`End`都是行號的代號，你可以用數字 1, 2, 3...

也可以是特殊字元，例如\$是最後一行

接著`s///g`是取代命令，`s/你想取代的/你想顯示的新字串/g`

字串使用正規語言進行比對

例如：

```bash
  [a-zA-Z]+

  \".*?\"
```

等等

最後，如果想要一次套用多個命令

使用 `|` 字元來分隔不同命令

例如：

`:1,$s/Care/Car/g | 1,$s/Circlew/Circle/g`
