/**
 * A few color related utilities
 **/

/* global require _ d3 */

export let labelColors =  [
    'black',
    'blue',
    'green',
    'brown',
    'purple',
    'rgba(90, 143, 298, 0.5)',
    'rgba(30, 123, 298, 0.7)',
    'rgba(30, 123, 298, 0.9)',
    'rgba(20, 133, 198, 0.9)'
];


export let colorMap = {
    "Caption"                : "blue",
    "Image"                  : "brown",
    "CharRun"                : "chocolate",
    "CharRunBegin"           : "purple",
    "CharRunBaseline"        : "purple",
    "FontBaseline"           : "blue",
    "LeftAlignedCharCol"     : "crimson",
    "RightAlignedCharCol"    : "darkorchid",
    "LeftAlignedColEnd"      : "darkred",
    "HPageDivider"           : "darksalmon",
    "ColLeftEvidence"        : "darkturquoise",
    "ColRightEvidence"       : "firebrick",
    "PageLines"              : "green",
    "HLinePath"              : "indianred",
    "VLinePath"              : "khaki",
    "LinePath"               : "lavender",
    "OutlineBox"             : "magenta"
} ;

function rgb(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
}

export let SolarColor = {
    base03:    "#002b36;",
    base02:    "#073642;",
    base01:    "#586e75;",
    base00:    "#657b83;",
    base0:     "#839496;",
    base1:     "#93a1a1;",
    base2:     "#eee8d5;",
    base3:     "#fdf6e3;",
    yellow:    "#b58900;",
    orange:    "#cb4b16;",
    red:       "#dc322f;",
    magenta:   "#d33682;",
    violet:    "#6c71c4;",
    blue:      "#268bd2;",
    cyan:      "#2aa198;",
    green:     "#859900;"
};

export let Color = {
  Snow                 : rgb(255, 250, 250),
  GhostWhite           : rgb(248, 248, 255),
  WhiteSmoke           : rgb(245, 245, 245),
  Gainsboro            : rgb(220, 220, 220),
  FloralWhite          : rgb(255, 250, 240),
  OldLace              : rgb(253, 245, 230),
  Linen                : rgb(250, 240, 230),
  AntiqueWhite         : rgb(250, 235, 215),
  PapayaWhip           : rgb(255, 239, 213),
  BlanchedAlmond       : rgb(255, 235, 205),
  Bisque               : rgb(255, 228, 196),
  PeachPuff            : rgb(255, 218, 185),
  NavajoWhite          : rgb(255, 222, 173),
  Moccasin             : rgb(255, 228, 181),
  Cornsilk             : rgb(255, 248, 220),
  Ivory                : rgb(255, 255, 240),
  LemonChiffon         : rgb(255, 250, 205),
  Seashell             : rgb(255, 245, 238),
  Honeydew             : rgb(240, 255, 240),
  MintCream            : rgb(245, 255, 250),
  Azure                : rgb(240, 255, 255),
  AliceBlue            : rgb(240, 248, 255),
  Lavender             : rgb(230, 230, 250),
  LavenderBlush        : rgb(255, 240, 245),
  MistyRose            : rgb(255, 228, 225),
  White                : rgb(255, 255, 255),
  Black                : rgb(0, 0, 0),
  DarkSlateGray        : rgb(47, 79, 79),
  DimGray              : rgb(105, 105, 105),
  SlateGray            : rgb(112, 128, 144),
  LightSlateGray       : rgb(119, 136, 153),
  Gray                 : rgb(190, 190, 190),
  LightGray            : rgb(211, 211, 211),
  MidnightBlue         : rgb(25, 25, 112),
  Navy                 : rgb(0, 0, 128),
  NavyBlue             : rgb(0, 0, 128),
  CornflowerBlue       : rgb(100, 149, 237),
  DarkSlateBlue        : rgb(72, 61, 139),
  SlateBlue            : rgb(106, 90, 205),
  MediumSlateBlue      : rgb(123, 104, 238),
  LightSlateBlue       : rgb(132, 112, 255),
  MediumBlue           : rgb(0, 0, 205),
  RoyalBlue            : rgb(65, 105, 225),
  Blue                 : rgb(0, 0, 255),
  DodgerBlue           : rgb(30, 144, 255),
  DeepSkyBlue          : rgb(0, 191, 255),
  SkyBlue              : rgb(135, 206, 235),
  LightSkyBlue         : rgb(135, 206, 250),
  SteelBlue            : rgb(70, 130, 180)
};


export let HighContrast = [
    rgb(255,0,0),
    rgb(76,0,0),
    // rgb(255,189,189),
    // rgb(127,166,0),
    // rgb(240,255,189),
    rgb(0,140,65),
    rgb(19,51,34),
    rgb(0,76,255),
    rgb(75,114,204),
    rgb(179,198,242),
    rgb(238,0,255),
    rgb(110,42,115),
    rgb(63,47,64),
    rgb(242,0,0),
    rgb(51,0,0),
    rgb(153,113,113),
    rgb(88,115,0),
    rgb(156,166,123),
    rgb(0,77,36),
    rgb(179,242,209),
    rgb(0,54,179),
    rgb(47,71,128),
    rgb(123,136,166), rgb(131,0,140), rgb(238,179,242), rgb(178,0,0), rgb(217,80,80), rgb(77,57,57), rgb(76,89,33), rgb(84,89,66), rgb(75,204,135), rgb(123,166,143), rgb(0,34,115), rgb(33,50,89), rgb(75,83,102), rgb(60,0,64), rgb(175,132,179), rgb(115,0,0), rgb(102,38,38), rgb(195,255,0), rgb(44,51,19), rgb(0,204,95), rgb(42,115,76), rgb(66,89,77), rgb(0,19,64), rgb(19,29,51), rgb(47,52,64), rgb(195,75,204), rgb(125,94,128)
];
