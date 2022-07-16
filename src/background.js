
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
    
    descSubmitButton.setAttribute("site", site);
    
    let deleteButton = document.createElement("BUTTON");
    deleteButton.innerText = "delete"
    deleteButton.setAttribute("class", "delete button");
    deleteButton.setAttribute("value", shortcutData.shortcut);

    deleteButton.setAttribute("site", site);



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

