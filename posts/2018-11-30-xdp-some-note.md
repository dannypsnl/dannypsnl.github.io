---
title: "XDP some note"
categories:
  - cs
tags:
  - networking
  - xdp
---

What is XDP? XDP is eXpress Data Path, it's a technology about putting a BPF code virtual machine on the NIC(network interface controller) driver before kernel network stack so that we can filter the packet before kernel, it would make processing speed greater.

We can do following things on the packet:

- `XDP_PASS`: allow the packet to pass through
- `XDP_DROP`: drop the packet
- `XDP_TX`: bounce the packet back on the same interface
- `XDP_REDIRECT`: redirects the packet to another interface

Here is an example of counting how many IPv4/6 packets be dropped.

```go
package main

import (
	"fmt"
	"os"
	"os/signal"

	bpf "github.com/iovisor/gobpf/bcc"
)

// bcc is from iovisor/bcc this project
/*
#cgo CFLAGS: -I/usr/include/bcc/compat
#cgo LDFLAGS: -lbcc
#include <bcc/bpf_common.h>
#include <bcc/libbpf.h>
void perf_reader_free(void *ptr);
*/
import "C"

const source string = `
#define KBUILD_MODNAME "foo"
#include <uapi/linux/bpf.h>
#include <linux/in.h>
#include <linux/if_ether.h>
#include <linux/if_packet.h>
#include <linux/if_vlan.h>
#include <linux/ip.h>
#include <linux/ipv6.h>
BPF_TABLE("array", int, long, dropcnt, 256);
static inline int parse_ipv4(void *data, u64 nh_off, void *data_end) {
    struct iphdr *iph = data + nh_off;
    if ((void*)&iph[1] > data_end)
        return 0;
    return iph->protocol;
}
static inline int parse_ipv6(void *data, u64 nh_off, void *data_end) {
    struct ipv6hdr *ip6h = data + nh_off;
    if ((void*)&ip6h[1] > data_end)
        return 0;
    return ip6h->nexthdr;
}
int xdp_prog1(struct xdp_md *ctx) {
    void* data_end = (void*)(long)ctx->data_end;
    void* data = (void*)(long)ctx->data;
    struct ethhdr *eth = data;

    uint64_t nh_off = sizeof(*eth);
    if (data + nh_off  > data_end)
        return XDP_DROP;
    uint16_t h_proto = eth->h_proto;
    if (h_proto == htons(ETH_P_8021Q) || h_proto == htons(ETH_P_8021AD)) {
        struct vlan_hdr *vhdr;
        vhdr = data + nh_off;
        nh_off += sizeof(struct vlan_hdr);
        if (data + nh_off > data_end)
            return XDP_DROP;
            h_proto = vhdr->h_vlan_encapsulated_proto;
    }
    if (h_proto == htons(ETH_P_8021Q) || h_proto == htons(ETH_P_8021AD)) {
        struct vlan_hdr *vhdr;
        vhdr = data + nh_off;
        nh_off += sizeof(struct vlan_hdr);
        if (data + nh_off > data_end)
            return XDP_DROP;
            h_proto = vhdr->h_vlan_encapsulated_proto;
    }
    int index;
    if (h_proto == htons(ETH_P_IP))
        index = parse_ipv4(data, nh_off, data_end);
    else if (h_proto == htons(ETH_P_IPV6))
        index = parse_ipv6(data, nh_off, data_end);
    else
        index = 0;
    long *value;
    value = dropcnt.lookup(&index);
    if (value) lock_xadd(value, 1);
    return XDP_DROP;
}
`

func usage() {
	fmt.Printf("Usage: %v <ifdev>\n", os.Args[0])
	fmt.Printf("e.g.: %v eth0\n", os.Args[0])
	os.Exit(1)
}

func main() {
	if len(os.Args) != 2 {
		usage()
	}
	module := bpf.NewModule(source, []string{
		"-w",
	})
	defer module.Close()

	fn, err := module.Load("xdp_prog1", C.BPF_PROG_TYPE_XDP, 1, 65536)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load xdp prog: %v\n", err)
		os.Exit(1)
	}

	device := os.Args[1]
	if err := module.AttachXDP(device, fn); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to attach xdp prog: %v\n", err)
		os.Exit(1)
	}

	defer func() {
		if err := module.RemoveXDP(device); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to remove XDP from %s: %v\n", device, err)
		}
	}()

	fmt.Println("Dropping packets, hit CTRL+C to stop")
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt, os.Kill)

	dropcnt := bpf.NewTable(module.TableId("dropcnt"), module)

	<-sig

	fmt.Println("\n{IP protocol-number}: {total dropped pkts}")
	for it := dropcnt.Iter(); it.Next(); {
		key := bpf.GetHostByteOrder().Uint32(it.Key())
		value := bpf.GetHostByteOrder().Uint64(it.Leaf())

		if value > 0 {
			fmt.Printf("%v: %v pkts\n", key, value)
		}
	}
}
```
