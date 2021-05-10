---
title: "NOTE: If we write kubernetes client in Rust"
categories:
  - cs
tags:
  - note
  - programming
  - kubernetes
  - rust
---

First, we can make in cluster config became more evident.

```rust
let cfg = Config::InCluster
// or
let cfg = Config::Path("~/.kube/config")
let cluster = kube::attach_cluster(cfg);
```

Then we can mix get/list by providing type parameters:

```rust
let nginx_pod = cluster.get::<Pod>(Namespace::Name("default"), "nginx-se3jn1-34jbk");
// list
let pods = cluster.list::<Pod>(Namespace::All);
```
