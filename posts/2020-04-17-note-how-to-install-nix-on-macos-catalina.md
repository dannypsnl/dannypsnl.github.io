---
title: "NOTE: how to install Nix package manager on MacOS Catalina"
categories:
  - cs
tags:
  - note
  - nix
  - macos
  - catalina
---

Since MacOS Catalina adds some new rules, root path cannot be used by applicatin now, caused Nix package manager cannot work! The problem is Nix stores all data in `/nix` this path. Unfortunately, Catalina disallows that. To solve thi s HeI write this note for solution.

From [zetavg's comment](https://github.com/NixOS/nix/issues/2925?fbclid=IwAR1Sjr2TbcbtBxoMGFNe2jvl_sRKubUwlbY4rfOjIHLX-9idnD37-Crxxwk#issuecomment-593066225):

```shell
# Create a volume for the nix store and configure it to mount at /nix.
wget https://raw.githubusercontent.com/LnL7/nix/darwin-10.15-install/scripts/create-darwin-volume.sh
bash create-darwin-volume.sh
# The following options can be enabled to disable spotlight indexing of the volume, which might be desirable.
sudo mdutil -i off /nix
# Hides the "Nix Store" disk on Desktop, need to relaunch Finder to see effect. Will not be necessary after the PR comment https://git.io/Jv2xT is accepted.
sudo SetFile -a V /nix
```

Probably a better one? [https://hackmd.io/@z/nix-store-macos-tm-recover](https://hackmd.io/@z/nix-store-macos-tm-recover)

Thanks [zetavg](https://github.com/zetavg)!
