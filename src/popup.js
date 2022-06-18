const REQUEST_SEPARATOR = "_";
const DELETE_SHORTCUTS_MSG = "Delete";
const CLEAR_STORAGE_MSG = "RESET" + REQUEST_SEPARATOR + "FULL"          // "RESET_FULL"
const CREATE_NEW_SHOWRTCUT_MSG = "new" + REQUEST_SEPARATOR + "shortcut" // "new_shortcut"
const ON_OFF_LOCAL_MSG = "onOff" + REQUEST_SEPARATOR + "local"          // "onOff_local"
const GET_SHORTCUTS = "show" + REQUEST_SEPARATOR + "shortcuts"          // "show_shortcuts"

let insertingShortcut = false
document.addEventListener('DOMContentLoaded', function () {
    
    document.getElementById('new_shortcut').addEventListener('click', onclick_newShortcut, false)
    document.getElementById('show shortcuts').addEventListener('click', onclick_showShortcuts, false)
    document.getElementById('on/off button local').addEventListener('click', onclick_onOffLocal, false)
    document.getElementById('reset storage').addEventListener('click', onclick_resetStorage, false)
    document.getElementById('delete shortcut submit').addEventListener('click', function() { 
      onclick_deleteShortcut(document.getElementById('shortcut input field'));
    });
    
    function onclick_newShortcut () {
      insertingShortcut = true;
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

function getShortcut(keySequence){
  return new Array(...keySequence).join('-').toLowerCase();
}

let keySequence = new Set()
let keySequenceStack = []
function getShortcutFromUser(e){

  if(e.key.toLowerCase() !== "enter"){
        if(e.key.toLowerCase() === "backspace"){
          keySequence.delete(keySequenceStack.pop())
        }
        else{
          keySequence.add(e.key.toLowerCase());
          keySequenceStack.push(e.key.toLowerCase())
        }
        
        document.getElementById("new keySequence input field").value =  getShortcut(keySequence);
        return
      }
      
      let shortcut = getShortcut(keySequence);
      keySequence.clear()
      keySequenceStack = []

      return shortcut;
}

document.addEventListener('keydown', async (e) =>{
  if(!insertingShortcut){
    return
  }

  let shortcut = getShortcutFromUser(e)
  
  if(e.key === "Enter"){
    if(shortcut ==="")
    {
      alert("Shortcut cannot be empty!")
      return
    }

     chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, CREATE_NEW_SHOWRTCUT_MSG + REQUEST_SEPARATOR + shortcut)
      })
      
    insertingShortcut = false;
    window.close();
  }
})