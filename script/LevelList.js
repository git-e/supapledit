function parseChunk(chunk, number) {
  return {
    number: number,
    label: `${`00${number}`.substr(-3)} ${String.fromCharCode(...chunk.slice(1446, 1446 + 23))}`,
    chunk: btoa(String.fromCharCode(...chunk)),
  };
}

export default class LevelList extends HTMLElement {

  get entries() {
    return this.children;
  }

  get selectedLevel() {
    return this.querySelector('level-entry[selected]');
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('level-select', event => {
      const selected = this.selectedLevel;
      if ( selected === event.target ) {
        event.stopPropagation();
        return;
      }
      if (selected) {
        selected.removeAttribute('selected');
      }
      event.previousSelection = selected;
      event.target.setAttribute('selected', '');
    });
    this.addEventListener('click', event => {
      this.toggleAttribute('folded');
    });
  }

  select(index) {
    this.entries[index].click();
  }

  loadFromBytes(bytes) {
    this.innerHTML=Array.from({length: bytes.length / 1536 | 0})
      .map((_, i) => bytes.slice(i * 1536, (i+1) * 1536))
      .map((chunk, i) => parseChunk(chunk, i + 1))
      .map((level) => `<level-entry data-chunk="${level.chunk}">${level.label}</level-entry>`)
      .join('\n');
  }

  saveToBytes(bytes) {
    return Array.from(this.entries).map(entry => entry.chunk);
  }
}
customElements.define('level-list', LevelList, { });

export class LevelEntry extends HTMLElement {

  get number() {
    return Array.from(this.parentElement.children).indexOf(this) + 1;
  }

  get label() {
    return this.innerText;
  }

  get chunk() {
    return Uint8Array.from(atob(this.dataset.chunk), c => c.charCodeAt(0));
  }

  constructor() {
    super();
  }

  update(chunk) {
    const data = parseChunk(chunk, this.number);
    this.dataset.chunk = data.chunk;
    this.dataset.number = data.number;
    this.innerText = data.label;
  }

  connectedCallback() {
    this.addEventListener('click', event => {
      this.dispatchEvent(new Event('level-select', {bubbles: true}));
      event.stopPropagation();
    });
  }
}
customElements.define('level-entry', LevelEntry, {});
