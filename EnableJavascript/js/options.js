document.getElementById("save").addEventListener("click", function () {
    save();
})
document.getElementById("reset").addEventListener("click", function () {
    reset();
})
let homepage = chrome.runtime.getManifest().homepage_url;
document.getElementById("drive").href = `${homepage}/drive-feature`;
document.getElementById("home").href = `${homepage}`;

const updateUrl = chrome.runtime.getManifest().update_url?.toLowerCase();
const id = chrome.runtime.id;

const storeUrl = (updateUrl && updateUrl.includes("microsoft")) ?
    `https://microsoftedge.microsoft.com/addons/detail/` + id :
    "https://chrome.google.com/webstore/detail/" + id;
document.getElementById("rate").href = storeUrl;


function save() {
    var re = document.getElementById("refreshenabled").checked;
    var rd = document.getElementById("refreshdisabled").checked;
    var wl = document.getElementById("whitelist").value.replace(/\r\n/g, "\n").split("\n");
    var bl = document.getElementById("blacklist").value.replace(/\r\n/g, "\n").split("\n");
    chrome.storage.local.set({ re: re, rd: rd, wl: wl, bl: bl }, function () {
        var msg = document.getElementById("msg");

        msg.innerHTML = "SaveSuccess".loc();
        setTimeout(() => {
            msg.innerHTML = "";
        }, 1000);
        //update settings display
        show();
    })
}
function reset() {
    document.getElementById("refreshenabled").checked = false;
    document.getElementById("refreshdisabled").checked = false;
    document.getElementById("whitelist").value = "";
    document.getElementById("blacklist").value = "";
    var msg = document.getElementById("msg");

    msg.innerHTML = "ConfirmReset".loc();
    setTimeout(() => {
        msg.innerHTML = "";
    }, 2000);
}
function show() {
    var re = document.getElementById("refreshenabled");
    var rd = document.getElementById("refreshdisabled");
    var wl = document.getElementById("whitelist");
    var bl = document.getElementById("blacklist");
    chrome.storage.local.get(function (d) {
        d.re ? re.checked = true : re.checked = false;
        d.rd ? rd.checked = true : rd.checked = false;
        if (d.wl) {
            wl.innerHTML = "";
            for (var i = 0; i < d.wl.length; i++) {
                if (d.wl[i] != "")
                    wl.innerHTML += d.wl[i] + "\n";
            }

        }
        if (d.bl) {
            bl.innerHTML = "";
            for (var i = 0; i < d.bl.length; i++) {
                if (d.bl[i] != "")
                    bl.innerHTML += d.bl[i] + "\n";
            }

        }

    })
}
show();
//localize
document.querySelectorAll("[data-loc]").forEach(el => {
    const key = el.getAttribute("data-loc");
    el.innerHTML = key.loc();
});