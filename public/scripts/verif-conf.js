const timeOutDiv = document.getElementById('timeout');
let timeOut = 20;
let rem = timeOut;

setTimeout(() => {window.location.href="index.html"}, timeOut*1000);

timeOutDiv.innerHTML = `<p>You will be redirected to the main page in ${rem} seconds</p>`
setInterval(() => {
    rem -= 1;
    timeOutDiv.innerHTML = `<p>You will be redirected to the main page in ${rem} seconds</p>`
}, 1000);