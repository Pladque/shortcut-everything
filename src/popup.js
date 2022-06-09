
document.addEventListener('DOMContentLoaded', function () {
    
    document.getElementById('new_shortcut').addEventListener('click', onclick_newShortcut, false)
    document.getElementById('on/off button').addEventListener('click', onclick_on_off, false)
    
    function onclick_newShortcut () {
      chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 'new_shortcut')// , setCount)
        
      })
    }
  
  
  function onclick_on_off () {
      chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, 'on_off')// , setCount)
          
      })
  }

  }, false)