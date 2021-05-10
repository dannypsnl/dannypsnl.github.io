---
title: "OpenCV introduction"
categories:
  - cs
tags:
  - OpenCV
  - cpp
---

## Install(Unix Like system)

### ffmpeg

[Download Page](https://www.ffmpeg.org/download.html)

```bash
$ ./configure --enable-shared
$ make
$ sudo make install
```

### OpenCV

[Download Page](https://opencv.org/releases.html)

```bash
$ mkdir release
$ cd release
$ cmake -D CMAKE_BUILD_TYPE=Release -D CMAKE_INSTALL_PREFIX=/usr/local ../
$ make
$ sudo make install
```

## Introduction

### Show Image

```cpp
// main.cc
#include <opencv2/opencv.hpp> // All OpenCV function's include file

int main(int argc, char** argv) {
  // image read
  cv::Mat img = cv::imread(argv[1], -1);
  if (img.empty()) return -1; // if no image, exit with -1

  // A window named Example, and with size of image
  cv::namedWindow( "Example", cv::WINDOW_AUTOSIZE );

  // Show img on window named Example
  cv::imshow( "Example", img );

  // Wait any key
  cv::waitKey(0);
  // Clean up
  cv::destroyWindow( "Example" );
}
```

Compile & Run it.<br>

```bash
$ clang++ -std=c++14 main.cc -lopencv_core -lopencv_highgui -lopencv_imgcodecs
```
