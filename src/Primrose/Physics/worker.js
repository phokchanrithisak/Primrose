import CANNON from "cannon";

import { CommandsByID, CommandsByName } from "./Commands";
import EngineServer from "./EngineServer";
import RPCBuffer from "./RPCBuffer";

const T = EngineServer.DT * 1000,
  engine = new EngineServer(),
  wasSleeping = {},
  params = [],
  returner = { messageID: null };

let lastTime = null,
  timer = null,
  rpc = new RPCBuffer(),
  useTransferables = true;

function exec(cmd, params) {
  const handler = engine[cmd.name];
  if(handler) {
    handler.apply(engine, params);
  }
}

onmessage = function handleMessage(evt) {
  let msg = evt.data;

  if(msg === "serializablesMode") {
    useTransferables = false;
  }
  else if(msg === "transferablesMode") {
    useTransferables = true;
  }
  else if(msg instanceof ArrayBuffer) {
    rpc.buffer = msg;

    while(rpc.available) {
      const cmd = CommandsByID[rpc.remove()];

      params.length = cmd.params.length;
      for(let j = 0; j < cmd.params.length; ++j) {
        params[j] = rpc.remove();
      }

      exec(cmd, params);
    }

    rpc.rewind();
  } 
  else {
    if(typeof msg === "string") {
      msg = JSON.parse(msg)
    }

    if(msg.type === "method") {
      if(msg.name === "start") {
        if(timer === null) {
          lastTime = performance.now();
          timer = setInterval(ontick, T);
        }    
      }
      else if(msg.name === "stop") {
        if(timer !== null) {
          clearInterval(timer);
          timer = null;
        }    
      }
      else if(msg.name === "getBuffer") {
        postMessage({ messageID: msg.messageID, buffer: rpc.buffer }, [rpc.buffer]);
      }
      else {
        exec(CommandsByName[msg.name], msg.params);
      }
    }
  }

  returner.messageID = msg.messageID;
  if(returner.messageID) {
    postMessage(returner);
  }
};

function transfer(id, body) {
  rpc.add(id);
  rpc.add(body.position.x);
  rpc.add(body.position.y);
  rpc.add(body.position.z);
  rpc.add(body.quaternion.x);
  rpc.add(body.quaternion.y);
  rpc.add(body.quaternion.z);
  rpc.add(body.quaternion.w);
  rpc.add(body.velocity.x);
  rpc.add(body.velocity.y);
  rpc.add(body.velocity.z);
  rpc.add(body.angularVelocity.x);
  rpc.add(body.angularVelocity.y);
  rpc.add(body.angularVelocity.z);
}

function serialize(n, id, body) {
  let i = n * 14;
  params[i++] = id;
  params[i++] = body.position.x;
  params[i++] = body.position.y;
  params[i++] = body.position.z;
  params[i++] = body.quaternion.x;
  params[i++] = body.quaternion.y;
  params[i++] = body.quaternion.z;
  params[i++] = body.quaternion.w;
  params[i++] = body.velocity.x;
  params[i++] = body.velocity.y;
  params[i++] = body.velocity.z;
  params[i++] = body.angularVelocity.x;
  params[i++] = body.angularVelocity.y;
  params[i++] = body.angularVelocity.z;
}


function ontick() {
  const t = performance.now(),
    dt = 0.001 * (t - lastTime);
  lastTime = t;
  engine.update(dt);

  if(!useTransferables || rpc.ready) {

    if(!useTransferables) {
      params.length = engine.bodyIDs.length * 14;
    }

    let n = 0;

    for(let i = 0; i < engine.bodyIDs.length; ++i) {
      const id = engine.bodyIDs[n],
        body = engine.bodyDB[id],
        sleeping = body.sleepState === CANNON.Body.SLEEPING;

      if(!sleeping || wasSleeping[id]) {
        if(useTransferables) {
          transfer(id, body);
        }
        else {
          serialize(n, id, body);
        }
        ++n;
      }

      wasSleeping[id] = sleeping;
    }

    if(useTransferables) {
      postMessage(rpc.buffer, [rpc.buffer]);
    }
    else {
      params.length = n * 14;
      postMessage(JSON.stringify(params));
    }
  }
}