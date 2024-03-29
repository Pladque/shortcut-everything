const STORAGE_RESERVED_NAMES_PREFIX = "$@$"
const GENERAL_SETTINGS_STORAGE_NAME = STORAGE_RESERVED_NAMES_PREFIX + "general-settings"
let darkmodeEnabled;


/// STORAGE ////// STORAGE ////// STORAGE ////// STORAGE ////// STORAGE ////// STORAGE ///

// reads local storage and returns value
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

/// helpers ////// helpers ////// helpers ////// helpers ////// helpers ////// helpers ///
function showMessage(message){
  document.getElementById('message').innerText = message
}

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


/// ON CLICKS ////// ON CLICKS ////// ON CLICKS ////// ON CLICKS ////// ON CLICKS ////// ON CLICKS ///
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

async function onclick_checkInnertext (shortcut, newValue, site) {

  await updateShortcut(shortcut, ["attributes", "others", "checkInnerText"], newValue, site)
  showMessage("consider inner text changged to: " + newValue)
}

async function onclick_changeInnerText(shortcut, newText, site){
  await updateShortcut(shortcut, ["attributes", "others", "innerText"], newText, site)
  showMessage("inner text changged to: " + newText)
}

async function onclick_deleteShortcut( shortcut, site){
  DeleteShortcut(shortcut, site);
  showMessage("deleted")
}

async function onclick_onOffSite(site){
  onOffSite(site);
  showMessage("site " + site + " has beed turned")
}

async function onclick_changeskippableAmount(shortcut, amount, site){
  await updateShortcut(shortcut, ["options", "maxAmonutOfAttribiutesToSkip"], +amount, site)
  showMessage("updated amount to " + amount)
  // sendMessageToContent(UPDATE_CACHE)
}

async function onclick_changehasToBevisible(shortcut,newValue, site){
  await updateShortcut(shortcut, ["options", "hasToBeVisible"], newValue, site);
  showMessage("has to be visible had been set to " + newValue + "( " + site + " | " + shortcut);
  // sendMessageToContent(UPDATE_CACHE)
}

async function onclick_switchMode(e){
  darkmodeEnabled = !darkmodeEnabled;
  await manageDarkMode();
}

/// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ///

async function onOffSite(site){
  let siteData = await readLocalStorage(site).catch(e => {
    console.log(e);
  });

  siteData.info.enabled = !siteData.info.enabled
  isExtensionEnabled = siteData.info.enabled;
  const updatedRecord = siteData;

  await saveToLocalStorage(site, updatedRecord).catch(e => {
    console.log(e);
  });;

  alert("extension for this site is enabled: " + siteData.info.enabled)

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

function createOptionHTML(title, field){
  var newNode = document.createElement('div');
  newNode.setAttribute("style", "width:100%;");

  var titleNode = document.createElement('div');
  titleNode.innerText = title;

  newNode.appendChild(titleNode);
  newNode.appendChild(field);

}

function createShortcutPanelRow(shortcutData, site){
    var newNode = document.createElement('p');
    newNode.setAttribute("value", shortcutData.shortcut)
    newNode.setAttribute("style", "border: 3px solid gray;  padding: 5px; ")
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


    let onOffInnerTextButton = document.createElement("BUTTON");
    onOffInnerTextButton.innerText = "on/off inner text"
    onOffInnerTextButton.setAttribute("class", "on/off inner text button");
    onOffInnerTextButton.setAttribute("value", shortcutData.shortcut);

    if(shortcutData.attributes.others.checkInnerText){
      onOffInnerTextButton.setAttribute("state", true);
    }else{
      onOffInnerTextButton.setAttribute("state", false);
    }

    let innerTextInputField = document.createElement("INPUT");
    innerTextInputField.setAttribute("value", shortcutData.attributes.others.innerText || "");
    innerTextInputField.setAttribute("type", "text");
    innerTextInputField.setAttribute("id", "innerText "+ shortcutData.shortcut);

    let updateInnerTextButton = document.createElement("BUTTON");
    updateInnerTextButton.innerText = "update inner text"
    updateInnerTextButton.setAttribute("class", "update inner text");
    updateInnerTextButton.setAttribute("value", shortcutData.shortcut);

    let amountOfSkipableAttribiutes = document.createElement("INPUT");
    amountOfSkipableAttribiutes.setAttribute("value", shortcutData.options.maxAmonutOfAttribiutesToSkip || "0");
    amountOfSkipableAttribiutes.setAttribute("type", "text");
    amountOfSkipableAttribiutes.setAttribute("id", "max skippable attribiutes "+ shortcutData.shortcut);

    let updateSkipableAttribiutesAmountButton = document.createElement("BUTTON");
    updateSkipableAttribiutesAmountButton.innerText = "update skippable attrs amount"
    updateSkipableAttribiutesAmountButton.setAttribute("class", "update skippable attrs amount");
    updateSkipableAttribiutesAmountButton.setAttribute("value", shortcutData.shortcut);

     let setHasToBeVisibleButton = document.createElement("BUTTON");
    setHasToBeVisibleButton.innerText = "has to be visible"
    setHasToBeVisibleButton.setAttribute("class", "has to be visible button");
    setHasToBeVisibleButton.setAttribute("value", shortcutData.options.hasToBeVisible);
    
    newNode.appendChild(enableButton)
    newNode.appendChild(name)
    newNode.appendChild(desbInputField)
    newNode.appendChild(descSubmitButton)
    newNode.appendChild(deleteButton)
    newNode.appendChild(onOffInnerTextButton)
    newNode.appendChild(innerTextInputField)
    newNode.appendChild(updateInnerTextButton)
    newNode.appendChild(amountOfSkipableAttribiutes)
    newNode.appendChild(updateSkipableAttribiutesAmountButton)
    newNode.appendChild(setHasToBeVisibleButton)

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
   
    updateInnerTextButton.addEventListener('click', function() {
      const newText =document.getElementById("innerText "+ shortcutData.shortcut).value
      onclick_changeInnerText(shortcutData.shortcut, newText, site)
    }, false);


    descSubmitButton.addEventListener('click', function() {
      const descInputField = document.getElementById("shortcut desc " + shortcutData.shortcut)
      onclick_updateDesc( shortcutData.shortcut, descInputField.value, site)
    }, false);

    onOffInnerTextButton.addEventListener('click', function() {
      
      if(onOffInnerTextButton.getAttribute("state") === "true" ){
        onclick_checkInnertext( shortcutData.shortcut,  false, site)
        onOffInnerTextButton.setAttribute("state", false);
      }else{
        onclick_checkInnertext( shortcutData.shortcut,  true, site)
        onOffInnerTextButton.setAttribute("state", true);
      }


    }, false);

     updateSkipableAttribiutesAmountButton.addEventListener('click', function() {
      const amountInput = document.getElementById("max skippable attribiutes "+ shortcutData.shortcut)
      onclick_changeskippableAmount( shortcutData.shortcut, amountInput.value, site)
    }, false);
    
    setHasToBeVisibleButton.addEventListener('click', function() {

      if(setHasToBeVisibleButton.getAttribute("value") === "true"){
        setHasToBeVisibleButton.innerText = "has to be visible";
        setHasToBeVisibleButton.setAttribute("value", "false"); 
        onclick_changehasToBevisible( shortcutData.shortcut,false,site)
      }else{
        setHasToBeVisibleButton.innerText = "does not have to be visible";
        setHasToBeVisibleButton.setAttribute("value", "true"); 
        onclick_changehasToBevisible( shortcutData.shortcut,true,site)
      }

   }, false);


    return newNode;
}


async function createShortcutsBoard(tabs) {

    chrome.storage.local.get(null, async function(items) {
        var allKeys = Object.keys(items);

        for(let site_ind =0; site_ind< allKeys.length; site_ind++){
            const url = allKeys[site_ind]
          
            if(url.substr(0, STORAGE_RESERVED_NAMES_PREFIX.length) === STORAGE_RESERVED_NAMES_PREFIX){
              continue;
            }


            const data = await readLocalStorage(url).catch(e => {
                console.error(e);
            });
            
            if(data === undefined || data === null){
                return
            }
            
            

            if(data.data.length >= 1){

                var node = document.getElementById("shortcuts collection");
                var newTitle = document.createElement('h2');
                newTitle.innerHTML = url;

                node.appendChild(newTitle)


                var onOffSiteButton = document.createElement('button');
                onOffSiteButton.innerText = "On/Off site"
                node.appendChild(onOffSiteButton)

                onOffSiteButton.addEventListener('click', function() {
                  onclick_onOffSite(url)
                }, false);
                
                
                for(let i = 0; i< data.data.length; i++){
                  node.appendChild(createShortcutPanelRow(data.data[i], url))
                  
                  var rawDataButton = document.createElement('button');
                  rawDataButton.innerText = "Show raw data"
                  rawDataButton.setAttribute("rawData", JSON.stringify( data.data[i]));

                  var rawDataDiv = document.createElement('div');
                  rawDataDiv.setAttribute("id", url + data.data[i].shortcut)
                  rawDataDiv.setAttribute("showed", "false")
                  
                  rawDataButton.addEventListener('click', function() {
                    const rawDataDiv =document.getElementById( url + data.data[i].shortcut)
                    
                    if (rawDataDiv.getAttribute("showed") === "false"){
                      rawDataDiv.innerHTML = JSON.stringify( data.data[i]);
                      rawDataDiv.setAttribute("showed", "true")
                    }else{
                      rawDataDiv.innerHTML = "";
                      rawDataDiv.setAttribute("showed", "false")
                    }




                  }, false);

                  node.appendChild(rawDataButton);
                  node.appendChild(rawDataDiv);

                }
                
            }
        
        }

    });
}

// Event listener
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('dark-mode switch').addEventListener('change', onclick_switchMode, false)

}, false)

/// darkMode ////// darkMode ////// darkMode ////// darkMode ////// darkMode ////// darkMode ////// darkMode ////// darkMode ///

async function manageDarkMode(){
   document.getElementById('dark-mode switch').checked = darkmodeEnabled;

   if(darkmodeEnabled){
    darkMode();
   }
   else{
    lightMode();
   }

  let darkmodeStatus = undefined;
  try {
    darkmodeStatus = await readLocalStorage(GENERAL_SETTINGS_STORAGE_NAME);
  } catch (error) {
    
  }

  let darkmodeStatusJSON =  JSON.parse(darkmodeStatus);
  darkmodeStatusJSON.darkmode = darkmodeEnabled;
  
  darkmodeStatusString = JSON.stringify(darkmodeStatusJSON);
  await saveToLocalStorage(GENERAL_SETTINGS_STORAGE_NAME,darkmodeStatusString );

}

function darkMode() {
  var element = document.body;
  var content = document.getElementById("DarkModetext");
  element.className = "dark-mode";
}
function lightMode() {
  var element = document.body;
  var content = document.getElementById("DarkModetext");
  element.className = "light-mode";
}

async function getDarkModeSettings(){
  let darkmodeStatus = undefined;
  try {
    darkmodeStatus = await readLocalStorage(GENERAL_SETTINGS_STORAGE_NAME);
  } catch (error) {
    
  }

  if(darkmodeStatus === undefined){
    let darkmodeNew = "{\"darkmode\": true}";
    await saveToLocalStorage(GENERAL_SETTINGS_STORAGE_NAME,darkmodeNew );
    darkmodeStatus = true;
  }

   return JSON.parse(darkmodeStatus).darkmode;
}

/// INIT actions ////// INIT actions ////// INIT actions ////// INIT actions ////// INIT actions ////// INIT actions ///
window.addEventListener('load', async (event) => {
  darkmodeEnabled = await getDarkModeSettings();
  await manageDarkMode();



 try {
    var query = { active: true, currentWindow: true };
    chrome.tabs.query(query, createShortcutsBoard);
  } catch (err) {
  }
})


// zrob ladniejszy background, cos bardziej w stylu ==== dokoncz funckje createOptionHTML(), niech do field to bd wtylko wlasciwosci i na ich podtawie bd tworzyc NODA
// enabled:   [checkbox]
// desc:      [desc field]

// zrob jakis inny alert / zadnego alertu gdy znajdzie element ale nie on screen