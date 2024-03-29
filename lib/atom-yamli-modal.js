'use babel';

import {CompositeDisposable} from 'atom';
import debounce from 'lodash.debounce';
import YamliModalView from './atom-yamli-modal-view';

export default {
  view: null,
  modalPanel: null,
  subscriptions: null,

  contextMenu: {
    'atom-text-editor': [
      {
        label: 'Open yamli modal with selection',
        command: 'Yamli Modal: Open with selection',
        visible: false
      }
    ]
  },

  config: {
    lang: {
      title: 'Language',
      description: 'Convert text to ARABIC',
      type: 'string',
      default: 'en'
    }
  },

  activate() {
    this.view = new YamliModalView();
    this.view.channelCallback(() => {
      this.modalPanel.hide();
    });
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.view.getElement(),
      visible: false
    });

    this.subscriptions = new CompositeDisposable();
    this.subscriptionsForTextEditor = null;

    const handleChangeSelectionRnage = debounce(({selection}) => {
      this.selectionText = selection.getText();

      if (this.selectionText) {
        this.enableContextMenu();
      } else {
        this.disableContextMenu();
      }
    }, 100);
    this.subscriptions.add(atom.workspace.observeActivePaneItem(item => {
      if (({}).toString.call(item) === '[object Undefined]') {
        return;
      }

      if (this.subscriptionsForTextEditor !== null) {
        this.subscriptionsForTextEditor.dispose();
      }

      this.subscriptionsForTextEditor = new CompositeDisposable();
      if ('onDidChangeSelectionRange' in item) {
        this.subscriptionsForTextEditor.add(
          item.onDidChangeSelectionRange(handleChangeSelectionRnage)
        );
      }
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'Yamli Modal: Toggle': () => this.toggle(),
      'Yamli Modal: Open with selection': () => this.toggle()
    }));

    this.subscriptions.add(atom.contextMenu.add(this.contextMenu));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.view.destroy();
  },

  serialize() {
    return {
      state: this.view.serialize()
    };
  },

  toggle() {
    if (this.modalPanel.isVisible()) {
      this.modalPanel.hide();
    } else {
      this.modalPanel.show();
      this.view.focus();
      if (this.selectionText) {
        this.view.setText(this.selectionText).insertText();
      }
    }
  },

  enableContextMenu() {
    this.contextMenu['atom-text-editor'][0].visible = true;
  },

  disableContextMenu() {
    this.contextMenu['atom-text-editor'][0].visible = false;
  }
};
