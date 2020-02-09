'use strict'

// import BEClient from '../be/client/singleton/BEClient.js'
import Definitions from './definitions.js'

function WidgetsClient() {

  this.name = 'widgets'

  this.finish = function() {
  }

  this.getMediaAssets = () => [
    Definitions.WORLD_BACKGROUND_IMAGE
  ]
}

let widgetsClient = new WidgetsClient()

export default widgetsClient
