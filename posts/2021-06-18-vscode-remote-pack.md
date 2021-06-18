---
title: "VSCode remote developing"
date: "Fri Jun 18 02:24:38 UTC 2021"
categories:
  - cs
tags:
  - vscode
  - remote
---

First step, install [remote pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack). Now, at the left-button of your vscode should have a `SSH: ...` button. After clicked it, there will show some options. Let's select `Open SSH Configuration File...`, pick one, and put the following content into it(replaced with current value):

```
Host <host-ip>
  HostName <host-ip>
  IdentityFile <private-key-file>
  User <user-name>
```

After these, select `Connect to Host` option, now we can select remote path to develop now! It seems all good, but you find you lost your LSP and some plugins. That's fine, vscode supports installing plugins for remote, installing them. Now, you are good.
