'use strict';

const _ = require('lodash');
const $ = require('jquery');
const getCaretCoordinates = require('textarea-caret');

function getDropdown() {
  return (elem => elem.length ? elem : $('<div/>', { id: '__emoji_autocomplete' }).prependTo(document.body))($('div#__emoji_autocomplete'));
}

function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  } else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}

function setCaretToPos(input, pos) {
  setSelectionRange(input, pos, pos);
}

function EmojiAutocomplete(config, elem) {
  this.beforeCaret = new RegExp((config.initSequence.length ? '' : '\\b') + config.initSequence + '([a-zA-Z0-9_+-]*)$');
  this.afterCaret = new RegExp('^' + config.initSequence + '([a-zA-Z0-9_+-]*)\\b');
  this.config = config;
  this.elem = elem;

  const keydownHandler = function onKeydown(e) {
    const key = e.keyCode || e.which;
    // 13: enter, 9: tab
    if (key === 13 || key === 9) {
      const start = this.__match.index;
      const end = this.__match.index + this.__match.length;
      (space => {
        this.elem.val(this.elem.val().substr(0, start) + this.__emoji[0].char + space + this.elem.val().substr(end));
        setCaretToPos(this.elem.get(0), this.__match.index + this.__emoji[0].char.length + space.length);
      })(this.elem.val().length === end ? this.config.spaceAfter : '');
      this.activateMenu(false);
      e.preventDefault();
    }
  }.bind(this);

  this.wordAt = function (string, pos) {
    const before = string.substr(0, pos);
    const after = string.substr(pos);
    const beforeMatch = before.match(this.beforeCaret);
    if (beforeMatch) {
      const more = after.match(/^([a-zA-Z0-9_+-]+)\b/i);
      const word = beforeMatch[1] + (more ? more[1] : '');
      return { word: word, index: beforeMatch.index, length: word.length + this.config.initSequence.length };
    }

    const afterMatch = after.match(this.afterCaret);
    if (afterMatch) {
      return { word: afterMatch[1], index: pos + afterMatch.index, length: afterMatch[1].length + this.config.initSequence.length };
    }
  };

  this.activateMenu = function (doActivate) {
    if (!doActivate) {
      this.__active = false;
      this.elem.off('keydown', keydownHandler);
      getDropdown().css({ display: 'none' });
    } else if (!this.__active) {
      this.__active = true;
      this.elem.on('keydown', keydownHandler);
      const areaCoords = this.elem.offset();
      // TODO: apparnetly that's broken :'(
      const caretCoords = getCaretCoordinates(this.elem.get(0), this.elem.selectionEnd);
      // TODO: actual line-height instead of 1.5 * font-size
      getDropdown().css({ display: 'inline-block', top: areaCoords.top + caretCoords.top + parseInt(this.elem.css('font-size'), 10) * 1.5, left: areaCoords.left + caretCoords.left });
    }
  };

  this.init = function () {
    this.elem.on('keyup click focus', () => {
      this.__caretPosition = this.elem.prop('selectionStart');

      this.__match = this.wordAt(this.elem.val(), this.__caretPosition);
      if (this.__match) {
        window.chrome.extension.sendMessage({ type: 'query', keyword: this.__match.word }, emoji => {
          this.__emoji = emoji;
          this.activateMenu(this.__match && this.__emoji && this.__emoji.length);
          getDropdown().empty();
          _.each(emoji, entry => {
            getDropdown().append($('<div />', {
              class: 'entry',
              text: entry.char + ' ' + entry.__key + ' — ' + entry.keywords.join(', ')
            }));
          });
        });
      } else {
        this.activateMenu(false);
      }
    });

    this.elem.on('blur', () => {
      this.activateMenu(false);
    });
  };
}

window.chrome.extension.sendMessage({ type: 'config' }, function (config) {
  const readyCheck = setInterval(function () {
    if (document.readyState === 'complete') {
      clearInterval(readyCheck);

      $(document).on('focus', 'textarea', function (event) {
        /* jshint camelcase: false */

        if (!event.target.__emoji_autocomplete_ready) {
          event.target.__emoji_autocomplete_ready = true;
          new EmojiAutocomplete(config, $(event.target)).init();
        }
      });
    }
  }, 10);
});
