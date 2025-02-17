---
title: ocamlformat preserve begin end block
tags:
  - software
  - ocaml
  - formatter
---

```dune
profile = janestreet
version = 0.27.0
exp-grouping = preserve
```

Then I can have

```ocaml
begin
  ...
end
```

instead get

```ocaml
(...)
```
