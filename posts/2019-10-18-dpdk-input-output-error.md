---
title: "DPDK -- EAL Input/output error"
categories:
  - cs
tags:
  - dpdk
  - networking
  - workrecord
---

Last week I'm trying to reproduce a bug happened in our customer environment, so we create a minimal example for this: https://github.com/glasnostic/nff_go_test

During this, I found an annoying problem and want to record it.

I got an error: `EAL: Error enabling interrupts for fd 10 (Input/output error)`

After some research, I found a patch for this(it didn't be merged into DPDK since it's a VMWare problem).

If you try to bind NIC that using `e1000` you might have the same issue.

To solve this disables the checking by:

```
sed -i "s/pci_intx_mask_supported(dev)/pci_intx_mask_supported(dev)||1/g" \
  $(DPDK_PROJECT)/kernel/linux/igb_uio/igb_uio.c
```

This would make `pci_intx_mask_supported` check do not work anymore.

then recompile, after compiling done, reload the kernel module:

```
rmmod igb_uio
insmod $(DPDK_PROJECT)/build/kmod/igb_uio
```

p.s. `DPDK_PROJECT` is the project root directory of DPDK, related to your environment.

Then this problem should be fixed.
