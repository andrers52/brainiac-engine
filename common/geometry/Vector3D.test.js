import { strict as assert } from "assert";
import sinon from "sinon";
import { Vector3D, vect3D } from "./Vector3D.js";

describe("Vector3D", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("Constructor", function () {
    it("should create a vector with default values (0, 0, 0)", function () {
      const v = new Vector3D();
      assert.strictEqual(v.x, 0);
      assert.strictEqual(v.y, 0);
      assert.strictEqual(v.z, 0);
    });

    it("should create a vector with specified values", function () {
      const v = new Vector3D(1, 2, 3);
      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, 3);
    });

    it("should handle partial parameters", function () {
      const v1 = new Vector3D(5);
      assert.strictEqual(v1.x, 5);
      assert.strictEqual(v1.y, 0);
      assert.strictEqual(v1.z, 0);

      const v2 = new Vector3D(2, 3);
      assert.strictEqual(v2.x, 2);
      assert.strictEqual(v2.y, 3);
      assert.strictEqual(v2.z, 0);
    });
  });

  describe("vect3D helper function", function () {
    it("should create a Vector3D instance", function () {
      const v = vect3D(1, 2, 3);
      assert(v instanceof Vector3D);
      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, 3);
    });

    it("should handle default parameters", function () {
      const v = vect3D();
      assert.strictEqual(v.x, 0);
      assert.strictEqual(v.y, 0);
      assert.strictEqual(v.z, 0);
    });
  });

  describe("set", function () {
    it("should set vector components", function () {
      const v = new Vector3D();
      const result = v.set(4, 5, 6);

      assert.strictEqual(v.x, 4);
      assert.strictEqual(v.y, 5);
      assert.strictEqual(v.z, 6);
      assert.strictEqual(result, v); // Should return this for chaining
    });

    it("should use default values when parameters not provided", function () {
      const v = new Vector3D(1, 2, 3);
      v.set();

      assert.strictEqual(v.x, 0);
      assert.strictEqual(v.y, 0);
      assert.strictEqual(v.z, 0);
    });
  });

  describe("copy", function () {
    it("should copy components from another vector", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 5, 6);
      const result = v1.copy(v2);

      assert.strictEqual(v1.x, 4);
      assert.strictEqual(v1.y, 5);
      assert.strictEqual(v1.z, 6);
      assert.strictEqual(result, v1); // Should return this for chaining
    });

    it("should not affect the source vector", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 5, 6);
      v1.copy(v2);

      assert.strictEqual(v2.x, 4);
      assert.strictEqual(v2.y, 5);
      assert.strictEqual(v2.z, 6);
    });
  });

  describe("zRotate", function () {
    it("should rotate vector around Z axis", function () {
      const v = new Vector3D(1, 0, 0);
      v.zRotate(Math.PI / 2); // 90 degrees

      // After 90-degree rotation, (1,0,0) should become approximately (0,1,0)
      assert(Math.abs(v.x) < 1e-10); // Should be very close to 0
      assert(Math.abs(v.y - 1) < 1e-10); // Should be very close to 1
      assert.strictEqual(v.z, 0); // Z should remain unchanged
    });

    it("should return this for chaining", function () {
      const v = new Vector3D(1, 2, 3);
      const result = v.zRotate(0.5);
      assert.strictEqual(result, v);
    });
  });

  describe("size", function () {
    it("should calculate the magnitude of the vector", function () {
      const v = new Vector3D(3, 4, 0);
      assert.strictEqual(v.size(), 5); // 3-4-5 triangle
    });

    it("should handle 3D vector", function () {
      const v = new Vector3D(1, 1, 1);
      assert(Math.abs(v.size() - Math.sqrt(3)) < 1e-10);
    });

    it("should return 0 for zero vector", function () {
      const v = new Vector3D(0, 0, 0);
      assert.strictEqual(v.size(), 0);
    });
  });

  describe("normalize", function () {
    it("should normalize vector to unit length", function () {
      const v = new Vector3D(3, 4, 0);
      const result = v.normalize();

      assert(Math.abs(v.size() - 1) < 1e-10);
      assert(Math.abs(v.x - 0.6) < 1e-10);
      assert(Math.abs(v.y - 0.8) < 1e-10);
      assert.strictEqual(v.z, 0);
      assert.strictEqual(result, v);
    });

    it("should handle 3D normalization", function () {
      const v = new Vector3D(2, 2, 2);
      v.normalize();

      assert(Math.abs(v.size() - 1) < 1e-10);
      const expectedComponent = 2 / Math.sqrt(12);
      assert(Math.abs(v.x - expectedComponent) < 1e-10);
      assert(Math.abs(v.y - expectedComponent) < 1e-10);
      assert(Math.abs(v.z - expectedComponent) < 1e-10);
    });
  });

  describe("vectorDistance", function () {
    it("should compute vector from this to another vector", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 6, 7);
      const result = v1.vectorDistance(v2);

      assert(result instanceof Vector3D);
      assert.strictEqual(result.x, 3);
      assert.strictEqual(result.y, 4);
      assert.strictEqual(result.z, 4);
    });

    it("should not modify original vectors", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 6, 7);
      v1.vectorDistance(v2);

      assert.strictEqual(v1.x, 1);
      assert.strictEqual(v1.y, 2);
      assert.strictEqual(v1.z, 3);
    });
  });

  describe("distance", function () {
    it("should compute Euclidean distance", function () {
      const v1 = new Vector3D(0, 0, 0);
      const v2 = new Vector3D(3, 4, 0);
      assert.strictEqual(v1.distance(v2), 5);
    });

    it("should handle 3D distance", function () {
      const v1 = new Vector3D(1, 1, 1);
      const v2 = new Vector3D(2, 2, 2);
      assert(Math.abs(v1.distance(v2) - Math.sqrt(3)) < 1e-10);
    });

    it("should be symmetric", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 5, 6);
      assert.strictEqual(v1.distance(v2), v2.distance(v1));
    });
  });

  describe("Component-wise distances", function () {
    const v1 = new Vector3D(2, 5, 8);
    const v2 = new Vector3D(7, 1, 3);

    it("should compute X distance", function () {
      assert.strictEqual(v1.Xdistance(v2), 5);
      assert.strictEqual(v2.Xdistance(v1), 5);
    });

    it("should compute Y distance", function () {
      assert.strictEqual(v1.Ydistance(v2), 4);
      assert.strictEqual(v2.Ydistance(v1), 4);
    });

    it("should compute Z distance", function () {
      assert.strictEqual(v1.Zdistance(v2), 5);
      assert.strictEqual(v2.Zdistance(v1), 5);
    });
  });

  describe("add", function () {
    it("should add another vector", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 5, 6);
      const result = v1.add(v2);

      assert.strictEqual(v1.x, 5);
      assert.strictEqual(v1.y, 7);
      assert.strictEqual(v1.z, 9);
      assert.strictEqual(result, v1);
    });

    it("should not modify the other vector", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 5, 6);
      v1.add(v2);

      assert.strictEqual(v2.x, 4);
      assert.strictEqual(v2.y, 5);
      assert.strictEqual(v2.z, 6);
    });
  });

  describe("addWithLimits", function () {
    it("should add vector when within limits", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(1, 1, 1);
      const result = v1.addWithLimits(v2, 10, -10, false);

      assert.strictEqual(v1.x, 2);
      assert.strictEqual(v1.y, 3);
      assert.strictEqual(v1.z, 4);
      assert.strictEqual(result, v1);
    });

    it("should clamp components to max limit when allOrNothing is false", function () {
      const v1 = new Vector3D(8, 2, 3);
      const v2 = new Vector3D(5, 1, 1);
      v1.addWithLimits(v2, 10, -10, false);

      assert.strictEqual(v1.x, 10); // Clamped to max
      assert.strictEqual(v1.y, 3);
      assert.strictEqual(v1.z, 4);
    });

    it("should clamp components to min limit when allOrNothing is false", function () {
      const v1 = new Vector3D(-8, 2, 3);
      const v2 = new Vector3D(-5, 1, 1);
      v1.addWithLimits(v2, 10, -10, false);

      assert.strictEqual(v1.x, -10); // Clamped to min
      assert.strictEqual(v1.y, 3);
      assert.strictEqual(v1.z, 4);
    });
  });

  describe("addWithMaxLimit", function () {
    it("should use addWithLimits with correct parameters", function () {
      const v1 = new Vector3D(5, 5, 5);
      const v2 = new Vector3D(2, 2, 2);
      const addWithLimitsSpy = sinon.spy(v1, "addWithLimits");

      v1.addWithMaxLimit(v2, 6, true);

      assert(
        addWithLimitsSpy.calledWith(v2, 6, -Number.MAX_SAFE_INTEGER, true),
      );
    });
  });

  describe("addWithMinLimit", function () {
    it("should use addWithLimits with correct parameters", function () {
      const v1 = new Vector3D(5, 5, 5);
      const v2 = new Vector3D(-2, -2, -2);
      const addWithLimitsSpy = sinon.spy(v1, "addWithLimits");

      v1.addWithMinLimit(v2, 2, false);

      assert(
        addWithLimitsSpy.calledWith(v2, Number.MAX_SAFE_INTEGER, 2, false),
      );
    });
  });

  describe("subtract", function () {
    it("should subtract another vector", function () {
      const v1 = new Vector3D(5, 7, 9);
      const v2 = new Vector3D(1, 2, 3);
      const result = v1.subtract(v2);

      assert.strictEqual(v1.x, 4);
      assert.strictEqual(v1.y, 5);
      assert.strictEqual(v1.z, 6);
      assert.strictEqual(result, v1);
    });

    it("should not modify the other vector", function () {
      const v1 = new Vector3D(5, 7, 9);
      const v2 = new Vector3D(1, 2, 3);
      v1.subtract(v2);

      assert.strictEqual(v2.x, 1);
      assert.strictEqual(v2.y, 2);
      assert.strictEqual(v2.z, 3);
    });
  });

  describe("to2D", function () {
    it("should set z component to 0", function () {
      const v = new Vector3D(1, 2, 3);
      v.to2D();

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, 0);
    });
  });

  describe("equal", function () {
    it("should return true for equal vectors", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(1, 2, 3);
      assert.strictEqual(v1.equal(v2), true);
    });

    it("should return false for different vectors", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(1, 2, 4);
      assert.strictEqual(v1.equal(v2), false);
    });

    it("should handle floating point precision", function () {
      const v1 = new Vector3D(1.0, 2.0, 3.0);
      const v2 = new Vector3D(1, 2, 3);
      assert.strictEqual(v1.equal(v2), true);
    });
  });

  describe("equal2D", function () {
    it("should return true for vectors equal in 2D", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(1, 2, 5);
      assert.strictEqual(v1.equal2D(v2), true);
    });

    it("should return false for vectors different in 2D", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(1, 3, 3);
      assert.strictEqual(v1.equal2D(v2), false);
    });
  });

  describe("clone", function () {
    it("should create an exact copy", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = v1.clone();

      assert(v2 instanceof Vector3D);
      assert.strictEqual(v2.x, 1);
      assert.strictEqual(v2.y, 2);
      assert.strictEqual(v2.z, 3);
      assert(v1 !== v2); // Different objects
    });

    it("should create independent copy", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = v1.clone();
      v2.x = 10;

      assert.strictEqual(v1.x, 1); // Original unchanged
      assert.strictEqual(v2.x, 10);
    });
  });

  describe("round", function () {
    it("should round all components to nearest integers", function () {
      const v = new Vector3D(1.4, 2.6, 3.5);
      const result = v.round();

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 3);
      assert.strictEqual(v.z, 4);
      assert.strictEqual(result, v);
    });

    it("should handle negative numbers", function () {
      const v = new Vector3D(-1.4, -2.6, -3.5);
      v.round();

      assert.strictEqual(v.x, -1); // -1.4 rounds to -1
      assert.strictEqual(v.y, -3); // -2.6 rounds to -3
      assert.strictEqual(v.z, -3); // -3.5 rounds to -3 (JavaScript behavior)
    });
  });

  describe("abs", function () {
    it("should set all components to their absolute values", function () {
      const v = new Vector3D(-1, -2, 3);
      const result = v.abs();

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, 3);
      assert.strictEqual(result, v);
    });

    it("should not change positive values", function () {
      const v = new Vector3D(1, 2, 3);
      v.abs();

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, 3);
    });
  });

  describe("toString", function () {
    it("should return string representation", function () {
      const v = new Vector3D(1, 2, 3);
      assert.strictEqual(v.toString(), "(1,2,3)");
    });

    it("should handle decimal numbers", function () {
      const v = new Vector3D(1.5, -2.3, 0);
      assert.strictEqual(v.toString(), "(1.5,-2.3,0)");
    });
  });

  describe("multiplyByScalar", function () {
    it("should multiply all components by scalar", function () {
      const v = new Vector3D(1, 2, 3);
      const result = v.multiplyByScalar(2);

      assert.strictEqual(v.x, 2);
      assert.strictEqual(v.y, 4);
      assert.strictEqual(v.z, 6);
      assert.strictEqual(result, v);
    });

    it("should handle negative scalars", function () {
      const v = new Vector3D(1, 2, 3);
      v.multiplyByScalar(-1);

      assert.strictEqual(v.x, -1);
      assert.strictEqual(v.y, -2);
      assert.strictEqual(v.z, -3);
    });

    it("should handle fractional scalars", function () {
      const v = new Vector3D(2, 4, 6);
      v.multiplyByScalar(0.5);

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, 3);
    });
  });

  describe("divideByScalar", function () {
    it("should divide all components by scalar", function () {
      const v = new Vector3D(2, 4, 6);
      const result = v.divideByScalar(2);

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, 3);
      assert.strictEqual(result, v);
    });

    it("should handle fractional division", function () {
      const v = new Vector3D(1, 2, 3);
      v.divideByScalar(0.5);

      assert.strictEqual(v.x, 2);
      assert.strictEqual(v.y, 4);
      assert.strictEqual(v.z, 6);
    });
  });

  describe("dotProduct", function () {
    it("should calculate dot product correctly", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 5, 6);
      const result = v1.dotProduct(v2);

      // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
      assert.strictEqual(result, 32);
    });

    it("should return 0 for perpendicular vectors", function () {
      const v1 = new Vector3D(1, 0, 0);
      const v2 = new Vector3D(0, 1, 0);
      assert.strictEqual(v1.dotProduct(v2), 0);
    });

    it("should be commutative", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 5, 6);
      assert.strictEqual(v1.dotProduct(v2), v2.dotProduct(v1));
    });
  });

  describe("angle", function () {
    it("should calculate angle between vectors", function () {
      const v1 = new Vector3D(1, 0, 0);
      const v2 = new Vector3D(0, 1, 0);
      const angle = v1.angle(v2);

      assert(Math.abs(angle - Math.PI / 2) < 1e-10); // 90 degrees
    });

    it("should return 0 for parallel vectors", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(2, 4, 6);
      const angle = v1.angle(v2);

      assert(Math.abs(angle) < 1e-10);
    });
  });

  describe("projectionSize", function () {
    it("should calculate projection magnitude", function () {
      const v1 = new Vector3D(3, 4, 0);
      const v2 = new Vector3D(1, 0, 0);
      const projSize = v1.projectionSize(v2);

      assert.strictEqual(projSize, 3); // Projection of (3,4,0) onto (1,0,0) is 3
    });

    it("should handle negative projections", function () {
      const v1 = new Vector3D(-3, 4, 0);
      const v2 = new Vector3D(1, 0, 0);
      const projSize = v1.projectionSize(v2);

      assert.strictEqual(projSize, -3);
    });
  });

  describe("projection", function () {
    it("should calculate projection vector", function () {
      const v1 = new Vector3D(3, 4, 0);
      const v2 = new Vector3D(1, 0, 0);
      const proj = v1.projection(v2);

      assert(proj instanceof Vector3D);
      assert.strictEqual(proj.x, 3);
      assert.strictEqual(proj.y, 0);
      assert.strictEqual(proj.z, 0);
    });

    it("should not modify original vectors", function () {
      const v1 = new Vector3D(3, 4, 0);
      const v2 = new Vector3D(1, 0, 0);
      v1.projection(v2);

      assert.strictEqual(v1.x, 3);
      assert.strictEqual(v1.y, 4);
      assert.strictEqual(v1.z, 0);
      assert.strictEqual(v2.x, 1);
      assert.strictEqual(v2.y, 0);
      assert.strictEqual(v2.z, 0);
    });
  });

  describe("crossProduct", function () {
    it("should calculate cross product correctly", function () {
      const v1 = new Vector3D(1, 0, 0);
      const v2 = new Vector3D(0, 1, 0);
      const cross = v1.crossProduct(v2);

      assert(cross instanceof Vector3D);
      assert.strictEqual(cross.x, 0);
      assert.strictEqual(cross.y, 0);
      assert.strictEqual(cross.z, 1);
    });

    it("should be anti-commutative", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 5, 6);
      const cross1 = v1.crossProduct(v2);
      const cross2 = v2.crossProduct(v1);

      assert.strictEqual(cross1.x, -cross2.x);
      assert.strictEqual(cross1.y, -cross2.y);
      assert.strictEqual(cross1.z, -cross2.z);
    });

    it("should return zero vector for parallel vectors", function () {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(2, 4, 6);
      const cross = v1.crossProduct(v2);

      assert(Math.abs(cross.x) < 1e-10);
      assert(Math.abs(cross.y) < 1e-10);
      assert(Math.abs(cross.z) < 1e-10);
    });
  });

  describe("Projection methods", function () {
    it("should project over XY plane", function () {
      const v = new Vector3D(1, 2, 3);
      const result = v.projectOverXY();

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, 0);
      assert.strictEqual(result, v);
    });

    it("should project over XZ plane", function () {
      const v = new Vector3D(1, 2, 3);
      const result = v.projectOverXZ();

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 0);
      assert.strictEqual(v.z, 3);
      assert.strictEqual(result, v);
    });

    it("should project over YZ plane", function () {
      const v = new Vector3D(1, 2, 3);
      const result = v.projectOverYZ();

      assert.strictEqual(v.x, 0);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, 3);
      assert.strictEqual(result, v);
    });
  });

  describe("invert", function () {
    it("should invert vector direction", function () {
      const v = new Vector3D(1, -2, 3);
      const result = v.invert();

      assert.strictEqual(v.x, -1);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, -3);
      assert.strictEqual(result, v);
    });
  });

  describe("adjustToSize", function () {
    it("should adjust vector to target size", function () {
      const v = new Vector3D(3, 4, 0);
      const adjusted = v.adjustToSize(10);

      assert(adjusted instanceof Vector3D);
      assert(Math.abs(adjusted.size() - 10) < 1e-10);
      assert(Math.abs(adjusted.x - 6) < 1e-10); // (3/5) * 10
      assert(Math.abs(adjusted.y - 8) < 1e-10); // (4/5) * 10
      assert.strictEqual(adjusted.z, 0);
    });

    it("should not modify original vector", function () {
      const v = new Vector3D(3, 4, 0);
      v.adjustToSize(10);

      assert.strictEqual(v.x, 3);
      assert.strictEqual(v.y, 4);
      assert.strictEqual(v.z, 0);
    });
  });

  describe("Static methods", function () {
    describe("makeUnit", function () {
      it("should create unit vector (1, 1, 1)", function () {
        const unit = Vector3D.makeUnit();
        assert(unit instanceof Vector3D);
        assert.strictEqual(unit.x, 1);
        assert.strictEqual(unit.y, 1);
        assert.strictEqual(unit.z, 1);
      });
    });

    describe("makeMean", function () {
      it("should calculate mean of two vectors", function () {
        const v1 = new Vector3D(1, 2, 3);
        const v2 = new Vector3D(3, 4, 5);
        const mean = Vector3D.makeMean(v1, v2);

        assert(mean instanceof Vector3D);
        assert.strictEqual(mean.x, 2);
        assert.strictEqual(mean.y, 3);
        assert.strictEqual(mean.z, 4);
      });

      it("should not modify original vectors", function () {
        const v1 = new Vector3D(1, 2, 3);
        const v2 = new Vector3D(3, 4, 5);
        Vector3D.makeMean(v1, v2);

        assert.strictEqual(v1.x, 1);
        assert.strictEqual(v1.y, 2);
        assert.strictEqual(v1.z, 3);
        assert.strictEqual(v2.x, 3);
        assert.strictEqual(v2.y, 4);
        assert.strictEqual(v2.z, 5);
      });
    });
  });

  describe("Flip methods", function () {
    it("should flip x component", function () {
      const v = new Vector3D(1, 2, 3);
      const result = v.flipX();

      assert.strictEqual(v.x, -1);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, 3);
      assert.strictEqual(result, v);
    });

    it("should flip y component", function () {
      const v = new Vector3D(1, 2, 3);
      const result = v.flipY();

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, -2);
      assert.strictEqual(v.z, 3);
      assert.strictEqual(result, v);
    });

    it("should flip z component", function () {
      const v = new Vector3D(1, 2, 3);
      const result = v.flipZ();

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 2);
      assert.strictEqual(v.z, -3);
      assert.strictEqual(result, v);
    });
  });

  describe("Method chaining", function () {
    it("should allow method chaining", function () {
      const v = new Vector3D(2, 3, 4);
      const result = v.multiplyByScalar(2).add(new Vector3D(1, 1, 1)).round();

      assert.strictEqual(v.x, 5);
      assert.strictEqual(v.y, 7);
      assert.strictEqual(v.z, 9);
      assert.strictEqual(result, v);
    });

    it("should chain multiple transformations", function () {
      const v = new Vector3D(1, 0, 0);
      v.multiplyByScalar(5).normalize().multiplyByScalar(10);

      assert(Math.abs(v.size() - 10) < 1e-10);
      assert(Math.abs(v.x - 10) < 1e-10);
      assert(Math.abs(v.y) < 1e-10);
      assert(Math.abs(v.z) < 1e-10);
    });
  });

  describe("Edge cases and error handling", function () {
    it("should handle zero vector normalization", function () {
      const v = new Vector3D(0, 0, 0);

      // Normalizing zero vector should result in NaN or infinity
      // This is mathematical behavior, not necessarily an error
      assert.doesNotThrow(() => v.normalize());
    });

    it("should handle very small vectors", function () {
      const v = new Vector3D(1e-10, 1e-10, 1e-10);
      const size = v.size();

      assert(size > 0);
      assert(size < 1e-9);
    });

    it("should handle very large vectors", function () {
      const v = new Vector3D(1e10, 1e10, 1e10);
      const size = v.size();

      assert(size > 1e10);
      assert.doesNotThrow(() => v.normalize());
    });

    it("should handle division by zero in scalar operations", function () {
      const v = new Vector3D(1, 2, 3);

      assert.doesNotThrow(() => v.divideByScalar(0));
      // Results will be Infinity, which is mathematically correct
    });
  });
});
