
/*
 *  Copyright (C) 2019-2022  didierfred@gmail.com 
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

let connections = {};



/*
* Listen for message form tab and send it to devtools 
**/
const notify = (message, sender, sendResponse) => {

  if (sender.tab) {
    let tabId = sender.tab.id;
    if (tabId in connections) connections[tabId].postMessage(message);
    else console.warn("Tab not found in connection list.");
  }
  else console.warn("sender.tab not defined.");
}


chrome.runtime.onMessage.addListener(notify);

console.log("start background process");

// Listen to message from devTools
chrome.runtime.onConnect.addListener((devToolsConnection) => {
  console.log("received onConnect");
  // assign the listener function to a variable so we can remove it later
  let devToolsListener = (message, sender, sendResponse) => {

    // in case message form devtools is to clean cache 
    if (message.clearBrowserCache) {
      clearBrowserCache();
      return;
    }
    // Otherwise message is to inject script 
    else {
      // Inject a content script into the identified tab
      console.log(`received script ${message.scriptToInject} to execute form tabId ${message.tabId}`);
      if (!connections[message.tabId]) connections[message.tabId] = devToolsConnection;
      injectAnalyseScript(message.tabId,message.scriptToInject);
    }
  }
  // add the listener
  devToolsConnection.onMessage.addListener(devToolsListener);

  devToolsConnection.onDisconnect.addListener((port) => {
    devToolsConnection.onMessage.removeListener(devToolsListener);

    Object.keys(connections).map(tab => {
      if (connections[tab] == port) {
        delete connections[tab];
        return false;
      }
    });
  });

});

function injectAnalyseScript(tabId,script) {
  if (chrome.tabs.executeScript)  injectAnalyseScriptWithManifestV2(tabId,script);
  else injectAnalyseScriptWithManifestV3(tabId,script);
}

function injectAnalyseScriptWithManifestV2(tabId,script) {
  chrome.tabs.executeScript(tabId,
    {file: script, allFrames: true});
}

function injectAnalyseScriptWithManifestV3(tabId,script) {
  chrome.scripting.executeScript({
    target: {tabId},
    files: [script]
  });
}


function clearBrowserCache()
{ 
  chrome.browsingData.remove({
  }, {
    "cache": true,
    "cookies": false,
    "downloads": true,
    "formData": false,
    "history": false,
    "indexedDB": false,
    "localStorage": false,
    "passwords": false,
    "serviceWorkers": true,
  }, console.log("Cache cleaning done"));
}

/*
Enable JS Toggle Code
 */

const reload = tab => {
  chrome.storage.local.get(function (d) {
    if (d.re && !d.state)
      return
    if (d.rd && d.state)
      return
    var url = tab.url ? tab.url : '';
    var arr = url.split("/");
    if (arr[0] === 'https:' || arr[0] === 'http:')
      chrome.tabs.reload();

  });
};

const badge = text => {
  chrome.action.setBadgeText({
    text: text,
  });
  chrome.action.setBadgeBackgroundColor({
    color: "red"
  });
}

const app = () => {
  chrome.storage.local.get({
    state: true
  }, d => {
    var text = "x";
    var setting = "block";
    if (d.state) {
      text = "";
      setting = "allow";
    }
    //set badge text
    badge(text);
    //set ext icon title
    set_title(setting);
    //action
    action(setting);

    whilelist_url();
    blacklist_url();
    //block/allow js

    d.state = !d.state;

    chrome.storage.local.set(d);

  });
}

const set_title = setting => {
  chrome.action.setTitle({
    "title": `Click to ${setting === 'allow' ? "block" : "allow"} Javascript`
  })
}

const all_url = setting => {
  chrome.contentSettings.javascript.set({
    primaryPattern: '<all_urls>',
    setting: setting
  });
}

const whilelist_url = () => {
  chrome.storage.local.get("wl", function (d) {
    if (d.wl) {

      d.wl.forEach(wl => {
        if (wl) {
          chrome.contentSettings.javascript.set({
            primaryPattern: wl + "*",
            setting: 'allow'
          });
        }
      });
    }
  })

}

whilelist_url();
const blacklist_url = () => {
  chrome.storage.local.get("bl", function (d) {
    if (d.bl)
      d.bl.forEach(bl => {
        if (bl) {
          chrome.contentSettings.javascript.set({
            primaryPattern: bl + "*",
            setting: 'block'
          });
        }
      });
  })

}
blacklist_url();

const action = setting => {
  chrome.contentSettings.javascript.clear({}, () => {
    all_url(setting);
  });
}
//first use
chrome.action.setTitle({
  "title": "Click to active this extension"
})
//on click extension icon
chrome.action.onClicked.addListener(function (tab) {
  app();
  reload(tab);

});
chrome.storage.onChanged.addListener(d => {

  if (d.wl) {
    whilelist_url();
  }
  if (d.bl) {
    blacklist_url();
  }
});


