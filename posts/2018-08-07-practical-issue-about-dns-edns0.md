---
title: "Practical issue about DNS -- EDNS0"
categories:
  - cs
tags:
  - networking
  - dns
  - golang
---

I have to create a checker for our DNS server.

Our DNS server will return it's config via `TXT`.

Code would like:

```go
package main

import "github.com/miekg/dns"

// func main
m := dns.Msg{}
// `google.com.` is correct format, `.` is required!
m.SetQuestion("google.com.", dns.TypeTXT)
c := dns.Client{}
// write out port 53(:53) is required, dns package we used at here won't automatically fix port to 53.
// Unlike some cli tool such as Dig
response, _, err := c.Exchange(&m, "8.8.8.8:53")
for _, t := range r.Answer {
    txt := t.(*dns.TXT)
    // dns.TXT.Txt is []string
    for _, t := txt.Txt {
        // t is string, now you can use it
        println(t)
    }
}
```

But our config stream is too big to over the limit of UDP! And we must get it.

**RFC 6891**:

> Traditional DNS messages are limited to 512 octets in size when sent over UDP [RFC1035].

After researching, I find we can extend DNS packet size by EDNS0.

**RFC 6891**:

> EDNS(0) specifies a way to advertise additional features such as
> larger response size capability, which is intended to help avoid
> truncated UDP responses, which in turn cause retry over TCP. It
> therefore provides support for transporting these larger packet sizes
> without needing to resort to TCP for transport.

Code is:

```go
m.SetEdns0(4096, true)
```

In `SetEdns0`:

```go
func (dns *Msg) SetEdns0(udpsize uint16, do bool) *Msg {
	e := new(OPT)
	e.Hdr.Name = "."
	e.Hdr.Rrtype = TypeOPT
	e.SetUDPSize(udpsize)
	if do {
		e.SetDo()
	}
	dns.Extra = append(dns.Extra, e)
	return dns
}
```

The code that change UDP size is `e.SetUDPSize`, so let's take a look:

```go
func (rr *OPT) SetUDPSize(size uint16) {
	rr.Hdr.Class = size
}
```

Type of `OPT.Hdr` is `RR_Header`, then we dig into **RFC 6891**, at page 5 you can find:

```
The fixed part of an OPT RR is structured as follows:

+------------+--------------+------------------------------+
| Field Name | Field Type   | Description                  |
+------------+--------------+------------------------------+
| NAME       | domain name  | MUST be 0 (root domain)      |
| TYPE       | u_int16_t    | OPT (41)                     |
| CLASS      | u_int16_t    | requestor's UDP payload size |
| TTL        | u_int32_t    | extended RCODE and flags     |
| RDLEN      | u_int16_t    | length of all RDATA          |
| RDATA      | octet stream | {attribute,value} pairs      |
+------------+--------------+------------------------------+
```

As expected, `RR_Header.Class` will change UDP payload size. Celebrate it!!!

More info:

- [RFC 2671](https://tools.ietf.org/html/rfc2671)
- [RFC 6891](https://tools.ietf.org/html/rfc6891)
- [miekg/dns](https://github.com/miekg/dns)
