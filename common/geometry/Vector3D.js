"use strict";

/**
 * Represents a 3D vector.
 * Note: the operations are destructive! Use clone() for protection.
 * @param {number} [x=0] - The x component of the vector
 * @param {number} [y=0] - The y component of the vector
 * @param {number} [z=0] - The z component of the vector
 * @constructor
 */
export function Vector3D(x = 0, y = 0, z = 0) {
  this.x = x;
  this.y = y;
  this.z = z;
}

/**
 * Sets the components of the vector
 * @param {number} [x=0] - The x component
 * @param {number} [y=0] - The y component
 * @param {number} [z=0] - The z component
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.set = function (x = 0, y = 0, z = 0) {
  this.x = x;
  this.y = y;
  this.z = z;
  return this;
};

/**
 * Copies the components from another vector to this vector
 * @param {Vector3D} otherVector - The vector to copy from
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.copy = function (otherVector) {
  this.x = otherVector.x;
  this.y = otherVector.y;
  this.z = otherVector.z;
  return this;
};

/**
 * Rotates the vector around the Z axis
 * @param {number} angle - The angle in radians
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.zRotate = function (angle) {
  const originalX = this.x;
  const originalY = this.y;
  this.x = Math.cos(angle) * originalX - Math.sin(angle) * originalY;
  this.y = Math.sin(angle) * originalX + Math.cos(angle) * originalY;
  return this;
};

/**
 * Calculates the magnitude of the vector
 * @returns {number} The magnitude/length of the vector
 */
Vector3D.prototype.size = function () {
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

/**
 * Normalizes the vector to unit length
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.normalize = function () {
  let size = this.size();
  this.x = this.x / size;
  this.y = this.y / size;
  this.z = this.z / size;
  return this;
};

/**
 * Computes the vector from this to another vector
 * @param {Vector3D} otherVector - The target vector
 * @returns {Vector3D} A new vector representing the distance
 */
Vector3D.prototype.vectorDistance = function (otherVector) {
  return new Vector3D(
    otherVector.x - this.x,
    otherVector.y - this.y,
    otherVector.z - this.z,
  );
};

/**
 * Computes the Euclidean distance between this vector and another vector
 * @param {Vector3D} otherVector - The other vector
 * @returns {number} The Euclidean distance
 */
Vector3D.prototype.distance = function (otherVector) {
  let v0 = otherVector.x - this.x;
  let v1 = otherVector.y - this.y;
  let v2 = otherVector.z - this.z;
  return Math.sqrt(v0 * v0 + v1 * v1 + v2 * v2);
};

/**
 * Computes the absolute distance between the x-components
 * @param {Vector3D} otherVector - The other vector
 * @returns {number} The absolute x-distance
 */
Vector3D.prototype.Xdistance = function (otherVector) {
  return Math.abs(this.x - otherVector.x);
};

/**
 * Computes the absolute distance between the y-components
 * @param {Vector3D} otherVector - The other vector
 * @returns {number} The absolute y-distance
 */
Vector3D.prototype.Ydistance = function (otherVector) {
  return Math.abs(this.y - otherVector.y);
};

/**
 * Computes the absolute distance between the z-components
 * @param {Vector3D} otherVector - The other vector
 * @returns {number} The absolute z-distance
 */
Vector3D.prototype.Zdistance = function (otherVector) {
  return Math.abs(this.z - otherVector.z);
};

/**
 * Adds another vector to this vector
 * @param {Vector3D} otherVector - The vector to add
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.add = function (otherVector) {
  this.x = this.x + otherVector.x;
  this.y = this.y + otherVector.y;
  this.z = this.z + otherVector.z;
  return this;
};

/**
 * Helper function - adds with limits all or nothing
 * Note: only executes operation if inside limits.
 * @param {Vector3D} vectorToBeChanged - The vector to modify
 * @param {Vector3D} otherVector - The vector to add
 * @param {number} maxLimit - Maximum limit for components
 * @param {number} minLimit - Minimum limit for components
 * @returns {Vector3D} The modified vector or original if limits exceeded
 */
function addWithLimitsAllOrNothing(
  vectorToBeChanged,
  otherVector,
  maxLimit,
  minLimit,
) {
  let x = vectorToBeChanged.x + otherVector.x;
  let y = vectorToBeChanged.y + otherVector.y;
  let z = vectorToBeChanged.z + otherVector.z;

  if (
    x > maxLimit ||
    x < minLimit ||
    y > maxLimit ||
    y < minLimit ||
    z > maxLimit ||
    z < minLimit
  )
    return vectorToBeChanged;

  vectorToBeChanged.x = x;
  vectorToBeChanged.y = y;
  vectorToBeChanged.z = z;
  return vectorToBeChanged;
}

/**
 * Adds another vector to this vector with limits
 * If allOrNothing is true (default) either apply all changes or none. This will distort the vector.
 * @param {Vector3D} otherVector - The vector to add
 * @param {number} maxLimit - Maximum limit for components
 * @param {number} minLimit - Minimum limit for components
 * @param {boolean} [allOrNothing=true] - Whether to apply all changes or none
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.addWithLimits = function (
  otherVector,
  maxLimit,
  minLimit,
  allOrNothing = true,
) {
  if (allOrNothing)
    return addWithLimitsAllOrNothing(this, otherVector, maxLimit, minLimit);

  let newX = this.x + otherVector.x;
  let newY = this.y + otherVector.y;
  let newZ = this.z + otherVector.z;

  if (newX > maxLimit) this.x = maxLimit;
  else if (newX < minLimit) this.x = minLimit;
  else this.x = newX;
  if (newY > maxLimit) this.y = maxLimit;
  else if (newY < minLimit) this.y = minLimit;
  else this.y = newY;
  if (newZ > maxLimit) this.z = maxLimit;
  else if (newZ < minLimit) this.z = minLimit;
  else this.z = newZ;

  return this;
};

/**
 * Adds another vector with maximum limit constraint
 * @param {Vector3D} otherVector - The vector to add
 * @param {number} maxLimit - Maximum limit for components
 * @param {boolean} [allOrNothing=true] - Whether to apply all changes or none
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.addWithMaxLimit = function (
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
 * Adds another vector with minimum limit constraint
 * @param {Vector3D} otherVector - The vector to add
 * @param {number} minLimit - Minimum limit for components
 * @param {boolean} [allOrNothing=true] - Whether to apply all changes or none
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.addWithMinLimit = function (
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
 * Subtracts another vector from this vector
 * @param {Vector3D} deltaPos - The vector to subtract
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.subtract = function (deltaPos) {
  this.x = this.x - deltaPos.x;
  this.y = this.y - deltaPos.y;
  this.z = this.z - deltaPos.z;
  return this;
};

/**
 * Converts this vector to 2D by setting z to 0
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.to2D = function () {
  this.z = 0;
};

/**
 * Checks if this vector is equal to another vector
 * @param {Vector3D} otherVector - The vector to compare with
 * @returns {boolean} True if vectors are equal
 */
Vector3D.prototype.equal = function (otherVector) {
  return (
    this.x === otherVector.x &&
    this.y === otherVector.y &&
    this.z === otherVector.z
  );
};

/**
 * Checks if this vector is equal to another vector in 2D (ignoring z)
 * @param {Vector3D} otherVector - The vector to compare with
 * @returns {boolean} True if vectors are equal in 2D
 */
Vector3D.prototype.equal2D = function (otherVector) {
  return this.x === otherVector.x && this.y === otherVector.y;
};

/**
 * Creates a clone of this vector
 * @returns {Vector3D} A new vector that is a copy of this one
 */
Vector3D.prototype.clone = function () {
  return new Vector3D(this.x, this.y, this.z);
};

/**
 * Rounds the components of this vector to nearest integers
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.round = function () {
  this.x = Math.round(this.x);
  this.y = Math.round(this.y);
  this.z = Math.round(this.z);
  return this;
};

/**
 * Sets the components to their absolute values
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.abs = function () {
  this.x = Math.abs(this.x);
  this.y = Math.abs(this.y);
  this.z = Math.abs(this.z);
  return this;
};

/**
 * Returns a string representation of the vector
 * @returns {string} String representation in format "(x,y,z)"
 */
Vector3D.prototype.toString = function () {
  return "(" + this.x + "," + this.y + "," + this.z + ")";
};

/**
 * Multiplies the vector components by a scalar
 * @param {number} value - The scalar value to multiply by
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.multiplyByScalar = function (value) {
  this.x = this.x * value;
  this.y = this.y * value;
  this.z = this.z * value;
  return this;
};

/**
 * Divides the vector components by a scalar
 * @param {number} value - The scalar value to divide by
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.divideByScalar = function (value) {
  this.x = this.x / value;
  this.y = this.y / value;
  this.z = this.z / value;
  return this;
};

/**
 * Calculates the dot product with another vector
 * @param {Vector3D} otherVector - The other vector
 * @returns {number} The dot product
 */
Vector3D.prototype.dotProduct = function (otherVector) {
  return (
    this.x * otherVector.x + this.y * otherVector.y + this.z * otherVector.z
  );
};

/**
 * Calculates the angle between this vector and another vector
 * @param {Vector3D} otherVector - The other vector
 * @returns {number} The angle in radians
 */
Vector3D.prototype.angle = function (otherVector) {
  return Math.acos(
    this.clone().dotProduct(otherVector) / (this.size() * otherVector.size()),
  );
};

/**
 * Calculates the projection size of this vector onto another vector
 * @param {Vector3D} otherVector - The vector to project onto
 * @returns {number} The magnitude of the projection
 */
Vector3D.prototype.projectionSize = function (otherVector) {
  return this.clone().dotProduct(otherVector) / otherVector.size();
};

/**
 * Projects this vector onto another vector
 * @param {Vector3D} otherVector - The vector to project onto
 * @returns {Vector3D} The projected vector
 */
Vector3D.prototype.projection = function (otherVector) {
  return otherVector.clone().multiplyByScalar(this.projectionSize(otherVector));
};

/**
 * Calculates the cross product with another vector
 * From: http://www.nondot.org/sabre/graphpro/3d2.html#Vectors
 * Normal vector to two other vectors.
 * Result vector size equal to the area of the parallelogram formed by the two original vectors.
 * @param {Vector3D} otherVector - The other vector
 * @returns {Vector3D} The cross product vector
 */
Vector3D.prototype.crossProduct = function (otherVector) {
  return new Vector3D(
    this.y * otherVector.z - this.z * otherVector.y,
    this.z * otherVector.x - this.x * otherVector.z,
    this.x * otherVector.y - this.y * otherVector.x,
  );
};

/**
 * Projects the vector onto the XY plane (sets z to 0)
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.projectOverXY = function () {
  this.z = 0;
  return this;
};

/**
 * Projects the vector onto the XZ plane (sets y to 0)
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.projectOverXZ = function () {
  this.y = 0;
  return this;
};

/**
 * Projects the vector onto the YZ plane (sets x to 0)
 * @returns {Vector3D} This vector for chaining
 */
Vector3D.prototype.projectOverYZ = function () {
  this.x = 0;
  return this;
};

/**
 * Gets the angle from X axis of the XY projection
 * @returns {number} The angle in radians
 */
Vector3D.prototype.getAngleFromXAxisOfXYProjection = function () {
  return Math.acos(this.x / this.clone().projectOverXY().distanceFromOrigin());
};

/**
 * Gets the angle from X axis of the XZ projection
 * @returns {number} The angle in radians
 */
Vector3D.prototype.getAngleFromXAxisOfXZProjection = function () {
  return Math.acos(this.x / this.clone().projectOverXZ().distanceFromOrigin());
};

/**
 * Gets the angle from Z axis of the YZ projection
 * @returns {number} The angle in radians
 */
Vector3D.prototype.getAngleFromZAxisOfYZProjection = function () {
  return Math.acos(this.z / this.clone().projectOverYZ().distanceFromOrigin());
};

/**
 * Rotates the vector around the X axis at origin
 * @param {number} angle - The angle in radians
 * @returns {Vector3D} A new rotated vector
 */
Vector3D.prototype.XRotateOnOrigin = function (angle) {
  let resultPoint = Vector3D.make2DProjectionFromAngleAndSize(
    this.getAngleFromZAxisOfYZProjection() + angle,
    this.clone().projectOverYZ().distanceFromOrigin(),
  );
  return new Vector3D(this.x, resultPoint.x, resultPoint.y);
};

/**
 * Rotates the vector around the Y axis at origin
 * @param {number} angle - The angle in radians
 * @returns {Vector3D} A new rotated vector
 */
Vector3D.prototype.YRotateOnOrigin = function (angle) {
  let resultPoint = Vector3D.make2DProjectionFromAngleAndSize(
    this.getAngleFromXAxisOfXZProjection() + angle,
    this.clone().projectOverXZ().distanceFromOrigin(),
  );
  return new Vector3D(resultPoint.x, this.y, resultPoint.y);
};

/**
 * Rotates the vector around the Z axis at origin
 * @param {number} angle - The angle in radians
 * @returns {Vector3D} A new rotated vector
 */
Vector3D.prototype.ZRotateOnOrigin = function (angle) {
  let resultPoint = Vector3D.make2DProjectionFromAngleAndSize(
    this.getAngleFromXAxisOfXYProjection() + angle,
    this.clone().projectOverXY().distanceFromOrigin(),
  );
  return new Vector3D(resultPoint.x, resultPoint.y, this.z);
};

/**
 * Rotates the vector around the X axis at a specific axis point
 * @param {Vector3D} axis - The axis point to rotate around
 * @param {number} angle - The angle in radians
 * @returns {Vector3D} A new rotated vector
 */
Vector3D.prototype.XRotateOnAxis = function (axis, angle) {
  return this.clone().subtract(axis).XRotateOnOrigin(angle).add(axis);
};

/**
 * Rotates the vector around the Y axis at a specific axis point
 * @param {Vector3D} axis - The axis point to rotate around
 * @param {number} angle - The angle in radians
 * @returns {Vector3D} A new rotated vector
 */
Vector3D.prototype.YRotateOnAxis = function (axis, angle) {
  return this.clone().subtract(axis).YRotateOnOrigin(angle).add(axis);
};

/**
 * Rotates the vector around the Z axis at a specific axis point
 * @param {Vector3D} axis - The axis point to rotate around
 * @param {number} angle - The angle in radians
 * @returns {Vector3D} A new rotated vector
 */
Vector3D.prototype.ZRotateOnAxis = function (axis, angle) {
  return this.clone().subtract(axis).ZRotateOnOrigin(angle).add(axis);
};

/**
 * Inverts the direction of the vector
 * @returns {Vector3D} This vector pointing in the opposite direction
 */
Vector3D.prototype.invert = function () {
  return this.multiplyByScalar(-1);
};

/**
 * Normalizes the vector to unit length
 * @returns {Vector3D} This normalized vector
 */
Vector3D.prototype.normalize = function () {
  return this.divideByScalar(this.size());
};

/**
 * Adjusts the size of the vector to a target magnitude
 * @param {number} targetSize - The target magnitude
 * @returns {Vector3D} A new vector with the target size
 */
Vector3D.prototype.adjustToSize = function (targetSize) {
  return this.clone().normalize().multiplyByScalar(targetSize);
};

/**
 * Creates a unit vector (1, 1, 1)
 * @returns {Vector3D} A new unit vector
 */
Vector3D.makeUnit = function () {
  return new Vector3D(1, 1, 1);
};

/**
 * Calculates the mean of two vectors
 * @param {Vector3D} vector1 - The first vector
 * @param {Vector3D} vector2 - The second vector
 * @returns {Vector3D} A new vector representing the mean
 */
Vector3D.makeMean = function (vector1, vector2) {
  return vector1.clone().add(vector2).divideByScalar(2);
};

/**
 * Creates a 2D projection from an angle and size
 * @param {number} angleFromXProjectedAxis - The angle from the X axis
 * @param {number} size - The magnitude of the vector
 * @returns {Vector3D} A new 2D projected vector
 */
Vector3D.make2DProjectionFromAngleAndSize = function (
  angleFromXProjectedAxis,
  size,
) {
  return new Vector3D(
    Math.cos(angleFromXProjectedAxis) * size,
    Math.sin(angleFromXProjectedAxis) * size,
    0,
  );
};

/**
 * Creates a vector from an angle and size
 * @param {number} angle - The angle in radians
 * @param {number} size - The magnitude of the vector
 * @returns {Vector3D} A new vector
 */
Vector3D.makeFromAngleAndSize = function (angle, size) {
  return new Vector3D(Math.cos(angle) * size, Math.sin(angle) * size, 0);
};

/**
 * Adds two vectors
 * @param {Vector3D} v1 - The first vector
 * @param {Vector3D} v2 - The second vector
 * @returns {Vector3D} A new vector that is the sum of v1 and v2
 */
Vector3D.add = function (v1, v2) {
  return v1.clone().add(v2);
};

/**
 * Subtracts one vector from another
 * @param {Vector3D} subtractFrom - The vector to subtract from
 * @param {Vector3D} subtractBy - The vector to subtract
 * @returns {Vector3D} A new vector that is the result of the subtraction
 */
Vector3D.subtract = function (subtractFrom, subtractBy) {
  return subtractFrom.clone().subtract(subtractBy);
};

/**
 * Calculates the area of a parallelogram formed by two vectors
 * @param {Vector3D} vector1 - The first vector
 * @param {Vector3D} vector2 - The second vector
 * @returns {number} The area of the parallelogram
 */
Vector3D.parallelogramArea = function (vector1, vector2) {
  return vector1.crossProduct(vector2).size();
};

/**
 * Clones a vector
 * @param {Vector3D} vectorToClone - The vector to clone
 * @returns {Vector3D} A new vector that is a clone of the input
 */
Vector3D.clone = function (vectorToClone) {
  return vectorToClone.clone();
};

/**
 * Checks if a face is facing up based on two vectors
 * @param {Vector3D} vector1 - The first vector
 * @param {Vector3D} vector2 - The second vector
 * @returns {boolean} True if the face is facing up
 */
Vector3D.isFaceUp = function (vector1, vector2) {
  return vector1.clone().crossProduct(vector2).z >= 0;
};

/**
 * Converts the vector from one coordinate system to another
 * @param {Vector3D} fromBaseSize - The original base size
 * @param {Vector3D} toBaseSize - The target base size
 * @returns {Vector3D} A new vector converted to the new coordinate system
 */
Vector3D.prototype.convert = function (fromBaseSize, toBaseSize) {
  return new Vector3D(
    (this.x * toBaseSize.x) / fromBaseSize.x,
    (this.y * toBaseSize.y) / fromBaseSize.y,
    (this.z * toBaseSize.z) / fromBaseSize.z,
  );
};

/**
 * Gets the angle accounting for the quadrant we're in
 * @returns {number} The angle of the vector in radians
 */
Vector3D.prototype.getAngle = function () {
  return Math.atan2(this.y, this.x);
};

/**
 * Flips the x-component of the vector
 * @returns {Vector3D} This vector with the x-component flipped
 */
Vector3D.prototype.flipX = function () {
  this.x *= -1;
  return this;
};

/**
 * Flips the y-component of the vector
 * @returns {Vector3D} This vector with the y-component flipped
 */
Vector3D.prototype.flipY = function () {
  this.y *= -1;
  return this;
};

/**
 * Flips the z-component of the vector
 * @returns {Vector3D} This vector with the z-component flipped
 */
Vector3D.prototype.flipZ = function () {
  this.z *= -1;
  return this;
};

/**
 * Creates a vector from an angle and magnitude
 * Allows us to get a new vector from angle and magnitude
 * @param {number} angle - The angle in radians
 * @param {number} magnitude - The magnitude of the vector
 * @returns {Vector3D} A new vector created from the given angle and magnitude
 */
Vector3D.fromAngle = function (angle, magnitude) {
  return new Vector3D(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};

/**
 * Returns the origin vector (0, 0, 0)
 * @returns {Vector3D} A vector representing the origin
 */
Vector3D.Origin = function () {
  return new Vector3D();
};

/**
 * Alias to simplify vector creation
 * @param {number} [x=0] - The x component
 * @param {number} [y=0] - The y component
 * @param {number} [z=0] - The z component
 * @returns {Vector3D} A new Vector3D instance
 */
export const vect3D = (x, y, z) => new Vector3D(x, y, z);
