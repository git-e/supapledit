import {Tile} from './Tile.js'

class PenSelectEvent extends Event {
  constructor(type) {
    super('pen-select', {bubbles: true});
    this.pen = type;
  }
}

export default class TileSelector extends HTMLElement {
  _tileSets;
  _currentPen;

  constructor() {
    super();
  }

  connectedCallback() {
    setTimeout(() => {
      this._tileSets = {};
      this.querySelectorAll("tile-set").forEach(ts => this._tileSets[ts.key] = ts);
    });
  }

  nextSet(key) {
    this.selectTile(this._tileSets[key].nextTile(this._currentTile));
  }

  prevSet(key) {
    this.selectTile(this._tileSets[key].prevTile(this._currentTile));
  }

  selectTile(tile) {
    if (this._currentTile) {
      this._currentTile.removeAttribute("active", "")
    }
    this._currentTile = tile;
    this._currentTile.setAttribute("active", "")
    this.dispatchEvent(new PenSelectEvent(tile ? tile.type : null));
  }
}
customElements.define('tile-selector', TileSelector, { });

class TileSet extends HTMLElement {

  _tiles;

  get key() {
    return this.getAttribute('key');
  }

  constructor() {
    super();
  }

  connectedCallback() {
    setTimeout(() => {
      this._tiles = this.querySelectorAll("tile-entry");
    });
  }

  nextTile(currentTile) {
    return this._tiles[([].indexOf.call(this._tiles, currentTile) + 1) % this._tiles.length];
  }

  prevTile(currentTile) {
    return this._tiles[([].indexOf.call(this._tiles, currentTile) + this._tiles.length - 1) % this._tiles.length];
  }
}
customElements.define('tile-set', TileSet, { });

class TileEntry extends Tile {

  _selector;

  constructor() {
    super();
  }

  connectedCallback() {
    for (let p = this; p; p = p.parentElement) {
      if (p instanceof TileSelector) {
        this._selector = p;
      }
    }
    this.addEventListener('click', (event) => {
      event.preventDefault();
      this._selector.selectTile(this);
    });
  }
}
customElements.define('tile-entry', TileEntry, { });
