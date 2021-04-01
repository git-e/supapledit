import {Tile, TileLayer} from "./Tile.js";

export default class LevelLayer extends TileLayer {
  get tiles() {
    return this.children;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = [
      "☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒                                                          ☒",
      "☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒☒",
    ].map(line => [].map.call(line, c => {
      switch (c) {
      case '☒': return '<layer-tile type="06"></layer-tile>';
      default: return '<layer-tile type="00"></layer-tile>';
      }
    })).flat().join('')
  }
}
customElements.define('level-layer', LevelLayer, { });
