---
title: "nix report"
categories:
  - cs
tags:
  - nix
  - shell
---

This article is created as a record of the feedback of the usage of nix, also stand for learning how to use nix in daily developing life. Remember I would not dig into the implementation or model concept inside of nix but all about how to use it to improve the developing environment.

### Install

To install nix all you have to do is running: `sh <(curl https://nixos.org/nix/install) --no-daemon` and follow the content, provided by the script after the script installed process down, on Linux or macOS.

To avoid outdated information, here is the [single-user installation](https://nixos.org/nix/manual/#sect-single-user-installation)(which you do above), and the [multi-user installation](https://nixos.org/nix/manual/#sect-multi-user-installation).

### Introduction

After installation, you would get several different commands for different purposes. I would introduce them one by one(only for those I'm using).

#### nix-env

`nix-env` is like `brew` for MacOS, `apt-get` for Ubuntu, `yum` for CentOS, but for all platform with nix. This command is the first one command would help immediately. You can do: `nix-env -i go` or `nix-env --install go`, after that let's check the binary `go` by `which go`, is located at `$HOME/.nix-profile/bin/go`. You can also use different channel(package source) for self-deployed packages or any other is not provided by nix channel.

Use `nix-env --help` to get more information

#### nix-shell

`nix-shell` would read `shell.nix` or fallback to read `default.nix` these config files. To understand what we do in it we need an example:

```nix
let
  pkgs = import <nixpkgs> { };
  inherit (pkgs) mkShell;
  inherit (pkgs) haskellPackages;
  inherit (haskellPackages) cabal-install;
  inherit (haskellPackages) stylish-haskell;

  ghc = haskellPackages.ghcWithPackages (pkgs: with pkgs; [base mtl]);
in
mkShell {
  buildInputs = [
    ghc
    cabal-install
    stylish-haskell
  ];
}
```

`mkShell` would return a shell by its argument set: `{}`, at here we can take a look at `stylish-haskell` this Haskell formatter, in `nix-shell` environment type `which stylish-haskell` would get `/nix/store/qqj9ldclapfbxhnvb357mjy5d5rjg6ip-stylish-haskell-0.9.2.2/bin/stylish-haskell`, and if you quit the environment should won't have the binary.

#### nix-build

Now, we already introduce the global level installer and project level installer. We have to go into how to create your own package.

`nix-build` would read `default.nix` to use its value as your package. Let's take a look at what it means.

```nix
let
  pkgs = import <nixpkgs> { };

  dependencies = import ./deps.nix;
in
  pkgs.haskellPackages.callPackage ./little-scheme.nix { dependencies=dependencies; }
```

Ignore `deps.nix`, that's a list has all Haskell dependencies I used.

`pkgs.haskellPackages.callPackage` creates a haskell package via it's argument. Let's dig into what `little-scheme.nix` do:

```nix
{ mkDerivation, base, mtl, dependencies, stdenv }:
mkDerivation {
  pname = "little-scheme";
  version = "0.1.0";
  src = stdenv.lib.sourceFilesBySuffices ./. [".hs" ".cabal" "LICENSE"];
  isLibrary = false;
  isExecutable = true;
  executableHaskellDepends = [ base mtl ] ++ dependencies;
  license = stdenv.lib.licenses.mit;
}
```

`src` be set to `stdenv.lib.sourceFilesBySuffices ./. [".hs" ".cabal" "LICENSE"]`, this line means only `.hs`, `.cabal` and `LICENSE` would lead a new build.

`executableHaskellDepends` would take a list of Haskell libraries.

`{}: expression` is a function. `{}` use pattern matching to extract the value from input set. `a: c` is take `a` return `c`, `a: b: c` is take `a` return `b: c`, consider to read [lambda calculus](https://en.wikipedia.org/wiki/Lambda_calculus) to understand the function in nix.

### Advanced use case

#### direnv

`direnv` is a powerful shell environment extension, it loads or unloads an environment depending on the current directory. To install it we can execute `nix-env --install direnv`, then add `eval "$(direnv hook zsh)"` at the end of `$HOME/.zshrc`([for others shells](https://github.com/direnv/direnv/blob/master/docs/hook.md)).

`direnv` supports using nix as environment configuration, you can put `use_nix` in the `$dir/.envrc`, and it would watch `$dir/shell.nix` and `$dir/default.nix` to update the environment. However, the current version `use_nix` has cache missing issue, so you can just copy whole content from [https://github.com/kalbasit/nur-packages/blob/master/pkgs/nixify/envrc](https://github.com/kalbasit/nur-packages/blob/master/pkgs/nixify/envrc), and put `use_nix -s shell.nix` in the `$dir/.envrc`.

p.s. A minor issue is `direnv` do not work with `alias`, so probably still have to use `$HOME/.zshrc` to manage them.
