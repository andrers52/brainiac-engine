"use strict";

import { camera } from "../node_modules/brainiac-engine/server/agent/Camera.js";
import { BEServer } from "../node_modules/brainiac-engine/server/singleton/BEServer.js";
import { createButton } from "../node_modules/brainiac-engine/server/ui/Button.js";

function WidgetsServer() {
  this.onUserConnected = function (user, cameraSize) {
    //button with action
    let button = createButton("blueParticle.jpg", null, () =>
      console.log("button pressed!"),
    );
  };

  this.start = function () {
    //BE.setBackgroundImage(BE.TestApp.InteractionTests.Definitions.WORLD_BACKGROUND_IMAGE);
    // environment.setWorldRectangle(camera.rectangle.size)
    camera.rectangle = BEServer.getEnvironment().getWorldRectangle().clone();
    //BEServer.setBackgroundImageName(Definitions.WORLD_BACKGROUND_IMAGE)

    /* *** WIDGET INTERACTION TESTS *** */
    //button without action
    //let button = BE.createButton('blueParticle.jpg')
    //alert('you should be seeing a button')
    //button.die()

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
    // let superContainer = new BE.Container(null, 'horizontal', 0, new BE.Rectangle(null, new BE.Vector(100,100)))
    // let container1 = new BE.Container(null, 'vertical', 0, null)
    // let container2 = new BE.Container(null, 'vertical', 0, null)
    // superContainer.addAgent(container1)
    // superContainer.addAgent(container2)

    // let ag1 = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE)
    // let ag2 = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLUE_SQUARE_IMAGE)
    // container1.addAgent(ag1)
    // container1.addAgent(ag2)

    // let ag3 = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLUE_SQUARE_IMAGE)
    // let ag4 = BE.createAgent(BE.TestApp.InteractionTests.Definitions.BLACK_SQUARE_IMAGE)
    // container2.addAgent(ag3)
    // container2.addAgent(ag4)

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
  };

  this.finish = function () {};
}

let widgetsServer = new WidgetsServer();

export { widgetsServer };
