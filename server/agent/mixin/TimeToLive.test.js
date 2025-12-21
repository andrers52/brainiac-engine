import { strict as assert } from 'assert';
import sinon from 'sinon';
import { TimeToLive } from './TimeToLive.js';

describe('TimeToLive', function () {
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
  });

  afterEach(function () {
    clock.restore();
  });

  it('should call die method after the specified time', function () {
    const timeToLiveInMilliseconds = 3000;
    const agent = {
      isAlive: true,
      die: sinon.spy(),
    };

    TimeToLive.call(agent, timeToLiveInMilliseconds);

    clock.tick(timeToLiveInMilliseconds - 1);
    assert.strictEqual(agent.die.called, false);

    clock.tick(1);
    assert.strictEqual(agent.die.called, true);
  });

  it('should call die method after the default time if no time is specified', function () {
    const DEFAULT_TIME_TO_LIVE = 5000;
    const agent = {
      isAlive: true,
      die: sinon.spy(),
    };

    TimeToLive.call(agent);

    clock.tick(DEFAULT_TIME_TO_LIVE - 1);
    assert.strictEqual(agent.die.called, false);

    clock.tick(1);
    assert.strictEqual(agent.die.called, true);
  });

  it('should not call die if isAlive is false', function () {
    const timeToLiveInMilliseconds = 3000;
    const agent = {
      isAlive: false,
      die: sinon.spy(),
    };

    TimeToLive.call(agent, timeToLiveInMilliseconds);

    clock.tick(timeToLiveInMilliseconds);
    assert.strictEqual(agent.die.called, false);
  });
});
