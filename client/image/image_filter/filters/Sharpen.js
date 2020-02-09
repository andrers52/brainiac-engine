
import ImageFilter from '../ImageFilter.js'

'use strict'
export default function Sharpen(imageData) {

  return ImageFilter.convolute(
    imageData,
    [  0, -1,  0,
      -1,  5, -1,
      0, -1,  0 ]
  )
}
