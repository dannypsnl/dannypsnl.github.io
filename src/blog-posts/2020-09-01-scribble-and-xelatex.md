---
title: "NOTE: scribble and xelatex"
categories:
  - cs
tags:
  - note
  - racket
  - scribble
  - latex
  - xelatex
---

scribble is a useful tool to create nice documents, however, with Chinese(any unicode character) it might produce some weird empty box for them. To solve this problem we need to create `style.tex`.

```latex
% style.tex
\usepackage{fontspec}
\setmainfont{Kaiti TC}
```

`Kaiti TC` can be changed to any supported fonts on your machine.

Then we have our scribble document.

```scribble
; test.scrbl
#lang scribble/manual

@(require scribble/core)

@title{Title}
@author+email["Danny" "dannypsnl@gmail.com"]

@para[#:style 'pretitle]{
 @elem[#:style (make-style "fontsize" '(exact-chars))]|{8pt}{12pt}|
 @elem[#:style "selectfont"]}

中文
```

Using command: `scribble ++style style.tex --latex test.scrbl`, it should produce `test.tex`, then eval `xelatex test.tex` should produce `test.pdf`. That is!
