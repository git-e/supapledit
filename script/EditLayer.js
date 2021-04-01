import {Tile, TileLayer} from "./Tile.js";
import selectedTileType from "./SelectedTileType.js"

class TileEnterEvent extends Event {
  constructor(tile) {
    super('tile-enter', {bubbles: true});
    this.tile = tile;
  }
}

class EditReadyEvent extends Event {
  constructor(layer) {
    super('edit-ready', {bubbles: true});
    this.layer = layer;
  }
}

export default class EditLayer extends TileLayer {

  _pen = null;

  set pen(type) {
    this._pen = type;
  }

  get pen() {
    return this._pen;
  }

  get tiles() {
    return this.children;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    let tiles = [];
    tiles.length = 1440;
    this.innerHTML = tiles.fill('<edit-tile></edit-tile>').join('');
    this.addEventListener('pointerup', (event) => {
      this.dispatchEvent(new EditReadyEvent(this))
    });
  }
}
customElements.define('edit-layer', EditLayer, { });

class EditTile extends Tile {

  constructor() {
    super();
  }

  get pos() {
    return Number.parseInt(this.getAttribute("pos"));
  }

  connectedCallback() {
    this._layer = this.parentElement;
    const pos = [].indexOf.call(this.parentElement.children, this);
    this.setAttribute('pos', pos);
    this.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      if ( event.buttons & 1 && this._layer.pen ) {
        this.type = this._layer.pen;
      }
    });
    this.addEventListener("pointerenter", (event) => {
      if ( event.buttons & 1 && this._layer.pen ) {
        this.type = this._layer.pen;
      }
      this.dispatchEvent(new TileEnterEvent(this));
    });
  }
}
customElements.define('edit-tile', EditTile, { });
