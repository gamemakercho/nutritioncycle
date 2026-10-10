export const BIKE_MANIFEST = {
  "version": 2,
  "assets": {
    "riderFrame": "assets/rider_frame_sheet.webp",
    "rearWheel": "assets/rear_food_wheel.webp",
    "frontWheel": "assets/front_water_wheel.webp"
  },
  "sheetSize": [
    1774,
    887
  ],
  "animations": {
    "normal": [
      "normal_0",
      "normal_1",
      "normal_2",
      "normal_3"
    ],
    "fast": [
      "fast_0",
      "fast_1",
      "fast_2",
      "fast_3"
    ]
  },
  "animation": {
    "fastEnterKmh": 70,
    "fastExitKmh": 65
  },
  "frames": {
    "normal_0": {
      "sourceRect": [
        0,
        0,
        443,
        423
      ],
      "rearAxle": [
        68.5,
        341.5
      ],
      "frontAxle": [
        374.0,
        381.0
      ]
    },
    "normal_1": {
      "sourceRect": [
        443,
        0,
        444,
        423
      ],
      "rearAxle": [
        72.5,
        341.5
      ],
      "frontAxle": [
        377.0,
        381.0
      ]
    },
    "normal_2": {
      "sourceRect": [
        887,
        0,
        443,
        423
      ],
      "rearAxle": [
        80.5,
        341.5
      ],
      "frontAxle": [
        395.0,
        381.0
      ]
    },
    "normal_3": {
      "sourceRect": [
        1330,
        0,
        444,
        423
      ],
      "rearAxle": [
        86.5,
        341.5
      ],
      "frontAxle": [
        396.5,
        381.5
      ]
    },
    "fast_0": {
      "sourceRect": [
        0,
        423,
        443,
        464
      ],
      "rearAxle": [
        68.0,
        306.0
      ],
      "frontAxle": [
        410.5,
        355.5
      ]
    },
    "fast_1": {
      "sourceRect": [
        443,
        423,
        444,
        464
      ],
      "rearAxle": [
        73.0,
        306.0
      ],
      "frontAxle": [
        411.0,
        355.5
      ]
    },
    "fast_2": {
      "sourceRect": [
        887,
        423,
        443,
        464
      ],
      "rearAxle": [
        79.0,
        306.0
      ],
      "frontAxle": [
        411.0,
        355.5
      ]
    },
    "fast_3": {
      "sourceRect": [
        1330,
        423,
        444,
        464
      ],
      "rearAxle": [
        81.0,
        306.0
      ],
      "frontAxle": [
        409.0,
        355.5
      ]
    }
  },
  "world": {
    "width": 560,
    "height": 560,
    "groundY": 512,
    "rearAxle": [
      140,
      380
    ],
    "frontAxle": [
      480,
      452
    ]
  },
  "wheels": {
    "rearWheel": {
      "center": [
        140,
        380
      ],
      "radius": 132,
      "pivot": [
        626.5,
        629.0
      ],
      "nativeRadius": 509.0,
      "imageSize": [
        1254,
        1254
      ],
      "opaqueBounds": [
        125,
        118,
        1130,
        1138
      ]
    },
    "frontWheel": {
      "center": [
        480,
        452
      ],
      "radius": 60,
      "pivot": [
        626.5,
        638.5
      ],
      "nativeRadius": 494.5,
      "imageSize": [
        1254,
        1254
      ],
      "opaqueBounds": [
        139,
        145,
        1116,
        1133
      ]
    }
  },
  "notes": "Original generated PNG bytes are unchanged. Per-frame similarity transforms align both wheel mounts."
};
