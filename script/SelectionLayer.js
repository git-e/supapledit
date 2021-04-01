import {Tile, TileLayer} from "./Tile.js";

export default class SelectionLayer extends TileLayer {
  get tiles() {
    return this.children;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    let tiles = [];
    tiles.length = 1440;
    this.innerHTML = tiles.fill('<layer-tile></layer-tile>').join('');
  }
}
customElements.define('selection-layer', SelectionLayer, { });
