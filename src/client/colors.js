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

function rbg(r, g, b) {
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
  Snow                 : rbg(255, 250, 250),
  GhostWhite           : rbg(248, 248, 255),
  WhiteSmoke           : rbg(245, 245, 245),
  Gainsboro            : rbg(220, 220, 220),
  FloralWhite          : rbg(255, 250, 240),
  OldLace              : rbg(253, 245, 230),
  Linen                : rbg(250, 240, 230),
  AntiqueWhite         : rbg(250, 235, 215),
  PapayaWhip           : rbg(255, 239, 213),
  BlanchedAlmond       : rbg(255, 235, 205),
  Bisque               : rbg(255, 228, 196),
  PeachPuff            : rbg(255, 218, 185),
  NavajoWhite          : rbg(255, 222, 173),
  Moccasin             : rbg(255, 228, 181),
  Cornsilk             : rbg(255, 248, 220),
  Ivory                : rbg(255, 255, 240),
  LemonChiffon         : rbg(255, 250, 205),
  Seashell             : rbg(255, 245, 238),
  Honeydew             : rbg(240, 255, 240),
  MintCream            : rbg(245, 255, 250),
  Azure                : rbg(240, 255, 255),
  AliceBlue            : rbg(240, 248, 255),
  Lavender             : rbg(230, 230, 250),
  LavenderBlush        : rbg(255, 240, 245),
  MistyRose            : rbg(255, 228, 225),
  White                : rbg(255, 255, 255),
  Black                : rbg(0, 0, 0),
  DarkSlateGray        : rbg(47, 79, 79),
  DimGray              : rbg(105, 105, 105),
  SlateGray            : rbg(112, 128, 144),
  LightSlateGray       : rbg(119, 136, 153),
  Gray                 : rbg(190, 190, 190),
  LightGray            : rbg(211, 211, 211),
  MidnightBlue         : rbg(25, 25, 112),
  Navy                 : rbg(0, 0, 128),
  NavyBlue             : rbg(0, 0, 128),
  CornflowerBlue       : rbg(100, 149, 237),
  DarkSlateBlue        : rbg(72, 61, 139),
  SlateBlue            : rbg(106, 90, 205),
  MediumSlateBlue      : rbg(123, 104, 238),
  LightSlateBlue       : rbg(132, 112, 255),
  MediumBlue           : rbg(0, 0, 205),
  RoyalBlue            : rbg(65, 105, 225),
  Blue                 : rbg(0, 0, 255),
  DodgerBlue           : rbg(30, 144, 255),
  DeepSkyBlue          : rbg(0, 191, 255),
  SkyBlue              : rbg(135, 206, 235),
  LightSkyBlue         : rbg(135, 206, 250),
  SteelBlue            : rbg(70, 130, 180)
};
