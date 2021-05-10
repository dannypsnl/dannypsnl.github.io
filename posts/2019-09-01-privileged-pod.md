---
title: "Privileged Pod -- Debug kubernetes node"
categories:
  - cs
tags:
  - kubernetes
  - debug
---

Just a record.

At most of time, if we want to get into a node of kubernetes cluster, we can just using `ssh`. Or we would have a master node has public IP, then we first access the master than access workers to debug. However, in some environments that's impossible to do that. In my case, an AKS cluster, can't access nodes directly since we don't give it a public IP. What can we do now? Priviledged Pod!

The YAML definition is:

```
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: privileged
spec:
  selector:
    matchLabels:
      name: privileged-container
  template:
    metadata:
      labels:
        name: privileged-container
    spec:
      containers:
      - name: busybox
        image: busybox
        resources:
          limits:
            cpu: 200m
            memory: 100Mi
          requests:
            cpu: 100m
            memory: 50Mi
        stdin: true
        securityContext:
          privileged: true
        volumeMounts:
        - name: host-root-volume
          mountPath: /host
          readOnly: true
      volumes:
      - name: host-root-volume
        hostPath:
          path: /
      hostNetwork: true
      hostPID: true
      restartPolicy: Always
```

The point is:

```
        volumeMounts:
        - name: host-root-volume
          mountPath: /host
          readOnly: true
```

We mount the host path `/` to `/host` of the container. And we use host network: `hostNetwork: true` and host PID: `hostPID: true`.

Use `DaemonSet` to ensure we can debug on each nodes.

When we want to use the pod, using the command: `kubectl exec -ti privileged-xk23n chroot /host`.
