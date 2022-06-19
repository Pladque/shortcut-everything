const REQUEST_SEPARATOR = "_";
const DELETE_SHORTCUTS_MSG = "Delete";
const CLEAR_STORAGE_MSG = "RESET" + REQUEST_SEPARATOR + "FULL"          // "RESET_FULL"
const CREATE_NEW_SHOWRTCUT_MSG = "new" + REQUEST_SEPARATOR + "shortcut" // "new_shortcut"
const ON_OFF_LOCAL_MSG = "onOff" + REQUEST_SEPARATOR + "local"          // "onOff_local"
const GET_SHORTCUTS = "show" + REQUEST_SEPARATOR + "shortcuts"          // "show_shortcuts"


// TEMP
const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], function (result) {
        if (result[key] === undefined) {
          reject();
        } else {
            resolve(result[key] );
        }
      });
    });
  };


function getSiteUrlIdentifier(){
  const url = getURL();
  return parseURL(url)
}
function getURL(){
  return window.location.href
}


function parseURL(url){
    const partlyParsed = url.split('//')  // to seperate "https://"
    const parsed = partlyParsed[1].split('/')[0]  

    return parsed
}

function onclick_deleteShortcut (shortcut) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, DELETE_SHORTCUTS_MSG + REQUEST_SEPARATOR + shortcut)
    })
}



async function createShortcutsBoard(tabs) {
  var currentTab = tabs[0]; 

  const url = JSON.stringify(currentTab.url)
  // alert(parseURL(url))
  const data = await readLocalStorage(parseURL(url)).catch(e => {
    console.error(e);
  });

  var node = document.getElementById("shortcuts collection");

  for(let i = 0; i< data.data.length; i++){
    var newNode = document.createElement('p');
    newNode.setAttribute("style", "background-color: aliceblue;")
    newNode.setAttribute("value", data.data[i].shortcut)
    newNode.setAttribute("class", "shortcut")

    var y = document.createTextNode(data.data[i].shortcut)

    var x = document.createElement("INPUT");
    x.setAttribute("type", "text");
    x.setAttribute("value", data.data[i].desc);
    x.setAttribute("style", "width: 40%;");
    x.setAttribute("class", "shortcut desc");
    
    let z = document.createElement("BUTTON");
    z.innerText = "change desc"
    z.setAttribute("class", "change desc button");
    z.setAttribute("value", data.data[i].shortcut)

    let t = document.createElement("BUTTON");
    t.innerText = "delete"
    t.setAttribute("class", "delete button");
    t.setAttribute("value", data.data[i].shortcut);

    newNode.appendChild(y)
    newNode.appendChild(x)
    newNode.appendChild(z)
    newNode.appendChild(t)

    node.appendChild(newNode);

    t.addEventListener('click', function() {
        onclick_deleteShortcut( data.data[i].shortcut)
      }, false);



    }

    

}


function showMessage(message){
  document.getElementById('message').innerText = message
}


//////
let insertingShortcut = false
document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('new_shortcut').addEventListener('click', onclick_newShortcut, false)
    document.getElementById('on/off button local').addEventListener('click', onclick_onOffLocal, false)
    document.getElementById('reset storage').addEventListener('click', onclick_resetStorage, false)
    document.getElementById('delete shortcut submit').addEventListener('click', function() { 
      onclick_deleteShortcut(document.getElementById('shortcut input field'));
    });

   
    
    function onclick_newShortcut () {
      insertingShortcut = true;
      showMessage("enter key sequence, then press ENTER. Once this popup dissaper, click on element you want to be shortcutted")
    }

  function onclick_onOffLocal () {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, ON_OFF_LOCAL_MSG)
        
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

// INIT actions
window.addEventListener('load', async (event) => {

  try {
    var query = { active: true, currentWindow: true };
    chrome.tabs.query(query, createShortcutsBoard);
  
  } catch (err) {
  }

})
