---
layout: post
title: "File IO under Linux"
categories: linux SystemProgramming
tags:
  - linux 
  - SystemProgramming
---

系統程式最重要的部分就是系統呼叫，了解系統提供的能力是利用系統的第一步

而檔案操作是常見且實用的技巧，今天就用幾個基礎的函式作為開篇

`open()`系統呼叫用來打開檔案，根據Linux man page，我們需要以下標頭檔

```c
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
```

而函數原型有

```c
int open(const char *pathname, int flags);
int open(const char *pathname, int flags, mode_t mode);
```

我們先不深入細節，還有一個函數是`creat()`，但是一般我們不使用它，它之所以存在是因為早期Unix系統中，`open()`僅有2個參數，
無法用來建立新檔案，而是使用`creat()`系統呼叫建立並開啟新檔案

```c
#include <fcntl.h>
int creat(const char *pathname, mode_t mode);
```

`creat()`的行為是：根據pathname建立並開啟檔案，若檔案已存在，則開啟並清空檔案。
等價於`fd = open(pathname, O_WRONLY | O_CREAT | O_TRUNC, mode)`呼叫

雖然某些舊程式依然存在`creat()`，但`open()`提供更多更細的控制方式，所以傾向於使用`open()`

回到`open()`，它又有什麼值得關注的細節呢？

