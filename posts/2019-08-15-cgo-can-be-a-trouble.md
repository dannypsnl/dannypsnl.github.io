---
title: "cgo can be a trouble"
categories:
  - cs
tags:
  - golang
  - cgo
---

This week, I have to upgrade nff-go from v0.7.0 to v0.8.1, so I change the version first. However, I found the whole package `nff-go/low` move to `nff-go/internal/low`, and our code directly based on `low`.

After some research, I found all I need is call C function directly; the function is under `librte_ethdev`. So I add:

```go
// #include <rte_ethdev.h>
import "C"
```

in our code.

I thought since nff-go already link DPDK, I have nothing to do here, but I'm wrong.

The problem is that CGO would link C objects into temporary objects first. So linker would complain there was no reference to the function I call.

So I add another line:

```go
// #cgo LDFLAGS: -lrte_distributor -lrte_reorder -lrte_kni -lrte_pipeline -lrte_table -lrte_port -lrte_timer -lrte_jobstats -lrte_lpm -lrte_power -lrte_acl -lrte_meter -lrte_sched -lrte_vhost -lrte_ip_frag -lrte_cfgfile -Wl,--whole-archive -Wl,--start-group -lrte_kvargs -lrte_mbuf -lrte_hash -lrte_ethdev -lrte_mempool -lrte_ring -lrte_mempool_ring -lrte_eal -lrte_cmdline -lrte_net -lrte_bus_pci -lrte_pci -lrte_bus_vdev -lrte_timer -lrte_pmd_bond -lrte_pmd_vmxnet3_uio -lrte_pmd_virtio -lrte_pmd_cxgbe -lrte_pmd_enic -lrte_pmd_i40e -lrte_pmd_fm10k -lrte_pmd_ixgbe -lrte_pmd_e1000 -lrte_pmd_ena -lrte_pmd_ring -lrte_pmd_af_packet -lrte_pmd_null -Wl,--end-group -Wl,--no-whole-archive -lrt -lm -ldl -lnuma
```

They are directly copied from [https://github.com/intel-go/nff-go/blob/v0.8.1/internal/low/low_no_mlx.go](https://github.com/intel-go/nff-go/blob/v0.8.1/internal/low/low_no_mlx.go)

However, linker unhappy with it, there are multiple definitions of symbols in the final object now, because we link two DPDK now.

In pure CGO, we have no way to link only one at this situation, but since we know the duplicate references are the same one so whatever the linker picks the program would work.

Once we know that, we can use `#cgo LDFLAGS: -Wl,--allow-multiple-definition` to force the linker to ignore this duplicate.

However, we won't want to have a copied from nff-go, so I did the trick in Makefile to copied it automatically when building.<Paste>
