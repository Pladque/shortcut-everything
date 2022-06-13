//// GLOBAL VALUES ///////// GLOBAL VALUES ///////// GLOBAL VALUES ///////// GLOBAL VALUES /////

var READ_ACTIVE = true;
var isExtensionEnabled = true;
  
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


function prepareDataToCache(data){

  let shortCutInfo = {}
  for(let i = 0; i < data.data.length; i++){
    shortCutInfo[data.data[i].shortcut] = () => {
      if(isExtensionEnabled){
        const savedShortCut = data.data[i].attributes
        if(savedShortCut){
          const next_href = getHrefFromElementWithProperties(savedShortCut) 
          // alert(next_href === "null")
          if(next_href === "null"){
            alert("ERROR, cannot find href in element")
          }
          else{
            goToHref(next_href)
          }
    
        }
      }
    }
  }

  return shortCutInfo;
}

const saveToLocalStorage = async(name, obj) =>{
  let dynamicRecord = {}
  dynamicRecord[name] = obj
  const constRecord = dynamicRecord;

  await chrome.storage.local.set(constRecord, async() => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    }

    // updating cache
    shortcut.set({});
    const shortCutInfo = prepareDataToCache(obj)
    
    await shortcut.set(shortCutInfo).catch(e => {
      console.log(e);
    });

  }).catch(e => {
    console.log(e);
  });
  
  // CODE HERE WILL NOT RUN, idk why...

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


var shortcut = {
  // (A) SET SHORTCUT KEYS TO LISTEN TO
  listen: null,
  set: (listen) => {
    // (A1) KEY SEQUENCE + FUNCTION TO RUN
    shortcut.listen = listen;

    // (A2) KEY PRESS LISTENERS
    window.addEventListener('keydown', (evt) => {
      shortcut.track(evt.key.toLowerCase(), true);
    });
    window.addEventListener('keyup', (evt) => {
      shortcut.track(evt.key.toLowerCase(), false);
    });
  },

  // (B) KEY PRESS SEQUENCE TRACKER
  sequence: [],
  track: (key, direction) => {
    // (B1) PREVENT AUTO CLEANING
    if (shortcut.junk != null) {
      clearTimeout(shortcut.junk);
    }

    // (B2) KEY DOWN
    if (direction) {
      if (!shortcut.sequence.includes(key)) {
        shortcut.sequence.push(key);
      }
    }

    // (B3) KEY UP
    else {
      let idx = shortcut.sequence.indexOf(key);
      if (idx != -1) {
        shortcut.sequence.splice(idx, 1);
      }
    }

    // (B4) HIT SHORTCUT?
    if (shortcut.sequence.length != 0) {
      let seq = shortcut.sequence.join('-');
      if (shortcut.listen[seq]) {
        shortcut.sequence = [];
        shortcut.listen[seq]();
      }

      // (B5) PREVENT "STUCK SEQUENCE" WHEN USER LEAVES PAGE
      // E.G. OPEN NEW TAB WHILE IN MIDDLE OF KEY PRESS SEQUENCE
      else {
        shortcut.junk = setTimeout(shortcut.clean, 600);
      }
    }
  },

  // (C) AUTO CLEANUP
  junk: null,
  clean: () => {
    shortcut.junk = null;
    shortcut.sequence = [];
  },
};
      
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

function getShortcut(keySequence){
  return new Array(...keySequence).join('-').toLowerCase();
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
async function onOffLocal(){
  const site = getSiteUrlIdentifier();

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

let keySequence = new Set()
let keySequenceStack = []
async function newShortcut(){
  READ_ACTIVE = false;
    document.addEventListener('keydown', async (e) =>{
      
      
      if(e.key.toLowerCase() !== "enter"){
        if(e.key.toLowerCase() === "backspace"){
          keySequence.delete(keySequenceStack.pop())
        }
        else{
          keySequence.add(e.key.toLowerCase());
          keySequenceStack.push(e.key.toLowerCase())
        }
        
        return
      }
      
      let shortcut = getShortcut(keySequence);
      keySequence.clear()
      keySequenceStack = []
      

      document.body.addEventListener('click', async (e) => {
         if(READ_ACTIVE || shortcut.length === 0){
           return
        }
        
        READ_ACTIVE = true;
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
          }

          keySequence.clear()
          keySequenceStack = []
          shortcut = ""
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
    alert("not found any shortcuts for this site: " + site)
    return
  }
  
  shortcutrsArr = presentShortcuts.data
  
  let overridingShourtcutIndex = getIndefOfShortcut(shortcutrsArr, shortcutToDelete)
  
  let shortcutInfo = {}
  if(overridingShourtcutIndex === -1){  // not found shortcut
    alert("not found shortcut: " +  shortcutToDelete + ". Nothing deleted")
    return
  }else{  // delete shortcut
    shortcutInfo = shortcutrsArr[overridingShourtcutIndex] 
    shortcutrsArr.splice(overridingShourtcutIndex, 1);
  }

   await saveToLocalStorage(site, {"data": shortcutrsArr, info: presentShortcuts["info"]}).catch(e => {
    console.log(e);
  });
  
  alert("deleted " + shortcutToDelete +" "+ shortcutInfo["desc"])

}

async function resetStorage(){
  shortcut.set({});



  await clearStorage("storage cleared").catch(e => {
    console.log(e);
  });

  const data = {"data": [], "info": {"enabled": isExtensionEnabled}}
  await saveToLocalStorage(getSiteUrlIdentifier(), data)
}



//// EVENT LISTENER && HANDLER //////// EVENT LISTENER && HANDLER //////// EVENT LISTENER && HANDLER ////
//@desc: main message listener(s) and handler for extension

chrome.runtime.onMessage.addListener(async function(request){
  
  // temp, just to check sth
  if(request === "show_shortcuts"){
    const data = await readLocalStorage(getSiteUrlIdentifier())
    alert(JSON.stringify(data))
    return
  }

  if(request === 'onOff_local'){
    onOffLocal()
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


document.onkeydown = function (e) {
  //remove this function if you dont want to block default action
  // normalize event
  e = e || window.event;

  // detecting multiple keys, e.g: Ctrl + shift + k and block default action (in edge it duplicates tab)
  if (e.ctrlKey && !e.altKey && e.shiftKey && e.keyCode === 75) {
    //75 means k [*]
    // prevent default action
    if (e.preventDefault) {
      e.preventDefault();
    }
    // IEalert
    e.returnValue = false;
  }
};


window.addEventListener('load', async (event) => {

  try {
    const data = await readLocalStorage(getSiteUrlIdentifier())
    const shortCutInfo = prepareDataToCache(data)
    
    if(!data || !data.info){
      alert("no data")
      return
    }
  
    isExtensionEnabled = data.info.enabled;
    
    await shortcut.set(shortCutInfo).catch(e => {
      console.log(e);
    });
  
  } catch (err) {
    const data = {"data": [], "info": {"enabled": true}}
    await saveToLocalStorage(getSiteUrlIdentifier(), data)

  }

})


