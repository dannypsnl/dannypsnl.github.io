---
title: "How to compare Go benchmark in TravisCI"
categories:
  - cs
tags:
  - golang
  - testing
  - travis
---

Although the article is for Go, but you still can use concept part for others language.

Frist we create a script called `bench_compare.sh`:

```bash
if [ "${TRAVIS_PULL_REQUEST_BRANCH:-$TRAVIS_BRANCH}" != "master" ]; then
	REMOTE_URL="$(git config --get remote.origin.url)";
	cd ${TRAVIS_BUILD_DIR}/.. && \
	git clone ${REMOTE_URL} "${TRAVIS_REPO_SLUG}-bench" && \
	cd "${TRAVIS_REPO_SLUG}-bench" && \
	git checkout master && \
	go test -bench . ./... > master_bench.out && \
	git checkout ${TRAVIS_COMMIT} && \
	go test -bench . ./... > current_bench.out && \
	go get golang.org/x/tools/cmd/benchcmp && \
	benchcmp master_bench.out current_bench.out;
fi
```

Then I usually would execute it at `after_success` this section,
`.travis.yml`:

```
script:
  # testing part
after_success:
  # ignore
  - bash ./bench_compare.sh
```

p.s. write `script` part is just want to tell you it's located at that indention

Now let me explain the script, basically we peek `${TRAVIS_PULL_REQUEST_BRANCH:-$TRAVIS_BRANCH}` is not `master` first.
To make sure we are not at `master` branch, if we are not at `master`, then we start to compare the benchmark result.
Here has a point, `$(git config --get remote.origin.url)` is required, you can write `git checkout master` to know why.
Then we checkout `master` and `${TRAVIS_COMMIT}`(I think this variable already tell you what is it), do benchmarking and store them.
Final step we download `golang.org/x/tools/cmd/benchcmp` for comparing, and compare two result file.

To get more info, you can reference:

- [travis default variables](https://docs.travis-ci.com/user/environment-variables/#default-environment-variables)
- [godoc.org/golang.org/x/tools/cmd/benchcmp](godoc.org/golang.org/x/tools/cmd/benchcmp)

Thanks for reading
