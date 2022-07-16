

const REQUEST_SEPARATOR = "_";
const DELETE_SHORTCUTS_MSG = "Delete";
const CLEAR_STORAGE_MSG = "RESET-FULL"          
const CREATE_NEW_SHOWRTCUT_MSG = "new-shortcut" 
const CREATE_NEW_DOUBLE_SHOWRTCUT_MSG = "new-double-shortcut" 
const ON_OFF_LOCAL_MSG = "onOff-local"         
const GET_SHORTCUTS = "show-shortcuts"         
const UPDATE_CACHE = "update-cache"
const ENABLE_DISABLE_SHORTCUT = "enable-disable-shortcut"


const ATTRIBIUTES_TO_SKIP = ["href", "src"]  
const NOT_WORKING_TAGS = ["svg", "ellipse", "path"]
const TAGS_TO_SELECT = ["input"]
const SEARCH_FULL = true




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


function showMessage(message){
  document.getElementById('message').innerText = message
}

async function updateShortcut(shortcut, fields, newValue, url){
  chrome.tabs.query({currentWindow: true, active: true}, async function (tabs) {

    const data = await readLocalStorage(url).catch(e => {
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
        
        await saveToLocalStorage(url, data).catch(e => {
          console.error(e);
        });

        return
      }
    }
  })
}

// ON CLICKS //
async function onclick_updateDesc (shortcut, desc, site) {
    showMessage("updated description on "+ site )
    await updateShortcut(shortcut, ["desc"], desc, site)
}

async function onclick_enableDisableShortcut (shortcut, currState, site) {
  if (currState === "true"){
        await updateShortcut(shortcut, ["options", "enabled"], false, site)
        showMessage("Shortcut enabled: " + "false")
    }else{
        await updateShortcut(shortcut, ["options", "enabled"], true, site)
        showMessage("Shortcut enabled: " + "true")
  }

}

async function onclick_deleteShortcut( shortcut, site){
  DeleteShortcut(shortcut, site);
  showMessage("deleted")
}

////

function getIndexOfShortcut(shortcutrsArr, shortcut){
  let index = -1;
  for(let i =0; i< shortcutrsArr.length; i++){
    if(shortcutrsArr[i]["shortcut"] === shortcut){
      index = i;
      break;
    }
  }

  return index
}


async function DeleteShortcut(shortcutToDelete, site){
  let presentShortcuts = null

  try {
    presentShortcuts = await readLocalStorage(site).catch(e => {console.log(e);});
  } catch (error) {  }

  if(presentShortcuts === null){
    alert("not found any shortcuts for this site: " + site)
    return
  }
  
  shortcutrsArr = presentShortcuts.data
  
  let indexOfShortcut = getIndexOfShortcut(shortcutrsArr, shortcutToDelete)
  
  let shortcutInfo = {}
  if(indexOfShortcut === -1){  // not found shortcut

    alert("not found shortcut: " +  shortcutToDelete + ". Nothing deleted")
    return

  }else{  // delete shortcut

    shortcutInfo = shortcutrsArr[indexOfShortcut] 
    shortcutrsArr.splice(indexOfShortcut, 1);
  }

  await saveToLocalStorage(site, {"data": shortcutrsArr, info: presentShortcuts["info"]}).catch(e => {console.log(e);});
  
  alert("deleted " + shortcutToDelete +" "+ shortcutInfo["desc"])

}

function createShortcutPanelRow(shortcutData, site){
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
    // enableButton.setAttribute("site", site)

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
    
    // descSubmitButton.setAttribute("site", site);
    
    let deleteButton = document.createElement("BUTTON");
    deleteButton.innerText = "delete"
    deleteButton.setAttribute("class", "delete button");
    deleteButton.setAttribute("value", shortcutData.shortcut);

    // deleteButton.setAttribute("site", site);



    let onOffInnerTextButton = document.createElement("BUTTON");
    onOffInnerTextButton.innerText = "on/off inner text"
    onOffInnerTextButton.setAttribute("class", "on/off inner text button");
    onOffInnerTextButton.setAttribute("value", shortcutData.shortcut);

    if(shortcutData.attributes.others.checkInnerText){
      onOffInnerTextButton.setAttribute("state", true);
    }else{
      onOffInnerTextButton.setAttribute("state", false);
    }



    let amountOfSkipableAttribiutes = document.createElement("INPUT");
    amountOfSkipableAttribiutes.setAttribute("value", shortcutData.options.maxAmonutOfAttribiutesToSkip || "0");
    amountOfSkipableAttribiutes.setAttribute("type", "text");
    amountOfSkipableAttribiutes.setAttribute("id", "max skippable attribiutes "+ shortcutData.shortcut);

    let updateSkipableAttribiutesAmountButton = document.createElement("BUTTON");
    updateSkipableAttribiutesAmountButton.innerText = "update skippable attrs amount"
    updateSkipableAttribiutesAmountButton.setAttribute("class", "update skippable attrs amount");
    updateSkipableAttribiutesAmountButton.setAttribute("value", shortcutData.shortcut);

    
    newNode.appendChild(enableButton)
    newNode.appendChild(name)
    newNode.appendChild(desbInputField)
    newNode.appendChild(descSubmitButton)
    newNode.appendChild(deleteButton)
    newNode.appendChild(onOffInnerTextButton)
    newNode.appendChild(amountOfSkipableAttribiutes)
    newNode.appendChild(updateSkipableAttribiutesAmountButton)

    enableButton.addEventListener('click', function() {
        const currState = enableButton.getAttribute("shortcut-enabled");
        onclick_enableDisableShortcut( shortcutData.shortcut, currState, site);

        if(currState === "true"){
          enableButton.setAttribute("shortcut-enabled", "false");
          enableButton.innerText = "on"
        }else{
          enableButton.setAttribute("shortcut-enabled", "true");
          enableButton.innerText = "off"
        }
    }, false);

    deleteButton.addEventListener('click', function() {
        onclick_deleteShortcut( shortcutData.shortcut, site)
      }, false);

    descSubmitButton.addEventListener('click', function() {
      const descInputField = document.getElementById("shortcut desc " + shortcutData.shortcut)
      onclick_updateDesc( shortcutData.shortcut, descInputField.value, site)
    }, false);

    onOffInnerTextButton.addEventListener('click', function() {
      
      if(onOffInnerTextButton.getAttribute("state") === "true" ){
        onclick_checkInnertext( shortcutData.shortcut,  false)
        onOffInnerTextButton.setAttribute("state", false);
      }else{
        onclick_checkInnertext( shortcutData.shortcut,  true)
        onOffInnerTextButton.setAttribute("state", true);
      }


    }, false);

     updateSkipableAttribiutesAmountButton.addEventListener('click', function() {
      const amountInput = document.getElementById("max skippable attribiutes "+ shortcutData.shortcut)
      onclick_changeskippableAmount( shortcutData.shortcut, amountInput.value)
    }, false);


    return newNode;
}


async function createShortcutsBoard(tabs) {

    chrome.storage.local.get(null, async function(items) {
        var allKeys = Object.keys(items);

        for(let site_ind =0; site_ind< allKeys.length; site_ind++){
            const url = allKeys[site_ind]
            const data = await readLocalStorage(url).catch(e => {
                console.error(e);
            });
            
            if(data === undefined || data === null){
                return
            }
            
            
            if(data.data.length >= 1){

                var node = document.getElementById("shortcuts collection");
                var newTitle = document.createElement('h1');
                newTitle.innerHTML = url;

                node.appendChild(newTitle)
                
                
                for(let i = 0; i< data.data.length; i++){
                    node.appendChild(createShortcutPanelRow(data.data[i], url))
                }
                
            }
        
        }

    });
}

// INIT actions
window.addEventListener('load', async (event) => {


 try {
    var query = { active: true, currentWindow: true };
    chrome.tabs.query(query, createShortcutsBoard);
  
  } catch (err) {
  }

})

