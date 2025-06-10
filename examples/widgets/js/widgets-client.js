"use strict";

// import { BEClient } from '../node_modules/brainiac-engine/client/singleton/BEClient.js'
import { Definitions } from "./definitions.js";

function WidgetsClient() {
  this.name = "widgets";

  this.finish = function () {};

  this.getMediaAssets = () => [Definitions.WORLD_BACKGROUND_IMAGE];
}

let widgetsClient = new WidgetsClient();

export { widgetsClient };
