let has_executed = false
document.addEventListener('DOMContentLoaded',function(){
    main();
    has_executed = true;
});

function main(){

    console.log("main.js has been loaded and executed successfully.");

    document.getElementById('textNoteManagerButton').addEventListener('click',function(){
        chrome.tabs.create({url: chrome.runtime.getURL('text-note/main-dashboard/text-not-manager.html')});
    });
}

if (has_executed == false){
    main();
}