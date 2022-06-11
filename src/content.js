//// GLOBAL VALUES ///////// GLOBAL VALUES ///////// GLOBAL VALUES ///////// GLOBAL VALUES /////

var READ_ACTIVE = true;
var isEnabledGlobal = true
  
//// STORAGE  //////// STORAGE  //////// STORAGE  //////// STORAGE  //////// STORAGE  ////
//@desc: place to write code directly connecting with storage

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

const clearStorage = async(msg) => {
  chrome.storage.local.clear(function() {
    var error = chrome.runtime.lastError;
    if (error) {
        console.error(error);
    }
    if(msg!== null)
      alert(msg)
  });

}
const saveToLocalStorage = async(name, obj) =>{

  let dynamicRecord = {}
  dynamicRecord[name] = obj
  const constRecord = dynamicRecord;

  await chrome.storage.local.set(constRecord, () => {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
    }
  }).catch(e => {
    console.log(e);
});

}

//// SHORTCUT READERS //////// SHORTCUT READERS //////// SHORTCUT READERS //////// SHORTCUT READERS ////
//@desc: functions connected to reading shortcut and mathing it records from storage

// @DESC: Compares event.key with avalible shortcuts
// @INPUT: event
// @RETURNS: element properties saved for this shortcut or null if not found 
async function readShortcut(e) {
  const site = getSiteUrlIdentifier();
  const avalibleShortcuts = await readLocalStorage(site).catch(e => {
    console.log(e);
});
  // alert(JSON.stringify(avalibleShortcuts["data"]))
  for(let i =0; i<avalibleShortcuts["data"].length; i++){
    if (e.key === avalibleShortcuts["data"][i]["shortcut"]){
      return avalibleShortcuts["data"][i]["attributes"]
    }
  }

  return null
}

function goToHref(h){
    window.location.href = h
}

      
//// HELPERS/OTHER //////// HELPERS/OTHER //////// HELPERS/OTHER //////// HELPERS/OTHER ////
//@desc: functions to help in other functions, functions that doesnt fit anywhere else

// @DESC: Parsing an URL to use it as a name while saving
// @INPUT: URL as string, like "https://www.w3schools.com/jsref/jsref_obj_date.asp"
// @RETURNS: "parsed" url -- cuts off everything but "base" website name
//            above URL are going to be parsed to "www.w3schools.com"
function parseURL(url){
    const partlyParsed = url.split('//')  // to seperate "https://"
    const parsed = partlyParsed[1].split('/')[0]  

    return parsed
}

async function isExtensionEnabled(){
  
  const site = getSiteUrlIdentifier();

  let siteData = await readLocalStorage(site).catch(e => {
    console.log(e);
});

  if(siteData && siteData.info){
      const isEnabledOnCurrentSite = siteData.info.enabled;
      return isEnabledGlobal && isEnabledOnCurrentSite;
  }
  else return isEnabledGlobal

}

//// GETs //////// GETs //////// GETs //////// GETs //////// GETs //////// GETs //////// GETs ////
//@desc: getters

function getSiteUrlIdentifier(){
  const url = getURL();
  return parseURL(url)
}

function getIndefOfShortcut(shortcutrsArr, shortcut){
  let index = -1;
  for(let i =0; i< shortcutrsArr.length; i++){
    if(shortcutrsArr[i]["shortcut"] === shortcut){
      index = i;
      break;
    }
  }

  return index
}

function getShortcut(e){
  return e.key.toLowerCase();
}

function getURL(){
  return window.location.href
}

// @DESC: based on properies/attributes (like for example class name) returns matched element from
//        currently open webpage
// @INPUT: properties in JSON format as a string
// @RETURNS: href that matches element with given properties or string "null" if not found   
function getHrefFromElementWithProperties(elementProperties){
  const allElements = document.body.getElementsByTagName("*");
  const elementPropertiesJSON = JSON.parse(elementProperties);
  
  let next_href = "null"
  for(let i =0; i<allElements.length; i++){
    let attributes_names = allElements[i].getAttributeNames();
    let check = true;
    for(let j = 0; j<attributes_names.length; j++){
      if(attributes_names[j] === "href"){
        continue;
      }
      
      if(allElements[i].getAttribute(attributes_names[j]) !== elementPropertiesJSON[attributes_names[j]]){
        check = false
      }

    }

    if(allElements[i].getAttribute("href") && check && attributes_names.length>=2)
    {
      next_href = allElements[i].getAttribute("href")
      break;
    }
  }

  return next_href
}

// @DESC: Gets data from object (element) user clicked on 
// @INPUT: event
// @RETURNS: all data from event.target but "href"
// @TODO: make sth like "attributesToSkip" and put href inside, so in the future
//        we were able to exclude more attributes easly            
async function getButtonInfo(e){
  e = e || window.event;
  var target = e.target || e.srcElement
  
  var temp_button_data = {};
  const attrsNames = target.getAttributeNames();

  for(let i =0; i<attrsNames.length; i++){
    if(attrsNames[i]=== "href"){
      continue;
    }
    temp_button_data[attrsNames[i]] =  target.getAttribute(attrsNames[i]);
  }

  
  const button_data = JSON.stringify(temp_button_data)

  return button_data

}

//// EVENTS FUNCTIONS /////// EVENTS FUNCTIONS /////// EVENTS FUNCTIONS /////// EVENTS FUNCTIONS ///
//@desc: functions to run inside event listener(s)

function onOffGlobal(){
  isEnabledGlobal = !isEnabledGlobal
  alert("extension is on: " + isEnabledGlobal)
}


async function onOffLocal(){
  const site = getSiteUrlIdentifier();
  let siteData = await readLocalStorage(site).catch(e => {
    console.log(e);
});

  siteData.info.enabled = !siteData.info.enabled

  const updatedRecord = siteData;

  await saveToLocalStorage(site, updatedRecord).catch(e => {
    console.log(e);
});;

  alert("extension for this site is enabled: " + siteData.info.enabled)

}


async function newShortcut(){
  READ_ACTIVE = false;
    document.addEventListener('keydown', async (e) =>{
      const shortcut = getShortcut(e);

      document.body.addEventListener('click', async (e) => {

        const elementProperties = await getButtonInfo(e).catch(e => {
            console.log(e);
        });
        const site = getSiteUrlIdentifier();
    
        let presentShortcuts = null

        try {
          presentShortcuts = await readLocalStorage(site).catch(e => {
            console.log(e);
        });
        } catch (error) {
          
        }

        const description = "No description provided"
        const shortcutInfoObj = {"shortcut": shortcut, "attributes": elementProperties, "desc": description}


        if(presentShortcuts === null || presentShortcuts === undefined){
          await saveToLocalStorage(site,  {"data": [ shortcutInfoObj ], "info": {"enabled": true} }).catch(e => {
            console.log(e);
        });

        }else{
            // alert(JSON.stringify(presentShortcuts))
            shortcutrsArr = presentShortcuts["data"]
          
            let overridingShourtcutIndex = getIndefOfShortcut(shortcutrsArr, shortcut)
            
            if(overridingShourtcutIndex === -1){  // add new shortcut
              shortcutrsArr.push(shortcutInfoObj) 
            }else{  // override shortcut
              shortcutrsArr[overridingShourtcutIndex] = shortcutInfoObj
            }

            await saveToLocalStorage(site,  {"data": shortcutrsArr, info: presentShortcuts["info"]}).catch(e => {
                console.log(e);
            });

            READ_ACTIVE = true;
        }
      }
      , true)
    });
}


async function DeleteShortcut(shortcutToDelete){
  const site = getSiteUrlIdentifier();
  let presentShortcuts = null
  try {
    presentShortcuts = await readLocalStorage(site).catch(e => {
        console.log(e);
    });
  } catch (error) {
    
  }

  if(presentShortcuts === null){
    alert("not found aby shortcuts for this site: " + site)
    return
  }
  shortcutrsArr = presentShortcuts.data

  let overridingShourtcutIndex = getIndefOfShortcut(shortcutrsArr, shortcutToDelete)

  let shortcutInfo = {}
  if(overridingShourtcutIndex === -1){  // not found shortcut
    alert("not found shortcut: " +  request.substr(7, request.length - 1) + ". Nothing deleted")
    return
  }else{  // delete shortcut
    shortcutInfo = shortcutrsArr[overridingShourtcutIndex] 
    shortcutrsArr.splice(overridingShourtcutIndex, 1);
  }

  await saveToLocalStorage(site, {"data": shortcutrsArr, info: shortcutrsArr["info"]}).catch(e => {
    console.log(e);
});

  alert("deleted " + shortcutToDelete +" "+ shortcutInfo["desc"])
}

async function resetStorage(){
  await clearStorage("storage cleared").catch(e => {
    console.log(e);
});
}



//// EVENT LISTENER && HANDLER //////// EVENT LISTENER && HANDLER //////// EVENT LISTENER && HANDLER ////
//@desc: main message listener(s) and handler for extension

chrome.runtime.onMessage.addListener(async function(request){
  if(request === "onOff_global"){
    onOffGlobal()
    return
  }else if(request === 'onOff_local'){
    onOffLocal()
    return
  }

  const isEnabled = await isExtensionEnabled().catch(e => {
    console.log(e);
});
  if(!isEnabled){
    return
  }
  
  if(request==="new_shortcut")
  {
    await  newShortcut().catch(e => {
        console.log(e);
    });

  } else if(request.length >=2 && request.substr(0, 7) === "Delete_"){

    const shortcutToDelete = request.substr(7, request.length - 1).toLowerCase();
    await DeleteShortcut(shortcutToDelete).catch(e => {
        console.log(e);
    });
   
  }else if (request ==='RESET_FULL'){
    await resetStorage().catch(e => {
        console.log(e);
    });
  }
  else{
    alert("UNKNOWN REQUEST: " + request)
  }
  
})

document.addEventListener('keydown', async (e) => {
  const isEnabled = await isExtensionEnabled().catch(e => {
    console.log(e);
});
  if(!isEnabled){
    return
  }

  if(READ_ACTIVE){
    const savedShortCut = await readShortcut(e).catch(e => {
        console.log(e);
    });
    
    if(savedShortCut){
      const next_href = getHrefFromElementWithProperties(savedShortCut) 

      if(next_href === "null"){
        alert("ERROR, cannot find href in element")
      }
      else{
        goToHref(next_href)
      }

    }
  }
});