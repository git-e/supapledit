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
  _tileSelector;

  constructor() {
    super();
  }

  connectedCallback() {
    setTimeout(() => {
      this._levelFile = this.querySelector('level-file');
      this._levelList = this.querySelector('level-list');
      this._levelView = this.querySelector('level-view');
      this._tileSelector = this.querySelector('tile-selector');
    });
    this.addEventListener('load-levelset', event => {
      const file = event.file;
      file.arrayBuffer().then(array => {
        this._levelList.loadFromBytes(new Uint8Array(array));
        this._levelList.select(0);
      })
    });
    this.addEventListener('save-levelset', event => {
      this.synchronizeLevelList(this._levelList.selectedLevel);
      save(new Blob(this._levelList.saveToBytes(), {type: "application/binary"}), this._levelFile.filename);
    });
    this.addEventListener('save-levellist', event => {
      this.synchronizeLevelList(this._levelList.selectedLevel);
      const parts = this._levelFile.filename.split('.', 2);
      const name = parts[0].replace(/[sS]$/, '')
      const ext = (parts[1] ? parts[1] : 'LST').replace(/[dD][aA][tT]/, 'LST').replace(/^[dD]/, 'L');
      save(new Blob(Array.from(this._levelList.entries, entry => Uint8Array.from(entry.label + '\n', c=>c.charCodeAt(0))), {type: 'application/binary'}), `${name}.${ext}`);
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
          event.preventDefault();
          if (event.shiftKey) {
            this._tileSelector.prevSet(event.code.substr(-1));
          } else {
            this._tileSelector.nextSet(event.code.substr(-1));
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
