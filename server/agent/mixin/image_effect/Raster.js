'use strict'

import EFunction from '../../../../../../arslib/enhancements/e-function.js'
import  {createAgentWithRectangle} from '../../../agent/Agent.js'
import Fade from './Fade.js'



//agent lives a trail of fading images
export default function Raster () {

  function moveWithRaster() {
    let fadingAgent = createAgentWithRectangle(this.imageName, this.rectangle.clone(), false)
    Fade.call(fadingAgent)
    fadingAgent.startFading()
  }

  this.move =
    EFunction.sequence(this.move, moveWithRaster, this)
}

