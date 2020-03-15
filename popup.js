const inp = document.querySelector("#inp");
const submitBtn = document.querySelector("#submitBtn");
const form = document.querySelector("form");
const speedSpan = document.querySelector("#speed");
const defaultSpeedBtn = document.querySelector("#defaultSpeedBtn");
const MIN = 0.1;
const MAX = 10;
const STEP = 0.1;

inp.setAttribute("min", MIN);
inp.setAttribute("max", MAX);
inp.setAttribute("step", STEP);

var tabId;

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  tabId = tabs[0].id;
});

persist = function(value, tabId) {
  chrome.storage.sync.get(["currentSpeed"], function(res) {
    let newCurrentSpeed = {};
    newCurrentSpeed[tabId] = value;
    let newState = { ...res.currentSpeed, ...newCurrentSpeed };
    chrome.storage.sync.set({ currentSpeed: newState }, function() {});
  });
};

changeSpeed = function(value, tabId) {
  chrome.tabs.query({ active: true, currentWindow: true }, function() {
    chrome.tabs.executeScript(tabId, {
      code: 'document.querySelector("video").playbackRate = ' + value
    });
  });
};

function update(value = null) {
  if (value === null) {
    chrome.storage.sync.get(["currentSpeed"], function(res) {
      if (!res.currentSpeed.hasOwnProperty(tabId)) {
        changeSpeed(1, tabId);
        persist(1, tabId);
        speedSpan.textContent = 1;
        inp.value = 1;
      } else {
        changeSpeed(res.currentSpeed[tabId], tabId);
        speedSpan.textContent = res.currentSpeed[tabId];
        inp.value = res.currentSpeed[tabId];
      }
    });
  } else {
    changeSpeed(value, tabId);
    persist(value, tabId);
    speedSpan.textContent = value;
    inp.value = value;
  }
}

update();

form.addEventListener("submit", submitSpeed);

function submitSpeed(event) {
  event.preventDefault();
  if (!isNaN(inp.value)) {
    let value = Number(inp.value);
    value = value > MIN ? value : MIN;
    value = value < MAX ? value : MAX;
    update(value);
  }
}

defaultSpeedBtn.addEventListener("click", function() {
  changeSpeed(1, tabId);
  update(1);
});
