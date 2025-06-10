"use strict";

//Note2: the operations are destructive! Use clone() for protection.
export function Vector3D(x = 0, y = 0, z = 0) {
  this.x = x;
  this.y = y;
  this.z = z;
}

Vector3D.prototype.set = function (x = 0, y = 0, z = 0) {
  this.x = x;
  this.y = y;
  this.z = z;
  return this;
};

Vector3D.prototype.copy = function (otherVector) {
  this.x = otherVector.x;
  this.y = otherVector.y;
  this.z = otherVector.z;
  return this;
};

Vector3D.prototype.zRotate = function (angle) {
  this.x = Math.cos(angle) * this.x - Math.sin(angle) * this.y;
  this.y = Math.sin(angle) * this.x + Math.cos(angle) * this.y;
  return this;
};

Vector3D.prototype.size = function () {
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

Vector3D.prototype.normalize = function () {
  let size = this.size();
  this.x = this.x / size;
  this.y = this.y / size;
  this.z = this.z / size;
  return this;
};

Vector3D.prototype.vectorDistance = function (otherVector) {
  return new Vector3D(
    otherVector.x - this.x,
    otherVector.y - this.y,
    otherVector.z - this.z,
  );
};
Vector3D.prototype.distance = function (otherVector) {
  let v0 = otherVector.x - this.x;
  let v1 = otherVector.y - this.y;
  let v2 = otherVector.z - this.z;
  return Math.sqrt(v0 * v0 + v1 * v1 + v2 * v2);
};

Vector3D.prototype.Xdistance = function (otherVector) {
  return Math.abs(this.x - otherVector.x);
};

Vector3D.prototype.Ydistance = function (otherVector) {
  return Math.abs(this.y - otherVector.y);
};

Vector3D.prototype.Zdistance = function (otherVector) {
  return Math.abs(this.z - otherVector.z);
};

Vector3D.prototype.add = function (otherVector) {
  this.x = this.x + otherVector.x;
  this.y = this.y + otherVector.y;
  this.z = this.z + otherVector.z;
  return this;
};

//Note: only executes operation if inside limits.
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

//if allOrNothing is true (default) either apply all changes or none. This will distort the vector.
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

Vector3D.prototype.subtract = function (deltaPos) {
  this.x = this.x - deltaPos.x;
  this.y = this.y - deltaPos.y;
  this.z = this.z - deltaPos.z;
  return this;
};

Vector3D.prototype.to2D = function () {
  this.z = 0;
};

Vector3D.prototype.equal = function (otherVector) {
  return (
    this.x === otherVector.x &&
    this.y === otherVector.y &&
    this.z === otherVector.z
  );
};

Vector3D.prototype.equal2D = function (otherVector) {
  return this.x === otherVector.x && this.y === otherVector.y;
};

Vector3D.prototype.clone = function () {
  return new Vector3D(this.x, this.y, this.z);
};

Vector3D.prototype.round = function () {
  this.x = Math.round(this.x);
  this.y = Math.round(this.y);
  this.z = Math.round(this.z);
  return this;
};

Vector3D.prototype.abs = function () {
  this.x = Math.abs(this.x);
  this.y = Math.abs(this.y);
  this.z = Math.abs(this.z);
  return this;
};

Vector3D.prototype.toString = function () {
  return "(" + this.x + "," + this.y + "," + this.z + ")";
};

Vector3D.prototype.multiplyByScalar = function (value) {
  this.x = this.x * value;
  this.y = this.y * value;
  this.z = this.z * value;
  return this;
};

Vector3D.prototype.divideByScalar = function (value) {
  this.x = this.x / value;
  this.y = this.y / value;
  this.z = this.z / value;
  return this;
};

Vector3D.prototype.dotProduct = function (otherVector) {
  return (
    this.x * otherVector.x + this.y * otherVector.y + this.z * otherVector.z
  );
};

Vector3D.prototype.angle = function (otherVector) {
  return Math.acos(
    (this.clone().dotProduct(otherVector) / this.size()) * otherVector.size(),
  );
};

Vector3D.prototype.projectionSize = function (otherVector) {
  return this.clone().dotProduct(otherVector) / otherVector.size();
};

Vector3D.prototype.projection = function (otherVector) {
  return otherVector.clone().multiplyByScalar(this.projectionSize(otherVector));
};

Vector3D.prototype.crossProduct = function (otherVector) {
  /*
   * from: http://www.nondot.org/sabre/graphpro/3d2.html#Vectors
   * normal vector to two other vectors.
   * result vector size equal to the area of the parrellelagram formed by the two original vectors.
   */
  return new Vector3D(
    this.y * otherVector.z - this.z * otherVector.y,
    this.z * otherVector.x - this.x * otherVector.z,
    this.x * otherVector.y - this.y * otherVector.x,
  );
};

Vector3D.prototype.projectOverXY = function () {
  this.z = 0;
  return this;
};

Vector3D.prototype.projectOverXZ = function () {
  this.y = 0;
  return this;
};

Vector3D.prototype.projectOverYZ = function () {
  this.x = 0;
  return this;
};

Vector3D.prototype.getAngleFromXAxisOfXYProjection = function () {
  return Math.acos(this.x / this.clone().projectOverXY().distanceFromOrigin());
};

Vector3D.prototype.getAngleFromXAxisOfXZProjection = function () {
  return Math.acos(this.x / this.clone().projectOverXZ().distanceFromOrigin());
};

Vector3D.prototype.getAngleFromZAxisOfYZProjection = function () {
  return Math.acos(this.z / this.clone().projectOverYZ().distanceFromOrigin());
};

Vector3D.prototype.XRotateOnOrigin = function (angle) {
  let resultPoint = Vector3D.make2DProjectionFromAngleAndSize(
    this.getAngleFromZAxisOfYZProjection() + angle,
    this.clone().projectOverYZ().distanceFromOrigin(),
  );
  return new Vector3D(this.x, resultPoint.x, resultPoint.y);
};

Vector3D.prototype.YRotateOnOrigin = function (angle) {
  let resultPoint = Vector3D.make2DProjectionFromAngleAndSize(
    this.getAngleFromXAxisOfXZProjection() + angle,
    this.clone().projectOverXZ().distanceFromOrigin(),
  );
  return new Vector3D(resultPoint.x, this.y, resultPoint.y);
};

Vector3D.prototype.ZRotateOnOrigin = function (angle) {
  let resultPoint = Vector3D.make2DProjectionFromAngleAndSize(
    this.getAngleFromXAxisOfXYProjection() + angle,
    this.clone().projectOverXY().distanceFromOrigin(),
  );
  return new Vector3D(resultPoint.x, resultPoint.y, this.z);
};

Vector3D.prototype.XRotateOnAxis = function (axis, angle) {
  return this.clone().subtract(axis).XRotateOnOrigin(angle).add(axis);
};

Vector3D.prototype.YRotateOnAxis = function (axis, angle) {
  return this.clone().subtract(axis).YRotateOnOrigin(angle).add(axis);
};

Vector3D.prototype.ZRotateOnAxis = function (axis, angle) {
  return this.clone().subtract(axis).ZRotateOnOrigin(angle).add(axis);
};

Vector3D.prototype.invert = function () {
  return this.multiplyByScalar(-1);
};

Vector3D.prototype.normalize = function () {
  return this.divideByScalar(this.size());
};

Vector3D.prototype.adjustToSize = function (targetSize) {
  return this.normalize().clone().multiplyByScalar(targetSize);
};

Vector3D.makeUnit = function () {
  return new Vector3D(1, 1, 1);
};

Vector3D.makeMean = function (vector1, vector2) {
  return vector1.clone().add(vector2).divideByScalar(2);
};

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

Vector3D.makeFromAngleAndSize = function (angle, size) {
  return new Vector3D(Math.cos(angle) * size, Math.sin(angle) * size, 0);
};

Vector3D.add = function (v1, v2) {
  return v1.clone().add(v2);
};

Vector3D.subtract = function (subtractFrom, subtractBy) {
  return subtractFrom.clone().subtract(subtractBy);
};

Vector3D.parallelogramArea = function (vector1, vector2) {
  return vector1.crossProduct(vector2).size();
};

Vector3D.clone = function (vectorToClone) {
  return vectorToClone.clone();
};

Vector3D.isFaceUp = function (vector1, vector2) {
  return vector1.clone().crossProduct(vector2).z >= 0;
};

Vector3D.prototype.convert = function (fromBaseSize, toBaseSize) {
  return new Vector3D(
    (this.x * toBaseSize.x) / fromBaseSize.x,
    (this.y * toBaseSize.y) / fromBaseSize.y,
    (this.z * toBaseSize.z) / fromBaseSize.z,
  );
};

// Gets the angle accounting for the quadrant we're in
Vector3D.prototype.getAngle = function () {
  return Math.atan2(this.y, this.x);
};

Vector3D.prototype.flipX = function () {
  this.x *= -1;
  return this;
};
Vector3D.prototype.flipY = function () {
  this.y *= -1;
  return this;
};
Vector3D.prototype.flipZ = function () {
  this.z *= -1;
  return this;
};

// Allows us to get a new vector from angle and magnitude
Vector3D.fromAngle = function (angle, magnitude) {
  return new Vector3D(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};

Vector3D.Origin = function () {
  return new Vector3D();
};

//alias to simplify vector creation
const vect = (x, y, z) => new Vector3D(x, y, z);
