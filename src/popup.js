

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
const ENABLE_DISABLE_SHORTCUT = "enable-disable-shortcut"

const insertingShortcutModes = {
  "none": "none",
  "new": "new",
  "update": "update"
}

let insertingShortcutMode = insertingShortcutModes.none

function changeInsertingMode(newMode){
  insertingShortcutMode = newMode;
}

let oldShortcut = "";



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

//   chrome.storage.onChanged.addListener(function(changes, namespace) {
//      alert("change recived! 2");
// });

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

function createShortcutPanelRow(shortcutData){
    var newNode = document.createElement('p');
    newNode.setAttribute("style", "background-color: aliceblue;")
    newNode.setAttribute("value", shortcutData.shortcut)
    newNode.setAttribute("class", "shortcut")

    let enableButton = document.createElement("BUTTON");

    if(shortcutData.options.enabled){
      enableButton.innerText = "off"
    }else{
      enableButton.innerText = "on"
    }
    enableButton.setAttribute("shortcut-enabled", shortcutData.options.enabled)
    enableButton.setAttribute("class", "enable button");
    enableButton.setAttribute("value", shortcutData.shortcut)

    var name = document.createTextNode(shortcutData.shortcut)

    var desbInputField = document.createElement("INPUT");
    desbInputField.setAttribute("type", "text");
    desbInputField.setAttribute("value", shortcutData.desc);
    desbInputField.setAttribute("style", "width: 40%;");
    desbInputField.setAttribute("id", "shortcut desc " + shortcutData.shortcut);
    
    let descSubmitButton = document.createElement("BUTTON");
    descSubmitButton.innerText = "change desc"
    descSubmitButton.setAttribute("class", "change desc button");
    descSubmitButton.setAttribute("value", shortcutData.shortcut)

    let deleteButton = document.createElement("BUTTON");
    deleteButton.innerText = "delete"
    deleteButton.setAttribute("class", "delete button");
    deleteButton.setAttribute("value", shortcutData.shortcut);


    let indexInputField = document.createElement("INPUT");
    indexInputField.innerText = "0"
    indexInputField.setAttribute("type", "text");
    indexInputField.setAttribute("id", "wanted index "+ shortcutData.shortcut);

    if( shortcutData.options.elementIndex){
      indexInputField.setAttribute("value", shortcutData.options.elementIndex)    
    }else{
      indexInputField.setAttribute("value", 0)    
    }


    let indexSubmitButton = document.createElement("BUTTON");
    indexSubmitButton.innerText = "change index"
    indexSubmitButton.setAttribute("class", "change index button button");
    indexSubmitButton.setAttribute("value", shortcutData.shortcut);

    // let onOffInnerTextButton = document.createElement("BUTTON");
    // onOffInnerTextButton.innerText = "on/off inner text"
    // onOffInnerTextButton.setAttribute("class", "on/off inner text button");
    // onOffInnerTextButton.setAttribute("value", shortcutData.shortcut);

    // // alert(typeof shortcutData.attributes.others.checkInnerText)
    // if(shortcutData.attributes.others.checkInnerText){
    //   // alert(1)
    //   onOffInnerTextButton.setAttribute("state", true);
    // }else{
    //   // alert(2)
    //   onOffInnerTextButton.setAttribute("state", false);
    // }


    let improveButton = document.createElement("BUTTON");
    improveButton.innerText = "improve"
    improveButton.setAttribute("class", "improve shortcut button");
    improveButton.setAttribute("value", shortcutData.shortcut);

    let updateKeySequenceButton = document.createElement("BUTTON");
    updateKeySequenceButton.innerText = "update shortcut"
    updateKeySequenceButton.setAttribute("class", "update shortcut");
    updateKeySequenceButton.setAttribute("value", shortcutData.shortcut);

    // let amountOfSkipableAttribiutes = document.createElement("INPUT");
    // amountOfSkipableAttribiutes.setAttribute("value", shortcutData.options.maxAmonutOfAttribiutesToSkip || "0");
    // amountOfSkipableAttribiutes.setAttribute("type", "text");
    // amountOfSkipableAttribiutes.setAttribute("id", "max skippable attribiutes "+ shortcutData.shortcut);

    // let updateSkipableAttribiutesAmountButton = document.createElement("BUTTON");
    // updateSkipableAttribiutesAmountButton.innerText = "update skippable attrs amount"
    // updateSkipableAttribiutesAmountButton.setAttribute("class", "update skippable attrs amount");
    // updateSkipableAttribiutesAmountButton.setAttribute("value", shortcutData.shortcut);

    
    newNode.appendChild(enableButton)
    newNode.appendChild(name)
    newNode.appendChild(desbInputField)
    newNode.appendChild(descSubmitButton)
    newNode.appendChild(deleteButton)
    newNode.appendChild(indexInputField)
    newNode.appendChild(indexSubmitButton)
    // newNode.appendChild(onOffInnerTextButton)
    newNode.appendChild(improveButton)
    newNode.appendChild(updateKeySequenceButton)
    // newNode.appendChild(amountOfSkipableAttribiutes)
    // newNode.appendChild(updateSkipableAttribiutesAmountButton)

    enableButton.addEventListener('click', function() {
        const currState = enableButton.getAttribute("shortcut-enabled");
        onclick_enableDisableShortcut( shortcutData.shortcut, currState);

        if(currState === "true"){
          enableButton.setAttribute("shortcut-enabled", "false");
          enableButton.innerText = "on"
        }else{
          enableButton.setAttribute("shortcut-enabled", "true");
          enableButton.innerText = "off"
        }
    }, false);

    deleteButton.addEventListener('click', function() {
        onclick_deleteShortcut( shortcutData.shortcut)
      }, false);

    descSubmitButton.addEventListener('click', function() {
      const descInputField = document.getElementById("shortcut desc " + shortcutData.shortcut)
      onclick_updateDesc( shortcutData.shortcut, descInputField.value)
    }, false);

    indexSubmitButton.addEventListener('click', function() {
      const indexInput = document.getElementById("wanted index " + shortcutData.shortcut)
      onclick_changeIndex( shortcutData.shortcut, indexInput.value)
    }, false);

    // onOffInnerTextButton.addEventListener('click', function() {
    //   // alert(onOffInnerTextButton.getAttribute("state"))
    //   // onclick_checkInnertext( shortcutData.shortcut, onOffInnerTextButton.getAttribute("state"))
      
    //   if(onOffInnerTextButton.getAttribute("state") === "true" ){
    //     onclick_checkInnertext( shortcutData.shortcut,  false)
    //     onOffInnerTextButton.setAttribute("state", false);
    //   }else{
    //     onclick_checkInnertext( shortcutData.shortcut,  true)
    //     onOffInnerTextButton.setAttribute("state", true);
    //   }


    // }, false);

    improveButton.addEventListener('click', function() {
      onclick_newDoubleShortcut( shortcutData.shortcut)
    }, false);

    updateKeySequenceButton.addEventListener('click', function() {
      onclick_updatekeySequence( shortcutData.shortcut)
    }, false);


    //  updateSkipableAttribiutesAmountButton.addEventListener('click', function() {
    //   const amountInput = document.getElementById("max skippable attribiutes "+ shortcutData.shortcut)
    //   onclick_changeskippableAmount( shortcutData.shortcut, amountInput.value)
    // }, false);


    return newNode;
}

async function updateShortcut(shortcut, fields, newValue){
  chrome.tabs.query({currentWindow: true, active: true}, async function (tabs) {
    var currentTab = tabs[0]; 

    const url = JSON.stringify(currentTab.url)
    const data = await readLocalStorage(parseURL(url)).catch(e => {
      console.error(e);
    });

    for(let i = 0; i<data.data.length; i++){
      if(data.data[i].shortcut === shortcut){
        
        if(fields.length == 2){
          data.data[i][fields[0]][fields[1]] = newValue
        }else if(fields.length == 1){
          data.data[i][fields[0]] = newValue
        }else if(fields.length == 3){
          data.data[i][fields[0]][fields[1]][fields[2]] = newValue
        }
        
        await saveToLocalStorage(parseURL(url), data).catch(e => {
          console.error(e);
        });

        return
      }
    }
  })
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
    node.appendChild(createShortcutPanelRow(data.data[i]))
  }
    
}


/// OnClick functions ////// OnClick functions ////// OnClick functions ////// OnClick functions ///
async function onclick_newShortcut () {
  
  (async () => {
    const src = chrome.runtime.getURL("common.js");
    const contentMain = await import(src);
    contentMain.main();
  })();

  changeInsertingMode(insertingShortcutModes.new)
  showMessage("enter key sequence, then press ENTER. Once this popup dissaper, click on element you want to be shortcutted")
}

async function onclick_createPackage () {

  showMessage("Creating package...")

  chrome.tabs.query({currentWindow: true, active: true}, async function (tabs) {
    var currentTab = tabs[0]; 

    const url = JSON.stringify(currentTab.url)
    const parsedUrl = parseURL(url);
    const data = await readLocalStorage(parsedUrl)

    let packageJSON = {}

    packageJSON.site = parsedUrl
    packageJSON.data = data;

    const package = JSON.stringify(packageJSON)

    let pacakgeField = document.getElementById("package create field");
    pacakgeField.setAttribute("value", package)
  });

   showMessage("Package created, ready to copy")

}

function onclick_copyPackage () {
  
  var pacakgeField = document.getElementById("package create field");
  
  pacakgeField.select();
  pacakgeField.setSelectionRange(0, 99999); /* For mobile devices */
  
  navigator.clipboard.writeText(pacakgeField.value);
  
  showMessage("Copied the package!")
}

function onclick_onOffLocal () {
  sendMessageToContent(ON_OFF_LOCAL_MSG)
}


function onclick_openSettings () {
 chrome.tabs.create({
      url: 'settings.html'
    });
}

function onclick_showShortcuts () {
  sendMessageToContent(GET_SHORTCUTS)
}

async function onclick_LoadPackage () {
  showMessage("file is uploaidng...")

  var file = document.getElementById("package input field").files[0];
  if (file) {
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = async function (evt) {
      // alert(evt.target.result)

      const dataJSON = JSON.parse(evt.target.result);

      await saveToLocalStorage(dataJSON.site, (dataJSON.data))

      showMessage("Shortcuts read succefully!")
    }
    reader.onerror = function (evt) {
        showMessage("error reading file")
    }

  }

  
}

function onclick_newDoubleShortcut (shortcut) {
  sendMessageToContent( CREATE_NEW_DOUBLE_SHOWRTCUT_MSG + REQUEST_SEPARATOR + shortcut)

  showMessage("now click on element you want to be shortcutted better")
  
}

function onclick_updatekeySequence (shortcut) {
  showMessage("insert new Key sequence, then press ENTER, if such a sequence already exists, it will be overwritten")
  
  oldShortcut = shortcut;
  changeInsertingMode(insertingShortcutModes.update);
}

function onclick_enableDisableShortcut (shortcut, currState) {
  sendMessageToContent(ENABLE_DISABLE_SHORTCUT + REQUEST_SEPARATOR + shortcut)

  if (currState === "true"){
    showMessage("Shortcut enabled: " + "false")
  }else{
    showMessage("Shortcut enabled: " + "true")
  }

}

function onclick_resetStorage () {
  sendMessageToContent(CLEAR_STORAGE_MSG)

}


function onclick_deleteShortcut (shortcut) {
  sendMessageToContent(DELETE_SHORTCUTS_MSG + REQUEST_SEPARATOR + shortcut)
  // sendMessageToContent(UPDATE_CACHE)
}

async function onclick_updateDesc (shortcut, desc) {

  await updateShortcut(shortcut, ["desc"], desc)
  showMessage("updated description")

}

async function onclick_changeIndex(shortcut, ind){

  await updateShortcut(shortcut, ["options", "elementIndex"], ind)
  showMessage("updated index")
  // sendMessageToContent(UPDATE_CACHE)

}

async function onclick_checkInnertext (shortcut, newValue) {

  await updateShortcut(shortcut, ["attributes", "others", "checkInnerText"], newValue)
  showMessage("consider inner text changged to: " + newValue)
  // sendMessageToContent(UPDATE_CACHE)

}


async function onclick_changeskippableAmount(shortcut, amount){
  
  await updateShortcut(shortcut, ["options", "maxAmonutOfAttribiutesToSkip"], +amount)
  showMessage("updated amount to " + amount)
  // sendMessageToContent(UPDATE_CACHE)

}

////// Listeners ///////// Listeners ///////// Listeners ///////// Listeners ///
let improvingShortcut = false
document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('new_shortcut').addEventListener('click', onclick_newShortcut, false)
    document.getElementById('create package button').addEventListener('click', onclick_createPackage, false)
    document.getElementById('copy package').addEventListener('click', onclick_copyPackage, false)
    document.getElementById('on/off button local').addEventListener('click', onclick_onOffLocal, false)
    document.getElementById('settings button').addEventListener('click', onclick_openSettings, false)
    document.getElementById('reset storage').addEventListener('click', onclick_resetStorage, false)
    document.getElementById('show shortcuts raw').addEventListener('click', onclick_showShortcuts, false)
    document.getElementById('package input submit button').addEventListener('click', onclick_LoadPackage, false)

}, false)


document.addEventListener('keydown', async (e) =>{

  if(insertingShortcutMode === insertingShortcutModes.new){
    let shortcut = getShortcutFromUser(e)
  
    if(e.key === "Enter"){
      if(shortcut ==="")
      {
        alert("Shortcut cannot be empty!")
        return
      }
      
      sendMessageToContent(CREATE_NEW_SHOWRTCUT_MSG + REQUEST_SEPARATOR + shortcut)
      
      changeInsertingMode(insertingShortcutModes.none)

      window.close();
    }
  }
  else if (insertingShortcutMode === insertingShortcutModes.update){
    let shortcut = getShortcutFromUser(e)
  
    if(e.key === "Enter"){
      if(shortcut ==="")
      {
        alert("Shortcut cannot be empty!")
        return
      }
      
      updateShortcut(oldShortcut, ["shortcut"], shortcut)

      changeInsertingMode(insertingShortcutModes.none)

      window.close();
    }
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

// try to make simple background page 
// https://github.com/shama/letswritecode/tree/master/how-to-make-chrome-extensions/bear
// dodaj tam zeby sie wyswetiallo mniej wiecej co i jak, nie musi jeszcze dzialac, nie musi byc dodatkowych ustawien
//    niech bedzie latwo jakos edytowac ten zapis, np. zeby checki na "consider" albo "nie cosider" inner txt, 
//    zeby to bylo ladnie w polach wypisane

//  ale niech beda z boku klikalne taby (jak w tym co mam do shortcutow)

// merguj to z mainem

// refactor zeby cache sie aktualizowac "storage.onChanged" bo jest taka opcja


// alternative shortcuts  --  pamietaj pobrac z maina jak to wyglada i od nowa robic



// jak rozwiazqac problem mlodego dzbana....