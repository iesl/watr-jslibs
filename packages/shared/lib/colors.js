/**
 * A few color related utilities
 **/
export let labelColors = ['black', 'blue', 'green', 'brown', 'purple', 'rgba(90, 143, 298, 0.5)', 'rgba(30, 123, 298, 0.7)', 'rgba(30, 123, 298, 0.9)', 'rgba(20, 133, 198, 0.9)'];
export let colorMap = {
  "Caption": "blue",
  "Image": "brown",
  "CharRun": "chocolate",
  "CharRunBegin": "purple",
  "CharRunBaseline": "purple",
  "FontBaseline": "blue",
  "LeftAlignedCharCol": "crimson",
  "RightAlignedCharCol": "darkorchid",
  "LeftAlignedColEnd": "darkred",
  "HPageDivider": "darksalmon",
  "ColLeftEvidence": "darkturquoise",
  "ColRightEvidence": "firebrick",
  "PageLines": "green",
  "HLinePath": "indianred",
  "VLinePath": "khaki",
  "LinePath": "lavender",
  "OutlineBox": "magenta"
};

function rgb(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

export let SolarColor = {
  base03: "#002b36;",
  base02: "#073642;",
  base01: "#586e75;",
  base00: "#657b83;",
  base0: "#839496;",
  base1: "#93a1a1;",
  base2: "#eee8d5;",
  base3: "#fdf6e3;",
  yellow: "#b58900;",
  orange: "#cb4b16;",
  red: "#dc322f;",
  magenta: "#d33682;",
  violet: "#6c71c4;",
  blue: "#268bd2;",
  cyan: "#2aa198;",
  green: "#859900;"
};
export let Color = {
  Snow: rgb(255, 250, 250),
  GhostWhite: rgb(248, 248, 255),
  WhiteSmoke: rgb(245, 245, 245),
  Gainsboro: rgb(220, 220, 220),
  FloralWhite: rgb(255, 250, 240),
  OldLace: rgb(253, 245, 230),
  Linen: rgb(250, 240, 230),
  AntiqueWhite: rgb(250, 235, 215),
  PapayaWhip: rgb(255, 239, 213),
  BlanchedAlmond: rgb(255, 235, 205),
  Bisque: rgb(255, 228, 196),
  PeachPuff: rgb(255, 218, 185),
  NavajoWhite: rgb(255, 222, 173),
  Moccasin: rgb(255, 228, 181),
  Cornsilk: rgb(255, 248, 220),
  Ivory: rgb(255, 255, 240),
  LemonChiffon: rgb(255, 250, 205),
  Seashell: rgb(255, 245, 238),
  Honeydew: rgb(240, 255, 240),
  MintCream: rgb(245, 255, 250),
  Azure: rgb(240, 255, 255),
  AliceBlue: rgb(240, 248, 255),
  Lavender: rgb(230, 230, 250),
  LavenderBlush: rgb(255, 240, 245),
  MistyRose: rgb(255, 228, 225),
  White: rgb(255, 255, 255),
  Black: rgb(0, 0, 0),
  DarkSlateGray: rgb(47, 79, 79),
  DimGray: rgb(105, 105, 105),
  SlateGray: rgb(112, 128, 144),
  LightSlateGray: rgb(119, 136, 153),
  Gray: rgb(190, 190, 190),
  LightGray: rgb(211, 211, 211),
  MidnightBlue: rgb(25, 25, 112),
  Navy: rgb(0, 0, 128),
  NavyBlue: rgb(0, 0, 128),
  CornflowerBlue: rgb(100, 149, 237),
  DarkSlateBlue: rgb(72, 61, 139),
  SlateBlue: rgb(106, 90, 205),
  MediumSlateBlue: rgb(123, 104, 238),
  LightSlateBlue: rgb(132, 112, 255),
  MediumBlue: rgb(0, 0, 205),
  RoyalBlue: rgb(65, 105, 225),
  Blue: rgb(0, 0, 255),
  DodgerBlue: rgb(30, 144, 255),
  DeepSkyBlue: rgb(0, 191, 255),
  SkyBlue: rgb(135, 206, 235),
  LightSkyBlue: rgb(135, 206, 250),
  SteelBlue: rgb(70, 130, 180)
};
export let HighContrast = [rgb(255, 0, 0), rgb(76, 0, 0), // rgb(255,189,189),
// rgb(127,166,0),
// rgb(240,255,189),
rgb(0, 140, 65), rgb(19, 51, 34), rgb(0, 76, 255), rgb(75, 114, 204), rgb(179, 198, 242), rgb(238, 0, 255), rgb(110, 42, 115), rgb(63, 47, 64), rgb(242, 0, 0), rgb(51, 0, 0), rgb(153, 113, 113), rgb(88, 115, 0), rgb(156, 166, 123), rgb(0, 77, 36), rgb(179, 242, 209), rgb(0, 54, 179), rgb(47, 71, 128), rgb(123, 136, 166), rgb(131, 0, 140), rgb(238, 179, 242), rgb(178, 0, 0), rgb(217, 80, 80), rgb(77, 57, 57), rgb(76, 89, 33), rgb(84, 89, 66), rgb(75, 204, 135), rgb(123, 166, 143), rgb(0, 34, 115), rgb(33, 50, 89), rgb(75, 83, 102), rgb(60, 0, 64), rgb(175, 132, 179), rgb(115, 0, 0), rgb(102, 38, 38), rgb(195, 255, 0), rgb(44, 51, 19), rgb(0, 204, 95), rgb(42, 115, 76), rgb(66, 89, 77), rgb(0, 19, 64), rgb(19, 29, 51), rgb(47, 52, 64), rgb(195, 75, 204), rgb(125, 94, 128)];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2xvcnMudHMiXSwibmFtZXMiOlsibGFiZWxDb2xvcnMiLCJjb2xvck1hcCIsInJnYiIsInIiLCJnIiwiYiIsIlNvbGFyQ29sb3IiLCJiYXNlMDMiLCJiYXNlMDIiLCJiYXNlMDEiLCJiYXNlMDAiLCJiYXNlMCIsImJhc2UxIiwiYmFzZTIiLCJiYXNlMyIsInllbGxvdyIsIm9yYW5nZSIsInJlZCIsIm1hZ2VudGEiLCJ2aW9sZXQiLCJibHVlIiwiY3lhbiIsImdyZWVuIiwiQ29sb3IiLCJTbm93IiwiR2hvc3RXaGl0ZSIsIldoaXRlU21va2UiLCJHYWluc2Jvcm8iLCJGbG9yYWxXaGl0ZSIsIk9sZExhY2UiLCJMaW5lbiIsIkFudGlxdWVXaGl0ZSIsIlBhcGF5YVdoaXAiLCJCbGFuY2hlZEFsbW9uZCIsIkJpc3F1ZSIsIlBlYWNoUHVmZiIsIk5hdmFqb1doaXRlIiwiTW9jY2FzaW4iLCJDb3Juc2lsayIsIkl2b3J5IiwiTGVtb25DaGlmZm9uIiwiU2Vhc2hlbGwiLCJIb25leWRldyIsIk1pbnRDcmVhbSIsIkF6dXJlIiwiQWxpY2VCbHVlIiwiTGF2ZW5kZXIiLCJMYXZlbmRlckJsdXNoIiwiTWlzdHlSb3NlIiwiV2hpdGUiLCJCbGFjayIsIkRhcmtTbGF0ZUdyYXkiLCJEaW1HcmF5IiwiU2xhdGVHcmF5IiwiTGlnaHRTbGF0ZUdyYXkiLCJHcmF5IiwiTGlnaHRHcmF5IiwiTWlkbmlnaHRCbHVlIiwiTmF2eSIsIk5hdnlCbHVlIiwiQ29ybmZsb3dlckJsdWUiLCJEYXJrU2xhdGVCbHVlIiwiU2xhdGVCbHVlIiwiTWVkaXVtU2xhdGVCbHVlIiwiTGlnaHRTbGF0ZUJsdWUiLCJNZWRpdW1CbHVlIiwiUm95YWxCbHVlIiwiQmx1ZSIsIkRvZGdlckJsdWUiLCJEZWVwU2t5Qmx1ZSIsIlNreUJsdWUiLCJMaWdodFNreUJsdWUiLCJTdGVlbEJsdWUiLCJIaWdoQ29udHJhc3QiXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFJQSxPQUFPLElBQUlBLFdBQVcs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LEVBQU8sRUFBUCxDQXZCM1EsRUF1QnVSQSxHQUFHLENBQUMsQ0FBRCxFQUFHLEdBQUgsRUFBTyxFQUFQLENBdkIxUixFQXVCc1NBLEdBQUcsQ0FBQyxFQUFELEVBQUksR0FBSixFQUFRLEVBQVIsQ0F2QnpTLEVBdUJzVEEsR0FBRyxDQUFDLEVBQUQsRUFBSSxFQUFKLEVBQU8sRUFBUCxDQXZCelQsRUF1QnFVQSxHQUFHLENBQUMsQ0FBRCxFQUFHLEVBQUgsRUFBTSxFQUFOLENBdkJ4VSxFQXVCbVZBLEdBQUcsQ0FBQyxFQUFELEVBQUksRUFBSixFQUFPLEVBQVAsQ0F2QnRWLEVBdUJrV0EsR0FBRyxDQUFDLEVBQUQsRUFBSSxFQUFKLEVBQU8sRUFBUCxDQXZCclcsRUF1QmlYQSxHQUFHLENBQUMsR0FBRCxFQUFLLEVBQUwsRUFBUSxHQUFSLENBdkJwWCxFQXVCa1lBLEdBQUcsQ0FBQyxHQUFELEVBQUssRUFBTCxFQUFRLEdBQVIsQ0F2QnJZLENBQW5CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBIGZldyBjb2xvciByZWxhdGVkIHV0aWxpdGllc1xuICoqL1xuXG5leHBvcnQgbGV0IGxhYmVsQ29sb3JzID0gIFtcbiAgICAnYmxhY2snLFxuICAgICdibHVlJyxcbiAgICAnZ3JlZW4nLFxuICAgICdicm93bicsXG4gICAgJ3B1cnBsZScsXG4gICAgJ3JnYmEoOTAsIDE0MywgMjk4LCAwLjUpJyxcbiAgICAncmdiYSgzMCwgMTIzLCAyOTgsIDAuNyknLFxuICAgICdyZ2JhKDMwLCAxMjMsIDI5OCwgMC45KScsXG4gICAgJ3JnYmEoMjAsIDEzMywgMTk4LCAwLjkpJ1xuXTtcblxuXG5leHBvcnQgbGV0IGNvbG9yTWFwID0ge1xuICAgIFwiQ2FwdGlvblwiICAgICAgICAgICAgICAgIDogXCJibHVlXCIsXG4gICAgXCJJbWFnZVwiICAgICAgICAgICAgICAgICAgOiBcImJyb3duXCIsXG4gICAgXCJDaGFyUnVuXCIgICAgICAgICAgICAgICAgOiBcImNob2NvbGF0ZVwiLFxuICAgIFwiQ2hhclJ1bkJlZ2luXCIgICAgICAgICAgIDogXCJwdXJwbGVcIixcbiAgICBcIkNoYXJSdW5CYXNlbGluZVwiICAgICAgICA6IFwicHVycGxlXCIsXG4gICAgXCJGb250QmFzZWxpbmVcIiAgICAgICAgICAgOiBcImJsdWVcIixcbiAgICBcIkxlZnRBbGlnbmVkQ2hhckNvbFwiICAgICA6IFwiY3JpbXNvblwiLFxuICAgIFwiUmlnaHRBbGlnbmVkQ2hhckNvbFwiICAgIDogXCJkYXJrb3JjaGlkXCIsXG4gICAgXCJMZWZ0QWxpZ25lZENvbEVuZFwiICAgICAgOiBcImRhcmtyZWRcIixcbiAgICBcIkhQYWdlRGl2aWRlclwiICAgICAgICAgICA6IFwiZGFya3NhbG1vblwiLFxuICAgIFwiQ29sTGVmdEV2aWRlbmNlXCIgICAgICAgIDogXCJkYXJrdHVycXVvaXNlXCIsXG4gICAgXCJDb2xSaWdodEV2aWRlbmNlXCIgICAgICAgOiBcImZpcmVicmlja1wiLFxuICAgIFwiUGFnZUxpbmVzXCIgICAgICAgICAgICAgIDogXCJncmVlblwiLFxuICAgIFwiSExpbmVQYXRoXCIgICAgICAgICAgICAgIDogXCJpbmRpYW5yZWRcIixcbiAgICBcIlZMaW5lUGF0aFwiICAgICAgICAgICAgICA6IFwia2hha2lcIixcbiAgICBcIkxpbmVQYXRoXCIgICAgICAgICAgICAgICA6IFwibGF2ZW5kZXJcIixcbiAgICBcIk91dGxpbmVCb3hcIiAgICAgICAgICAgICA6IFwibWFnZW50YVwiXG59IDtcblxuZnVuY3Rpb24gcmdiKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIpIHtcbiAgICByZXR1cm4gYHJnYigke3J9LCAke2d9LCAke2J9KWA7XG59XG5cbmV4cG9ydCBsZXQgU29sYXJDb2xvciA9IHtcbiAgICBiYXNlMDM6ICAgIFwiIzAwMmIzNjtcIixcbiAgICBiYXNlMDI6ICAgIFwiIzA3MzY0MjtcIixcbiAgICBiYXNlMDE6ICAgIFwiIzU4NmU3NTtcIixcbiAgICBiYXNlMDA6ICAgIFwiIzY1N2I4MztcIixcbiAgICBiYXNlMDogICAgIFwiIzgzOTQ5NjtcIixcbiAgICBiYXNlMTogICAgIFwiIzkzYTFhMTtcIixcbiAgICBiYXNlMjogICAgIFwiI2VlZThkNTtcIixcbiAgICBiYXNlMzogICAgIFwiI2ZkZjZlMztcIixcbiAgICB5ZWxsb3c6ICAgIFwiI2I1ODkwMDtcIixcbiAgICBvcmFuZ2U6ICAgIFwiI2NiNGIxNjtcIixcbiAgICByZWQ6ICAgICAgIFwiI2RjMzIyZjtcIixcbiAgICBtYWdlbnRhOiAgIFwiI2QzMzY4MjtcIixcbiAgICB2aW9sZXQ6ICAgIFwiIzZjNzFjNDtcIixcbiAgICBibHVlOiAgICAgIFwiIzI2OGJkMjtcIixcbiAgICBjeWFuOiAgICAgIFwiIzJhYTE5ODtcIixcbiAgICBncmVlbjogICAgIFwiIzg1OTkwMDtcIlxufTtcblxuZXhwb3J0IGxldCBDb2xvciA9IHtcbiAgU25vdyAgICAgICAgICAgICAgICAgOiByZ2IoMjU1LCAyNTAsIDI1MCksXG4gIEdob3N0V2hpdGUgICAgICAgICAgIDogcmdiKDI0OCwgMjQ4LCAyNTUpLFxuICBXaGl0ZVNtb2tlICAgICAgICAgICA6IHJnYigyNDUsIDI0NSwgMjQ1KSxcbiAgR2FpbnNib3JvICAgICAgICAgICAgOiByZ2IoMjIwLCAyMjAsIDIyMCksXG4gIEZsb3JhbFdoaXRlICAgICAgICAgIDogcmdiKDI1NSwgMjUwLCAyNDApLFxuICBPbGRMYWNlICAgICAgICAgICAgICA6IHJnYigyNTMsIDI0NSwgMjMwKSxcbiAgTGluZW4gICAgICAgICAgICAgICAgOiByZ2IoMjUwLCAyNDAsIDIzMCksXG4gIEFudGlxdWVXaGl0ZSAgICAgICAgIDogcmdiKDI1MCwgMjM1LCAyMTUpLFxuICBQYXBheWFXaGlwICAgICAgICAgICA6IHJnYigyNTUsIDIzOSwgMjEzKSxcbiAgQmxhbmNoZWRBbG1vbmQgICAgICAgOiByZ2IoMjU1LCAyMzUsIDIwNSksXG4gIEJpc3F1ZSAgICAgICAgICAgICAgIDogcmdiKDI1NSwgMjI4LCAxOTYpLFxuICBQZWFjaFB1ZmYgICAgICAgICAgICA6IHJnYigyNTUsIDIxOCwgMTg1KSxcbiAgTmF2YWpvV2hpdGUgICAgICAgICAgOiByZ2IoMjU1LCAyMjIsIDE3MyksXG4gIE1vY2Nhc2luICAgICAgICAgICAgIDogcmdiKDI1NSwgMjI4LCAxODEpLFxuICBDb3Juc2lsayAgICAgICAgICAgICA6IHJnYigyNTUsIDI0OCwgMjIwKSxcbiAgSXZvcnkgICAgICAgICAgICAgICAgOiByZ2IoMjU1LCAyNTUsIDI0MCksXG4gIExlbW9uQ2hpZmZvbiAgICAgICAgIDogcmdiKDI1NSwgMjUwLCAyMDUpLFxuICBTZWFzaGVsbCAgICAgICAgICAgICA6IHJnYigyNTUsIDI0NSwgMjM4KSxcbiAgSG9uZXlkZXcgICAgICAgICAgICAgOiByZ2IoMjQwLCAyNTUsIDI0MCksXG4gIE1pbnRDcmVhbSAgICAgICAgICAgIDogcmdiKDI0NSwgMjU1LCAyNTApLFxuICBBenVyZSAgICAgICAgICAgICAgICA6IHJnYigyNDAsIDI1NSwgMjU1KSxcbiAgQWxpY2VCbHVlICAgICAgICAgICAgOiByZ2IoMjQwLCAyNDgsIDI1NSksXG4gIExhdmVuZGVyICAgICAgICAgICAgIDogcmdiKDIzMCwgMjMwLCAyNTApLFxuICBMYXZlbmRlckJsdXNoICAgICAgICA6IHJnYigyNTUsIDI0MCwgMjQ1KSxcbiAgTWlzdHlSb3NlICAgICAgICAgICAgOiByZ2IoMjU1LCAyMjgsIDIyNSksXG4gIFdoaXRlICAgICAgICAgICAgICAgIDogcmdiKDI1NSwgMjU1LCAyNTUpLFxuICBCbGFjayAgICAgICAgICAgICAgICA6IHJnYigwLCAwLCAwKSxcbiAgRGFya1NsYXRlR3JheSAgICAgICAgOiByZ2IoNDcsIDc5LCA3OSksXG4gIERpbUdyYXkgICAgICAgICAgICAgIDogcmdiKDEwNSwgMTA1LCAxMDUpLFxuICBTbGF0ZUdyYXkgICAgICAgICAgICA6IHJnYigxMTIsIDEyOCwgMTQ0KSxcbiAgTGlnaHRTbGF0ZUdyYXkgICAgICAgOiByZ2IoMTE5LCAxMzYsIDE1MyksXG4gIEdyYXkgICAgICAgICAgICAgICAgIDogcmdiKDE5MCwgMTkwLCAxOTApLFxuICBMaWdodEdyYXkgICAgICAgICAgICA6IHJnYigyMTEsIDIxMSwgMjExKSxcbiAgTWlkbmlnaHRCbHVlICAgICAgICAgOiByZ2IoMjUsIDI1LCAxMTIpLFxuICBOYXZ5ICAgICAgICAgICAgICAgICA6IHJnYigwLCAwLCAxMjgpLFxuICBOYXZ5Qmx1ZSAgICAgICAgICAgICA6IHJnYigwLCAwLCAxMjgpLFxuICBDb3JuZmxvd2VyQmx1ZSAgICAgICA6IHJnYigxMDAsIDE0OSwgMjM3KSxcbiAgRGFya1NsYXRlQmx1ZSAgICAgICAgOiByZ2IoNzIsIDYxLCAxMzkpLFxuICBTbGF0ZUJsdWUgICAgICAgICAgICA6IHJnYigxMDYsIDkwLCAyMDUpLFxuICBNZWRpdW1TbGF0ZUJsdWUgICAgICA6IHJnYigxMjMsIDEwNCwgMjM4KSxcbiAgTGlnaHRTbGF0ZUJsdWUgICAgICAgOiByZ2IoMTMyLCAxMTIsIDI1NSksXG4gIE1lZGl1bUJsdWUgICAgICAgICAgIDogcmdiKDAsIDAsIDIwNSksXG4gIFJveWFsQmx1ZSAgICAgICAgICAgIDogcmdiKDY1LCAxMDUsIDIyNSksXG4gIEJsdWUgICAgICAgICAgICAgICAgIDogcmdiKDAsIDAsIDI1NSksXG4gIERvZGdlckJsdWUgICAgICAgICAgIDogcmdiKDMwLCAxNDQsIDI1NSksXG4gIERlZXBTa3lCbHVlICAgICAgICAgIDogcmdiKDAsIDE5MSwgMjU1KSxcbiAgU2t5Qmx1ZSAgICAgICAgICAgICAgOiByZ2IoMTM1LCAyMDYsIDIzNSksXG4gIExpZ2h0U2t5Qmx1ZSAgICAgICAgIDogcmdiKDEzNSwgMjA2LCAyNTApLFxuICBTdGVlbEJsdWUgICAgICAgICAgICA6IHJnYig3MCwgMTMwLCAxODApXG59O1xuXG5cbmV4cG9ydCBsZXQgSGlnaENvbnRyYXN0ID0gW1xuICAgIHJnYigyNTUsMCwwKSxcbiAgICByZ2IoNzYsMCwwKSxcbiAgICAvLyByZ2IoMjU1LDE4OSwxODkpLFxuICAgIC8vIHJnYigxMjcsMTY2LDApLFxuICAgIC8vIHJnYigyNDAsMjU1LDE4OSksXG4gICAgcmdiKDAsMTQwLDY1KSxcbiAgICByZ2IoMTksNTEsMzQpLFxuICAgIHJnYigwLDc2LDI1NSksXG4gICAgcmdiKDc1LDExNCwyMDQpLFxuICAgIHJnYigxNzksMTk4LDI0MiksXG4gICAgcmdiKDIzOCwwLDI1NSksXG4gICAgcmdiKDExMCw0MiwxMTUpLFxuICAgIHJnYig2Myw0Nyw2NCksXG4gICAgcmdiKDI0MiwwLDApLFxuICAgIHJnYig1MSwwLDApLFxuICAgIHJnYigxNTMsMTEzLDExMyksXG4gICAgcmdiKDg4LDExNSwwKSxcbiAgICByZ2IoMTU2LDE2NiwxMjMpLFxuICAgIHJnYigwLDc3LDM2KSxcbiAgICByZ2IoMTc5LDI0MiwyMDkpLFxuICAgIHJnYigwLDU0LDE3OSksXG4gICAgcmdiKDQ3LDcxLDEyOCksXG4gICAgcmdiKDEyMywxMzYsMTY2KSwgcmdiKDEzMSwwLDE0MCksIHJnYigyMzgsMTc5LDI0MiksIHJnYigxNzgsMCwwKSwgcmdiKDIxNyw4MCw4MCksIHJnYig3Nyw1Nyw1NyksIHJnYig3Niw4OSwzMyksIHJnYig4NCw4OSw2NiksIHJnYig3NSwyMDQsMTM1KSwgcmdiKDEyMywxNjYsMTQzKSwgcmdiKDAsMzQsMTE1KSwgcmdiKDMzLDUwLDg5KSwgcmdiKDc1LDgzLDEwMiksIHJnYig2MCwwLDY0KSwgcmdiKDE3NSwxMzIsMTc5KSwgcmdiKDExNSwwLDApLCByZ2IoMTAyLDM4LDM4KSwgcmdiKDE5NSwyNTUsMCksIHJnYig0NCw1MSwxOSksIHJnYigwLDIwNCw5NSksIHJnYig0MiwxMTUsNzYpLCByZ2IoNjYsODksNzcpLCByZ2IoMCwxOSw2NCksIHJnYigxOSwyOSw1MSksIHJnYig0Nyw1Miw2NCksIHJnYigxOTUsNzUsMjA0KSwgcmdiKDEyNSw5NCwxMjgpXG5dO1xuIl19