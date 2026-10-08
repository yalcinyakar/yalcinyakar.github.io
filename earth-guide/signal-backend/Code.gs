/** EARTH Signal Wall. Bind this script to a PRIVATE Google Sheet. */
const ALLOWED_ORIGIN = "https://yalcinyakar.github.io";
const HEADERS = ["id","createdAt","name","kind","message","approved","requestId"];
function onOpen() { SpreadsheetApp.getUi().createMenu("Signal Wall").addItem("Initialize inbox","initializeInbox").addToUi(); }
function initializeInbox() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty("SHEET_ID",book.getId());
  let sheet = book.getSheetByName("Signals") || book.insertSheet("Signals");
  if (!sheet.getLastRow()) sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  if (sheet.getLastRow() > 1) sheet.getRange(2,6,sheet.getLastRow()-1,1).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
}
function inbox_() {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (!id) throw new Error("Run initializeInbox first");
  const sheet = SpreadsheetApp.openById(id).getSheetByName("Signals");
  if (!sheet) throw new Error("Missing inbox"); return sheet;
}
function text_(value,max) { const s=String(value || "").trim(); if(s.length>max) throw new Error("Too long"); return s; }
function sheetText_(value) { return /^[=+@-]/.test(value) ? "'" + value : value; }
function safeJson_(value) { return JSON.stringify(value).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029"); }
function publishedMessages_(sheet) {
  if (sheet.getLastRow()<2) return [];
  return sheet.getRange(2,1,sheet.getLastRow()-1,HEADERS.length).getValues()
    .filter(row=>row[5]===true)
    .slice(-100).reverse().map(row=>({
      id:String(row[0]),date:new Date(row[1]).toISOString(),
      name:String(row[2]).replace(/^'(?=[=+@-])/,"").slice(0,80),
      kind:String(row[3]),message:String(row[4]).replace(/^'(?=[=+@-])/,"").slice(0,2000)
    }));
}
function doGet(e) {
  const callback=String((e&&e.parameter&&e.parameter.callback)||"");
  if(callback && !/^earthSignals_[a-f0-9]{32}$/.test(callback)) return ContentService.createTextOutput("Invalid callback");
  let result; try { result={ok:true,messages:publishedMessages_(inbox_())}; } catch(error) { result={ok:false,messages:[]}; }
  const json=safeJson_(result);
  return ContentService.createTextOutput(callback?callback+"("+json+");":json)
    .setMimeType(callback?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);
}
function receipt_(nonce,ok,code) {
  const payload=safeJson_({type:"earth-signal-receipt",nonce,ok,code});
  return HtmlService.createHtmlOutput("<!doctype html><html><body><p>"+(ok?"Received for review.":"Message not saved.")+"</p><script>window.top.postMessage("+payload+","+JSON.stringify(ALLOWED_ORIGIN)+");<\/script></body></html>")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function doPost(e) {
  const p=(e&&e.parameter)||{},nonce=String(p.nonce||"");
  if(!/^[a-f0-9-]{36}$/.test(nonce)) return receipt_("",false,"invalid");
  let lock;
  try {
    const requestId=text_(p.requestId,36),name=text_(p.name,80)||"Anonymous visitor",message=text_(p.message,2000),kind=text_(p.kind,20);
    if(!/^[a-f0-9-]{36}$/.test(requestId)||!message||p.consent!=="yes"||p.website||!["Hello","Question","Correction"].includes(kind)) return receipt_(nonce,false,"invalid");
    lock=LockService.getScriptLock(); if(!lock.tryLock(5000)) return receipt_(nonce,false,"busy");
    const sheet=inbox_(),last=sheet.getLastRow();
    // Retried requests reuse the same ID, including after an uncertain timeout.
    if(last>=2 && sheet.getRange(2,7,last-1,1).getValues().some(r=>String(r[0])===requestId)) return receipt_(nonce,true,"duplicate");
    const props=PropertiesService.getScriptProperties(),day=new Date().toISOString().slice(0,10);
    let usage=JSON.parse(props.getProperty("DAILY_USAGE")||"{}"); if(usage.day!==day)usage={day,count:0};
    if(usage.count>=200) return receipt_(nonce,false,"busy");
    sheet.insertRowAfter(1);
    sheet.getRange(2,1,1,HEADERS.length).clearFormat();
    sheet.getRange(2,6).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
    sheet.getRange(2,1,1,HEADERS.length).setValues([[Utilities.getUuid(),new Date().toISOString(),sheetText_(name),kind,sheetText_(message),false,requestId]]);
    SpreadsheetApp.flush();
    usage.count++;props.setProperty("DAILY_USAGE",JSON.stringify(usage));
    return receipt_(nonce,true,"pending");
  } catch(error) { return receipt_(nonce,false,"unavailable"); }
  finally { if(lock&&lock.hasLock())lock.releaseLock(); }
}
