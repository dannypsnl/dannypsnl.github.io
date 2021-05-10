---
title: "How to use .gitignore"
image: ../images/git/gitignore.png
categories:
  - cs
tags:
  - git
---

So what's wrong with me, write down an article for `.gitignore`. Because this [answer](https://stackoverflow.com/a/58758400/6789898) makes me reconsider how to use `.gitignore`.

The answer tell us it have a better name: `.git-do-not-complain-about-some-files-that-are-untracked-and-do-not-automatically-add-them-in-that-case-but-this-file-has-no-effect-on-files-that-are-tracked`

The origin problem is coming from the asker tracks files that shouldn't be. How to prevent any out of the expected document won't be tracked? How can we avoid this happened? We have to ensure every file tracked is because we allowed.

Normally, we add the pattern we don't want to track into `.gitignore`. However, it can be really annoying, for example, sometimes I use `vim`, sometimes I use `vscode` and sometimes I use Jetbrains products. Unfortunately, `vscode` and Jetbrains would create a folder in your project. And more shit is some `language-server` also do this.

So we want to have a common file to place for it. We can do this:

`git config --global --add core.excludesfile /path/to/common-gitignore`

What's the problem with this? The problem is how to ensure I do this for every environment? I can do this for my new computer, but can't do that for my co-worker. And if they are contributors from the internet. That became impossible.

But we still want to do something. So here I suggest we, anyway, whatever, balabalabala, use a wildcard at the top to not track anything and use `!` pattern for those we pretty sure should be tracked.

For example, a Go project can use following:

```
# .gitignore
*
!.gitignore
!*.c
!*.go
!*.sum
!*.mod
!*.md
!Makefile
```

Yes, prevent everything first. And make sure what we want to keep. After we reverse the thought, we pretty sure that every tracked file, of course, is those we want to track.
