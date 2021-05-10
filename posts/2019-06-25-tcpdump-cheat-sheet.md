---
title: "tcpdump cheat sheet"
categories:
  - cs
tags:
  - tcpdump
  - networking
---

tcpdump?

A command line tool for analyzing network packets.

How to get packets?

Using `-i` option, `tcpdump -i <device-name>`, you would get the packet through NIC(network interface card) named <device-name>.</device-name>

How to get `<device-name>`?

using `ip link` could get some, e.g.

```
$ ip link
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 16436 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 08:01:37:d1:9c:bd brd ff:ff:ff:ff:ff:ff
$ tcpdump -i eth0
```

Now I know how to get all packets through certain NIC, but I want to analysis specify connections, how can I get it?

Expression.

What Expression?

tcpdump expression.

What is tcpdump expression?

A set of combinable rules, for example `src 10.0.0.10` means only the packets from `10.0.0.10` would show.Here is a list(incomplete) of tcpdump expression, the `#` leading comments:

```
host 10.0.0.10 # from or to 10.0.0.10
port 23 # contains port 23
dst 10.0.0.10 # as src, but for destination
# Protocols
arp # only ARP
icmp
tcp
udp
fddi
ether
# Protocol logic is simple, is not, for all
```

You say they are combinable, how they combined?

Good question, they can be combined with `or`, `and` or with leading `!`(not); `or` is `or`, not `and`, for example, `src 10.0.0.10 or src 10.0.0.11` is for packets from `10.0.0.10` or `10.0.0.11`, obviously.

I found packets not showing all informations I want, what could I do?

Simple, tcpdump has `-v` for verbose output, `-vv` for more verbose, `-vvv` for even more verbose. `-vvvv` for… no, I’m kidding.

Ha, that’s funny, and the timestamp is not readable for me, how to make it more friendly?

Use `-t`, and not kidding, use `-ttttt` for maximally timestamp, and you have `-kt, k <- 1..=5` for different level output.

I found the IP be replaced by host name but I don’t want it, how to remove it?

`-n` would tell `tcpdump` stop convert address.

What if I want to save my hard working result?

`-w <filename>` is what you’re looking for, it would write the raw packets to file named `<filename>` rather than parsing & printing. And remember you can record packets into a file, and use **[Wireshark](https://www.wireshark.org/download.html)** to analysis it! For complex flow analyzing, I would do that. Now, the most important path already covered, you can always get more & fresher information about it from `manpage` of `tcpdump`, good lucks.

#### references

- [wiki: NIC](https://en.wikipedia.org/wiki/Network_interface_controller)
- [man: tcpdump](https://www.tcpdump.org/manpages/tcpdump.1.html)
