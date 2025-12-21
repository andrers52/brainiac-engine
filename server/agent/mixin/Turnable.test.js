import { strict as assert } from 'assert';
import { Turnable } from './Turnable.js';

describe('Turnable', function () {
  let turnable;

  beforeEach(function () {
    turnable = {};
    Turnable.call(turnable, 1); // Initialize with default speed
  });

  it('should initialize with default values', function () {
    assert.strictEqual(turnable.orientation, 0);
    assert.strictEqual(
      turnable.TURNABLE_DEFAULT_ROTATE_ANGLE,
      (2 * Math.PI) / 360,
    );
  });

  it('should reset orientation', function () {
    turnable.orientation = Math.PI;
    turnable.resetOrientation();
    assert.strictEqual(turnable.orientation, 0);
  });

  it('should rotate clockwise', function () {
    turnable.rotateClockwise();
    assert.strictEqual(
      turnable.orientation,
      2 * Math.PI - turnable.TURNABLE_DEFAULT_ROTATE_ANGLE,
    );

    turnable.rotateClockwise(Math.PI / 2);
    assert.strictEqual(
      turnable.orientation,
      2 * Math.PI - turnable.TURNABLE_DEFAULT_ROTATE_ANGLE - Math.PI / 2,
    );
  });

  it('should rotate counterclockwise', function () {
    turnable.rotateCounterclockwise();
    assert.strictEqual(
      turnable.orientation,
      turnable.TURNABLE_DEFAULT_ROTATE_ANGLE % (2 * Math.PI),
    );

    turnable.rotateCounterclockwise(Math.PI / 2);
    assert.strictEqual(
      turnable.orientation,
      (turnable.TURNABLE_DEFAULT_ROTATE_ANGLE + Math.PI / 2) % (2 * Math.PI),
    );
  });

  it('should calculate angle to turn to face position', function () {
    turnable.rectangle = {
      center: { x: 0, y: 0 },
    };
    let position = { x: 1, y: 1 };
    let angleToTurn = turnable.calculateAngleToTurnToFacePosition(position);
    assert.strictEqual(angleToTurn, Math.atan2(1, 1));

    position = { x: -1, y: 1 };
    angleToTurn = turnable.calculateAngleToTurnToFacePosition(position);
    assert.strictEqual(angleToTurn, Math.atan2(1, -1));

    position = { x: -1, y: -1 };
    angleToTurn = turnable.calculateAngleToTurnToFacePosition(position);
    assert.strictEqual(angleToTurn, Math.atan2(-1, -1) + 2 * Math.PI);

    position = { x: 1, y: -1 };
    angleToTurn = turnable.calculateAngleToTurnToFacePosition(position);
    assert.strictEqual(angleToTurn, Math.atan2(-1, 1) + 2 * Math.PI);
  });
});
