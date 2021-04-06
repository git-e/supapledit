class LoadLevelset extends Event {
  constructor(file) {
    super('load-levelset', {bubbles: true});
    this.file = file;
  }
}

export default class LevelFile extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('click', event => {
      if (event.target.name == 'save-dat') {
        this.dispatchEvent(new Event('save-levelset', {bubbles: true}))
      }
      if (event.target.name == 'save-lst') {
        this.dispatchEvent(new Event('save-levellist', {bubbles: true}))
      }
    });
    this.addEventListener('change', event => {
      const file = event.target.files[0];
      this.querySelector('span').innerText = file.name;
      event.stopPropagation();
      this.dispatchEvent(new LoadLevelset(file));
    });
  }
}
customElements.define('level-file', LevelFile, {});
