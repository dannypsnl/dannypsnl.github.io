---
title: "fun networking: tcp close"
categories:
  - cs
tags:
  - workrecord
  - networking
  - tcp
---

Recently we are working on a new feature is about filter packets by HTTP header for our router.
This is the concept, we read the header by rules, rules are just some key/value pair.
If key missing or value isn't matched, then we drop the packet.

When a connection end, we would remove this connection from allowing pass map.

Anyway, we found a bug is, we use FIN flag to say this packet is the end of the TCP connection,
but we know a connection end is `a:FIN` -> `b:ACK` -> `b:FIN` -> `a:ACK`, a/b is client/server here.
So except the first packet, following packets won't pass our router,
then connection would never end until timeout, lol.
