BE.UnitTests.AnimatedTestCase = function() {
  let SAMPLE_ANIMATED_CONFIGURATION =
    {"defaultState": "standing",
     "auto_reverse": false,
      "animationStates":
        [ {"stateName": "standing", "timeinMilis": null, "animationFrames": ["media/images/blower1.png","media/images/blower2.png"], "audioName": null}]
    };

  this.testCreate = function() {
    let agent = BE.createAgent();
    BE.Animated.call(agent, SAMPLE_ANIMATED_CONFIGURATION);
    BE.UnitTests.testSuite.assertTrue(
      agent.currentState === 'standing',
      "current state not read from configuration");
  };
}

BE.UnitTests.testSuite.add("BE.UnitTests.AnimatedTestCase");
