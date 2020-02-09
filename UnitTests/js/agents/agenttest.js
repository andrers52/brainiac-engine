BE.UnitTests.AgentTestCase = function() {

  this.testCreate = function() {
    BE.UnitTests.testSuite.assertTrue(BE.createAgent() instanceof BE.Agent);
  };


  this.testCreationDefaults = function() {
    let agent = BE.createAgent();
    BE.UnitTests.testSuite.assertSame(agent.rectangle.getSize().x , 0);
    BE.UnitTests.testSuite.assertSame(agent.rectangle.getSize().y , 0);
    BE.UnitTests.testSuite.assertSame(agent.audioName , null);
    BE.UnitTests.testSuite.assertSame(agent.imageName, null);
    BE.UnitTests.testSuite.assertTrue(agent.isVisible);
  };


  this.testDie = function() {
    let agent = BE.createAgent();
    BE.UnitTests.testSuite.assertTrue(BE.agents.includes(agent));
    agent.die();
    BE.UnitTests.testSuite.assertFalse(BE.agents.includes(agent));
  };


  // *********** BEHAVIOR **********************

  this.testHasEmptyBehavior = function() {
    let agent = BE.createAgent();
    BE.UnitTests.testSuite.assertIsFunction(agent.behavior);
  };

  /*
  this.testModifyDie = function() {
    let oldDie = agent.die;
    BE.ActiveBehavior.call(agent);
    BE.UnitTests.testSuite.assertFalse(oldDie === agent.die);
  };


  //TODO: NOT WORKING. IT IS NECESSARY TO CHANGE THE TEST SUITE CODE TO ALLOW FOR ASSYNCHRONOUS TESTS (WAIT FOR TEST FINNISH)
  // this.testScheduledBehaviorActivation = function() {
  //     let testFlag = false;
  //     function behavior() {
  //         testFlag = true;
  //     }
  //            agent.behavior = behavior;
  //            BE.ActiveBehavior.call(agent);
  //     BE.UnitTests.testSuite.assertFalse(testFlag);
  //     BE.Util.sleep(BE.Definitions.AGENT_BEHAVIOR_DELAY * 2);
  //            BE.UnitTests.testSuite.assertTrue(testFlag);
  //    };



  // ****************** MOVABLE *******************
  this.testMovableProperty = function() {
    BE.UnitTests.testSuite.assertTrue((BE.createAgent()).isMovable);
  };

  this.testAgentInitialPosition = function() {
    let agent = BE.createAgent();
    let position = agent.getPosition();
    BE.UnitTests.testSuite.assertSame(position.x,0);
    BE.UnitTests.testSuite.assertSame(position.y,0);
  };

  this.testAgentMove = function() {
    let agent = BE.createAgent();
    let positionToMove = new BE.Vector(-1,-1);
    BE.UnitTests.testSuite.assertTrue(agent.move(positionToMove));
    let resultPosition = agent.getPosition();
    BE.UnitTests.testSuite.assertTrue(resultPosition.equal(positionToMove));
  };

  this.testMoveTowardsAnotherAgent = function() {
    let agent1 = BE.createAgent();
    let agent2 = BE.createAgent();
    let positionToMove = new BE.Vector(3,4);
    agent2.move(positionToMove);
    BE.UnitTests.testSuite.assertSame(agent1.getPosition().distance(agent2.getPosition()), 5);
    agent1.moveTowardsAnotherAgent(agent2, 1);
    BE.UnitTests.testSuite.assertSame(agent1.getPosition().distance(agent2.getPosition()), 4);
  };

  this.testValidAgentMove = function() {
    let agent = BE.createAgent();
    let distance = new BE.Vector(1,1);
    BE.UnitTests.testSuite.assertTrue(agent.move(distance));
  };

  this.testInvalidAgentMove = function() {
    let agent = BE.createAgent();
    let origin = BE.createVector(0,0);
    BE.UnitTests.testSuite.assertTrue(agent.move(origin));
    let position1 = agent.getPosition();
    BE.UnitTests.testSuite.assertTrue(position1.equal(origin));

    let worldCorner = new BE.Vector(BE.Definitions.WORLD_WIDTH/2 - BE.Definitions.AGENT_WIDTH/2, BE.Definitions.WORLD_HEIGHT/2 - BE.Definitions.AGENT_HEIGHT/2);
    let maxWorldCornerForAgentToFit = worldCorner.clone().subtract(new BE.Vector(BE.Definitions.AGENT_WIDTH/2, BE.Definitions.AGENT_HEIGHT/2));
    BE.UnitTests.testSuite.assertTrue(agent.move(maxWorldCornerForAgentToFit));
    BE.UnitTests.testSuite.assertTrue(agent.setPosition(origin));

    let outsideWorld = new BE.Vector(BE.Definitions.WORLD_WIDTH, BE.Definitions.WORLD_HEIGHT);

    BE.UnitTests.testSuite.assertFalse(agent.move(outsideWorld));

    let position2 = agent.getPosition();
    BE.UnitTests.testSuite.assertFalse(position2.equal(worldCorner));
  };


  this.testAvailablePosition = function() {
    BE.UnitTests.testSuite.assertTrue(BE.World.isAvailablePosition(
      new BE.Rectangle(new BE.Vector(0,0), new BE.Vector(0,0))));
    BE.UnitTests.testSuite.assertTrue(BE.World.isAvailablePosition(
      new BE.Rectangle(new BE.Vector(0,BE.Definitions.WORLD_HEIGHT), new BE.Vector(0,0))));
    BE.UnitTests.testSuite.assertTrue(BE.World.isAvailablePosition(
      new BE.Rectangle(new BE.Vector(BE.Definitions.WORLD_WIDTH,0), new BE.Vector(0,0))));
    BE.UnitTests.testSuite.assertTrue(BE.World.isAvailablePosition(
      new BE.Rectangle(new BE.Vector(BE.Definitions.WORLD_WIDTH,BE.Definitions.WORLD_HEIGHT), new BE.Vector(0,0))));
    BE.UnitTests.testSuite.assertTrue(BE.World.isAvailablePosition(
      new BE.Rectangle(new BE.Vector(10,10), new BE.Vector(10,10))));
  };

  this.testUnAvailablePosition = function() {
    let agentShape = new BE.Rectangle(new BE.Vector(0,0), new BE.Vector(10,10));
    BE.UnitTests.testSuite.assertTrue(BE.World.isAvailablePosition(agentShape));
    BE.createAgent(BE.World, agentShape);
    BE.UnitTests.testSuite.assertFalse(BE.World.isAvailablePosition(agentShape));
  };


  // ************************* TURNABLE ****************

  this.initiate = function() {
    agent.resetOrientation();
  };

  this.testTurnableProperty = function() {
    BE.UnitTests.testSuite.assertTrue((BE.createAgent()).isTurnable);
  };

  this.testAgentInitialOrientation = function() {
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),0);
  };

  this.testOrientationGetSet = function() {
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),0);
    let newOrientation = 1;
    agent.setOrientationInRadians(newOrientation);
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(), newOrientation);
    agent.resetOrientation();
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),0);
    let negativeOrientation = -1;
    agent.setOrientationInRadians(negativeOrientation);
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(), negativeOrientation);
  };

  this.testSetAboveMaximumOrientation = function() {
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),0);
    let excess = 1;
    let aboveMaximumorientationToTurn = (2 * Math.PI) + excess;
    agent.setOrientationInRadians(aboveMaximumorientationToTurn);
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(), excess);
  };

  this.testSetBelowMinimumOrientation = function() {
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),0);
    let excess = -1;
    let belowMinimumOrientationToTurn = (-(2 * Math.PI)) + excess;
    agent.setOrientationInRadians(belowMinimumOrientationToTurn);
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(), excess);
  };


  this.testDefaultClockwiseRotate = function() {
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),0);
    agent.rotateClockwise();
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),BE.Definitions.TURNABLE_DEFAULT_ROTATE_ANGLE);
  };

  this.testDefaultCounterClockwiseRotate = function() {
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),0);
    agent.rotateCounterclockwise();
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),-BE.Definitions.TURNABLE_DEFAULT_ROTATE_ANGLE);
  };

  this.testClockwiseRotate = function() {
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),0);
    agent.rotateClockwise(2);
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),2);
  };

  this.testCounterClockwiseRotate = function() {
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),0);
    agent.rotateCounterclockwise(2);
    BE.UnitTests.testSuite.assertSame(agent.getOrientationInRadians(),-2);
  };
*/
}

BE.UnitTests.testSuite.add("BE.UnitTests.AgentTestCase");
