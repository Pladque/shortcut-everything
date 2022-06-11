var READ_ACTIVE = true;
var isOnGlobal = true
// Rework this script:
//    change requests to varaibles, make function from looking for element in memory etc
  

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

function goToHref(h){
    window.location.href = h
}

// @DESC: Compares event.key with avalible shortcuts
// @INPUT: event
// @RETURNS: element properties saved for this shortcut or null if didnt find 
//            
async function readShortcut(e) {
  const site = getSiteUrlIdentifier();
  const avalibleShortcuts = await readLocalStorage(site)
  for(let i =0; i<avalibleShortcuts.length; i++){
    if (e.key === avalibleShortcuts[i]["shortcut"]){
      return avalibleShortcuts[i]["attributes"]
    }
  }

  return null
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

function getShortcut(e){
  return e.key.toLowerCase();
}

function getURL(){
  return window.location.href
}

// @DESC: Parsing an URL to use it as a name while saving
// @INPUT: URL as string, like "https://www.w3schools.com/jsref/jsref_obj_date.asp"
// @RETURNS: "parsed" url -- cuts off everything but "base" website name
//            above URL are going to be parsed to "www.w3schools.com"
function parseURL(url){
    const partlyParsed = url.split('//')  // to seperate "https://"
    const parsed = partlyParsed[1].split('/')[0]  

    return parsed
}

function getSiteUrlIdentifier(){
  const url = getURL();
  return parseURL(url)
}



// event listener && handler
chrome.runtime.onMessage.addListener(async function(request){
  if(request === "onOff_global"){
    isOnGlobal = !isOnGlobal
    alert("extension is on: " + isOnGlobal)
    return
  }else if(request === 'onOff_local'){
    alert("localc on/off ")
    return
  }


  if(!isOnGlobal){
    return
  }
  
  if(request==="new_shortcut")
  {
    READ_ACTIVE = false;
    document.addEventListener('keydown', async (e) =>{
      const shortcut = getShortcut(e);

      document.body.addEventListener('click', async (e) => {

        const elementProperties = await getButtonInfo(e)
        const site = getSiteUrlIdentifier();
    
        let presentShortcuts = null

        try {
          presentShortcuts = await readLocalStorage(site)
        } catch (error) {
          
        }

        const description = "No description provided"
        const shortcutInfoObj = {"shortcut": shortcut, "attributes": elementProperties, "desc": description}


        if(presentShortcuts === null){
          let dynamicRecord = {}
          dynamicRecord[site] = [ shortcutInfoObj ]
          const constRecord = dynamicRecord

          // save shortcuton new website
          await chrome.storage.local.set(constRecord, () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
            }

          });
        }else{
            
            // searching for shortcut to either override it or add as a new one
            let overridingShourtcutIndex = -1;
            for(let i =0; i< presentShortcuts.length; i++){
              if(presentShortcuts[i]["shortcut"] === shortcut){
                overridingShourtcutIndex = i;
                break;
              }
            }

            
            if(overridingShourtcutIndex === -1){  // add new shortcut
              presentShortcuts.push(shortcutInfoObj) 
            }else{  // override shortcut
              presentShortcuts[overridingShourtcutIndex] = shortcutInfoObj
            }


            let dynamicRecord = {}
            dynamicRecord[site] = presentShortcuts
            const constRecord = dynamicRecord;

            // save shortcut on new website
            await chrome.storage.local.set(constRecord, () => {
              if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError.message);
              }

            });

            READ_ACTIVE = true;
        }
      }
      , true)
    });
  } else if(request.length >=2 && request.substr(0, 7) === "Delete_"){

    // alert("deleting shortcut: " + request.substr(7, request.length - 1))

    const site = getSiteUrlIdentifier();
    const shortcutToDelete = request.substr(7, request.length - 1).toLowerCase();

    let presentShortcuts = null
    try {
      presentShortcuts = await readLocalStorage(site)
    } catch (error) {
      
    }

    if(presentShortcuts === null){
      alert("not found aby shortcuts for this site: " + site)
      return
    }

    // searching for shortcut to either override it or add as a new one
    let overridingShourtcutIndex = -1;
    for(let i =0; i< presentShortcuts.length; i++){
      if(presentShortcuts[i]["shortcut"] === shortcutToDelete){
        overridingShourtcutIndex = i;
        break;
      }
    }

    let shortcutInfo = {}
    if(overridingShourtcutIndex === -1){  // not found shortcut
      alert("not found shortcut: " +  request.substr(7, request.length - 1) + ". Nothing deleted")
      return
    }else{  // override shortcut
      shortcutInfo = presentShortcuts[overridingShourtcutIndex] 
      presentShortcuts.splice(overridingShourtcutIndex, 1);
    }


    let dynamicRecord = {}
    dynamicRecord[site] = presentShortcuts
    const constRecord = dynamicRecord;

    // save shortcut on new website
    await chrome.storage.local.set(constRecord, () => {
      if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
      }
    });

    alert("deleted " + request.substr(7, request.length - 1) +" "+ shortcutInfo["desc"])
  }else if (request ==='RESET_FULL'){

    chrome.storage.local.clear(function() {
      var error = chrome.runtime.lastError;
      if (error) {
          console.error(error);
      }
      alert("storage cleared")
    });

  }
  else{
    alert("UNKNOWN REQUEST: " + request)
  }
  
})

document.addEventListener('keydown', async (e) => {
  if(!isOnGlobal){
    return
  }

  if(READ_ACTIVE){
    const savedShortCut = await readShortcut(e)
    if(savedShortCut){
      const next_href = getHrefFromElementWithProperties(savedShortCut) 
      goToHref(next_href)
    }


  }
});


// split [site] into data: X and sth like site_data: Y