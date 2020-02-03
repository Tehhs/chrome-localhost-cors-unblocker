'use strict';
//handlers for onHeadersReceived callback functions; install(id) and remove(id) depend on this 
let handlers = {} 

//prefs for code I stole 
const prefs = {
  'enabled': false,
  'overwrite-origin': true,
  'overwrite-methods': true,
  'methods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH']
};

//Enable CORS for every tab 
chrome.tabs.query({title:"Output Management"},(res)=>{
    res.forEach( (r) => { 
        cors.install(r.id) 
    })
})

/*
//when a new tab opens, enable CORS for that tab 
chrome.tabs.onCreated.addListener(function(tab) { 
    cors.install(tab.id)
    console.log(tab.url)
})
*/

//when tab updates url, check url and add CORS if need be 
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(changeInfo.status && changeInfo.status == "loading") { 
        processTab(tabId)
    }
});


//if tab gets removed, remove the handles for it and remove the CORS 
chrome.tabs.onRemoved.addListener((tabID, removeInfo)=>{
    if(tabID in handlers) { 
        console.log('Removing handle (if there is any) for tab ID ', tabID)
    }    
})

//tests if the tab has a url we want to disable CORS for, or if a CORS tab should no longer have CORS 
const processTab = (tabID) => { 
    console.log('Processing tab ' + tabID)
    chrome.tabs.get(tabID, (tab)=>{
        const hostname = (new URL(tab.url)).hostname 
        if(hostname == "localhost" && !(tab.id in handlers)) { 
            cors.install(tab.id)
            console.log("Adding handle for tab ", tab)
        } 
        else if (hostname != "localhost" && (tab.id in handlers)) { 
            cors.remove(tab.id)
            console.log('Removing handle for tab ', tab)
        }
        
    })
}

//some code I stole to enable CORS 
const cors = {};
cors.onHeadersReceived = ({responseHeaders}) => {

  if (prefs['overwrite-origin'] === true) {
    const o = responseHeaders.find(({name}) => name.toLowerCase() === 'access-control-allow-origin');
    if (o) {
      o.value = '*';
    }
    else {
      responseHeaders.push({
        'name': 'Access-Control-Allow-Origin',
        'value': '*'
      });
    }
  }
  if (prefs['overwrite-methods'] === true) {
    const o = responseHeaders.find(({name}) => name.toLowerCase() === 'access-control-allow-methods');
    if (o) {
      o.value = prefs.methods.join(', ');
    }
    else {
      responseHeaders.push({
        'name': 'Access-Control-Allow-Methods',
        'value': prefs.methods.join(', ')
      });
    }
  }
  return {responseHeaders};
};

//enable CORS on tab ID 
cors.install = (id) => {
  cors.remove(id);
  const extra = ['blocking', 'responseHeaders'];
  if (/Firefox/.test(navigator.userAgent) === false) {
    extra.push('extraHeaders');
  }

  let newHandler = (details) => cors.onHeadersReceived(details)
  handlers[id] = newHandler
  chrome.webRequest.onHeadersReceived.addListener( newHandler, {
    urls: ['<all_urls>'],
    tabId: id
  }, extra);
};

//remove CORS on tab id 
cors.remove = (id) => {
  chrome.webRequest.onHeadersReceived.removeListener(handlers[id]);
  delete handlers[id]
};





