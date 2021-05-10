---
title: "Lean 4, Idris 2 安裝"
date: "Tue Jan 19 13:41:55 UTC 2021"
categories:
  - cs
tags:
  - note
  - plt
  - installation
  - idris
  - lean
---

# Lean 4(nightly)

```shell
curl https://raw.githubusercontent.com/Kha/elan/master/elan-init.sh -sSf | sh
elan default leanprover/lean4:nightly
```

### Editor

- [VSCode](https://github.com/leanprover-community/vscode-lean4)

# Idris 2

```shell
brew install idris2
nix-env -i idris2
```

### Editor

- [vim](https://github.com/edwinb/idris2-vim)
- [emacs](https://github.com/redfish64/idris2-mode)
