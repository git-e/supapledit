import {Tile} from "./Tile.js";
import InfoBox from "./InfoBox.js";
import LevelTiles from "./LevelTiles.js";
import EditLayer from "./EditLayer.js";
import SelectionLayer from "./SelectionLayer.js";
import Port from "./Port.js";

export default class LevelView extends HTMLElement {
  _levelTiles;
  _editTiles;
  _infoBox;
  _ports;
  _positionUpdateTimeout = null;
  _currentTile = null;

  constructor() {
    super();
  }

  connectedCallback() {
    setTimeout(() => {
      this._levelTiles = this.querySelector('level-tiles');
      this._editTiles = this.querySelector('edit-tiles');
      this._infoBox = this.querySelector('info-box');
      this._ports = Array.from(this.querySelector('port-list').children);
    });
    this.addEventListener('tile-enter', (event) => {
      clearTimeout(this._positionUpdateTimeout);
      this._positionUpdateTimeout = setTimeout(()=>this._infoBox.showTilePosition(event.tile.pos));
      this._currentTile = event.tile;
    });
    document.body.addEventListener('keydown', (event) => {
      if (event.target === document.body) {
        if (event.code === "KeyV" && this._currentTile) {
          event.preventDefault();
          this.querySelector('[title="misc"] input[name="viewport.x"]').value = Math.min(40, Math.max(0, (this._currentTile.pos % 60) - 9));
          this.querySelector('[title="misc"] input[name="viewport.y"]').value = Math.min(12, Math.max(0, ((this._currentTile.pos / 60) | 0) - 6));
        }
        if (event.code === "KeyP") {
          event.preventDefault();
          if (event.shiftKey) {
            if ( this._infoBox.ports > 0 ) {
              --this._infoBox.ports;
            }
          } else if (this._currentTile) {
            if ( this._infoBox.ports < 10 ) {
              ++this._infoBox.ports;
              this._ports[this._infoBox.ports - 1].pos = this._currentTile.pos;
            }
          }
        }
      }
    });
  }

  loadFromBytes(bytes, number) {
    this._levelTiles.fromArray(bytes.slice(0,1440))
    this.querySelector('[title="misc"] input[name="viewport.x"]').value = bytes[1441];
    this.querySelector('[title="misc"] input[name="viewport.y"]').value = bytes[1443];
    this._infoBox.gravity = bytes[1444] == 1;
    this.querySelector('[title="misc"] input[name="version"]').value = bytes[1445] - 32;
    this._infoBox.levelnumber = number;
    this._infoBox.levelname = [].map.call(bytes.slice(1446, 1446 + 23), b => String.fromCharCode(b)).join("");
    this._infoBox.freezez = bytes[1469] == 2;
    this._infoBox.infotrons = bytes[1470];
    this._infoBox.ports = bytes[1471];

    Array.from({ length: 10 }, (v, i) => bytes.slice(1472 + i * 6, 1472 + (i+1) * 6))
      .forEach((bytes, i) => {
        const port = this._ports[i];
        port.pos = (bytes[0] << 7) + (bytes[1] >> 1);
        port.gravity = bytes[2] === 1;
        port.freezez = bytes[3] === 2;
        port.freezee = bytes[4] === 1;
      });
  }

  saveToBytes() {
    let bytes = new Uint8Array(1536);

    this._levelTiles.toArray().forEach((tile, i) => {
      bytes[i] = tile;
    });
    bytes[1441] = this.querySelector('[title="misc"] input[name="viewport.x"]').value;
    bytes[1443] = this.querySelector('[title="misc"] input[name="viewport.y"]').value;
    bytes[1444] = this._infoBox.gravity ? 1 : 0;
    bytes[1445] = this.querySelector('[title="misc"] input[name="version"]').value + 32;
    for (let i = 0; i < 23; ++i) {
      bytes[1446 + i] = (this._infoBox.levelname[i] || "-").charCodeAt(0);
    }
    bytes[1469]=this._infoBox.freezez ? 2 : 0;
    bytes[1470]=this._infoBox.infotrons;
    bytes[1471]=this._infoBox.ports;
    this._ports.forEach((port, i) => {
      bytes[1472 + i*6 + 0] = (port.pos >> 7) & 0xff;
      bytes[1472 + i*6 + 1] = (port.pos << 1) & 0xff;
      bytes[1472 + i*6 + 2] = port.gravity ? 1 : 0;
      bytes[1472 + i*6 + 3] = port.freezez ? 2 : 0;
      bytes[1472 + i*6 + 4] = port.freezee ? 1 : 0;
    });

    return bytes;
  }
}
customElements.define('level-view', LevelView, {});

class TileLayers extends HTMLElement {

  _editor;

  constructor() {
    super();
  }

  get activeLayer() {
    return document.querySelector("level-tiles");
  }

  get editLayer() {
    return document.querySelector("edit-layer");
  }

  connectedCallback() {
    setTimeout(() => {
      window.history.replaceState(this.activeLayer.toRleArray(), null);
    })

    window.addEventListener('popstate', e => {
      this.activeLayer.fromRleArray(e.state);
    });

    this.addEventListener('pointerdown', (event) => {
      document.activeElement.blur();
    });
    this.addEventListener('edit-ready', (event) => {
      event.layer.mergeInto(this.activeLayer);
      window.history.pushState(this.activeLayer.toRleArray(), null);
    });
  }
}
customElements.define('tile-layers', TileLayers, { });

class SelectedTile extends Tile {
  constructor() {
    super();
  }
}
customElements.define('selected-tile', SelectedTile, {});
