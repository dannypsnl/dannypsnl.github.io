---
title: ocaml inline test 使用方式
date: 2025-02-12
tags:
  - software
  - ocaml
  - expect test
---

1. write OCaml inline test
2. run it
3. if output is proper, run `dune promote` to accept result

# command

```shell
# 分成兩步驟
dune test
dune promote
# 或是測試後直接更新
dune test --auto-promote
```

# OCaml code

```ocaml
let%expect_test "atest" =
  print_int 1;
  [%expect {||}]
```

# Dune config

```dune
(library
 (name xxx)
 (inline_tests)
 (preprocess
  (pps ppx_expect))
 (libraries))
```
