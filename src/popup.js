// Request messages //// Request messages //// Request messages //
// @WARGNIGN: any word cannot be prefix of another
const REQUEST_SEPARATOR = "_";
const DELETE_SHORTCUTS_MSG = "Delete";
const CLEAR_STORAGE_MSG = "RESET-FULL"          // "RESET-FULL"
const CREATE_NEW_SHOWRTCUT_MSG = "new-shortcut" // "new-shortcut"
const CREATE_NEW_DOUBLE_SHOWRTCUT_MSG = "new-double-shortcut" // "new-double-shortcut"
const ON_OFF_LOCAL_MSG = "onOff-local"          // "onOff-local"
const GET_SHORTCUTS = "show-shortcuts"          // "show-shortcuts"
const UPDATE_CACHE = "update-cache"


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

function sendMessageToContent(msg){
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, msg)
      
  })
}




/// shortcuts board in popup /// /// shortcuts board in popup /// /// shortcuts board in popup /// 

async function createShortcutsBoard(tabs) {
  var currentTab = tabs[0]; 

  const url = JSON.stringify(currentTab.url)
  // alert(parseURL(url))
  const data = await readLocalStorage(parseURL(url)).catch(e => {
    console.error(e);
  });

  if(data === undefined || data === null){
    return
  }

  var node = document.getElementById("shortcuts collection");

  for(let i = 0; i< data.data.length; i++){
    var newNode = document.createElement('p');
    newNode.setAttribute("style", "background-color: aliceblue;")
    newNode.setAttribute("value", data.data[i].shortcut)
    newNode.setAttribute("class", "shortcut")

    let enableButton = document.createElement("BUTTON");
    enableButton.innerText = "on/off shortcut"
    enableButton.setAttribute("class", "enable button");
    enableButton.setAttribute("value", data.data[i].shortcut)

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
      s.setAttribute("value", data.data[i].options.elementIndex)    
    }else{
      s.setAttribute("value", 0)    
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

    let updateKeySequenceButton = document.createElement("BUTTON");
    updateKeySequenceButton.innerText = "update shortcut"
    updateKeySequenceButton.setAttribute("class", "update shortcut");
    updateKeySequenceButton.setAttribute("value", data.data[i].shortcut);

    let amountOfSkipableAttribiutes = document.createElement("INPUT");
    amountOfSkipableAttribiutes.setAttribute("value", data.data[i].options.maxAmonutOfAttribiutesToSkip || "0");
    amountOfSkipableAttribiutes.setAttribute("type", "text");
    amountOfSkipableAttribiutes.setAttribute("id", "max skippable attribiutes "+ data.data[i].shortcut);

    let updateSkipableAttribiutesAmountButton = document.createElement("BUTTON");
    updateSkipableAttribiutesAmountButton.innerText = "update skippable attrs amount"
    updateSkipableAttribiutesAmountButton.setAttribute("class", "update skippable attrs amount");
    updateSkipableAttribiutesAmountButton.setAttribute("value", data.data[i].shortcut);

    
    newNode.appendChild(enableButton)
    newNode.appendChild(y)
    newNode.appendChild(x)
    newNode.appendChild(z)
    newNode.appendChild(t)
    newNode.appendChild(s)
    newNode.appendChild(k)
    newNode.appendChild(p)
    newNode.appendChild(j)
    newNode.appendChild(updateKeySequenceButton)
    newNode.appendChild(amountOfSkipableAttribiutes)
    newNode.appendChild(updateSkipableAttribiutesAmountButton)

    node.appendChild(newNode);

    enableButton.addEventListener('click', function() {
        onclick_enableDisableShortcut( data.data[i].shortcut)
      }, false);

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

    updateKeySequenceButton.addEventListener('click', function() {
      onclick_updatekeySequence( data.data[i].shortcut)
    }, false);


     updateSkipableAttribiutesAmountButton.addEventListener('click', function() {
      const amountInput = document.getElementById("max skippable attribiutes "+ data.data[i].shortcut)
      onclick_changeskippableAmount( data.data[i].shortcut, amountInput.value)
    }, false);


  }
    
}


/// OnClick functions ////// OnClick functions ////// OnClick functions ////// OnClick functions ///
function onclick_newShortcut () {
  insertingShortcut = true;
  showMessage("enter key sequence, then press ENTER. Once this popup dissaper, click on element you want to be shortcutted")
}

function onclick_onOffLocal () {
  sendMessageToContent(ON_OFF_LOCAL_MSG)
}

function onclick_showShortcuts () {
  sendMessageToContent(GET_SHORTCUTS)
}

function onclick_newDoubleShortcut (shortcut) {
  sendMessageToContent( CREATE_NEW_DOUBLE_SHOWRTCUT_MSG + REQUEST_SEPARATOR + shortcut)

  showMessage("now click on element you want to be shortcutted better")
  
}

function onclick_updatekeySequence (shortcut) {
  showMessage("TODO: update shortcut: " + shortcut)
}

function onclick_enableDisableShortcut (shortcut) {
  showMessage("TODO: shortcut will be enabled / disabled: " + shortcut)
}

function onclick_resetStorage () {
  sendMessageToContent(CLEAR_STORAGE_MSG)

}


function onclick_deleteShortcut (shortcut) {
  sendMessageToContent(DELETE_SHORTCUTS_MSG + REQUEST_SEPARATOR + shortcut)
  sendMessageToContent(UPDATE_CACHE)
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

  sendMessageToContent(UPDATE_CACHE)

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

  sendMessageToContent(UPDATE_CACHE)
    
}


function onclick_changeskippableAmount(shortcut, amount){
   chrome.tabs.query({currentWindow: true, active: true}, async function (tabs) {
    var currentTab = tabs[0]; 

    const url = JSON.stringify(currentTab.url)
    const data = await readLocalStorage(parseURL(url)).catch(e => {
      console.error(e);
    });

    for(let i = 0; i<data.data.length; i++){
      if(data.data[i].shortcut === shortcut){
        data.data[i].options.maxAmonutOfAttribiutesToSkip = +amount
        

        await saveToLocalStorage(parseURL(url), data).catch(e => {
          console.error(e);
        });

        showMessage("updated amount")

        return
      }
    }

  })

  sendMessageToContent(UPDATE_CACHE)
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



// enableButton zeby dzialalo oraz zeby shortcuty byly posortowane (najpierw enabled, potem disabled)

// niech bedzie mozliwosc updata shortcuta z poziomu popupa, zeby zmienic z np. alt-h na alt-g latwo

// skroty z custom wejsciem, np. "p-1" oznacza ze chcemy wziac indeks 0, "p-2", ze indeks 2 itd
//    to powinno dzialac kiedy sa podobne rzeczy na stronie i chcemy latwo po nich przechodzic

// POZWALAJ ZEBY NIE ZGADZAL SIE NP 1-2 ATRYBUTY, ZEBY DZIEKI TEMU DZIALLO NP.
//    SEARCH BAR ZAWSZE NA YT

// shortcut do wloczania/wylaczania rozszerzenia