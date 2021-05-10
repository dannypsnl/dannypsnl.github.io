---
title: "HugePages on Kubernetes"
categories:
  - cs
tags:
  - workrecord
  - hugepages
  - kubernetes
  - linux
---

## What is Huge Page?

When a process using some memory, CPU marking the RAM used by the process. For efficiently, CPU allocate by chunks by 4K bytes(default on many platforms). Those chunks called pages. Since process address space is virtual, CPU and OS must remember which page belongs to which process, more memory been used, more pages need to be managed. To avoid heavy scheduling about pages, most current CPU architectures support the bigger page than 4KB, on Linux, it named huge page.

## Kubernetes

We are in the containerization world now, kubernetes is an open-source container orchestration system for automating deployment, scaling, and management. But some application requiring the huge page ability, in our case, that's DPDK.

## So can we use enable hugepages in kubernetes?

The answer is yes, but we have to check the version of kubernetes first.

According to [feature-gates](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/) description. If your kubernetes version >= 1.10, then HugePages default on, else you have to enable it by yourself.

Log in to your kubernetes node machine. Open and edit `/etc/default/kubelet` this file, find `-—feature-gates=` these texts, add some text to make it looks like `-—feature-gates=HugePages=true`.

> p.s. If you want to add more than one feature, use `,` separate the option, e.g. `--feature-gates="...,DynamicKubeletConfig=true"`

Save and close editor, now run the following commands:

```bash
# according to your environment, this is optional
$ systemctl daemon-reload
$ systemctl restart kubelet
```

> p.s. You might need `sudo` before the command, also according to your environment

> p.s. [advanced kubelet config](https://kubernetes.io/docs/setup/independent/kubelet-integration/)

The previous setting is for kubernetes 1.8 and 1.9, 1.7 and below do not support this feature.

Now lets into the next section, how to mount huge page on to node.

Commands are easy:

```bash
$ mkdir -p /mnt/huge
$ mount -t hugetlbfs nodev /mnt/huge
# 1024 is the total number of hugepages, you can using others value as you need
$ echo 1024 > /sys/devices/system/node/node0/hugepages/hugepages-2048kB/nr_hugepages
```

> p.s. As the previous note, you might need `sudo` to do those stuff, and read [this](https://stackoverflow.com/questions/84882/sudo-echo-something-etc-privilegedfile-doesnt-work) to know by sudo echo might not work as what you think

Then use: `cat /proc/meminfo | grep Huge` to see current status, after these, `systemctl restart kubelet` again.

Now leave your node machine, and use: `kubectl describe nodes` to check hugepages is enable or not. You might see something like:

```yaml
apiVersion: v1
kind: Node
metadata:
  name: node1
# ignore...
status:
  capacity:
    memory: 10Gi
    hugepages-2Mi: 1Gi
  allocatable:
    memory: 9Gi
    hugepages-2Mi: 1Gi
# ignore...
```

An example pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example
spec:
  containers:
    # use the image you like
    volumeMounts:
      - mountPath: /hugepages
        name: hugepage
    resources:
      requests:
        hugepages-2Mi: 1Gi
      limits:
        hugepages-2Mi: 1Gi
  volumes:
    - name: hugepage
      emptyDir:
        medium: HugePages
```

### Could we setting hugepages in Pod?

For now, this feature seems won't support to use Pod configure hugepages, according to the [proposal](https://github.com/kubernetes/community/blob/master/contributors/design-proposals/resource-management/hugepages.md#scope) description.

After researching, we finally run up our Router with DPDK(although have other issues) in Pod, and we found we might not be able to mount hugepages at Pod init time.

## Conculsion

After learning about how to enable the hugepages, you might not have the chance to use hugepages directly, but a lot of third-party software would use it, then you can get the benefit from the hugepages. Thanks for the reading.
