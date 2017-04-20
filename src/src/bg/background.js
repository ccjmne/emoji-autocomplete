'use strict';

const config = {
  initSequence: ':',
  spaceAfter: ' '
};

const emoji = require('emojilib');
const _ = require('lodash');

window.chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.type) {
  case 'config':
    return sendResponse(config);
  case 'query':
    return sendResponse(_(emoji.lib).filter(emoji => {
      return _.filter(emoji.keywords, keyword => keyword.indexOf(request.keyword) + 1).length;
    }).take(8).value());
  }

  return sendResponse();
});
