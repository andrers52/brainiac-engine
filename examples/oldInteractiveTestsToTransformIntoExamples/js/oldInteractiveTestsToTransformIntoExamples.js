"use strict";
BE.TestApp.InteractionTests = function() {

  this.start = function() {
    //BE.setBackgroundImage(BE.TestApp.InteractionTests.Definitions.WORLD_BACKGROUND_IMAGE);
    BE.setWorldRectangle(BE.camera.rectangle.size);

    // *** FADING MIXIN ***
    //let fadingAgent = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE);
    //BE.Fading.call(fadingAgent);

    // *** RASTER MIXIN ***
    //let agent = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE);
    //BE.Raster.call(agent);
    //BE.Draggable.call(agent,true,true);

    // *** PULSATE MIXIN ***
    //let agent = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE);
    //BE.Pulsate.call(agent);

    // *** SPIN MIXIN ***
    //let agent = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE);
    //BE.Spin.call(agent);


    /* *** SENSING WORLD BORDER ***
       let sensingWorldBorderAgent = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BUBBLE_IMAGE);
       sensingWorldBorderAgent.onSensingWorldBorder = function() {
       sensingWorldBorderAgent.die();
       };
       sensingWorldBorderAgent.behavior = function() {
       sensingWorldBorderAgent.move(new BE.Vector(1, 0, 0));
       };
       BE.SensingWorldBorder.call(sensingWorldBorderAgent, null);
    */

    /* *** SENSING AGENT ***
       let obstacleAgent = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BUBBLE_IMAGE);
       obstacleAgent.move(new BE.Vector(500, 0, 0));

       let sensingOtherAgent = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BUBBLE_IMAGE);
       sensingOtherAgent.onSensingAgent = function(otherAgent) {
       otherAgent.die();
       sensingOtherAgent.die();
       };
       sensingOtherAgent.behavior = function() {
       sensingOtherAgent.move(new BE.Vector(1, 0, 0));
       };
       BE.SensingAgent.call(sensingOtherAgent, null);
    */

    /* *** WIDGET INTERACTION TESTS *** */
    //button without action
    //let button = BE.createButton(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE);

    //button with action
    //let button = BE.createButton(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE, null, function() {console.log(this.text);});
    //button.text = "button action test";

    //toggle button with action
    // let toggleButton =
    //   new BE.ToggleButton(
    //     BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE,
    //     BE.TestApp.InteractionTests.Definitions.BLUE_SQUARE_IMAGE,
    //     null,
    //     function() {console.log(this.selectedText);},
    //     function() {console.log(this.deselectedText);}
    //     );
    // toggleButton.selectedText = "toggleButton selected!";
    // toggleButton.deselectedText = "toggleButton DEselected!";


    //container test
    let superContainer = new BE.Container(null, "horizontal", 0, new BE.Rectangle(null, new BE.Vector(100,100)));
    let container1 = new BE.Container(null, "vertical", 0, null);
    let container2 = new BE.Container(null, "vertical", 0, null);
    superContainer.addAgent(container1);
    superContainer.addAgent(container2);

    let ag1 = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE);
    let ag2 = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLUE_SQUARE_IMAGE);
    container1.addAgent(ag1);
    container1.addAgent(ag2);

    let ag3 = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLUE_SQUARE_IMAGE);
    let ag4 = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE);
    container2.addAgent(ag3);
    container2.addAgent(ag4);


    //label
    //BE.createLabel("test");

    //score (NOT WORKING YET!)
    //BE.createScore(100);

    //basic widget
    //let widget = BE.createWidget(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE, null);

    //selectable widget
    //let widget = BE.createWidget(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE, null);
    //BE.Selectable.call(widget);

    //draggable widget
    //let widget = BE.createWidget(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE, null);
    //BE.Draggable.call(widget,true,true);

    //draggable/selectable widget
    //let widget = BE.createWidget(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE, null);
    //BE.Selectable.call(widget);
    //BE.Draggable.call(widget,true,true);

    //draggable label (fix label positioning)
    //let widget = BE.createWidget(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE, null);
    //let label = new BE.Label("test");
    //BE.Draggable.call(label,true,true);


    // *** ACTION SCHEDULING *** TO BE CONTINUED ***
    /*
      let agent = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE);
      agent.seek_100_100 = function() {
      this.move(new BE.Vector(1,1));
      };
      agent.isAtPosition = function() {
      this.getPosition().equal(new BE.Vector(100,100));
      }
      BE.ActionScheduler.call(agent);
      agent.schedule(agent, agent.seek_100_100, agent.isAtPosition);
    */
  };

  this.finish = function() {
  };

};
