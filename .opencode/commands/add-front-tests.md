---
description: Analyze front test coverage and add new ones if needed
agent: build
model: opencode/big-pickle
---

First, analyze the tests coverage in the front repository. The front tests are stored in the directory front/src/test, the front code is stored in the directory front/src/*.

Then, add new tests respecting the existing structure :

- api tests must be stored in front/src/test/api
- component tests must be stored in front/src/test/components
- context tests must be stored in front/src/test/contexts
- hook tests must be stored in front/src/test/hooks
- page tests must be stored in front/src/test/pages
- type tests must be stored in front/src/test/types

If needed, create a new directory to fit the code as much as possible.

When the new tests are created, do not run them, you are only asked to analyze coverage and create new tests.
