'use strict'

//receives size and array of effects to use in order to create new image, 
//store and return new name.
export default function DottedRectangle (context) {
  let lineWidth = 2
  let numDotsPerWidth = 20
  let numDotsPerHeight = 20

  context.beginPath()
  context.lineWidth = lineWidth
  context.rect(0,0,context.canvas.width,context.canvas.height)
  context.fillStyle = 'black'
  context.strokeStyle= 'grey'
 

  //draw dots
  context.lineWidth = 1
  for (var x = 0; x < context.canvas.width; x = x + (context.canvas.width/numDotsPerWidth)) {
    for (var y = 0; y < context.canvas.height; y = y + (context.canvas.height/numDotsPerHeight)) {
      context.rect(x,y,1,1)
    }
  }
  context.stroke()
}

