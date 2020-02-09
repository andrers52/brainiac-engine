BE.UnitTests.TimeToLiveAgentMixinTestCase = function() {


  this.testCreate = function() {
    let timeToLiveAgent = BE.createAgent();
    BE.TimeToLive.call(timeToLiveAgent, 1000);
    BE.UnitTests.testSuite.assertTrue(timeToLiveAgent !== null);
  };
}

BE.UnitTests.testSuite.add("BE.UnitTests.TimeToLiveAgentMixinTestCase");
