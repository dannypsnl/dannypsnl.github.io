---
title: ocaml sedlex
date: 2025-02-12
tags:
  - software
  - ocaml
  - sedlex
---

因為 OCaml lexer 預設沒有對 unicode 的處理方式，更合適的 lexer 程式庫是 [sedlex](https://github.com/ocaml-community/sedlex)，以下案例取自 https://github.com/ocaml-community/sedlex/blob/master/examples/repeat.ml

```ocaml
let rec token buf =
  match%sedlex buf with
    | white_space ->
        print_endline "\tWhitespace";
        token buf
    | 'a', Rep (white_space, 1) ->
        print_endline "a\n\tWhitespace";
        token buf
    | Rep ("bc", 2) ->
        print_endline "bcbc";
        token buf
    | Rep ("d", 1 .. 1) ->
        print_endline "d";
        token buf
    | Rep ("ef", 1 .. 3) ->
        Printf.printf "%s\n" (Sedlexing.Utf8.lexeme buf);
        token buf
    | eof -> print_endline "\tEnd"
    | any ->
        print_endline "Other";
        token buf
    | _ -> failwith "Internal failure: Reached impossible place"

let () =
  let lexbuf = Sedlexing.Utf8.from_string "a bcbc d ef efef efefef" in
  token lexbuf
```
