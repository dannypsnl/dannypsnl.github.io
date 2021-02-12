---
title: "NOTE: 安裝 NixOS"
date: "Thu Feb  4 04:46:25 UTC 2021"
categories:
  - cs
tags:
  - note
  - nix
  - nixos
---

先到 [Download Page](https://nixos.org/download.html) 下載 Gnome, 64bit 這個 iso，在 macos 上可以用以下指令找出並把 iso image 弄進 USB

```shell
$ diskutil list
[..]
/dev/diskN (external, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
[..]
$ diskutil unmountDisk diskN
$ sudo dd if=nix.iso of=/dev/rdiskN
```

要記得把 `N` 換成正確的值，`nix.iso` 的檔名也要改對。完成之後把 USB 插到要安裝的電腦並調整開機選項讓 USB 優先之後應該會出現 NixOS Graphic installer 的介面，開進去之後打開 terminal 輸入（記得把 `/dev/sda` 換成正確的 disk device，可以用 GParted 看或是直接用 GParted 切）

```shell
$ sudo su
$ parted /dev/sda
(parted) mklabel gpt
(parted) mkpart primary 512MiB -8GiB
(parted) mkpart primary linux-swap -8GiB 100%
(parted) mkpart ESP fat32 1MiB 512MiB
(parted) set 3 esp on
```

由於採用 UEFI，需要三個 partition，切成 ext4、linux-swap 跟 fat32。

```shell
$ mkfs.ext4 -L nixos /dev/sda1
$ mkswap -L swap /dev/sda2
$ swapon /dev/sda2
$ mkfs.fat -F 32 -n boot /dev/sda3
```

mount

```shell
$ mount /dev/disk/by-label/nixos /mnt
$ mkdir -p /mnt/boot
$ mount /dev/disk/by-label/boot /mnt/boot
```

mount 好了之後生成 config

```shell
$ nixos-generate-config --root /mnt
# 按需要修改內容，檢查 hardware-configuration.nix 裡面的設置有沒有設定檔案系統相關的資訊（`fileSystems."/".device` 這種），沒有的話就是前面切的有問題需要修正
$ nano /mnt/etc/nixos/configuration.nix
$ nixos-install
$ reboot
```

這樣就大功告成可以開始設定電腦惹 wow
