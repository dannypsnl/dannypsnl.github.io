---
title: "Tracing source code of Kubernetes client-go"
categories:
  - cs
tags:
  - kubernetes
  - golang
---

Whole thing is started from **Ingress** this feature of **Kubernetes**.
But today I'm not going to talk too much about it, basically just I have to let **Ingress Controller**
will send packets to our **Router** so that we could do the thing we want,
if you are interested in our **Router**, you can more infos from [our blog](https://glasnostic.com/blog) and
demo by just login to play with it.

Anyway, the thing I'm going to do for this is I have to create a proxy for real kubernetes API server,
and modify the real data to what we want. To do that, I have to understand how [client-go](https://github.com/kubernetes/client-go)
(**Ingress** use client-go to get info, of course) send requests and what it expected. Let's start!

> NOTE: I just mention some part of codes, not explaining whole big piture

```go
	epEventHandler := cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			updateCh.In() <- Event{
				Type: CreateEvent,
				Obj:  obj,
			}
		},
		DeleteFunc: func(obj interface{}) {
			updateCh.In() <- Event{
				Type: DeleteEvent,
				Obj:  obj,
			}
		},
		UpdateFunc: func(old, cur interface{}) {
			oep := old.(*corev1.Endpoints)
			cep := cur.(*corev1.Endpoints)
			if !reflect.DeepEqual(cep.Subsets, oep.Subsets) {
				updateCh.In() <- Event{
					Type: UpdateEvent,
					Obj:  cur,
				}
			}
		},
	}
```

These codes at [ingress-nginx](https://github.com/kubernetes/ingress-nginx) tag `nginx-v0.20.0`(at following context we just use this tag),
file `internal/ingress/controller/store/store.go` line `446`

The purpose is emit these callbacks into `SharedInformer` to get kubernetes events for updating the datas in store,
to generate nginx configuration for load balancing these pods.

Ok, so where we use `epEventHandler`? We would see it be passed into `store.informers.Endpoint` at
the same function, line `519`

```go
store.informers.Endpoint.AddEventHandler(epEventHandler)
```

Here we should care two things

- what is `Endpoint`?
- how it use the functions sent into `AddEventHandler`?

Let's keep dig into the code, we would see `AddEventHandler` is a method of an `interface`: `SharedInformer`,
yes, we just talk about it, now we see it. `SharedInformer` is defined under `k8s.io/client-go/tools/cache/shared_informer.go`
(remember, here what I'm tracing is the `client-go` under `ingress-nginx` vendor, so it might outdate with latest `client-go`)

The only implementor of `SharedInformer` is `sharedIndexInformer`(still at same file),
it's a structure, here is the real code of `AddEventHandler`

```go
func (s *sharedIndexInformer) AddEventHandler(handler ResourceEventHandler) {
	s.AddEventHandlerWithResyncPeriod(handler, s.defaultEventHandlerResyncPeriod)
}

func (s *sharedIndexInformer) AddEventHandlerWithResyncPeriod(handler ResourceEventHandler, resyncPeriod time.Duration) {
	// ignore, here would do some period syncing
	listener := newProcessListener(handler, resyncPeriod, determineResyncPeriod(resyncPeriod, s.resyncCheckPeriod), s.clock.Now(), initialBufferSize)
	// ignore, here would emit `listener` into `processer`
}

func newProcessListener(handler ResourceEventHandler, requestedResyncPeriod, resyncPeriod time.Duration, now time.Time, bufferSize int) *processorListener {
	ret := &processorListener{
		nextCh:                make(chan interface{}),
		addCh:                 make(chan interface{}),
		handler:               handler,
		pendingNotifications:  *buffer.NewRingGrowing(bufferSize),
		requestedResyncPeriod: requestedResyncPeriod,
		resyncPeriod:          resyncPeriod,
	}

	ret.determineNextResync(now)

	return ret
}
```

To here, we should stop this part, because we can't get more from these.
So I go back to how to use `sharedIndexInformer`

I found type of `store.informers` have a method `Run` that would be called by store,
that's mean what it call is the point we care, that's `store.informers.Endpoint`

```go
func (i *Informer) Run(stopCh chan struct{}) {
	// this is *sharedIndexInformer.Run
	go i.Endpoint.Run(stopCh)
	// ignore, all resource is working under the same way
}

func (s *sharedIndexInformer) Run(stopCh <-chan struct{}) {
	// this is last line, I ignore others codes
	s.controller.Run(stopCh)
}
```

Then I take a look at how controller works

```go
// Run begins processing items, and will continue until a value is sent down stopCh.
// It's an error to call Run more than once.
// Run blocks; call via go.
func (c *controller) Run(stopCh <-chan struct{}) {
	defer utilruntime.HandleCrash()
	go func() {
		<-stopCh
		c.config.Queue.Close()
	}()
	r := NewReflector(
		c.config.ListerWatcher,
		c.config.ObjectType,
		c.config.Queue,
		c.config.FullResyncPeriod,
	)
	r.ShouldResync = c.config.ShouldResync
	r.clock = c.clock

	c.reflectorMutex.Lock()
	c.reflector = r
	c.reflectorMutex.Unlock()

	var wg wait.Group
	defer wg.Wait()

	wg.StartWithChannel(stopCh, r.Run)

	wait.Until(c.processLoop, time.Second, stopCh)
}
```

The point is `wg.StartWithChannel(stopCh, r.Run)`, in `reflector.Run`,
it call `r.ListAndWatch(stopCh)`, and `ListAndWatch` is based on `listWatcher`

```go
list, err := r.listerWatcher.List(options)
if err != nil {
	return fmt.Errorf("%s: Failed to list %v: %v", r.name, r.expectedType, err)
}
```

We would go back here later, let's find out what is `listerWatcher`

We set `store.informers.Endpoint` by this `store.informers.Endpoint = infFactory.Core().V1().Endpoints().Informer()` at
`internal/ingress/controller/store/store.go:L264`

Then we see `infFactory`, line `257`

```go
infFactory := informers.NewSharedInformerFactoryWithOptions(client, resyncPeriod,
	informers.WithNamespace(namespace),
	informers.WithTweakListOptions(func(*metav1.ListOptions) {}))
```

`informer`:

```go
func (f *endpointsInformer) Informer() cache.SharedIndexInformer {
	return f.factory.InformerFor(&corev1.Endpoints{}, f.defaultInformer)
}
// defaultInformer
func (f *endpointsInformer) defaultInformer(client kubernetes.Interface, resyncPeriod time.Duration) cache.SharedIndexInformer {
	return NewFilteredEndpointsInformer(client, f.namespace, resyncPeriod, cache.Indexers{cache.NamespaceIndex: cache.MetaNamespaceIndexFunc}, f.tweakListOptions)
}
// NewFilteredEndpointsInformer
func NewFilteredEndpointsInformer(client kubernetes.Interface, namespace string, resyncPeriod time.Duration, indexers cache.Indexers, tweakListOptions internalinterfaces.TweakListOptionsFunc) cache.SharedIndexInformer {
	return cache.NewSharedIndexInformer(
		&cache.ListWatch{
			ListFunc: func(options metav1.ListOptions) (runtime.Object, error) {
				if tweakListOptions != nil {
					tweakListOptions(&options)
				}
				return client.CoreV1().Endpoints(namespace).List(options)
			},
			WatchFunc: func(options metav1.ListOptions) (watch.Interface, error) {
				if tweakListOptions != nil {
					tweakListOptions(&options)
				}
				return client.CoreV1().Endpoints(namespace).Watch(options)
			},
		},
		&corev1.Endpoints{},
		resyncPeriod,
		indexers,
	)
}
```

Ha, we got `ListWatch` now, it would call an instance of `*kubernetes.ClientSet` to get the info it wanted!

Now we can back to `ListAndWatch`, let's take a look at the details of it.

In fact, I'm more focused on watch API, because it's a little bit weird.
I found it's server with keep sending data until client part close the connection.
How it did it? At `k8s.io/client-go/tools/cache/reflector.go:L226`

```go
	for {
		// give the stopCh a chance to stop the loop, even in case of continue statements further down on errors
		select {
		case <-stopCh:
			return nil
		default:
		}

		timeoutSeconds := int64(minWatchTimeout.Seconds() * (rand.Float64() + 1.0))
		options = metav1.ListOptions{
			ResourceVersion: resourceVersion,
			// We want to avoid situations of hanging watchers. Stop any wachers that do not
			// receive any events within the timeout window.
			TimeoutSeconds: &timeoutSeconds,
		}

		r.metrics.numberOfWatches.Inc()
		w, err := r.listerWatcher.Watch(options)
		if err != nil {
			switch err {
			case io.EOF:
				// watch closed normally
			case io.ErrUnexpectedEOF:
				glog.V(1).Infof("%s: Watch for %v closed with unexpected EOF: %v", r.name, r.expectedType, err)
			default:
				utilruntime.HandleError(fmt.Errorf("%s: Failed to watch %v: %v", r.name, r.expectedType, err))
			}
			// If this is "connection refused" error, it means that most likely apiserver is not responsive.
			// It doesn't make sense to re-list all objects because most likely we will be able to restart
			// watch where we ended.
			// If that's the case wait and resend watch request.
			if urlError, ok := err.(*url.Error); ok {
				if opError, ok := urlError.Err.(*net.OpError); ok {
					if errno, ok := opError.Err.(syscall.Errno); ok && errno == syscall.ECONNREFUSED {
						time.Sleep(time.Second)
						continue
					}
				}
			}
			return nil
		}

		if err := r.watchHandler(w, &resourceVersion, resyncerrc, stopCh); err != nil {
			if err != errorStopRequested {
				glog.Warningf("%s: watch of %v ended with: %v", r.name, r.expectedType, err)
			}
			return nil
		}
	}
```

Of course is a endless loop, would stop by channel or return.

The tricky part is it check error content, if it's a probable EOF, it would keep taking data rather stop connection.

Ok, everything seems make sense right now, but that's not enough, I'm very confused by why it could receiving a JSON data by
such as a streaming way, so let's go back to see `client.CoreV1().Endpoints(namespace).Watch(options)`

```go
// Watch returns a watch.Interface that watches the requested endpoints.
func (c *endpoints) Watch(opts metav1.ListOptions) (watch.Interface, error) {
	opts.Watch = true
	return c.client.Get().
		Namespace(c.ns).
		Resource("endpoints").
		VersionedParams(&opts, scheme.ParameterCodec).
		Watch()
}
// Watch attempts to begin watching the requested location.
// Returns a watch.Interface, or an error.
func (r *Request) Watch() (watch.Interface, error) {
	return r.WatchWithSpecificDecoders(
		func(body io.ReadCloser) streaming.Decoder {
			framer := r.serializers.Framer.NewFrameReader(body)
			return streaming.NewDecoder(framer, r.serializers.StreamingSerializer)
		},
		r.serializers.Decoder,
	)
}
```

And I found the point is `r.serializers`, and the shit thing is it still is a function send by external code.

If you trace back then you would find it's from `*RESTClient.serializers`,
at `k8s.io/client-go/rest/client.go`, line `225` and `227` send this into `NewRequest`

And you found it's created at line `108` in same file, `serializers, err := createSerializers(config)`

```go
func createSerializers(config ContentConfig) (*Serializers, error) {
	// ignore, we don't care them since we just use `StreamSerializer` of `Serializers`
	if info.StreamSerializer != nil {
		s.StreamingSerializer = info.StreamSerializer.Serializer
		s.Framer = info.StreamSerializer.Framer
	}

	return s, nil
}
```

We would see the type of `StreamSerializer` is `runtime.Serializer`, it's an interface, and since we are sending JSON data,
so we go to the JSON one implementor of it to see it's `Decode`

```go
import (
	jsoniter "github.com/json-iterator/go"
)
```

After see that, I know the trace already done, because my question already been answered, them use `github.com/json-iterator/go` this library

I guess I would talk about something about how to create a kube API proxy with modifying datas after completing my proxy of kube API server.
(It's really hard XD)

I guess today the most interesting thing we learned is Go `*http.Response` is a `ReadCloser`!(How Kubernetes done their watch trick)

Anyway, thanks for read, hope these could help you more detailed understanding Kubernetes client implementation
and be a little start point to read more about it.
