
document.addEventListener('DOMContentLoaded', function () {
    
    document.getElementById('new_shortcut').addEventListener('click', onclick_newShortcut, false)
    document.getElementById('on/off button global').addEventListener('click', onclick_onOffGlobal, false)
    document.getElementById('on/off button local').addEventListener('click', onclick_onOffLocal, false)
    document.getElementById('reset storage').addEventListener('click', onclick_resetStorage, false)
    document.getElementById('delete shortcut submit').addEventListener('click', function() { 
      onclick_deleteShortcut(document.getElementById('shortcut input field'));
    });
    
    function onclick_newShortcut () {
      chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 'new_shortcut')
        
      })
    }
  
  function onclick_onOffGlobal () {
      chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, 'onOff_global')
          
      })
  }

  function onclick_onOffLocal () {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 'onOff_local')
        
    })
}

  function onclick_deleteShortcut (shortcutInputField) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 'Delete_' + shortcutInputField.value)
        
    })
}

function onclick_resetStorage () {
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, 'RESET_FULL')
      
  })
}


}, false)
