---
title: "How to disable Go test caching"
categories:
  - cs
tags:
  - golang
---

Go 的測試有一個很討厭的行為，那就是 test caching，它會儲存測試的結果然後導致失敗沒有被發覺

如果你的 Go 版本是 1.9，你可以嘗試用`go test -count=1`命令執行測試

`-count=1`參數會取消 test caching

你還有其他選擇，例如`GOCACHE=off go test`，這也會取消 test caching

期望這個問題可以很快得到解決
