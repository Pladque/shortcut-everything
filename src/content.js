var READ_ACTIVE = true;


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

async function readShortcut(e) {
  
  // zamiast "shortcut" powinno byc cos w tylu adresu strony aktualnej
  // sprawdzaj, czy e.key matchuje z elemetem [0] z zapisu

  const temp = await readLocalStorage('shortcut')

  if (e.key === temp[0]){
    return temp[1]
  }else{
    return null
  }
}



function _objectWithoutProperties(obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}

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
  return e.key;
}


// event handler
chrome.runtime.onMessage.addListener(function(request){
  if(request === "on_off"){

  }
  else if(request==="new_shortcut")
  {
    READ_ACTIVE = false;
    document.addEventListener('keydown', async (e) =>{
      const shortcut = getShortcut(e);
      document.body.addEventListener('click', async (e) => {
        const elementProperties = await getButtonInfo(e)
        const record = {"shortcut": [shortcut, elementProperties] }

        // save shortcut
        await chrome.storage.local.set(record, () => {
          if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
          }

          READ_ACTIVE = true;
        });

      }
      , true)
    });
   

  }
})

document.addEventListener('keydown', async (e) => {
  if(READ_ACTIVE){
    const savedShortCut = await readShortcut(e)
    if(savedShortCut){
      const next_href = getHrefFromElementWithProperties(savedShortCut) 
      goToHref(next_href)
    }


  }
});
