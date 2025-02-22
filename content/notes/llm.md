---
title: "使用 LLM 生成專案"
date: 2025-02-22
tags:
  - software
---

NOTE for https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/

# 生成專案規格書 prompt

```
Ask me one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on my previous answers, and our end goal is to have a detailed specification I can hand off to a developer. Let’s do this iteratively and dig into every relevant detail. Remember, only one question at a time.

Here’s the idea:

<IDEA>
```

完成後用

```
Now that we’ve wrapped up the brainstorming process, can you compile our findings into a comprehensive, developer-ready specification? Include all relevant requirements, architecture choices, data handling details, error handling strategies, and a testing plan so a developer can immediately begin implementation.
```

大部分的 LLM 都會回應一個 Markdown 格式的文字，儲存到 `spec.md`

# 實現計劃 prompt

```
Draft a detailed, step-by-step blueprint for building this project. Then, once you have a solid plan, break it down into small, iterative chunks that build on each other. Look at these chunks and then go another round to break it into small steps. Review the results and make sure that the steps are small enough to be implemented safely with strong testing, but big enough to move the project forward. Iterate until you feel that the steps are right sized for this project.

From here you should have the foundation to provide a series of prompts for a code-generation LLM that will implement each step in a test-driven manner. Prioritize best practices, incremental progress, and early testing, ensuring no big jumps in complexity at any stage. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step.

Make sure and separate each prompt section. Use markdown. Each prompt should be tagged as text using code tags. The goal is to output prompts, but context, etc is important as well.

<SPEC>
```

# 待辦清單 prompt

```
Can you make a `todo.md` that I can use as a checklist? Be thorough.
```

# 工具

| 工具                                            | 用途                           |
| ----------------------------------------------- | ------------------------------ |
| [repomix](https://github.com/yamadashy/repomix) | 把專案資訊 dump 到一個文字檔中 |
| [aider](https://aider.chat/)                    | 會執行測試與修復的循環生成環境 |

# 其他實用的 promopts

## code review

```
You are a senior developer. Your job is to do a thorough code review of this code. You should write it up and output markdown. Include line numbers, and contextual info. Your code review will be passed to another teammate, so be thorough. Think deeply  before writing the code review. Review every part, and don't hallucinate.
```

## 生成測試

```
You are a senior developer. Your job is to review this code, and write out a list of missing test cases, and code tests that should exist. You should be specific, and be very good. Do Not Hallucinate. Think quietly to yourself, then act - write the issues. The issues  will be given to a developer to executed on, so they should be in a format that is compatible with github issues
```
