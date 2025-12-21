import { strict as assert } from 'assert';
import { Vector } from './Vector.js';

describe('Vector', function () {
  it('should create a Vector instance', function () {
    assert.ok(new Vector() instanceof Vector);
  });

  it('should have default values with no parameters', function () {
    let point = new Vector();
    assert.strictEqual(point.x, 0);
    assert.strictEqual(point.y, 0);
  });

  it('should have values when constructed with parameters', function () {
    let point = new Vector(10, 11);
    assert.strictEqual(point.x, 10);
    assert.strictEqual(point.y, 11);
  });

  it('should rotate around the Z axis', function () {
    let point1 = new Vector(0, 1, 0);
    let ninethDegreesInRadians = Math.PI / 2;
    let point2 = point1.zRotate(ninethDegreesInRadians).round();
    assert.strictEqual(point2.x, -1);
    assert.strictEqual(point2.y, 0);
    assert.strictEqual(point2.z, point1.z);
  });

  it('should calculate the distance between two vectors', function () {
    let point1 = new Vector(0, 3);
    let point2 = new Vector(4, 0);
    assert.strictEqual(point1.distance(point2), 5);
  });

  it('should add two vectors', function () {
    let point1 = new Vector(0, 3);
    let point2 = new Vector(4, 0);
    let pointSum = point1.add(point2);
    assert.strictEqual(pointSum.x, 4);
    assert.strictEqual(pointSum.y, 3);
  });

  it('should subtract one vector from another', function () {
    let point1 = new Vector(0, 3);
    let point2 = new Vector(4, 0);
    let subtraction = point1.subtract(point2);
    assert.strictEqual(subtraction.x, -4);
    assert.strictEqual(subtraction.y, 3);
  });

  it('should not modify original vectors when subtracting', function () {
    let point1 = new Vector(0, 3);
    let point2 = new Vector(4, 0);
    let point1Clone = point1.clone();
    let point2Clone = point2.clone();
    let subtraction = Vector.subtract(point1, point2); // Use static method for non-destructive operation
    assert.strictEqual(subtraction.x, -4);
    assert.strictEqual(subtraction.y, 3);
    assert.strictEqual(point1.toString(), point1Clone.toString());
    assert.strictEqual(point2.toString(), point2Clone.toString());
  });

  it('should calculate the vector size', function () {
    let point = new Vector(3, 4);
    assert.strictEqual(point.size(), 5);
  });

  it('should adjust to the same size', function () {
    let point1 = new Vector(3, 4);
    let point2 = point1.clone().adjustToSize(5);
    assert.strictEqual(point1.size(), point2.size());
  });

  it('should adjust to a different size', function () {
    let point1 = new Vector(3, 4);
    let point2 = point1.adjustToSize(10);
    assert.strictEqual(point2.size(), 10);
  });

  it('should clone a vector', function () {
    let origin = new Vector();
    let otherOrigin = origin.clone();
    assert.strictEqual(origin.toString(), otherOrigin.toString());

    let point1 = new Vector(1, 1);
    assert.ok(point1.equal(point1.clone()));
  });

  it('should convert vector to string', function () {
    let point = new Vector();
    assert.strictEqual(point.toString(), '(0,0)');
    let newPoint = point.add(new Vector(1, 1));
    assert.strictEqual(newPoint.toString(), '(1,1)');
  });

  it('should rotate vector', function () {
    let originalPosition = new Vector(1, 0);
    let Angle90DegreesInRadians = Math.PI / 2;
    let expectedEndPosition = new Vector(0, 1);
    assert.strictEqual(
      originalPosition.zRotate(Angle90DegreesInRadians).round().toString(),
      expectedEndPosition.toString(),
    );
  });

  it('should divide vector by scalar', function () {
    let x, y, z;
    x = y = z = 1;
    let divisor = 2;
    let originalPosition = new Vector(x, y, z);
    let expectedResult = new Vector(x / divisor, y / divisor, z / divisor);
    assert.strictEqual(
      originalPosition.clone().divideByScalar(divisor).toString(),
      expectedResult.toString(),
    );
  });

  it('should make a unit vector', function () {
    assert.strictEqual(Vector.makeUnit().x, 1);
    assert.strictEqual(Vector.makeUnit().y, 1);
  });

  it('should make the mean vector', function () {
    let origin = new Vector();
    let twoByTwo = new Vector(2, 2);
    let opposite = twoByTwo.clone().multiplyByScalar(-1);
    assert.strictEqual(
      Vector.makeMean(twoByTwo, opposite).toString(),
      origin.toString(),
    );
  });

  it('should find the angle between two vectors using dot product', function () {
    let x = new Vector(1, 0);
    let y = new Vector(0, 1);
    assert.strictEqual(x.angle(y), Math.PI / 2);
  });

  it('should calculate projection size', function () {
    let x = new Vector(1, 0, 0);
    let y = new Vector(0, 1, 0);
    assert.strictEqual(x.projectionSize(y), 0);
  });

  it('should calculate projection', function () {
    let x = new Vector(1, 0, 0);
    let xy = new Vector(1, 1, 0);
    assert.strictEqual(xy.projectionSize(x), 1);
    assert.strictEqual(xy.projection(x).toString(), x.toString());
  });

  it('should calculate the cross product', function () {
    let x = new Vector(1, 0);
    let y = new Vector(0, 1);
    // 2D cross product returns a scalar (z-component of 3D cross product)
    assert.strictEqual(x.crossProduct(y), 1);
    assert.strictEqual(y.crossProduct(x), -1);
  });

  it('should calculate the parallelogram area', function () {
    it('should calculate the parallelogram area', function () {
      let oneZero = new Vector(1, 0);
      let oneOne = new Vector(1, 1);
      let expectedArea = 1;
      assert.strictEqual(
        Vector.parallelogramArea(oneZero, oneOne),
        expectedArea,
      );
    });

    it('should determine if face is up', function () {
      let upVector = new Vector(0, 1); // Pointing up (positive y)
      let downVector = new Vector(0, -1); // Pointing down (negative y)
      assert.ok(Vector.isFaceUp(upVector));
      assert.ok(!Vector.isFaceUp(downVector));
    });

    it('should determine if face is down', function () {
      let upVector = new Vector(0, 1); // Pointing up (positive y)
      let downVector = new Vector(0, -1); // Pointing down (negative y)
      assert.ok(!Vector.isFaceUp(downVector));
      assert.ok(Vector.isFaceUp(upVector));
    });
  });

  it('should convert vector size', function () {
    let fromBaseSize = new Vector(10, 10);
    let toBaseSize = new Vector(5, 5);
    let vectorToConvert = new Vector(1, 1);
    let expectedConvertedVector = new Vector(0.5, 0.5);
    assert.strictEqual(
      vectorToConvert.convert(fromBaseSize, toBaseSize).toString(),
      expectedConvertedVector.toString(),
    );
  });
});
