'use strict';

/**
 * @fileoverview 2D Vector implementation with mathematical operations.
 * Note: Most operations are destructive! Use clone() method for protection.
 * @author Brainiac Engine
 */

/**
 * Represents a 2D vector with x and y components.
 * Provides mathematical operations for vector manipulation.
 *
 * @class Vector
 * @param {number} [x=0] - The x component of the vector
 * @param {number} [y=0] - The y component of the vector
 *
 * @example
 * // Create a new vector
 * const v1 = new Vector(3, 4);
 * const v2 = new Vector(); // (0, 0)
 *
 * // Vector operations
 * v1.add(v2).normalize();
 * console.log(v1.size()); // Vector magnitude
 */
function Vector(x = 0, y = 0) {
  this.data = new Float64Array(2);
  this.data[0] = x;
  this.data[1] = y;
}

/**
 * Gets/Sets the x component of the vector.
 * @returns {number} The x component of the vector.
 */
Object.defineProperty(Vector.prototype, 'x', {
  get: function () {
    return this.data[0];
  },
  set: function (value) {
    this.data[0] = value;
  },
});

/**
 * Gets/Sets the y component of the vector.
 * @returns {number} The y component of the vector.
 */
Object.defineProperty(Vector.prototype, 'y', {
  get: function () {
    return this.data[1];
  },
  set: function (value) {
    this.data[1] = value;
  },
});

/**
 * Sets the components of the vector.
 * @param {number} x - The x component.
 * @param {number} y - The y component.
 * @returns {Vector} This vector after modification.
 */
Vector.prototype.set = function (x, y) {
  // isValidVector(x,y)
  this.data[0] = x;
  this.data[1] = y;
  return this;
};

/**
 * Copies the components of another vector to this vector.
 * @param {Vector} otherVector - The other vector to copy from.
 * @returns {Vector} This vector after modification.
 */
Vector.prototype.copy = function (otherVector) {
  // isValidVector(otherVector.data[0],otherVector.data[1])
  this.data[0] = otherVector.data[0];
  this.data[1] = otherVector.data[1];
  return this;
};

/**
 * Rotates the vector by a given angle around the Z axis.
 * @param {number} angle - The angle in radians to rotate.
 * @returns {Vector} This vector after rotation.
 */
Vector.prototype.zRotate = function (angle) {
  const x = this.data[0];
  const y = this.data[1];
  this.data[0] = Math.cos(angle) * x - Math.sin(angle) * y;
  this.data[1] = Math.sin(angle) * x + Math.cos(angle) * y;
  return this;
};

/**
 * Calculates the magnitude of the vector.
 * @returns {number} The magnitude of the vector.
 */
Vector.prototype.size = function () {
  return Math.sqrt(this.data[0] * this.data[0] + this.data[1] * this.data[1]);
};

/**
 * Normalizes the vector to unit length.
 * @returns {Vector} This vector after normalization.
 */
Vector.prototype.normalize = function () {
  let size = this.size() || 1;
  this.data[0] = this.data[0] / size;
  this.data[1] = this.data[1] / size;
  return this;
};

/**
 * Computes the vector from this to another vector.
 * @param {Vector} otherVector - The vector to compute the distance to.
 * @returns {Vector} A new vector representing the distance.
 */
Vector.prototype.vectorDistance = function (otherVector) {
  return new Vector(
    otherVector.data[0] - this.data[0],
    otherVector.data[1] - this.data[1],
  );
};

/**
 * Computes the Euclidean distance between this vector and another vector.
 * @param {Vector} otherVector - The other vector.
 * @returns {number} The Euclidean distance.
 */
Vector.prototype.distance = function (otherVector) {
  let v0 = otherVector.data[0] - this.data[0];
  let v1 = otherVector.data[1] - this.data[1];
  return Math.sqrt(v0 * v0 + v1 * v1);
};

/**
 * Computes the absolute distance between the x-components of this vector and another vector.
 * @param {Vector} otherVector - The other vector.
 * @returns {number} The absolute x-distance.
 */
Vector.prototype.Xdistance = function (otherVector) {
  return Math.abs(this.data[0] - otherVector.data[0]);
};

/**
 * Computes the absolute distance between the y-components of this vector and another vector.
 * @param {Vector} otherVector - The other vector.
 * @returns {number} The absolute y-distance.
 */
Vector.prototype.Ydistance = function (otherVector) {
  return Math.abs(this.data[1] - otherVector.data[1]);
};

/**
 * Adds another vector to this vector.
 * @param {Vector} otherVector - The other vector to add.
 * @returns {Vector} This vector after addition.
 */
Vector.prototype.add = function (otherVector) {
  this.data[0] = this.data[0] + otherVector.data[0];
  this.data[1] = this.data[1] + otherVector.data[1];
  return this;
};

//Note: only executes operation if inside limits.
/**
 * Adds another vector to this vector with constraints.
 * @param {Vector} vectorToBeChanged - The vector to be changed.
 * @param {Vector} otherVector - The other vector to add.
 * @param {number} maxLimit - The maximum limit for both components.
 * @param {number} minLimit - The minimum limit for both components.
 * @returns {Vector} The modified vector if within limits, otherwise the original vector.
 */
function addWithLimitsAllOrNothing(
  vectorToBeChanged,
  otherVector,
  maxLimit,
  minLimit,
) {
  let x = vectorToBeChanged.data[0] + otherVector.data[0];
  let y = vectorToBeChanged.data[1] + otherVector.data[1];

  if (x > maxLimit || x < minLimit || y > maxLimit || y < minLimit)
    return vectorToBeChanged;

  vectorToBeChanged.data[0] = x;
  vectorToBeChanged.data[1] = y;
  return vectorToBeChanged;
}

//if allOrNothing is true (default) either apply all changes or none. This will distort the vector.
/**
 * Adds another vector to this vector with limits and an option to apply all or nothing.
 * @param {Vector} otherVector - The vector to add.
 * @param {number} maxLimit - The maximum limit for the components.
 * @param {number} minLimit - The minimum limit for the components.
 * @param {boolean} allOrNothing - If true, apply all changes or none. If false, adjust each component within limits.
 * @returns {Vector} This vector after attempting the addition.
 */
Vector.prototype.addWithLimits = function (
  otherVector,
  maxLimit,
  minLimit,
  allOrNothing = true,
) {
  if (allOrNothing)
    return addWithLimitsAllOrNothing(this, otherVector, maxLimit, minLimit);

  let newX = this.data[0] + otherVector.data[0];
  let newY = this.data[1] + otherVector.data[1];

  if (newX > maxLimit) this.data[0] = maxLimit;
  else if (newX < minLimit) this.data[0] = minLimit;
  else this.data[0] = newX;
  if (newY > maxLimit) this.data[1] = maxLimit;
  else if (newY < minLimit) this.data[1] = minLimit;
  else this.data[1] = newY;

  return this;
};

/**
 * Adds another vector to this vector with a maximum limit.
 * @param {Vector} otherVector - The other vector to add.
 * @param {number} maxLimit - The maximum limit for the components.
 * @param {boolean} allOrNothing - If true, apply all changes or none. If false, adjust each component within limits.
 * @returns {Vector} This vector after attempting the addition.
 */
Vector.prototype.addWithMaxLimit = function (
  otherVector,
  maxLimit,
  allOrNothing = true,
) {
  return this.addWithLimits(
    otherVector,
    maxLimit,
    -Number.MAX_SAFE_INTEGER,
    allOrNothing,
  );
};

/**
 * Adds another vector to this vector with a minimum limit.
 * @param {Vector} otherVector - The other vector to add.
 * @param {number} minLimit - The minimum limit for the components.
 * @param {boolean} allOrNothing - If true, apply all changes or none. If false, adjust each component within limits.
 * @returns {Vector} This vector after attempting the addition.
 */
Vector.prototype.addWithMinLimit = function (
  otherVector,
  minLimit,
  allOrNothing = true,
) {
  return this.addWithLimits(
    otherVector,
    Number.MAX_SAFE_INTEGER,
    minLimit,
    allOrNothing,
  );
};

/**
 * Subtracts another vector from this vector.
 * @param {Vector} deltaPos - The vector to subtract.
 * @returns {Vector} This vector after subtraction.
 */
Vector.prototype.subtract = function (deltaPos) {
  this.data[0] = this.data[0] - deltaPos.data[0];
  this.data[1] = this.data[1] - deltaPos.data[1];
  return this;
};

/**
 * Checks if this vector is equal to another vector.
 * @param {Vector} otherVector - The vector to compare with.
 * @returns {boolean} True if both vectors are equal, false otherwise.
 */
Vector.prototype.equal = function (otherVector) {
  return (
    this.data[0] === otherVector.data[0] && this.data[1] === otherVector.data[1]
  );
};

/**
 * Checks if this vector is equal to another vector in a 2D space.
 * @param {Vector} otherVector - The vector to compare with.
 * @returns {boolean} True if both vectors are equal, false otherwise.
 */
Vector.prototype.equal2D = function (otherVector) {
  return (
    this.data[0] === otherVector.data[0] && this.data[1] === otherVector.data[1]
  );
};

/**
 * Creates a new vector with the same components as this vector.
 * @returns {Vector} A new vector that is a clone of this vector.
 */
Vector.prototype.clone = function () {
  return new Vector(this.data[0], this.data[1]);
};

/**
 * Rounds the components of this vector to the nearest integer.
 * @returns {Vector} This vector with rounded components.
 */
Vector.prototype.round = function () {
  this.data[0] = Math.round(this.data[0]);
  this.data[1] = Math.round(this.data[1]);
  return this;
};

/**
 * Sets the components of this vector to their absolute values.
 * @returns {Vector} This vector with absolute components.
 */
Vector.prototype.abs = function () {
  this.data[0] = Math.abs(this.data[0]);
  this.data[1] = Math.abs(this.data[1]);
  return this;
};

/**
 * Converts the vector to a string representation.
 * @returns {string} The string representation of the vector.
 */
Vector.prototype.toString = function () {
  return '(' + this.data[0] + ',' + this.data[1] + ')';
};

/**
 * Multiplies the components of this vector by a scalar.
 * @param {number} value - The scalar to multiply with.
 * @returns {Vector} This vector after multiplication.
 */
Vector.prototype.multiplyByScalar = function (value) {
  this.data[0] = this.data[0] * value;
  this.data[1] = this.data[1] * value;
  return this;
};

/**
 * Divides the components of this vector by a scalar.
 * @param {number} value - The scalar to divide with.
 * @returns {Vector} This vector after division.
 */
Vector.prototype.divideByScalar = function (value) {
  this.data[0] = this.data[0] / (value || 1);
  this.data[1] = this.data[1] / (value || 1);
  // isValidVector(this.data[0],this.data[1])
  return this;
};

/**
 * Calculates the dot product of this vector with another vector.
 * @param {Vector} otherVector - The other vector.
 * @returns {number} The dot product of the two vectors.
 */
Vector.prototype.dotProduct = function (otherVector) {
  return (
    this.data[0] * otherVector.data[0] + this.data[1] * otherVector.data[1]
  );
};

/**
 * Calculates the angle between this vector and another vector.
 * @param {Vector} otherVector - The other vector.
 * @returns {number} The angle in radians.
 */
Vector.prototype.angle = function (otherVector) {
  return Math.acos(
    (this.clone().dotProduct(otherVector) / this.size()) * otherVector.size(),
  );
};

/**
 * Projects this vector onto another vector and returns the magnitude of the projection.
 * @param {Vector} otherVector - The vector to project onto.
 * @returns {number} The magnitude of the projection.
 */
Vector.prototype.projectionSize = function (otherVector) {
  return this.clone().dotProduct(otherVector) / otherVector.size();
};

/**
 * Projects this vector onto another vector.
 * @param {Vector} otherVector - The vector to project onto.
 * @returns {Vector} The projected vector.
 */
Vector.prototype.projection = function (otherVector) {
  return otherVector.clone().multiplyByScalar(this.projectionSize(otherVector));
};

/**
 * Gets the angle of this vector from the X-axis in the XY plane.
 * @returns {number} The angle in radians.
 */
Vector.prototype.getAngleFromXAxisOfXYProjection = function () {
  const result = Math.acos(
    this.data[0] / this.clone().projectOverXY().distanceFromOrigin(),
  );
  if (result === NaN) return 0;
};

/**
 * Inverts the direction of this vector.
 * @returns {Vector} This vector pointing in the opposite direction.
 */
Vector.prototype.invert = function () {
  return this.multiplyByScalar(-1);
};

/**
 * Adjusts the size of this vector to a specified length.
 * @param {number} targetSize - The target size.
 * @returns {Vector} This vector after resizing.
 */
Vector.prototype.adjustToSize = function (targetSize) {
  return this.normalize().multiplyByScalar(targetSize);
};

/**
 * Creates a unit vector (1,1).
 * @returns {Vector} A new unit vector.
 */
Vector.makeUnit = function () {
  return new Vector(1, 1);
};

/**
 * Calculates the mean of two vectors.
 * @param {Vector} vector1 - The first vector.
 * @param {Vector} vector2 - The second vector.
 * @returns {Vector} A new vector representing the mean of the two vectors.
 */
Vector.makeMean = function (vector1, vector2) {
  return vector1.clone().add(vector2).divideByScalar(2);
};

/**
 * Creates a 2D projection of a vector from an angle and size.
 * @param {number} angleFromXProjectedAxis - The angle from the X axis.
 * @param {number} size - The magnitude of the vector.
 * @returns {Vector} A new vector representing the 2D projection.
 */
Vector.make2DProjectionFromAngleAndSize = function (
  angleFromXProjectedAxis,
  size,
) {
  return new Vector(
    Math.cos(angleFromXProjectedAxis) * size,
    Math.sin(angleFromXProjectedAxis) * size,
  );
};

/**
 * Creates a vector from an angle and magnitude.
 * @param {number} angle - The angle in radians.
 * @param {number} size - The magnitude of the vector.
 * @returns {Vector} A new vector representing the specified angle and magnitude.
 */
Vector.makeFromAngleAndSize = function (angle, size) {
  return new Vector(Math.cos(angle) * size, Math.sin(angle) * size);
};

/**
 * Adds two vectors.
 * @param {Vector} v1 - The first vector.
 * @param {Vector} v2 - The second vector.
 * @returns {Vector} A new vector that is the sum of v1 and v2.
 */
Vector.add = function (v1, v2) {
  return v1.clone().add(v2);
};

/**
 * Subtracts one vector from another.
 * @param {Vector} subtractFrom - The vector to subtract from.
 * @param {Vector} subtractBy - The vector to subtract.
 * @returns {Vector} A new vector that is the result of the subtraction.
 */
Vector.subtract = function (subtractFrom, subtractBy) {
  return subtractFrom.clone().subtract(subtractBy);
};

/**
 * Clones a vector.
 * @param {Vector} vectorToClone - The vector to clone.
 * @returns {Vector} A new vector that is a clone of the input vector.
 */
Vector.clone = function (vectorToClone) {
  return vectorToClone.clone();
};

/**
 * Converts a vector from one base size to another.
 * @param {Vector} fromBaseSize - The original base size of the vector.
 * @param {Vector} toBaseSize - The target base size for the conversion.
 * @returns {Vector} The vector converted to the new base size.
 */
Vector.prototype.convert = function (fromBaseSize, toBaseSize) {
  return new Vector(
    (this.data[0] * toBaseSize.data[0]) / (fromBaseSize.data[0] || 1),
    (this.data[1] * toBaseSize.data[1]) / (fromBaseSize.data[1] || 1),
  );
};

// Gets the angle accounting for the quadrant we're in
/**
 * Gets the angle of the vector accounting for the quadrant it's in.
 * @returns {number} The angle of the vector in radians.
 */
Vector.prototype.getAngle = function () {
  return Math.atan2(this.data[1], this.data[0]);
};

/**
 * Flips the x-component of the vector.
 * @returns {Vector} This vector with the x-component flipped.
 */
Vector.prototype.flipX = function () {
  this.data[0] *= -1;
  return this;
};

/**
 * Flips the y-component of the vector.
 * @returns {Vector} This vector with the y-component flipped.
 */
Vector.prototype.flipY = function () {
  this.data[1] *= -1;
  return this;
};

// Allows us to get a new vector from angle and magnitude
/**
 * Creates a vector from an angle and magnitude.
 * @param {number} angle - The angle in radians.
 * @param {number} magnitude - The magnitude of the vector.
 * @returns {Vector} A new vector created from the given angle and magnitude.
 */
Vector.fromAngle = function (angle, magnitude) {
  return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};

/**
 * Returns the origin vector (0, 0).
 * @returns {Vector} A vector representing the origin.
 */
/**
 * Returns the origin vector (0, 0).
 * @returns {Vector} A vector representing the origin.
 */
Vector.Origin = function () {
  return new Vector();
};

/**
 * Calculates the cross product with another vector (2D cross product returns a scalar).
 * @param {Vector} otherVector - The other vector.
 * @returns {number} The cross product (z-component of the 3D cross product).
 */
Vector.prototype.crossProduct = function (otherVector) {
  return (
    this.data[0] * otherVector.data[1] - this.data[1] * otherVector.data[0]
  );
};

/**
 * Calculates the area of a parallelogram formed by two vectors.
 * @param {Vector} vector1 - The first vector.
 * @param {Vector} vector2 - The second vector.
 * @returns {number} The area of the parallelogram.
 */
Vector.parallelogramArea = function (vector1, vector2) {
  return Math.abs(vector1.crossProduct(vector2));
};

/**
 * Determines if a face is pointing up (positive y direction).
 * @param {Vector} normal - The normal vector of the face.
 * @returns {boolean} True if the face is pointing up.
 */
Vector.isFaceUp = function (normal) {
  return normal.data[1] > 0;
};

/**
 * Custom JSON serialization to ensure x and y properties are preserved.
 * @returns {Object} Object with x and y properties for JSON serialization.
 */
Vector.prototype.toJSON = function () {
  return {
    x: this.data[0],
    y: this.data[1],
  };
};

//alias to simplify vector creation
const vect = (x, y) => new Vector(x, y);

export { Vector, vect };
