import LevelFile from "./LevelFile.js";
import LevelList from "./LevelList.js";
import LevelView from "./LevelView.js";
import TileSelector from "./TileSelector.js";

function save(blob, name) {
  const a = document.createElement('a');
  a.download = name;
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
}

export default class LevelEditor extends HTMLElement {
  _levelFile;
  _levelList;
  _levelView;

  constructor() {
    super();
  }

  connectedCallback() {
    setTimeout(() => {
      this._levelList = this.querySelector('level-list');
      this._levelView = this.querySelector('level-view');
      this._tileSelector = this.querySelector('tile-selector');
    });
    this.addEventListener('load-levelset', event => {
      const file = event.file;
      file.arrayBuffer().then(array => {
        this._levelList.loadFromBytes(new Uint8Array(array));
      })
    });
    this.addEventListener('save-levelset', event => {
      this.synchronizeLevelList(this._levelList.selectedLevel);
      save(new Blob(this._levelList.saveToBytes(), {type: "application/binary"}), "LEVELS.DAT");
    });
    this.addEventListener('save-levellist', event => {
      this.synchronizeLevelList(this._levelList.selectedLevel);
      save(new Blob(Array.from(this._levelList.entries, entry => Uint8Array.from(entry.label + '\n', c=>c.charCodeAt(0))), {type: "application/binary"}), "LEVEL.LST");
    });
    this.addEventListener('level-select', event => {
      this.synchronizeLevelList(event.previousSelection);
      this._levelView.loadFromBytes(Uint8Array.from(atob(event.target.dataset.chunk), c => c.charCodeAt(0)), event.target.number);
    });
    this.addEventListener('pen-select', (event) => {
      this.querySelector('edit-layer').pen = event.pen;
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

  synchronizeLevelList(levelEntry) {
    levelEntry && levelEntry.update(this._levelView.saveToBytes());
  }
}
customElements.define('level-editor', LevelEditor, {});
