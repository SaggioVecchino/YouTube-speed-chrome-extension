persist = function (value, tabId) {
  chrome.storage.sync.get(["currentSpeed"], function (res) {
    let newCurrentSpeed = {};
    newCurrentSpeed[tabId] = value;
    let newState = { ...res.currentSpeed, ...newCurrentSpeed };
    chrome.storage.sync.set({ currentSpeed: newState }, function () {});
  });
};

changeSpeed = function (value, tabId) {
  chrome.tabs.query({ active: true, currentWindow: true }, function () {
    chrome.tabs.executeScript(tabId, {
      code:
        'document.querySelector("#movie_player > div.html5-video-container > video").playbackRate = ' +
        value,
    });
  });
};

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ currentSpeed: {} });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostPrefix: "www.youtube",
              pathContains: "watch",
              schemes: ["https", "http"],
            },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    changeInfo.status === "complete" &&
    /^(https?:\/\/(www\.)?)?youtube\.com\/watch/.test(tab.url)
  ) {
    console.log("background.js page updated");
    changeSpeed(1, tabId);
    persist(1, tabId);
  }
});
