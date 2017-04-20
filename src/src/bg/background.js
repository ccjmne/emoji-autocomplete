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
    const query = request.keyword.toLowerCase();
    return sendResponse(_(emoji.lib).filter((emoji, key) => {
      emoji.__key = key;
      const foundKey = key.indexOf(query);
      if (foundKey !== -1) {
        return (emoji.__priority = foundKey.toString() + key);
      }

      const foundKeyword = _(emoji.keywords).map(keyword => keyword.indexOf(query)).filter(idx => idx !== -1).reduce(Math.min);
      if (typeof foundKeyword !== 'undefined') {
        return (emoji.__priority = '_' + foundKeyword.toString());
      }
    }).sortBy('__priority').take(8).value());
  }

  return sendResponse();
});
