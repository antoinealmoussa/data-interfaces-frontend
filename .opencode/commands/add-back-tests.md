---
description: Analyze back test coverage and add new ones if needed
agent: build
model: opencode/big-pickle
---

First, analyze the tests coverage in the back repository. The back tests are stored in the directory back/app/tests, the back code is stored in the directory back/app/*.

Then, add new tests respecting the existing structure :

- api tests must be stored in back/app/tests/api
- core tests must be stored in back/app/tests/core
- schemas tests must be stored in back/app/tests/schemas
- services tests must be stored in back/app/tests/services
- utils tests must be stored in back/app/tests/utils

If needed, create a new directory to fit the code as much as possible.

When the new tests are created, do not run them, you are only asked to analyze coverage and create new tests.
