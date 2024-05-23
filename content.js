chrome.storage.local.get({ vunData: [] }, (result) => {
  let vunData = result.vunData;
  vunData.forEach(item => {
    let regex = new RegExp(`(${item.text})`, 'gi');
    document.body.innerHTML = document.body.innerHTML.replace(regex, `<span class="vun-underline" title="${item.note}">$1</span>`);
  });
});
