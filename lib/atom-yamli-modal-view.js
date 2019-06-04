'use babel';

export default class YamliModalView {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('atom-yamli-modal-view__box');
    this.loaded = false;
    this.selectionText = null;

    const webview = this.webview = document.createElement('webview');
    webview.setAttribute('nodeintegration', true);

    webview.addEventListener('dom-ready', () => {

      webview.executeJavaScript(`
        'use strict';
        const ipcRenderer = require('electron').ipcRenderer;
        const source = document.getElementById('tinymce');
        source.addEventListener('blur', () => {
          ipcRenderer.send('blur');
        });
        ipcRenderer.on('focus', () => {
          source.focus();
        });
      `);

      if (!this.loaded) {
        this.loaded = true;
        this.insertText();
      }

    });


    webview.src = `https://www.yamli.com/arabic-keyboard/`;
    webview.className = [
      'atom-yamli-modal-view__view',
      'native-key-bindings'
    ].join(' ');
    this.element.appendChild(webview);
  }

  focus() {
    this.webview.focus();
    this.webview.send('focus');
  }

  channelCallback(callback) {
    this.webview.addEventListener('blur', callback);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  setText(text) {
    this.selectionText = text;
    return this;
  }

  insertText() {
    if (this.selectionText && this.loaded) {
      // console.log(this.selectionText);
      //yamli editor has an iframe requires a bit of traversing to get to
      this.webview.executeJavaScript(`

        var iframe = document.getElementById('editor_ifr');
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;

        innerDoc.getElementById('tinymce').children[0].innerHTML='${this.selectionText}';
      `);
    }
  }
}
