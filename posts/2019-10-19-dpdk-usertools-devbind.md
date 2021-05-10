---
title: "DPDK usertools: devbind"
categories:
  - cs
tags:
  - dpdk
  - networking
  - workrecord
---

After compiling DPDK, load module and start our process. A common problem is we have no idea where is the NIC going :).

And DPDK actually provides some tools for these operations, one of them is `dpdk-devbind.py`. It located at `$(DPDK_PROJECT)/usertools/dpdk-devbind.py`

We can use it to get current status:

```
$ dpdk-devbind.py --status
# shorthand
$ dpdk-devbind.py -s
```

Bind driver:

```
$ dpdk-devbind.py --bind e1000e 00:06.0
# shorthand
$ dpdk-devbind.py -b e1000e 00:06.0
# we also can use NIC name, but remember that a NIC could have no name
# only PCI would always existed.
$ dpdk-devbind.py -b igb_uio eth1
```

Unbind driver:

```
$ dpdk-devbind.py --unbind 00:06.0
# shorthand
$ dpdk-devbind.py -u 00:06.0
# equal to
$ dpdk-devbind.py --bind none 00:06.0
```

p.s. Remember that these operations requiring permission(`sudo` or what).

Just that, have fun!
