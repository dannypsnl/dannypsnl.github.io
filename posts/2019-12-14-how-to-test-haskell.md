---
title: "How to test in Haskell: HSpec setup"
image: ../images/haskell/haskell.png
categories:
  - cs
tags:
  - haskell
  - beginner
  - testing
---

Before you start to read, ensure you're using Cabal >= 3.0 to manage your project.

For a **Haskell** project, I usually use Cabal, do not have any special reason. In the `xxx.cabal` file, we can define some common dependencies by `common` block:

```
-- just let you know how does the file should look like
-- with full content people can understand the structure better
cabal-version:       3.0

name:                your-module
version:             0.1.0.0
license:             MIT
license-file:        LICENSE
author:              your-name
maintainer:          your-name@email.com
-- Extra files to be distributed with the package, such as examples or a
-- README.
extra-source-files:  CHANGELOG.md

-- Common block
common shared-properties
  default-language: Haskell2010
  build-depends:
    base == 4.*, mtl >= 2.2
  ghc-options:
    -Wall
```

Then we can add `test-suite` block like this:

```
-- common block at here
library
  import: shared-properties
  exposed-modules:     YourModule
  other-modules:
  -- Directories containing source files.
  hs-source-dirs:      src
  default-language:    Haskell2010

test-suite spec
  import: shared-properties
  type: exitcode-stdio-1.0
  other-modules: YourModuleSpec SpecHelper
  hs-source-dirs: test
  main-is: Spec.hs
  build-depends: hspec >= 2.7
                 , hspec-discover >= 2.7
                 , your-module
  default-language:    Haskell2010
```

Create `$project-path/test/Spec.hs` and put:

```hs
{-# OPTIONS_GHC -F -pgmF hspec-discover #-}
```

And create `$project-path/test/SpecHelper.hs` and put:

```hs
module SpecHelper (
  module Test.Hspec
) where

import Test.Hspec
```

Finally, create `$project-path/test/YourModuleSpec.hs` and put:

```hs
module YourModuleSpec where
import SpecHelper
import YourModule

spec :: Spec
spec = describe "Your module" $ do
  context "has a function add can add two nature numbers" $ do
    (add 1 2) `shouldBe` 3

main :: IO ()
main = hspec spec
```

Then run commands:

```bash
cabal new-update
cabal new-install --only-dependencies
cabal install hspec-discover
cabal new-configure --enable-tests
cabal new-test
```

We finish the setup of testing now.
