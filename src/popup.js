// Request messages //// Request messages //// Request messages //
// @WARGNIGN: any word cannot be prefix of another
const REQUEST_SEPARATOR = "_";
const DELETE_SHORTCUTS_MSG = "Delete";
const CLEAR_STORAGE_MSG = "RESET-FULL"          // "RESET-FULL"
const CREATE_NEW_SHOWRTCUT_MSG = "new-shortcut" // "new-shortcut"
const CREATE_NEW_DOUBLE_SHOWRTCUT_MSG = "new-double-shortcut" // "new-double-shortcut"
const ON_OFF_LOCAL_MSG = "onOff-local"          // "onOff-local"
const GET_SHORTCUTS = "show-shortcuts"          // "show-shortcuts"


// STORAGE ///// STORAGE ///// STORAGE ///// STORAGE ///// STORAGE ///// STORAGE ///
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

// saves to local storage
async function saveToLocalStorage(name, obj){
  let dynamicRecord = {}
  dynamicRecord[name] = obj
  const constRecord = dynamicRecord;
  await chrome.storage.local.set(constRecord, async() => {
  if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    }
  });

}

/// other / helpers ////// other / helpers ////// other / helpers ////// other / helpers ///

function parseURL(url){
    const partlyParsed = url.split('//')  // to seperate "https://"
    const parsed = partlyParsed[1].split('/')[0]  

    return parsed
}


function showMessage(message){
  document.getElementById('message').innerText = message
}

/// creating shortcut /// /// creating shortcut /// /// creating shortcut /// /// creating shortcut /// 

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

function getShortcut(keySequence){
  return new Array(...keySequence).join('-').toLowerCase();
}




/// shortcuts board in popup /// /// shortcuts board in popup /// /// shortcuts board in popup /// 

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
    x.setAttribute("id", "shortcut desc " + data.data[i].shortcut);
    
    let z = document.createElement("BUTTON");
    z.innerText = "change desc"
    z.setAttribute("class", "change desc button");
    z.setAttribute("value", data.data[i].shortcut)

    let t = document.createElement("BUTTON");
    t.innerText = "delete"
    t.setAttribute("class", "delete button");
    t.setAttribute("value", data.data[i].shortcut);


    let s = document.createElement("INPUT");
    s.innerText = "0"
    s.setAttribute("type", "text");
    s.setAttribute("id", "wanted index "+ data.data[i].shortcut);

    if( data.data[i].options.elementIndex){
      s.setAttribute("value", data.data[i].options.elementIndex)    // it should be from data.data[i].options....(gdzie tam dalej xd)
    }else{
      s.setAttribute("value", 0)    // it should be from data.data[i].options....(gdzie tam dalej xd)
    }


    let k = document.createElement("BUTTON");
    k.innerText = "change index"
    k.setAttribute("class", "change index button button");
    k.setAttribute("value", data.data[i].shortcut);

    let p = document.createElement("BUTTON");
    p.innerText = "on/off inner text"
    p.setAttribute("class", "on/off inner text button");
    p.setAttribute("value", data.data[i].shortcut);


    let j = document.createElement("BUTTON");
    j.innerText = "improve"
    j.setAttribute("class", "improve shortcut button");
    j.setAttribute("value", data.data[i].shortcut);

    newNode.appendChild(y)
    newNode.appendChild(x)
    newNode.appendChild(z)
    newNode.appendChild(t)
    newNode.appendChild(s)
    newNode.appendChild(k)
    newNode.appendChild(p)
    newNode.appendChild(j)

    node.appendChild(newNode);

    t.addEventListener('click', function() {
        onclick_deleteShortcut( data.data[i].shortcut)
      }, false);

    z.addEventListener('click', function() {
      const descInputField = document.getElementById("shortcut desc " + data.data[i].shortcut)
      onclick_updateDesc( data.data[i].shortcut, descInputField.value)
    }, false);

    k.addEventListener('click', function() {
      const indexInput = document.getElementById("wanted index " + data.data[i].shortcut)
      onclick_changeIndex( data.data[i].shortcut, indexInput.value)
    }, false);

    p.addEventListener('click', function() {
      onclick_checkInnertext( data.data[i].shortcut)
    }, false);

    j.addEventListener('click', function() {
      onclick_newDoubleShortcut( data.data[i].shortcut)
    }, false);


  }
    
}


/// OnClick functions ////// OnClick functions ////// OnClick functions ////// OnClick functions ///
function onclick_newShortcut () {
  insertingShortcut = true;
  showMessage("enter key sequence, then press ENTER. Once this popup dissaper, click on element you want to be shortcutted")
}

function onclick_onOffLocal () {
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, ON_OFF_LOCAL_MSG)
      
  })
}

function onclick_showShortcuts () {
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, GET_SHORTCUTS)
      
  })
}

function onclick_newDoubleShortcut (shortcut) {
  showMessage("now click on element you want to be shortcutted better")
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, CREATE_NEW_DOUBLE_SHOWRTCUT_MSG + REQUEST_SEPARATOR + shortcut)
      
  })
}

function onclick_resetStorage () {
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, CLEAR_STORAGE_MSG)
      
  })
}


function onclick_deleteShortcut (shortcut) {
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, DELETE_SHORTCUTS_MSG + REQUEST_SEPARATOR + shortcut)
  })
}

// TODO:  onclick_updateDesc, onclick_changeIndex, onclick_checkInnertext are nearly the same
//        find a way to make tempalte func for them
async function onclick_updateDesc (shortcut, desc) {
  chrome.tabs.query({currentWindow: true, active: true}, async function (tabs) {
    var currentTab = tabs[0]; 

    const url = JSON.stringify(currentTab.url)
    const data = await readLocalStorage(parseURL(url)).catch(e => {
      console.error(e);
    });

    for(let i = 0; i<data.data.length; i++){
      if(data.data[i].shortcut === shortcut){
        data.data[i].desc = desc

        

        await saveToLocalStorage(parseURL(url), data).catch(e => {
          console.error(e);
        });

        showMessage("updated description")

        return
      }
    }
    
  })
    
}

async function onclick_changeIndex(shortcut, ind){
   chrome.tabs.query({currentWindow: true, active: true}, async function (tabs) {
    var currentTab = tabs[0]; 

    const url = JSON.stringify(currentTab.url)
    const data = await readLocalStorage(parseURL(url)).catch(e => {
      console.error(e);
    });

    for(let i = 0; i<data.data.length; i++){
      if(data.data[i].shortcut === shortcut){
        data.data[i].options.elementIndex = ind
        

        await saveToLocalStorage(parseURL(url), data).catch(e => {
          console.error(e);
        });

        showMessage("updated index")

        return
      }
    }

  })

}

async function onclick_checkInnertext (shortcut) {
  
  chrome.tabs.query({currentWindow: true, active: true}, async function (tabs) {
    var currentTab = tabs[0]; 

    const url = JSON.stringify(currentTab.url)
    const data = await readLocalStorage(parseURL(url)).catch(e => {
      console.error(e);
    });

    for(let i = 0; i<data.data.length; i++){
      if(data.data[i].shortcut === shortcut){
        data.data[i].attributes.others.checkInnerText = !data.data[i].attributes.others.checkInnerText
        

        await saveToLocalStorage(parseURL(url), data).catch(e => {
          console.error(e);
        });

        showMessage("consider inner text changged to: " + data.data[i].attributes.others.checkInnerText)

        return
      }
    }
    
  })
    
}


////// Listeners ///////// Listeners ///////// Listeners ///////// Listeners ///
let insertingShortcut = false
let improvingShortcut = false
document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('new_shortcut').addEventListener('click', onclick_newShortcut, false)
    document.getElementById('on/off button local').addEventListener('click', onclick_onOffLocal, false)
    document.getElementById('reset storage').addEventListener('click', onclick_resetStorage, false)
    document.getElementById('show shortcuts raw').addEventListener('click', onclick_showShortcuts, false)

}, false)




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



