---
title: "NOTE: get labels from Pod"
categories:
  - cs
tags:
  - note
  - kubernetes
---

This week our company wants to improve one of our projects which is based on Istio, exchanging weight in different checker instances, make the traffic distribution fairer. My co-worker provides a nice idea: We watching Pods by the [label selector](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) to discover others instance. Code looks like:

```go
watcher, err := client.CoreV1().Pods("istio-system").Watch(meta.ListOptions{
	Watch:         true,
	LabelSelector: "xxx=yyy",
})
```

But this causes a problem, you can see that string `"xxx=yyy"`, we have no graceful way to avoid the repeating of label selector in Kubernetes config(for Kubernetes) and environment variable(for our program). And one day they would outdated.

In the beginning, we have a discussion and thought that it would unlikely to have the access to label selector value in Pod. Then start searching in the document. You know what? Surprisingly we can! Even have a few ways can choose! Let's take a look at them:

1. Use `env` variables

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
   name: get-labels
   spec:
   selector:
       matchLabels:
       name: get-labels-container
   template:
       metadata:
       labels:
           name: get-labels-container
       spec:
       containers:
           - name: a-container
           image: ubuntu:18.04
           env:
               - name: SELECTOR_VALUE
               valueFrom:
                   fieldRef:
                   fieldPath: metadata.labels['name']
   ```

   In this case, we can get one value from a label selector pair.

2. Load them into a file

   This requires a new API called: `downwardAPI`

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
   name: get-labels
   spec:
   selector:
       matchLabels:
       name: get-labels-container
   template:
       metadata:
       labels:
           name: get-labels-container
       spec:
       containers:
           - name: a-container
           image: ubuntu:18.04
           volumeMounts:
               - name: podinfo
               mountPath: /etc/podinfo
           command:
               - sleep
               - inf
       volumes:
           - name: podinfo
           downwardAPI:
               items:
               - path: "labels"
                   fieldRef:
                   fieldPath: metadata.labels
   ```

   In this container, we can use `cat /etc/podinfo/labels` to get all label selectors. So if we want to get all of them then we can use this solution.

Now, hope this can save your time since it's in a weird place of Kubernetes document. And thanks for your read.

#### References

- [k8s Doc: Expose Pod Information to Containers Through Files](https://kubernetes.io/docs/tasks/inject-data-application/downward-api-volume-expose-pod-information/)
