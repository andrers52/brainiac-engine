'use strict'
let Definitions = {}

Definitions.WORLD_BACKGROUND_IMAGE = './media/images/bubbles_background.png'

Definitions.BUBBLE_IMAGE = './media/images/bubble.png'
Definitions.BLACK_SQUARE_IMAGE = './media/images/black_square.png'
Definitions.BLUE_SQUARE_IMAGE = './media/images/blue_square.png'


Definitions.FISH_ANIMATED_CONFIGURATION =
  { 'defaultState': 'standing',
    'auto_reverse': false,
    'animationStates':
    [  {'stateName': 'standing', 'timeinMilis': null, 'animationFrames': ['./media/images/blower1.png', './media/images/blower2.png'], 'audioName': null}
    ]
  }

Definitions.BUBBLE_SPAWN_TIME =
  Definitions.BUBBLE_SPAWN_FREQUENCY * 10


Definitions.SPLASH_IMAGE_0 = './media/images/splashes/splash0.png'
Definitions.SPLASH_IMAGE_1 = './media/images/splashes/splash1.png'
Definitions.SPLASH_IMAGE_2 = './media/images/splashes/splash2.png'
Definitions.SPLASH_IMAGE_3 = './media/images/splashes/splash3.png'
Definitions.SPLASH_IMAGE_4 = './media/images/splashes/splash4.png'
Definitions.SPLASH_IMAGE_5 = './media/images/splashes/splash5.png'

Definitions.SCORE_MISS_AUDIO = './media/sounds/score_miss_sound'
  + '.mp3'


Definitions.BUBBLE_AUDIO = './media/sounds/bubble_pop_sound'
    + '.mp3'
Definitions.BUBBLE_LATERAL_MOVEMENT_AMPLITUDE = 2
Definitions.BUBBLE_VERTICAL_SPEED = 1

export Definitions
