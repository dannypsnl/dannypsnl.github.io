---
title: "Interaction with C in Zig"
categories:
  - cs
tags:
  - zig
  - c
  - language
---

From 1972, **C** became more and more important in the underlying world. Many projects are based on **C**, including the famous operating system: **Linux**; the multi-platform toolkit for creating GUI: GTK; "your friend": Ruby and many others great software. **C** also introduces the **pointer**, I especially point out is because there has several **pointer** ways at that time, but the one used by **C** is the winner, and most people only know this version right now: at before, the pointer we have usually directly use size rather than object as its value, which means a pointer `p` which points to location `1`, after using the `p++` would point to location `2`; in **C**, the one we get used to, would depend on what is the object the `p` points to; that's why `x[i]` and `*(x + i)` are equivalent. From [The C programming language](https://en.wikipedia.org/wiki/The_C_Programming_Language):

> As formal parameters in a function definition, char s[]; and char \*s are equivalent.

**C** is an unbelievable simple language and makes so many great stuff, I think I can say it's a great language. But is not enough nowadays, let's take a look at a few examples:

- where is my object?

  ```c
  struct object *new_object() {
      struct object *obj = {};
      return obj;
  }
  ```

- so, `char s[]` and `char *s` are equivalent?

  We have a global here:

  ```c
  char s[10];
  ```

  Can I use

  ```c
  extern char *s;
  ```

  to operate the origin one? No, but the following are the same

  ```c
  void function(char s[]);
  void function(char * const s);
  ```

- how to use boolean operations in **C**?

  ```c
  if (1);
  if (0);
  ```

  How about: `if (0x63)`?

- Can I point to that address?

  ```c
  char s[10];
  // so what is c?
  char c = *(s + 10);
  ```

Finally, we know [how to kill ourself by creating a global thermonuclear war](https://www.slideshare.net/olvemaudal/insecure-coding-in-c-and-c), or because we don't know?

### Future?

We make many tools and define many rules to avoid to make those errors in **C**. Like [MISRA C](https://en.wikipedia.org/wiki/MISRA_C), [model checking](https://en.wikipedia.org/wiki/List_of_model_checking_tools) and more. Some of them are palliative, like define programming rules (unless that rule can be checked by linter, else is usually not really helpful), but some of them are very nice; here my point is focusing on the tool like [F\*](https://www.fstar-lang.org/#introduction).

What I'm going to introduce is **Zig**. The first language which I really think it can be a replacement of **C**. The reason I think **Zig** is better is the concept of **compile-time** in **Zig**. Which means we can get the benefit from pre/post-condition checking. Let's have an example to know what's that means:

```zig
fn check_upper_case_name(comptime str: []const u8) void {
    comptime {
        var i = 0;
        while (i < str.len) {
            if (str[i] >= 'a' and str[i] <= 'z') {
                @compileError("must be all uppercase");
            }
            i += 1;
        }
    }
}
// so if we typed `check_upper_case_name("apple")`
// would cause a compile error
```

This is a very powerful feature, but it's not enough to be a replacement of **C**. **Rust** has more features than **C** in the programming language designing view. It's not about performance, many languages can be faster than **C**(depends on the field of CS). The **Go** even as simple as **C**. But they cannot be a replacement of **C**. Because the interaction way is not simple enough, even have limitations (this is quite normal, it's caused by different languages design, I have mentioned [how cgo makes trouble](/blog/2019/08/15/cs/cgo-can-be-a-trouble/),
cgo helps we link binary multiple times and must set up the linker flags multiple times, what a good idea!). Others language use FFI, in **Rust** we have to write:

> From https://doc.rust-lang.org/nomicon/ffi.html

```rust
#[link(name = "snappy")]
extern {
    fn snappy_max_compressed_length(source_length: size_t) -> size_t;
}
```

Everything looks good, but FFI has a common limitation(I think the language use this model would have this problem): [we cannot access the `#define` in **C**](https://stackoverflow.com/questions/21485655/how-do-i-use-c-preprocessor-macros-with-rusts-ffi). You know, we can access macro in C is already confuse people and thought it is just a variable(but it's not). But **C** programs use `#define` for many things, like error number. So we are required to do so:

```rust
const A_C_ERROR_XXX: u32 = 1;
const A_C_ERROR_XXX2: u32 = 2;
const A_C_ERROR_XXX3: u32 = 3;
```

Hope you enjoy this process(or normally we would make a code generator and found the header location was changed after some versions).

**Zig** does a lot on making the interaction more convenience, that's why it can be the replacement of **C**. Not joking, let's see how to access existing **C** code from **Zig**.

> From https://github.com/dannypsnl/write-you-a-k8s/blob/master/test.zig

```zig
const c = @cImport({
    @cInclude("netlink/netlink.h");
    @cInclude("netlink/route/link.h");
});
```

We can even access macro:

```zig
fn netlink_err(err: c_int) !void {
    // error code is negative, we must convert it back first, so we use `-err`
    switch (-err) {
        c.NLE_SUCCESS => {},
        c.NLE_FAILURE => return NetLinkError.FAILURE,
        c.NLE_INTR => return NetLinkError.INTR,
        c.NLE_BAD_SOCK => return NetLinkError.BAD_SOCK,
        c.NLE_AGAIN => return NetLinkError.AGAIN,
        c.NLE_NOMEM => return NetLinkError.NOMEM,
        c.NLE_EXIST => return NetLinkError.EXIST,
        c.NLE_INVAL => return NetLinkError.INVAL,
        c.NLE_RANGE => return NetLinkError.RANGE,
        c.NLE_MSGSIZE => return NetLinkError.MSGSIZE,
        c.NLE_OPNOTSUPP => return NetLinkError.OPNOTSUPP,
        c.NLE_AF_NOSUPPORT => return NetLinkError.AF_NOSUPPORT,
        c.NLE_OBJ_NOTFOUND => return NetLinkError.OBJ_NOTFOUND,
        c.NLE_NOATTR => return NetLinkError.NOATTR,
        c.NLE_MISSING_ATTR => return NetLinkError.MISSING_ATTR,
        c.NLE_AF_MISMATCH => return NetLinkError.AF_MISMATCH,
        c.NLE_SEQ_MISMATCH => return NetLinkError.SEQ_MISMATCH,
        c.NLE_MSG_OVERFLOW => return NetLinkError.MSG_OVERFLOW,
        c.NLE_MSG_TRUNC => return NetLinkError.MSG_TRUNC,
        c.NLE_NOADDR => return NetLinkError.NOADDR,
        c.NLE_SRCRT_NOSUPPORT => return NetLinkError.SRCRT_NOSUPPORT,
        c.NLE_MSG_TOOSHORT => return NetLinkError.MSG_TOOSHORT,
        c.NLE_MSGTYPE_NOSUPPORT => return NetLinkError.MSGTYPE_NOSUPPORT,
        c.NLE_OBJ_MISMATCH => return NetLinkError.OBJ_MISMATCH,
        c.NLE_NOCACHE => return NetLinkError.NOCACHE,
        c.NLE_BUSY => return NetLinkError.BUSY,
        c.NLE_PROTO_MISMATCH => return NetLinkError.PROTO_MISMATCH,
        c.NLE_NOACCESS => return NetLinkError.NOACCESS,
        c.NLE_PERM => return NetLinkError.PERM,
        else => return NetLinkError.Unknown,
    }
}

const NetLinkError = error{
    Unknown,
    FAILURE,
    INTR,
    BAD_SOCK,
    AGAIN,
    NOMEM,
    EXIST,
    INVAL,
    RANGE,
    MSGSIZE,
    OPNOTSUPP,
    AF_NOSUPPORT,
    OBJ_NOTFOUND,
    NOATTR,
    MISSING_ATTR,
    AF_MISMATCH,
    SEQ_MISMATCH,
    MSG_OVERFLOW,
    MSG_TRUNC,
    NOADDR,
    SRCRT_NOSUPPORT,
    MSG_TOOSHORT,
    MSGTYPE_NOSUPPORT,
    OBJ_MISMATCH,
    NOCACHE,
    BUSY,
    PROTO_MISMATCH,
    NOACCESS,
    PERM,
};
```

Yes, [`NLE_FAILURE` is macro](http://charette.no-ip.com:81/programming/doxygen/netfilter/errno_8h.html).

But we cannot just take a look at how to code it, right? How about the build system? **Zig** use **Zig** as build script, and already has several helpful functionalities! Here is an example(file should be named `build.zig`):

> From https://github.com/dannypsnl/write-you-a-k8s/blob/master/build.zig

```zig
const Builder = @import("std").build.Builder;

pub fn build(b: *Builder) void {
    const exe = b.addExecutable("test", "test.zig");

    exe.linkSystemLibrary("c");
    exe.linkSystemLibrary("nl-3");
    exe.linkSystemLibrary("nl-route-3");
    exe.addIncludeDir("/usr/include/libnl3");
    exe.install();

    b.default_step.dependOn(&exe.step);
}
```

We use `test.zig` to build an executable, link to **C** libraries `c`, `nl-3` and `nl-route-3`. Also, add an include directory for headers searching. All of them are the feature we exactly need when building a project works with **C**.

### Conculsion

Now we got the idea why **Zig** is a proper replacement of **C**, so we should use it right now? For me is not, it points out the way we can move to. But itself is not complete enough for a production project, for example I haven't saught a package manager for **Zig**, seems like still in [discussion](https://github.com/ziglang/zig/issues/943). So we can take a sit, and observe the future of **Zig**. Anyway, I really hope it can be successful. How about you?
