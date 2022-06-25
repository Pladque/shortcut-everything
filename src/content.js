//// GLOBAL VALUES ///////// GLOBAL VALUES ///////// GLOBAL VALUES ///////// GLOBAL VALUES /////

var READ_ACTIVE = true;
var isExtensionEnabled = true;
let autoCheckInnerTextChange = true;

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


const ATTRIBIUTES_TO_SKIP = ["href"]  
const NOT_WORKING_TAGS = ["svg", "ellipse", "path"]
const TAGS_TO_SELECT = ["input"]

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

// clears only local storage (no cache update)
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

// saves to local storage & updates cache
async function saveToLocalStorage(name, obj){
  let dynamicRecord = {}
  dynamicRecord[name] = obj
  const constRecord = dynamicRecord;
  await chrome.storage.local.set(constRecord, async() => {
  if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    }
  });
  
  // updating cache
  shortcut.set({});
  const shortCutInfo = prepareDataToCache(obj)
  await shortcut.set(shortCutInfo);

}

///// STORAGE RELATED / CACHE ////////// STORAGE RELATED / CACHE ////////// STORAGE RELATED / CACHE ////////// STORAGE RELATED / CACHE /////

// prepares data from memory to save inside cache
function prepareDataToCache(data){
  let shortCutInfo = {}
  for(let i = 0; i < data.data.length; i++){
    shortCutInfo[data.data[i].shortcut] = () => {
      if(isExtensionEnabled && data.data[i].options.enabled){
        // setInterval(function () {isExtensionEnabled = true}, 1000);
        // isExtensionEnabled = false;
        const savedShortCut = data.data[i]
        if(savedShortCut && READ_ACTIVE){
          let elem = getElementWithProperties(savedShortCut) 
          if(elem === null && autoCheckInnerTextChange){
            data.data[i].attributes.others.checkInnerText = ! data.data[i].attributes.others.checkInnerText;
            saveToLocalStorage(getSiteUrlIdentifier(), data)
            elem = getElementWithProperties(data.data[i]) 
          }
          
          // // DEBUG
          // alert(elem.getAttributeNames())
          // if(elem.getAttributeNames().length >=1){
          //   alert(elem.getAttribute(elem.getAttributeNames()[0]))
          // }


          ///
          if(elem === null){
            alert("ERROR, cannot element")
          }
          else{
            // alert(elem.getAttributeNames())
            try {
              if(TAGS_TO_SELECT.includes(elem.tagName.toLowerCase())){
                selectText(elem)
              }else{
                elem.click();
              }

            } catch (error) {
              alert("Ups, something went wrong")
              alert("Try add " + elem.tagName + " to NOT_WORKING_TAGS in config file (remember to delete this shortcut and add again)")
            }
            // elem.dispatchEvent(new Event('click'));
            // goToHref(next_href)
          }
    
        }
        // isExtensionEnabled = true;
        // onOffLocal();
      }
    }
  }

  return shortCutInfo;
}

// resets storage & cache
async function resetStorage(){
  shortcut.set({});

  await clearStorage("storage cleared").catch(e => {console.log(e);});

  const data = {"data": [], "info": {"enabled": isExtensionEnabled}}
  await saveToLocalStorage(getSiteUrlIdentifier(), data)
}

async function updateCache(){
   try {
    const data = await readLocalStorage(getSiteUrlIdentifier())
    const shortCutInfo = prepareDataToCache(data)
    
    isExtensionEnabled = data.info.enabled;
    await shortcut.set(shortCutInfo);
  
  } catch (err) {
    const data = {"data": [], "info": {"enabled": true}}
    await saveToLocalStorage(getSiteUrlIdentifier(), data)
  }

}


//// SHORTCUT READER //////// SHORTCUT READER //////// SHORTCUT READER //////// SHORTCUT READER ////
//@desc: main object that listens for key inputs and runs code realted to given shortcut

var shortcut = {
  // (A) SET SHORTCUT KEYS TO LISTEN TO
  listen: null,
  set: (listen) => {
    // (A1) KEY SEQUENCE + FUNCTION TO RUN
    shortcut.listen = listen;

    // (A2) KEY PRESS LISTENERS
    window.addEventListener('keydown', (evt) => {
      if (evt.key){
        shortcut.track(evt.key.toLowerCase(), true);
      }
    });
    window.addEventListener('keyup', (evt) => {
      if (evt.key){
        shortcut.track(evt.key.toLowerCase(), false);
      }
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

function getJSONfieldNames(jsonObject){
  fieldNames = []
  for (key in jsonObject) {
    if (jsonObject.hasOwnProperty(key)) {
       fieldNames.push(key);
    }
  }

  return fieldNames

}

function selectText(input) {
  input.focus();
  input.select();
}

function triggerFocus(element) {
    var eventType = "onfocusin" in element ? "focusin" : "focus",
        bubbles = "onfocusin" in element,
        event;

    if ("createEvent" in document) {
        event = document.createEvent("Event");
        event.initEvent(eventType, bubbles, true);
    }
    else if ("Event" in window) {
        event = new Event(eventType, { bubbles: bubbles, cancelable: true });
    }

    element.focus();
    element.dispatchEvent(event);
}

// returns inner text that belongs only to given element, excludes children innerTexts
function onlyElementInnerText(el){
  child = el.firstChild,
  texts = [];

  while (child) {
      if (child.nodeType == 3) {
          texts.push(child.data);
      }
      child = child.nextSibling;
  }

  var text = texts.join("");

  return text
}

function matchRequest(request, msg){
  return request.substr(0, msg.length) === msg
}


//// GETs //////// GETs //////// GETs //////// GETs //////// GETs //////// GETs //////// GETs ////

function getSiteUrlIdentifier(){
  const url = getURL();
  return parseURL(url)
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

function getURL(){
  return window.location.href
}

// recursively looks for childWannaBe in All childern of parent(and childer of children, and so on)
// return children if found or null if not found
function getChild(parent, childWannaBe){
   const childPropertiesJSON = JSON.parse(childWannaBe);

  for(let i = 0; i< parent.children.length; i++) {
    const childAttributes = parent.children[i].getAttributeNames();
    let check = true;
    for(let j = 0; j<childAttributes.length; j++){

      if( parent.children[i].getAttribute(childAttributes[j]) !== childPropertiesJSON[childAttributes[j]]){
        check = false
        break;
      }
    }

    if(check){
      return parent.children[i]
    }else{
      const possibleChild = getChild(parent.children[i], childWannaBe)
      if(possibleChild !== null)
      {
        return possibleChild
      }
    }

  }

  return null

}

// @DESC: based on properies/attributes (like for example class name) returns matched element from
//        currently open webpage
// @INPUT: properties in JSON format as a string
// @RETURNS: href that matches element with given properties or string "null" if not found   
function getElementWithProperties(elementProperties){
  const allElements = document.body.getElementsByTagName("*");
  let elementPropertiesJSON = {}
  elementPropertiesJSON = JSON.parse(elementProperties.attributes.targetAttributes);


  const innerText = elementProperties.attributes.others.innerText
  const checkInnerText = elementProperties.attributes.others.checkInnerText

  let wantedElement = null;  

  let currentIndex = 0;
  let indexOfWantetElement = 0


  let maxNoMatchingFields = 0;
  const optionsJSON =  elementProperties.options

  if(optionsJSON.maxAmonutOfAttribiutesToSkip){
    maxNoMatchingFields = optionsJSON.maxAmonutOfAttribiutesToSkip;
    // alert(optionsJSON.maxAmonutOfAttribiutesToSkip)
  }

  if(elementProperties.options.elementIndex){
    indexOfWantetElement = +elementProperties.options.elementIndex
  }

  const skippableAttribiutes = optionsJSON.skipableAttribiutes || [];

  // alert(skippableAttribiutes)

  const attributes_names = getJSONfieldNames(elementPropertiesJSON)
  let noMatchingFields = 0;
  let matchingElements = []
  for(let i =0; i<allElements.length; i++){
    let skippedAttribiutes = 0;

    for(let j = 0; j<attributes_names.length; j++){

      if(ATTRIBIUTES_TO_SKIP.includes(attributes_names[j])){
        skippedAttribiutes++;
        continue;
      }

      if(allElements[i].getAttribute(attributes_names[j]) !== elementPropertiesJSON[attributes_names[j]]){
        noMatchingFields++;
      }

      if(!skippableAttribiutes.includes(attributes_names[j])){
        break;
      }

      if(noMatchingFields > maxNoMatchingFields){
        break;
      }

    }

    if( noMatchingFields <= maxNoMatchingFields && attributes_names.length >= skippedAttribiutes)
    {
      if(onlyElementInnerText(allElements[i]) === innerText || checkInnerText===false){
        // if(currentIndex === indexOfWantetElement){
          
        //   wantedElement = allElements[i]
        //   break;
        // }else{
        //   currentIndex++;
        // }

         matchingElements.push({
          "noMatchingFields": noMatchingFields,
          "element": allElements[i],
        })

      }

    }

    noMatchingFields = 0;
  }


  function compare( a, b ) {
    if ( a.noMatchingFields < b.noMatchingFields ){
      return -1;
    }
    if ( a.noMatchingFields > b.noMatchingFields ){
      return 1;
    }
    return 0;
  }

  matchingElements.sort( compare );

  // for(let i = 0; i< matchingElements.length; i++){
  //   console.error(JSON.stringify(matchingElements[i]))
  // }
  
  if(matchingElements.length >=1){
    // console.error(JSON.stringify(matchingElements[indexOfWantetElement]))
    return  matchingElements[indexOfWantetElement].element;
  }else{
    return null
  }
  
}

function createArrFromAttribiutes(target){
  var temp_button_data = {};
  const attrsNames = target.getAttributeNames();

  for(let i =0; i<attrsNames.length; i++){
    if(ATTRIBIUTES_TO_SKIP.includes(attrsNames[i])){
      continue;
    }

    temp_button_data[attrsNames[i]] =  target.getAttribute(attrsNames[i]);
  }

  return temp_button_data;
}

// @DESC: Gets data from object (element) user clicked on 
// @INPUT: event
// @RETURNS: all data from event.target but "href"
// @TODO: make sth like "attributesToSkip" and put href inside, so in the future
//        we were able to exclude more attributes easly            
async function getButtonInfo(e){
  e = e || window.event;
  var target = e.target || e.srcElement
  
  const orginalTarget = target
  while(NOT_WORKING_TAGS.includes(target.tagName)){
    target = target.parentElement;
  }

  let button_data = {}
  button_data.targetAttributes = JSON.stringify(createArrFromAttribiutes(target))

  // if(target !== orginalTarget){
  //   button_data.orginalTargetAttributes = JSON.stringify(createArrFromAttribiutes(orginalTarget))
  // }

  button_data.others = {checkInnerText: true}
  button_data.others.innerText = onlyElementInnerText(orginalTarget)

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

// global value to save somewhere entered shortcut
globalShortcut = "none"
async function newShortcut(shortcut){
  READ_ACTIVE = false;

      
  globalShortcut = shortcut  
  document.body.addEventListener('click', async (e) => {
    if(READ_ACTIVE || shortcut === undefined){
      return
    }
    shortcut = globalShortcut

    
    READ_ACTIVE = true;
    
    const elementPropertiesWithOrginal = await getButtonInfo(e).catch(e => {
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
    const shortcutInfoObj = {
      "shortcut": shortcut, 
      "attributes": elementPropertiesWithOrginal, 
      "desc": description, 
      "options": {
        enabled: true, 
        skipableAttribiutes:    Object.keys(JSON.parse(elementPropertiesWithOrginal.targetAttributes)),
        maxAmonutOfAttribiutesToSkip: 0,
      }
    }

    if(presentShortcuts === null || presentShortcuts === undefined){
      await saveToLocalStorage(site,  {"data": [ shortcutInfoObj ], "info": {"enabled": true} }).catch(e => {
        console.log(e);
      });
    }else{
      shortcutrsArr = presentShortcuts["data"]
      
      let indexOfShortcut = getIndexOfShortcut(shortcutrsArr, shortcut)
      
      if(indexOfShortcut === -1){  // add new shortcut
        shortcutrsArr.push(shortcutInfoObj) 
      }else{  // override shortcut
        shortcutrsArr[indexOfShortcut] = shortcutInfoObj
      }

      await saveToLocalStorage(site,  {"data": shortcutrsArr, info: presentShortcuts["info"]}).catch(e => {
          console.log(e);
        });
      }

      shortcut = ""
  }
  , true)

}


async function improveShortcut(shortcut){
  READ_ACTIVE = false;

      
  globalShortcut = shortcut  
  document.body.addEventListener('click', async (e) => {
    if(READ_ACTIVE || shortcut === undefined){
      return
    }
    
    

    
    shortcut = globalShortcut

    
    READ_ACTIVE = true;
    
    const elementPropertiesWithOrginal = await getButtonInfo(e).catch(e => {
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
    const shortcutInfoObj = {"shortcut": shortcut, "attributes": elementPropertiesWithOrginal, "desc": description, "options": {enabled: true  }}

    // alert(JSON.stringify(shortcutInfoObj))

    if(presentShortcuts === null || presentShortcuts === undefined){
      alert("Something went wrong coudnt find shortcut: " + globalShortcut)
    }else{
      shortcutrsArr = presentShortcuts["data"]
      
      let indexOfShortcut = getIndexOfShortcut(shortcutrsArr, shortcut)
      
      if(indexOfShortcut === -1){  // coudn find suach a shortcut
        alert("Something went wrong coudnt find shortcut: " + globalShortcut)
      }else{  // improve shortcut

        let attributesProduct = {"targetAttributes": {}, "others": {}}
        
        const newTargetAttribiutes = JSON.parse(elementPropertiesWithOrginal.targetAttributes);
        const oldTargetAttribiutes = JSON.parse(shortcutrsArr[indexOfShortcut].attributes.targetAttributes);
        
        for (const [key, value] of Object.entries(oldTargetAttribiutes)) {
          // console.error(`${key}: ${value}`);
          // console.error((newTargetAttribiutes)[key])
          // console.error((oldTargetAttribiutes)[key])

          if(newTargetAttribiutes[key] === oldTargetAttribiutes[key]){
            attributesProduct.targetAttributes[key] = newTargetAttribiutes[key]
          }
        }     

        const newTargetothers = (elementPropertiesWithOrginal.others);
        const oldTargetOthers = (shortcutrsArr[indexOfShortcut].attributes.others);
        
        // alert(newTargetothers)

        for (const [key, value] of Object.entries(oldTargetOthers)) {

          if(newTargetothers[key] === oldTargetOthers[key] || key === "checkInnerText"){
            attributesProduct.others[key] = newTargetothers[key]
          }
        }     
        
         
        shortcutrsArr[indexOfShortcut].attributes.targetAttributes = JSON.stringify(attributesProduct.targetAttributes)
        // console.error(JSON.stringify(shortcutrsArr[indexOfShortcut]))
      }

      await saveToLocalStorage(site,  {"data": shortcutrsArr, info: presentShortcuts["info"]}).catch(e => {
          console.log(e);
        });
      }

      shortcut = ""
  }
  , true)

}


async function DeleteShortcut(shortcutToDelete){
  const site = getSiteUrlIdentifier();
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

async function enableDisableShortcut(shortcut){
  try {
    presentShortcuts = await readLocalStorage(getSiteUrlIdentifier()).catch(e => {
      console.log(e);
  });
  } catch (error) {
    
  }

  shortcutrsArr = presentShortcuts["data"];
    
  let indexOfShortcut = getIndexOfShortcut(shortcutrsArr, shortcut);

  presentShortcuts["data"][indexOfShortcut].options.enabled = !presentShortcuts["data"][indexOfShortcut].options.enabled

  saveToLocalStorage(getSiteUrlIdentifier(), presentShortcuts)

}




//// EVENT LISTENER && HANDLER //////// EVENT LISTENER && HANDLER //////// EVENT LISTENER && HANDLER ////
//@desc: main message listener(s) and handler for extension


// Requests listener
chrome.runtime.onMessage.addListener(async function(request){
  // temp, just to make debuging easier
  if(matchRequest(request, GET_SHORTCUTS) ){
    const data = await readLocalStorage(getSiteUrlIdentifier())
    alert(JSON.stringify(data))
    return
  }
  else if(matchRequest(request, ON_OFF_LOCAL_MSG) ){
    onOffLocal();
  }
  else if(matchRequest(request, CREATE_NEW_SHOWRTCUT_MSG) )
  {
    const shortcutStartInd = CREATE_NEW_SHOWRTCUT_MSG.length + REQUEST_SEPARATOR.length
    const shortcut = request.substr(shortcutStartInd,request.length-1)
    // alert(shortcut)
    await  newShortcut(shortcut).catch(e => {console.log(e); });

  }else if( matchRequest(request, CREATE_NEW_DOUBLE_SHOWRTCUT_MSG)){
      const shortcutToImprove = request.split(REQUEST_SEPARATOR)[1]
      improveShortcut(shortcutToImprove)
  } 
  else if( matchRequest(request, DELETE_SHORTCUTS_MSG)){

    const requestTypeLength = DELETE_SHORTCUTS_MSG.length + REQUEST_SEPARATOR.length
    const shortcutToDelete = request.substr(requestTypeLength, request.length - 1).toLowerCase();

    await DeleteShortcut(shortcutToDelete).catch(e => {console.log(e);});
   
  }else if (matchRequest(request, CLEAR_STORAGE_MSG)){
    await resetStorage().catch(e => { console.log(e); });
  }else if (matchRequest(request, UPDATE_CACHE)){
    updateCache();
  }else if(matchRequest(request, ENABLE_DISABLE_SHORTCUT)){
    const shortcut = request.split(REQUEST_SEPARATOR)[1];
    enableDisableShortcut(shortcut);
  }
  else{
    alert("UNKNOWN REQUEST: " + request)
  }
})


// //block default action
// document.onkeydown = function (e) {
//   // normalize event
//   e = e || window.event;

//   // detecting multiple keys, e.g: Ctrl + shift + k and block default action (in edge it duplicates tab)
//   if (e.ctrlKey && !e.altKey && e.shiftKey && e.keyCode === 75) {
//     //75 means k [*]
//     // prevent default action
//     if (e.preventDefault) {
//       e.preventDefault();
//     }
//     // IEalert
//     e.returnValue = false;
//   }
// };

// INIT actions
window.addEventListener('load', async (event) => {
  updateCache()
 

})

