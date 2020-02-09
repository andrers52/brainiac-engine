BE.UnitTests.EventsTestCase = function() {

    this.initiate = function() {
        BE.killAllAgents();
    };

    this.testPositiveKillAgentClickHitAtPosition = function() {
        //NOT WORKING... WHY? IT WORKS IN DEBUGGING MODE...
        let agent = BE.createAgent();
        
        agent.onMouseDownHit = function() {
            agent.die();
        };

        BE.UnitTests.testSuite.assertTrue(BE.agents.includes(agent), "Created agent do not appear in Engine list");

        let agentCanvasPosition = BE.CoordinatesConversion.worldToCanvas(agent.getPosition());
        BE.TestSuite.mouseGenerateEvent('mousedown', agentCanvasPosition.x, agentCanvasPosition.y);
        
        BE.UnitTests.testSuite.assertFalse(BE.agents.includes(agent), "Agent should have been removed from agent list");
    };

    this.testNegativeKillAgentClickHitAtPosition = function() {
        let agent = BE.createAgent();
        
        agent.onMouseDownHit = function() {
            agent.die();
        };
        
        BE.UnitTests.testSuite.assertTrue(BE.agents.includes(agent));
        
        let agentOldCanvasPosition = BE.CoordinatesConversion.worldToCanvas(agent.getPosition());
        
        agent.moveUp(100);
        
        BE.TestSuite.mouseGenerateEvent('mousedown', agentOldCanvasPosition.x, agentOldCanvasPosition.y);
        
        BE.UnitTests.testSuite.assertTrue(BE.agents.includes(agent));
    };


    this.testKillAgentClickNoHitAtPosition = function() {

        let agent = BE.createAgent();
        
        agent.onMouseDown = function() {
            agent.die();
        };

        agent.onMouseDownHit = function() {
            BE.UnitTests.testSuite.assertTrue(false, "agent accused hit when should not");
        };

        
        BE.UnitTests.testSuite.assertTrue(BE.agents.includes(agent));
        
        let agentOldCanvasPosition = BE.CoordinatesConversion.worldToCanvas(agent.getPosition());
        
        agent.moveUp(100);
        
        BE.TestSuite.mouseGenerateEvent('mousedown', agentOldCanvasPosition.x, agentOldCanvasPosition.y);
        
        BE.UnitTests.testSuite.assertFalse(BE.agents.includes(agent));
    };

}

BE.UnitTests.testSuite.add("BE.UnitTests.EventsTestCase");
