BE.UnitTests.ContainerTestCase = function() {

  this.testCreate = function() {
    let containerAgent = BE.createAgent();
    let containedAgent = BE.createAgent();
    BE.Container.call(containerAgent, [containedAgent]);
    BE.UnitTests.testSuite.assertTrue(containerAgent !== null);
  };

  this.testDisableMove = function() {
    let containedAgent = BE.createAgent();
    BE.UnitTests.testSuite.assertSame(
      (new BE.Vector()).toString(),
      containedAgent.getPosition().toString());

    //can move before being added to container
    containedAgent.moveUp(100);
    BE.UnitTests.testSuite.assertSame(
      (new BE.Vector(0,100)).toString(),
      containedAgent.getPosition().toString());

    let containerAgent = BE.createAgent();
    BE.Container.call(containerAgent, [containedAgent]);


    //agent has been moved to container position (0,0)
    BE.UnitTests.testSuite.assertSame(
      (new BE.Vector(0,0)).toString(),
      containedAgent.getPosition().toString());


    //try to move contained agent after being added to container
    //it shouldn't move
    containedAgent.moveDown(100);
    BE.UnitTests.testSuite.assertSame(
      (new BE.Vector(0,0)).toString(),
      containedAgent.getPosition().toString());
  };

  this.testCompoundMove = function() {
    let containedAgent = BE.createAgent();
    let containerAgent = BE.createAgent();
    BE.Container.call(containerAgent, [containedAgent]);
    containerAgent.moveUp(100);

    BE.UnitTests.testSuite.assertSame(
      (new BE.Vector(0,100)).toString(),
      containerAgent.getPosition().toString());

    BE.UnitTests.testSuite.assertSame(
      (new BE.Vector(0,100)).toString(),
      containedAgent.getPosition().toString(), "Contained agent did not move.");
  };

  this.testAgentsPlacement = function() {
    let containedAgentsSize = new BE.Vector(10,10);
    let containedAgent = BE.createAgent();
    containedAgent.setSize(containedAgentsSize);
    let containerAgent = BE.createAgent();
    BE.Container.call(containerAgent, [containedAgent]);

    BE.UnitTests.testSuite.assertSame(
      containedAgent.rectangle.toString(),
      containerAgent.rectangle.toString());

    let anotherContainedAgent = BE.createAgent();
    anotherContainedAgent.setSize(containedAgentsSize);
    containerAgent.addAgent(anotherContainedAgent);

    let expectedContainerRectangle =
      new BE.Rectangle(
        new BE.Vector((containedAgentsSize.x/2 + containerAgent.padding/2), 0),
        new BE.Vector((containedAgentsSize.x * 2 + containerAgent.padding), containedAgentsSize.y));


    BE.UnitTests.testSuite.assertSame(
      expectedContainerRectangle.toString(),
      containerAgent.rectangle.toString());
  };

  this.testAgentsPlacement = function() {
    let superContainer = new BE.Container(null, "horizontal", 0, new BE.Rectangle(null, new BE.Vector(200,200)));
    let container1 = new BE.Container(null, "vertical", 0, null);
    let container2 = new BE.Container(null, "vertical", 0, null);
    superContainer.addAgent(container1);
    superContainer.addAgent(container2);

    let ag1 = BE.createAgent(InteractionTests.Definitions.BLACK_SQUARE_IMAGE);
    let ag2 = BE.createAgent(InteractionTests.Definitions.BLUE_SQUARE_IMAGE);
    container1.addAgent(ag1);
    container1.addAgent(ag2);

    let ag3 = BE.createAgent(InteractionTests.Definitions.BLUE_SQUARE_IMAGE);
    let ag4 = BE.createAgent(InteractionTests.Definitions.BLACK_SQUARE_IMAGE);
    container2.addAgent(ag3);
    container2.addAgent(ag4);

    let expectedAg1Position = new BE.Vector(-50,50);
    let expectedAg2Position = new BE.Vector(-50,-50);

    let expectedAg3Position = new BE.Vector(50,50);
    let expectedAg4Position = new BE.Vector(50,-50);

    BE.UnitTests.testSuite.assertSame(
      ag1.getPosition().toString(),
      expectedAg1Position.toString());

    BE.UnitTests.testSuite.assertSame(
      ag2.getPosition().toString(),
      expectedAg2Position.toString());

    BE.UnitTests.testSuite.assertSame(
      ag3.getPosition().toString(),
      expectedAg3Position.toString());

    BE.UnitTests.testSuite.assertSame(
      ag4.getPosition().toString(),
      expectedAg4Position.toString());

  };

}

BE.UnitTests.testSuite.add("BE.UnitTests.ContainerTestCase");
