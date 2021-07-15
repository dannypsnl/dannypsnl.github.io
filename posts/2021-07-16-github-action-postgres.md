---
title: "Run Postgres on GitHub Action"
date: "Thu Jul 15 19:11:19 UTC 2021"
categories:
  - cs
tags:
  - github action
  - postgres
---

For some projects, like Phoenix project, we need a database for testing. Good news is setting it up is simple:

```yaml
jobs:
  build:
    name: Build and test
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:11
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: my_app_test
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
```

This is all we need.
