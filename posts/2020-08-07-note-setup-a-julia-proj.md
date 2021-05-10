---
title: "NOTE: how to setup a julia project"
categories:
  - cs
tags:
  - note
  - julia
  - beginner
---

Tape `julia` in shell, after getting into the interactive environment of [Julia](https://julialang.org/), tape `]` to get into pkg mode:

```
               _
   _       _ _(_)_     |  Documentation: https://docs.julialang.org
  (_)     | (_) (_)    |
   _ _   _| |_  __ _   |  Type "?" for help, "]?" for Pkg help.
  | | | | | | |/ _` |  |
  | | |_| | | | (_| |  |  Version 1.5.0 (2020-08-01)
 _/ |\__'_|_|_|\__'_|  |  Official https://julialang.org/ release
|__/                   |

(@v1.5) pkg>
```

In this mode tape: `generate HelloWorld`

```
(@v1.5) pkg> generate HelloWorld
```

In the current directory would have a new directory called `HelloWorld`.

In `HelloWorld/`:

```
Project.toml
src/
  HelloWorld.jl
```

To play with definitions in module `HelloWorld`, in pkg mode tape `activate .`

```
(@v1.5) pkg> activate .
```

Then use `;` + `enter` back to interactive mode:

```
julia> import HelloWorld
julia> using HelloWorld
```
