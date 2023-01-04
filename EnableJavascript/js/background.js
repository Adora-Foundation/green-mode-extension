importScripts("/js/welcome.js");

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


