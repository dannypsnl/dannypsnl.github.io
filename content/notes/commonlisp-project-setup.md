---
title: How to create a commonlisp project
tags:
  - software
  - commonlisp
---

```lisp
(ql:quickload "cl-project")
(cl-project:make-project #P"./path-to-project/root/")
```

It will create a directory with structure:

```
.
 |-..asd
 |-.gitignore
 |-README.org
 |-README.markdown
 |-src
 | |-main.lisp
 |-tests
 | |-main.lisp
```
