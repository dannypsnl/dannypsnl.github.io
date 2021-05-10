---
title: "NOTE: Racket CI(GitHub Action) cache"
date: "Wed Mar 31 07:29:38 UTC 2021"
categories:
  - cs
tags:
  - note
  - racket
  - ci
  - github action
---

Add the following code helps GitHub Action caches installed packages.

```yaml
- name: Cache
  uses: actions/cache@v2
  with:
    path: |
      ~/.racket
    key: ${{ runner.os }}-primes
```

If you install packages via command like:

```shell
raco pkg install --auto abc
```

Then add `--skip-installed`:

```shell
raco pkg install --auto --skip-installed abc
```
