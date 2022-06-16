const REQUEST_SEPARATOR = "_";
const DELETE_SHORTCUTS_MSG = "Delete";
const CLEAR_STORAGE_MSG = "RESET" + REQUEST_SEPARATOR + "FULL"          // "RESET_FULL"
const CREATE_NEW_SHOWRTCUT_MSG = "new" + REQUEST_SEPARATOR + "shortcut" // "new_shortcut"
const ON_OFF_LOCAL_MSG = "onOff" + REQUEST_SEPARATOR + "local"          // "onOff_local"
const GET_SHORTCUTS = "show" + REQUEST_SEPARATOR + "shortcuts"          // "show_shortcuts"

document.addEventListener('DOMContentLoaded', function () {
    
    document.getElementById('new_shortcut').addEventListener('click', onclick_newShortcut, false)
    document.getElementById('show shortcuts').addEventListener('click', onclick_showShortcuts, false)
    document.getElementById('on/off button local').addEventListener('click', onclick_onOffLocal, false)
    document.getElementById('reset storage').addEventListener('click', onclick_resetStorage, false)
    document.getElementById('delete shortcut submit').addEventListener('click', function() { 
      onclick_deleteShortcut(document.getElementById('shortcut input field'));
    });
    
    function onclick_newShortcut () {
      chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, CREATE_NEW_SHOWRTCUT_MSG)
        
      })
    }
  
  function onclick_showShortcuts () {
      chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, GET_SHORTCUTS)
      })
  }

  function onclick_onOffLocal () {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, ON_OFF_LOCAL_MSG)
        
    })
}

  function onclick_deleteShortcut (shortcutInputField) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, DELETE_SHORTCUTS_MSG + REQUEST_SEPARATOR + shortcutInputField.value)
        
    })
}

function onclick_resetStorage () {
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, CLEAR_STORAGE_MSG)
      
  })
}


}, false)
