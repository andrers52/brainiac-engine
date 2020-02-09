# be
Brainiac Engine

## Development instructions

### CONFIG
#### Config can be set two ways
a - config file
  If you do BEServer.startApp without the third parameter, the configuration, in node (multiplayer), the system will 
  look for a file at <project_root>/config/config.json
b - config object
  If you provide the third parameter to BEServer.startApp the configuration will be read from there. This can
  be done in node (multiplayer) or the browser (singleplayer)

#### Config parameters
buildType : ["dev"|"deploy"|"test"],
playProceduralSoundInClient : [true | false],
userAlwaysAtCenterOfCamera : [true | false], 
  true: camera follows user, false, camera is independent
localApp: [true: false] 
  true (default) means server and client on the browser, false means server in node and client in the browser

