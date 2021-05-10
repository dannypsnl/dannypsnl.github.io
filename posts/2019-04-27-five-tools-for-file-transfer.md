---
title: "5 tools for file transfer"
categories:
  - cs
tags:
  - tool
---

We usually have to transfer files between two computers, such as config, log, image. There are a lot of tools that could do it, but if we only know one approach, we would have trouble quickly, so I'm going to show you five tools relate to the topic.

### 1. scp(secure copy)

`scp` is a command line utility that allows you to copy files and directories between two locations securely. It put at first order is because it's the best choice if we could. With `scp`, we could:

- copy from your local to a remote
- copy from a remote to your local system
- copy between two remotes from your local

When scp transferring data, both password and files are encrypted so anyone could see the packet can't get any sensitive.

#### command line syntax

The format of the command is:
`scp [OPTION] [user@]SRC_HOST:]file1 [user@]DEST_HOST:]file2`

For example:

```bash
$ scp log.txt danny@54.133.2.8:~/
```

Means copy the `./log.txt` to the home directory of `54.133.2.8` this computer.

`scp` just like `cp`, as you thought, copy remote to local was:

```bash
$ scp danny@54.133.2.8:~/log.txt ./
```

If you want to copy between two remote:

```bash
$ scp danny@54.133.2.8:~/log.txt danny@54.133.2.9:~/
```

Usually, you need a key to use `scp`, to add it into command, use the option `-i` to do that:

```bash
$ scp -i /path/to/key $src $dst
```

There are a lot of useful options, just quickly pick some at here:

- `-r`: recursively copy the directories
- `-P`: specific port
- `-C`: force compress data

To get more information, take a look at [scp man page](https://linux.die.net/man/1/scp)

### 2. nc(netcat)

Although `scp` is powerful, sometimes the environment couldn't use it.

`nc` is a network testing tool actually, but if you use:

```bash
$ nc -l 8888 | tar zvf -
```

Nice, you listen on port `8888` now, next thing is transfer data to it.

```bash
$ tar cvf - ./file | nc localhost 8888
```

For a lazy guy:

```bash
# listen
$ nc -l 8888 > file
$ nc localhost 8888 < file
```

`nc` would close after receiving some data, so if we don't want that, try:

```bash
$ while true; do nc -l 8888 | tar zvf -; done
```

### 3. python

If you have no choice or want to provide a long time server, and no like to remember a lot of pipeline command, try `python`:

```bash
$ python3 -m http.server
```

It would start a file server at your command location.

### 4. tar

At `nc` section, could see we already use this tool, `tar` is helpful while the file is quite big, reduce the size to improve our life.

Example:

```bash
# compress
$ tar cvf file
# extract
$ tar zvf file
```

To get more information: [tar man page](https://linux.die.net/man/1/tar)

### 5. ngrok

At the previous section, we are assuming the target have public ip could reach easily. But life is hard. Sometimes we didn't have public ip; for this situation, `ngrok` could help.

Site: [ngrok](https://ngrok.com/)

This tool has to download by yourself.

Let's show how to use it:

```bash
# expose localhost:8080 by HTTP
$ ngrok http 8080
# expose localhost:8080 by TCP
$ ngrok tcp 8080
```

The TCP is beneficial for `nc` command. And HTTP is useful while you create a file server.

## Conculsion

In this tutorial, you learn how to transfer files by different tools and solve the limited networking environment issue to transfer data between different computers. Thanks for reading.
