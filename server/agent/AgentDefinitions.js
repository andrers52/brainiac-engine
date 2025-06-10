"use strict";

var AgentDefinitions = {};

// TODO: THIS SHOULD BE EQUAL TO THE MEDIUM NETWORK DELAY.
AgentDefinitions.AGENTS_EXECUTION_INTERVAL = 80; //65
AgentDefinitions.AGENTS_CLIENT_REFRESH_INTERVAL = 80; //70; //1000/20 (fps)

//No more changes to definitions outside here
Object.freeze(AgentDefinitions);

export { AgentDefinitions };
