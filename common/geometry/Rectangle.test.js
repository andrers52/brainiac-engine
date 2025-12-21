import { strict as assert } from 'assert';
import { Rectangle, rect } from './Rectangle.js';
import { Vector } from './Vector.js';

describe('Rectangle', function () {
  it('should be created as type Rectangle', function () {
    assert.ok(new Rectangle() instanceof Rectangle);
  });

  it('should provide a constructor with default values', function () {
    let rectangle = new Rectangle();
    assert.strictEqual(rectangle.topLeft().x, 0);
    assert.strictEqual(rectangle.topLeft().y, 0);
    assert.strictEqual(rectangle.bottomRight().x, 0);
    assert.strictEqual(rectangle.bottomRight().y, 0);
  });

  it('should provide a constructor defining initial values', function () {
    let rectangle = new Rectangle(new Vector(), new Vector(10, 10));

    assert.strictEqual(rectangle.topLeft().x, -5);
    assert.strictEqual(rectangle.topLeft().y, 5);
    assert.strictEqual(rectangle.bottomRight().x, 5);
    assert.strictEqual(rectangle.bottomRight().y, -5);
    assert.strictEqual(rectangle.topRight().x, 5);
    assert.strictEqual(rectangle.topRight().y, 5);
    assert.strictEqual(rectangle.bottomLeft().x, -5);
    assert.strictEqual(rectangle.bottomLeft().y, -5);
  });

  it('should check if a point is inside the rectangle', function () {
    let rectangle = new Rectangle(new Vector(10, 10), new Vector(10, 10));

    assert.ok(rectangle.checkPointInside(new Vector(5, 5)));
    assert.ok(rectangle.checkPointInside(new Vector(15, 5)));
    assert.ok(rectangle.checkPointInside(new Vector(15, 15)));
    assert.ok(rectangle.checkPointInside(new Vector(5, 15)));
  });

  it('should have its center inside itself', function () {
    let rectangle = new Rectangle(new Vector(10, 10), new Vector(10, 10));
    assert.ok(rectangle.checkPointInside(rectangle.center));
  });

  it('should detect a smaller rectangle at its position is inside it', function () {
    let internalRectangle = new Rectangle(new Vector(0, 0), new Vector(1, 1));
    let externalRectangle = new Rectangle(new Vector(0, 0), new Vector(2, 2));
    assert.ok(externalRectangle.checkInside(internalRectangle));
  });

  it('should detect a rectangle in its right upper corner as being inside it', function () {
    let internalRectangle = new Rectangle(
      new Vector(0.5, 0.5),
      new Vector(1, 1),
    );
    let externalRectangle = new Rectangle(new Vector(0, 0), new Vector(2, 2));
    assert.ok(externalRectangle.checkInside(internalRectangle));
  });

  it('should detect a rectangle in its left upper corner as being inside it', function () {
    let internalRectangle = new Rectangle(
      new Vector(-0.5, 0.5),
      new Vector(1, 1),
    );
    let externalRectangle = new Rectangle(new Vector(0, 0), new Vector(2, 2));
    assert.ok(externalRectangle.checkInside(internalRectangle));
  });

  it('should detect a rectangle in its left bottom corner as being inside it', function () {
    let internalRectangle = new Rectangle(
      new Vector(-0.5, -0.5),
      new Vector(1, 1),
    );
    let externalRectangle = new Rectangle(new Vector(0, 0), new Vector(2, 2));
    assert.ok(externalRectangle.checkInside(internalRectangle));
  });

  it('should detect a rectangle in its right bottom corner as being inside it', function () {
    let internalRectangle = new Rectangle(
      new Vector(0.5, -0.5),
      new Vector(1, 1),
    );
    let externalRectangle = new Rectangle(new Vector(0, 0), new Vector(2, 2));
    assert.ok(externalRectangle.checkInside(internalRectangle));
  });

  it('should detect a position is outside', function () {
    let rectangle = new Rectangle(new Vector(10, 10), new Vector(10, 10));

    assert.ok(!rectangle.checkPointInside(new Vector(20, 20)));
    assert.ok(!rectangle.checkPointInside(new Vector(5, 20)));
    assert.ok(!rectangle.checkPointInside(new Vector(20, 15)));
  });

  it('should move from position to position + vector', function () {
    let center1 = new Vector(10, 10);
    let size = new Vector(20, 20);
    let moveDistance = new Vector(30, 30);
    let rectangle1 = new Rectangle(center1, size);
    let rectangle2 = rectangle1.clone();
    rectangle2.move(moveDistance);
    let center2 = center1.clone().add(moveDistance);

    assert.ok(rectangle1.center.equal(center1));
    assert.ok(rectangle2.center.equal(center2));
  });

  it('should detect intersection with another rectangle', function () {
    let center = new Vector(0, 0);
    let size = new Vector(20, 20);
    let rectangleOutside = new Rectangle(center, size);
    let rectangleInside = new Rectangle(center, size.clone().divideByScalar(2));

    //inside rectangle should be considered as intersection (containment is a form of intersection)
    assert.ok(rectangleOutside.checkInside(rectangleInside)); // rectangleInside is inside rectangleOutside
    assert.ok(rectangleInside.checkIntersection(rectangleOutside)); // and they intersect (containment counts as intersection)

    let center2 = new Vector(10, 10);
    let intersectingRectangle = new Rectangle(center2, size);
    assert.ok(rectangleOutside.checkIntersection(intersectingRectangle));
  });

  it('should detect no intersection between rectangles', function () {
    let center1 = new Vector(0, 0);
    let center2 = new Vector(10, 10);
    let size = new Vector(2, 2);
    let rectangle1 = new Rectangle(center1, size);
    let rectangle2 = new Rectangle(center2, size);

    assert.ok(!rectangle1.checkIntersection(rectangle2));
  });

  it('should clone a rectangle', function () {
    let center = new Vector(0, 0);
    let size = new Vector(2, 2);
    let rectangle1 = new Rectangle(center, size);
    let rectangle2 = rectangle1.clone();

    assert.ok(rectangle1.center.equal(rectangle2.center));
    assert.ok(rectangle1.size.equal(rectangle2.size));
  });

  it('should pick greater and smaller X and Y', function () {
    let center1 = new Vector(0, 0);
    let center2 = new Vector(10, 10);
    let size1 = new Vector(1, 2);
    let size2 = new Vector(2, 1);
    let rectangle1 = new Rectangle(center1, size1);
    let rectangle2 = new Rectangle(center2, size2);

    assert.strictEqual(
      Rectangle.pickGreaterX(rectangle1, rectangle2).toString(),
      rectangle2.toString(),
    );
    assert.strictEqual(
      Rectangle.pickGreaterY(rectangle1, rectangle2).toString(),
      rectangle1.toString(),
    );
    assert.strictEqual(
      Rectangle.pickSmallerX(rectangle1, rectangle2).toString(),
      rectangle1.toString(),
    );
    assert.strictEqual(
      Rectangle.pickSmallerY(rectangle1, rectangle2).toString(),
      rectangle2.toString(),
    );
  });

  it('should detect intersection without corners inside', function () {
    let origin = new Vector(0, 0);
    let size1 = new Vector(20, 5);
    let size2 = new Vector(5, 20);
    let rectangle1 = new Rectangle(origin, size1);
    let rectangle2 = new Rectangle(origin, size2);

    assert.ok(rectangle1.checkIntersection(rectangle2));
  });

  it('should make a rectangle from corners', function () {
    let bottomLeft = new Vector(0, 0);
    let topRight = new Vector(2, 1);
    let result = Rectangle.makeFromCorners(bottomLeft, topRight);
    let expectedCenter = new Vector(1, 0.5);

    assert.strictEqual(result.bottomLeft().toString(), bottomLeft.toString());
    assert.strictEqual(result.topRight().toString(), topRight.toString());
    assert.strictEqual(
      result.getCenter().toString(),
      expectedCenter.toString(),
    );
  });

  it('should calculate position percentage correctly', function () {
    let rectangleSize = new Vector(10, 10);
    let rectangle = new Rectangle(null, rectangleSize);
    let bottomLeft = new Vector(-5, -5);
    let topRight = new Vector(5, 5);
    let percentageOfBottomLeft = rectangle.positionPercentage(bottomLeft);
    assert.strictEqual(
      percentageOfBottomLeft.toString(),
      new Vector(0, 0).toString(),
    );
    let percentageOfTopRight = rectangle.positionPercentage(topRight);
    assert.strictEqual(
      percentageOfTopRight.toString(),
      new Vector(100, 100).toString(),
    );
    let percentageOfCenter = rectangle.positionPercentage(rectangle.center);
    assert.strictEqual(
      percentageOfCenter.toString(),
      new Vector(50, 50).toString(),
    );
  });

  it('should convert size percentage to position correctly', function () {
    let rectangleSize = new Vector(10, 10);
    let rectangle = new Rectangle(null, rectangleSize);
    let expectedBottomLeftPosition = new Vector(-5, -5);
    let expectedTopRightPosition = new Vector(5, 5);
    let expectedCenterPosition = new Vector(0, 0);

    let bottomLeftPercentage = new Vector(0, 0);
    let topRightPercentage = new Vector(100, 100);
    let centerPercentage = new Vector(50, 50);

    let bottomLeftPosition =
      rectangle.sizePercentageToPosition(bottomLeftPercentage);
    assert.strictEqual(
      bottomLeftPosition.toString(),
      expectedBottomLeftPosition.toString(),
    );
    let topRightPosition =
      rectangle.sizePercentageToPosition(topRightPercentage);
    assert.strictEqual(
      topRightPosition.toString(),
      expectedTopRightPosition.toString(),
    );
    let centerPosition = rectangle.sizePercentageToPosition(centerPercentage);
    assert.strictEqual(
      centerPosition.toString(),
      expectedCenterPosition.toString(),
    );
  });

  it('should make a rectangle from a collection of rectangles', function () {
    // Test from two rectangles inside one another
    let enclosingRectangleSize = new Vector(10, 10);
    let enclosedRectangleSize = new Vector(5, 5);
    let enclosingRectangle = new Rectangle(null, enclosingRectangleSize);
    let enclosedRectangle = new Rectangle(null, enclosedRectangleSize);

    let allEncompasingRectangle1 = Rectangle.makeFromCollectionOfRectangles([
      enclosingRectangle,
      enclosedRectangle,
    ]);

    assert.strictEqual(
      allEncompasingRectangle1.center.toString(),
      enclosingRectangle.center.toString(),
    );
    assert.strictEqual(
      allEncompasingRectangle1.size.toString(),
      enclosingRectangle.size.toString(),
    );

    // Test from separated rectangles
    let rectangle1 = new Rectangle(null, new Vector(10, 10));
    let rectangle2 = new Rectangle(new Vector(5, 5), new Vector(10, 10));
    let expectedEncompassingRectangle = new Rectangle(
      new Vector(2.5, 2.5),
      new Vector(15, 15),
    );
    let allEncompasingRectangle2 = Rectangle.makeFromCollectionOfRectangles([
      rectangle1,
      rectangle2,
    ]);

    assert.strictEqual(
      allEncompasingRectangle2.center.toString(),
      expectedEncompassingRectangle.center.toString(),
    );
    assert.strictEqual(
      allEncompasingRectangle2.size.toString(),
      expectedEncompassingRectangle.size.toString(),
    );
  });

  it('should set position correctly', function () {
    let baseRect = rect(0, 0, 100, 100);
    let rect1 = rect(0, 0, 10, 10);

    rect1.setPosition(baseRect.center);
    assert.strictEqual(rect1.center.toString(), baseRect.center.toString());

    rect1.setPosition(baseRect.bottomLeft(), 'bottomLeft');
    assert.strictEqual(
      rect1.bottomLeft().toString(),
      baseRect.bottomLeft().toString(),
      'bottomLeft error',
    );

    rect1.setPosition(baseRect.topLeft(), 'topLeft');
    assert.strictEqual(
      rect1.topLeft().toString(),
      baseRect.topLeft().toString(),
      'topLeft error',
    );

    rect1.setPosition(baseRect.bottomRight(), 'bottomRight');
    assert.strictEqual(
      rect1.bottomRight().toString(),
      baseRect.bottomRight().toString(),
      'bottomRight error',
    );

    rect1.setPosition(baseRect.topRight(), 'topRight');
    assert.strictEqual(
      rect1.topRight().toString(),
      baseRect.topRight().toString(),
      'topRight error',
    );

    rect1.setPosition(baseRect.bottomCenter(), 'bottomCenter');
    assert.strictEqual(
      rect1.bottomCenter().toString(),
      baseRect.bottomCenter().toString(),
      'bottomCenter error',
    );

    rect1.setPosition(baseRect.topCenter(), 'topCenter');
    assert.strictEqual(
      rect1.topCenter().toString(),
      baseRect.topCenter().toString(),
      'topCenter error',
    );

    rect1.setPosition(baseRect.leftCenter(), 'leftCenter');
    assert.strictEqual(
      rect1.leftCenter().toString(),
      baseRect.leftCenter().toString(),
      'leftCenter error',
    );

    rect1.setPosition(baseRect.rightCenter(), 'rightCenter');
    assert.strictEqual(
      rect1.rightCenter().toString(),
      baseRect.rightCenter().toString(),
      'rightCenter error',
    );
  });
});
