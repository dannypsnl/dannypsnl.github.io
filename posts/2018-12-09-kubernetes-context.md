---
title: "Kubernetes context"
categories:
  - cs
tags:
  - kubernetes
---

## Before you beginning

You should already install `kubectl` this command line tool.
And knowing what is Kubernetes.
Knowing why we need to separate the environment for the different member.

## Config for demo

At first, we need to prepare a configuration that can help us learning operations of context.
Now, create a file called `config_demo`.

```bash
$ touch config_demo
```

Next, copy these contents into `config_demo`.

```yaml
apiVersion: v1
kind: Config

contexts:
  - context:
      cluster: ""
      user: ""
    name: backend
  - context:
      cluster: ""
      user: ""
    name: frontend
```

In our assuming, we have two kinds of developers, frontend & backend.

Now, type `kubectl --kubeconfig config_demo config get-contexts`
Output:

```bash
$ kubectl --kubeconfig config_demo config get-contexts
CURRENT   NAME       CLUSTER   AUTHINFO   NAMESPACE
          backend
          frontend
```

See, we have two contexts now. Let's get into the next step.

```bash
$ kubectl --kubeconfig config_demo config use-context backend
Switched to context "backend".
```

This command, obviously, change our context to `backend` now. But how do we checking this fact at other times? Here we go!

```bash
$ kubectl --kubeconfig config_demo config current-context
backend
```

Ok, now we already know some basic operations of `kubectl config` this command, let's see the current content of your config file:

```yaml
apiVersion: v1
clusters: []
contexts:
  - context:
      cluster: ""
      user: ""
    name: backend
  - context:
      cluster: ""
      user: ""
    name: frontend
current-context: backend
kind: Config
preferences: {}
users: []
```

We got some new thing into it, but basically, the most important part is `current-context`, so now you know how `kubectl` store this info, then you know how to create this by modifying the config directly.

Now, let's add some users to this config.

```yaml
apiVersion: v1
# ignore
users:
  - name: frontend-developer
  - name: backend-developer
```

Then add setting credentail for them

```bash
$ kubectl --kubeconfig config_demo config set-credentials backend-developer --username=danny --password=danny
User "backend-developer" set.
$ kubectl --kubeconfig config_demo config set-credentials frontend-developer --username=notme --password=notme
User "frontend-developer" set.
```

Now let's see what's different in the config

```yaml
apiVersion: v1
# ignore
users:
  - name: backend-developer
    user:
      password: danny
      username: danny
  - name: frontend-developer
    user:
      password: notme
      username: notme
```

p.s. Here, we use the basic auth, I won't suggest using this kind of auth in the real world and remember don't use the same value about username and password! I ever heard teacher use 1234 as a password when creating an example, and the student use 1234 even at work because used to do that, do make it happened to you!

Let's go to the usage part, we would set up the user of the context

```bash
$ kubectl --kubeconfig config_demo config set-context frontend --namespace frontend --user frontend-developer
Context "frontend" modified.
$ kubectl --kubeconfig config_demo config set-context backend --namespace backend --user backend-developer
Context "backend" modified.
```

Then see the change inside of the config

```yaml
apiVersion: v1
# ignore
contexts:
  - context:
      cluster: ""
      namespace: backend
      user: backend-developer
    name: backend
  - context:
      cluster: ""
      namespace: frontend
      user: frontend-developer
    name: frontend
```

As you see, we didn't have a cluster so we can't do some operation, so now we would use the kubernetes for docker environment default cluster to do the following task. To do so, we have to add the cluster to the config

```yaml
apiVersion: v1
# ignore
- context:
    cluster: docker-for-desktop-cluster
    namespace: backend
    user: backend-developer
  name: backend
```

And also do this for `frontend`, remember we didn't create a cluster, so you have included `~/.kube/config` on your computer to get `docker-for-desktop-cluster`

Once you do this, any operation on the cluster would require auth information, example:

```bash
$ KUBECONFIG=~/.kube/config:config_demo kubectl get pod
Error from server (Forbidden): pods is forbidden: User "system:anonymous" cannot list pods in the namespace "backend"
```

p.s. Just a small tip: `po` as `pod` as `pods` in the command line.

How to login the user is another part so I won't spend time on it but I can provide some references so that you can learn from those documentations. [https://kubernetes.io/docs/reference/access-authn-authz/authentication/](https://kubernetes.io/docs/reference/access-authn-authz/authentication/)

## Practical

But what I said won't actually use in your job, unless you're kube-master or technical leader or somewhat anyway you have to operate these fundamental part in kubernetes. So here I would tell you how to use context correctly, that's set up `KUBECONFIG` this environment variable!

In your `.bashrc`, `.zshrc` or anywhere, insert this:

```
export KUBECONFIG=$KUBECONFIG:config1:config2:config3
```

Where are configs from? Usually, are copying from your cloud platform, for example: **Azure**, **GCP**, **AWS**.

Anyway, this config already contains context information, so after you set up your `KUBECONFIG`, you can see a lot of context by `kubectl config get-contexts`, then what you need is just use them!

Thanks for reading, see you next time.
