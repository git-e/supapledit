class InfoBox extends HTMLElement {

  _levelnumber;
  _levelname;
  _infotrons;
  _gravity;
  _freezez;
  _ports;
  _pos;
  _posX;
  _posY;

  constructor() {
    super();
  }

  get levelnumber() { return Number.parseInt(this._levelnumber.value); }
  set levelnumber(number) {
    this._levelnumber.value = ('00' + number).substr(-3);
  }

  get levelname() { return this._levelname.value; }
  set levelname(name) {
    this._levelname.value = name;
  }

  get infotrons() { return Number.parseInt(this._infotrons.value); }
  set infotrons(infotrons) {
    this._infotrons.value = infotrons;
  }

  get gravity() { return this._gravity.checked || 0; }
  set gravity(gravity) {
    this._gravity.checked = gravity || 0;
  }

  get freezez() { return this._freezez.checked || 0; }
  set freezez(freezez) {
    this._freezez.checked = freezez || 0;
  }

  get ports() { return Number.parseInt(this._ports.value); }
  set ports(ports) {
    this._ports.value = ports;
  }

  showTilePosition(pos) {
    this._pos.innerText = `${`   ${pos}`.substr(-4)}:${` ${pos % 60 + 1}`.substr(-2)}x${` ${pos/60 + 1|0}`.substr(-2)}`;
  }

  connectedCallback() {
    setTimeout(() => {
      this._levelnumber = this.querySelector('input[name="levelnumber"');
      this._levelname = this.querySelector('input[name="levelname"');
      this._infotrons = this.querySelector('input[name="infotrons"');
      this._gravity = this.querySelector('input[name="gravity"]');
      this._freezez = this.querySelector('input[name="freezez"]');
      this._ports = this.querySelector('input[name="ports"]');
      this._pos = this.querySelector('label[title="pos"]');
    });
  }
}
customElements.define('info-box', InfoBox, { });
