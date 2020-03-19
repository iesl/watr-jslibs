//

const sampleShapesSerialized = {
  shapes: {
    // point: [x, y]",
    point: [10, 20],
    // line: [p1, p2]
    line: [[1, 2], [10, 20]],
    // circle: [point, radius]",
    circle: [[1, 2], 10],
    // rect: [x, y, width, height]",
    rect: [1, 2, 10, 20],
    // trapezoid: [p1, width1, p2, width2]",
    trapezoid: [[1, 2], 10, [20, 3], 15],
    // triangle: [p1, p2, p3]",
    triangle: [ [1, 2], [10, 20], [11, 50] ],
    // quadrilateral: [p1, p2, p3, p4]",
    quadrilateral: [ [1, 2], [10, 20], [11, 50], [31, 24] ]
  }
};
