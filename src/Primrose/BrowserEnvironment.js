import { any } from "../util";

import Environment from "./Environment";
import { Audio3D, Music } from "./Audio";
import { Ground, Sky } from "./Controls";
import { Shadows, Fog } from "./Graphics";
import { Engine } from "./Physics";
import { Teleporter } from "./Tools";

const DECK_GRID = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNC0xMC0yM1QxNjo1Nzo0MS0wNDowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTQtMTAtMjNUMTY6NTg6MTItMDQ6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTQtMTAtMjNUMTY6NTg6MTItMDQ6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjREMDEyNTUwNUFGNzExRTRCRjM4OTkyNEFCRUQ4QzI1IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjREMDEyNTUxNUFGNzExRTRCRjM4OTkyNEFCRUQ4QzI1Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NEQwMTI1NEU1QUY3MTFFNEJGMzg5OTI0QUJFRDhDMjUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NEQwMTI1NEY1QUY3MTFFNEJGMzg5OTI0QUJFRDhDMjUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz63TnTdAAAAXElEQVR42uzaQQ0AIBADwYPgPyjECoeNhlkFnX/HPbuiiwa88bPCAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AbAq/MDeAgwAYfQKNEfe4bMAAAAASUVORK5CYII=";

export default class BrowserEnvironment extends Environment {
  constructor(options) {

    options = options || {};

    options.plugins = options.plugins || [];

    const add = (Class, opts) => {
      if(!any(options.plugins, p => p instanceof Class)) {
        options.plugins.push(new Class(opts));
      }
    };

    add(Audio3D, { ambientSound: options.ambientSound });

    add(Music, { numNotes: options.numNotes });

    add(Sky, {
      texture: options.skyTexture
    });

    if(!(options.groundTexture || options.groundModel)) {
      options.groundTexture = DECK_GRID;
    }

    add(Ground, {
      texture: options.groundTexture,
      model: options.groundModel
    });

    add(Teleporter);

    add(Engine, {
      gravity: options.gravity
    });

    if(options.enableShadows) {
      add(Shadows, {
        mapSize: options.shadowMapSize,
        radius: options.shadowRadius,
        cameraSize: options.shadowCameraSize
      });
    }

    if(options.useFog) {
      add(Fog);
    }

    super(options);
  }
}
