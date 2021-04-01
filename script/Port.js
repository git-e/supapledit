export default class Port extends HTMLElement {

  _pos;
  _gravity;
  _freezez;
  _freezee;

  set pos(pos) { this._pos.value = pos; }
  get pos() { return Number.parseInt(this._pos.value); }

  get gravity() { return this._gravity.checked || 0; }
  set gravity(gravity) {
    this._gravity.checked = gravity || 0;
  }

  get freezez() { return this._freezez.checked || 0; }
  set freezez(freezez) {
    this._freezez.checked = freezez || 0;
  }

  get freezee() { return this._freezee.checked || 0; }
  set freezee(freezee) {
    this._freezee.checked = freezee || 0;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    setTimeout(() => {
      this._pos = this.querySelector('input[name="pos"]');
      this._gravity = this.querySelector('input[name="gravity"]');
      this._freezez = this.querySelector('input[name="freezez"]');
      this._freezee = this.querySelector('input[name="freezee"]');
    });
  }
}
customElements.define('port-switch', Port, {});
