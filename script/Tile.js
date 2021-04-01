class Tile extends HTMLElement {
  static get observedAttributes() {
    return ['type'];
  }

  get type() {
    return this.getAttribute('type');
  }

  get intType() {
    const type = this.type;
    return type ? Number.parseInt(type, 16) : 0x3F;
  }

  set type(type) {
    if (typeof(type) === 'number') {
      this.type = type === 0x3F ? null : ('0' + (type & 0x3F).toString(16)).substr(-2);
    } else {
      type ? this.setAttribute('type', type) : this.removeAttribute('type');
    }
  }

  constructor() {
    super();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'type' && oldValue !== newValue) {
      this.style.backgroundImage = newValue ? ('url("tiles/' + newValue + '.png")') : ('none');
    }
  }
}

class TileLayer extends HTMLElement {
  get tiles() {
    return this.children;
  }

  fromArray(tiles) {
    this.fromRleArray(tiles);
  }

  toArray() {
    return [].map.call(this.tiles, tile => tile.intType);
  }

  toRleArray() {
    let result = [];
    let counter;
    let lastSeen;
    for (let i = 0; i <= this.tiles.length; ++i) {
      let current = i < this.tiles.length ? this.tiles[i].intType : null;
      if (lastSeen !== current || counter == 255) {
        if (counter === undefined) {
        } else if (counter < 4) {
          result.push(lastSeen | ((counter - 1) << 6))
        } else {
          result.push(lastSeen | 0xC0);
          result.push(counter);
        }
        lastSeen = current;
        counter = 1;
      } else {
        ++counter;
      }
    }
    return result;
  }

  fromRleArray(tiles) {
    let pos = 0;
    for (let i = 0; i < tiles.length; ++i) {
      let type = tiles[i] & 0x3F;
      let counter = (tiles[i] < 0xC0) ? (tiles[i] >> 6) + 1 : tiles[++i];
      while(counter--) {
        this.tiles[pos++].type = type;
      }
    }
  }

  constructor() {
    super();
  }
}