'use strict'

import EFunction from '../../../arslib/enhancements/e-function.js'
import createWidget from './Widget.js'
import ChangeOnMouseDown from './mixin/ChangeOnMouseDown.js'


export default function createButton (imageName, inputRectangle, onMouseDownHit) {
  let button = createWidget( imageName,
    inputRectangle)
  
  button.onMouseDownHit =
    button.onMouseDownHit?
      EFunction.sequence(button.onMouseDownHit, onMouseDownHit, button) :
      onMouseDownHit
  ChangeOnMouseDown.call(button, 'shrink')
  return button
}

