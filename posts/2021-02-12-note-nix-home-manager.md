---
title: "NOTE: Nix home-manager 基本設定"
date: "Fri Feb 12 10:21:53 UTC 2021"
categories:
  - cs
tags:
  - note
  - nix
  - home-manager
---

home-manager 會讀取 `.config/nixpkgs/home.nix` 並套用裡面的設定（config），所以我們可以用一個 git repository 管理並用

```shell
ln -s $(pwd)/home.nix ${HOME}/.config/nixpkgs/home.nix
```

把設定掛到 home-manager 讀取的位置。一個基本的設定檔內容如下：

```nix
{ config, pkgs, ... }:
{
  programs.home-manager.enable = true;
  home.username = "$username";
  home.homeDirectory = "/home/$username";

  home.stateVersion = "21.03";

  home.packages = with pkgs;
    [
      // 你想安裝的套件，以下為示範
      tig
      curl
      silver-searcher
    ];
}
```

當然，不是任意字串都可以寫進去，套件是否存在可以到 [nixos search packages](https://search.nixos.org/packages) 頁面裡搜尋確認。

某些常見的程式已經被寫死進 home-manager 中，因此可以得到更仔細的設定，如 `zsh`：

```nix
{ config, pkgs, ... }:
{
  // ...

  programs.zsh = {
    enable = true;
    enableAutosuggestions = true;
    enableCompletion = true;

    oh-my-zsh = {
      enable = true;
      plugins = [ "git" "dotenv" "osx" ];
      theme = "robbyrussell";
    };

    shellAliases = {
      ls = "ls -GFh";
      ll = "ls -l";
      la = "ll -a";
      vi = "nvim";
      vim = "nvim";
    };
  }

  // ...
}
```

還可以用 `home.file."$filename".text` 控制 home 目錄下的檔案內容，例如 `agda` 就需要設定 `~/.agda/defaults` 跟 `~/.agda/libraries`，如下：

```nix
{ config, pkgs, ... }:
{
  // ...
  home.file.".agda/libraries".text = builtins.readFile ./agda/libraries;
  home.file.".agda/defaults".text = builtins.readFile ./agda/defaults;
  // ...
}
```

`builtins.readFile` 後面接的檔案位置是相對於當前 `home.nix` 的位置。
