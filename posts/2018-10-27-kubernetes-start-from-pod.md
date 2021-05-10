---
title: "Kubernetes 從 Pod 開始"
categories:
  - cs
tags:
  - kubernetes
---

> 欲閱讀本篇文章至少需要知道何為 container，由於範例將採用 Docker 為例，所以也預設讀者已經具備操作 Docker 的能力；且讀過 kubernetes 的[基礎概念](https://kubernetes.io/docs/concepts/)只是還沒開始用而已

Kubernetes 最小部署的單位為 Pod，一個 Pod 是 1 至 N 個 container 的群組，它們共享了網路(Network)和儲存空間(Storage)

這麼設計的好處之一是某些本來就耦合的比較嚴重的元件可以被封裝起來，而不需要硬是重寫成一個元件

雖然 Pod 是一組 container，對外部而言，那裡只有 Pod 而已，而通常我們還會再用 Service(Kubernetes 的另一種 Resource)包裝一群 Pod

> 比起是誰在服務，更重要的是有沒有服務

Pod 在 Kubernetes 中會被配給一個邏輯 IP(值得注意的是，這個 IP 是跨 namespace 的)，這即是其他內部(Kubernetes cluster 內)元件連結該 Pod 的通道

不過在其他東西之前，我想先提有哪些工具可以用來 debug 一個 Pod

> p.s. 在接下來的指令中，我都會直接用 `k` 替代 `kubectl`(想知道怎弄就去 google)，`$` 的變數開頭表示是你要按情況修改的參數

Auto completion 的一些討論: [https://discuss.kubernetes.io/t/kubectl-tips-and-tricks/192/10](https://discuss.kubernetes.io/t/kubectl-tips-and-tricks/192/10)

- `k get po`: 這是列出 pods 的意思
  注意是一個 namespace(預設是 deault 這個 namespace)底下的所有，但反正現在講這個就扯太遠，有興趣請參考 [Namespace Doc](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- `k logs $pod-name`: 要用這個指令之前你通常會需要上一個指令，因為 `logs` 吃的參數是 Pod 的名稱
  e.g.
  ```bash
  $ k get po
  NAME                                          READY   STATUS    RESTARTS   AGE
  acs-helloworld-callous-worm-7d549b8f9-dfbhx   1/1     Running   0          6h
  $ k logs acs-helloworld-callous-worm-7d549b8f9-dfbhx
  ```
  這裡 Pod 名字就是 `acs-helloworld-callous-worm-7d549b8f9-dfbhx`<br>
  這個指令可以拿到 Pod 中的 container 的 stdout 的輸出(所以我們這裡沒打 container 名稱是因為只有一個 container 存在)，
  你能用 `-c` 或 `--container` 指定特定的 container
  p.s. 等等我們建立 Pod 的時候會需要給 Pod 一個名字，那麼你可能會很好奇，為什麼這樣還需要指令？
  這是因為通常我們不會直接建立一個 Pod，而是用 Deployment 一次部署大量的 Pod，這時候產出的名字就跟你眼前所見的差不多糟糕
- `k describe po $pod-name`: 這個指令非常的重要，因為如果 Pod 根本無法啟動的話，你是拿不到 logs 的，這時候你就只能依靠 describe 取得 kubernetes 知道的訊息，這在環境出問題時可以幫助你更快的定位原因，例如 Node 沒資源給你了
- `k port-forward $pod-name $localhost-port:$pod-port`: 這可以把 Pod 的 `$pod-port` 對應到 localhost 的 `$localhost-port` 上，很適合在確定 Pod 如預期般工作時使用
- `k exec -ti $pod-name $command`: 這跟 Docker 的 exec 基本一樣，`$command` 用 `sh` 之類的就能進入 container 去做別的事

那麼，讓我們開始寫第一個 Pod 吧

```yaml
# alpine.yaml
apiVersion: v1
kind: Pod
metadata:
  name: debugger
  namespace: default
spec:
  containers:
    - name: alpine
      image: alpine
      command: ["sh", "-c", "echo The debugger is running && sleep 3600"]
  restartPolicy: Always
```

選擇這個樣板作為開始是因為我經常用這玩意來 debug 跟測試，所以推薦各位建立兩個這樣的 Pod 作為除錯/測試之用

接著我解釋一下這個設定檔:

- `apiVersion`: 這東西，不要懷疑，去看文件學什麼時候用什麼
- `kind`: Resource 的種類
- `metadata`: Pod 的一些資訊，這個設定檔有寫的是 `name` 跟 `namespace`，`name` 基本就是你 `get po` 看到的名字，`namespace` 則強制了只能部署在哪個 namespace 底下
- `spec`: 內容
  - `containers`: container 的列表，如開頭所言，Pod 是一群 container
    - `name`: container 的名字(多個 container 時可以用上)
    - `image`: 所使用的 container 映像檔
    - `command`: 啟動時執行的命令
  - `restartPolicy`: 設定 kubernetes 該如何決定何時/是否重啟 Pod，這裡是永遠重啟

Pod 可能在以下五種狀態之一，稱之為 Pod lifecycle:

- Pending: 還有 container image 沒建立完成
- Running: 底下還有 container 正在執行
- Succeeded: Pod 中所有的 container 都正確結束，且 Pod 不再重啟
- Failed: 至少一個 container 不正確的結束，且所有 container 都已被終止
- Unknown: 總之，拿不到 Pod 的狀態

restartPolicy 可以為

- Always(default): 如果執行結束了也要重啟
- OnFailure: 失敗時重啟
- Never: 掛了就不管了

在 [Pod lifecycle#example-states](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#example-states) 中有更詳盡的舉例可以學習

現在我們可以使用這個設定檔建立我們的 Pod 了，指令是 `k apply -f alpine.yaml`

`apply -f` 會套用你給的設定檔建立 Resource，同時也會檢查該設定檔的錯誤，如有錯誤是不會建立資源的

接著你應該會看到 `pod/alpine created` 這樣的回應，這就代表我們的 Pod 成功建立了

然後我們用 `logs` 指令去查看紀錄

```bash
$ k logs alpine
The debugger is running
```

你可以看到啟動時要求 container 執行的指令輸出

那麼這篇就告一段落，關於 Volume，有興趣的朋友可以先看 [Volumes](https://kubernetes.io/docs/concepts/storage/volumes/) 這篇官方介紹

### References:

#### [Kubernetes in Action](https://www.manning.com/books/kubernetes-in-action)

- Author: Marko Lukša
- ISBN: 978-1-617-29372-6

#### [Offical Pod Document](https://kubernetes.io/docs/concepts/workloads/pods/pod/)
