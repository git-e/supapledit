class LevelEditor extends HTMLElement {
  _currentTile = null;
  _layers;
  _infoBox;
  _ports;
  _tileSelector;
  _selectedTile;

  get currentTile() {
    return this._currentTile;
  }
  set currentTile(tile) {
    if ( this._currentTile !== tile ) {
      this._currentTile = tile;
      this._infoBox.showTilePosition(tile.pos);
    }
  }

  get currentTileType() {
    return this._selectedTile.type;
  }
  set currentTileType(type) {
    this._selectedTile.type = type;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    setTimeout(() => {
      this._layers = this.querySelector("level-layers");
      this._infoBox = this.querySelector('info-box');
      this._ports = this.querySelector("level-ports").children;
      this._tileSelector = this.querySelector('tile-selector');
      this._selectedTile = this.querySelector("selected-tile");
    });
    document.body.addEventListener('keydown', (event) => {
      if (event.target === document.body) {
        if (event.code.startsWith("Digit")) {
          if (event.shiftKey) {
            this._tileSelector.prevSet(event.code.substr(-1));
          } else {
            this._tileSelector.nextSet(event.code.substr(-1));
          }
        }
        if (event.code === "KeyV") {
          this.querySelector('[title="misc"] input[name="viewport.x"]').value = Math.min(40, Math.max(0, (this._currentTile.pos % 60) - 9));
          this.querySelector('[title="misc"] input[name="viewport.y"]').value = Math.min(12, Math.max(0, ((this._currentTile.pos / 60) | 0) - 6));
        }
        if (event.code === "KeyP") {
          if (event.shiftKey) {
            if ( this._infoBox.ports > 0 ) {
              --this._infoBox.ports;
            }
          } else {
            if ( this._infoBox.ports < 10 ) {
              ++this._infoBox.ports;
              this._ports[this._infoBox.ports - 1].pos = this._currentTile.pos;
            }
          }
        }
      }
    });
  }

  load() {
    let input = document.createElement("input");
    input.type="file";
    input.onchange=() => {
      let file = input.files[0];
      file.arrayBuffer().then(array => {
        this.loadFromBytes(new Uint8Array(array), file.name.substr(6));
      })
    }
    input.click();
  }

  save() {
    const blob = new Blob([this.saveToBytes()], {type: "application/binary"})
    const a = document.createElement('a');
    a.download = "LEVEL-" + ("000" + this._infoBox.levelnumber).substr(-3);
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  }

  loadFromBytes(bytes, number) {
    this._layers.activeLayer.fromArray(bytes.slice(0,1440))
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

    this._layers.activeLayer.toArray().forEach((tile, i) => {
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
    [].forEach.call(this._ports, (port, i) => {
      bytes[1472 + i*6 + 0] = (port.pos >> 7) & 0xff;
      bytes[1472 + i*6 + 1] = (port.pos << 1) & 0xff;
      bytes[1472 + i*6 + 2] = port.gravity ? 1 : 0;
      bytes[1472 + i*6 + 3] = port.freezez ? 2 : 0;
      bytes[1472 + i*6 + 4] = port.freezee ? 1 : 0;
    });

    return bytes;
  }
}
customElements.define('level-editor', LevelEditor, { });

class LevelLayers extends HTMLElement {

  _editor;

  constructor() {
    super();
  }

  get activeLayer() {
    return document.querySelector("level-layer");
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
    this.addEventListener('pointerup', (event) => {
      let activeTiles = this.activeLayer.tiles;
      [].forEach.call(this.editLayer.tiles, (tile, i) => {
        if ( tile.type ) {
          activeTiles[i].type = tile.type;
        }
        tile.type = null;
      })
      window.history.pushState(this.activeLayer.toRleArray(), null);
    });
  }
}
customElements.define('level-layers', LevelLayers, { });

class LevelLayer extends TileLayer {
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

class SelectionLayer extends TileLayer {
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

class EditLayer extends TileLayer {

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
  }
}
customElements.define('edit-layer', EditLayer, { });

class LayerTile extends Tile {

  _editor;

  constructor() {
    super();
  }
}
customElements.define('layer-tile', LayerTile, { });

class EditTile extends Tile {

  _editor;
  _levelLayer;
  _selectionLayer;

  constructor() {
    super();
  }

  get pos() {
    return Number.parseInt(this.getAttribute("pos"));
  }

  connectedCallback() {
    const pos = [].indexOf.call(this.parentElement.children, this);
    this.setAttribute('pos', pos);
    for (let p = this; p; p = p.parentElement) {
      if (p instanceof LevelEditor) {
        this._editor = p;
      }
    }
    this._levelLayer = this._editor.querySelector('level-layer');
    this._selectionLayer = this._editor.querySelector('selection-layer');
    this.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      if ( event.ctrlKey ) {
        if (event.buttons & 1) {
          if (event.altKey) {
            this._selectionLayer.tiles[this.pos].type = null;
          } else {
            this._selectionLayer.tiles[this.pos].type = this._levelLayer.tiles[this.pos].type;
          }
        }
      } else {
        if ( event.buttons & 1 && this._editor.currentTileType ) {
          this.type = this._editor.currentTileType;
        }
        this._editor.currentTile = this;
      }
    });
    this.addEventListener("pointerenter", (event) => {
      if ( event.ctrlKey ) {
        if (event.buttons & 1) {
          if (event.altKey) {
            this._selectionLayer.tiles[this.pos].type = null;
          } else {
            this._selectionLayer.tiles[this.pos].type = this._levelLayer.tiles[this.pos].type;
          }
        }
      } else {
        if ( event.buttons & 1 && this._editor.currentTileType ) {
          this.type = this._editor.currentTileType;
        }
      }
      this._editor.currentTile = this;
    });
  }
}
customElements.define('edit-tile', EditTile, { });

class SelectedTile extends Tile {
  constructor() {
    super();
  }
}
customElements.define('selected-tile', SelectedTile, {});
