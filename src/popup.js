
document.addEventListener('DOMContentLoaded', function () {
    
    document.getElementById('new_shortcut').addEventListener('click', onclick_newShortcut, false)
    document.getElementById('on/off button').addEventListener('click', onclick_on_off, false)
    document.getElementById('delete shortcut submit').addEventListener('click', function() { 
      onclick_deleteShortcut(document.getElementById('shortcut input field'));
    });
    
    function onclick_newShortcut () {
      chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 'new_shortcut')
        
      })
    }
  
  function onclick_on_off () {
      chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, 'on_off')
          
      })
  }

  function onclick_deleteShortcut (shortcutInputField) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 'Delete_' + shortcutInputField.value)
        
    })

}


}, false)
