const elem = document.getElementById('verif');

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function fetchReq(id){
    
try{
    const resp = await fetch(`/api/v1/auth/req-verify/${id}`);
    /*
    TO DO:
        make the api return various strings, the plan is to have some limitation on the number of these
        req verif requests, when that limit is reached a calmdown should be imposed on this id for a few hours.
    */
    if (!resp.ok){
        const re = await resp.json();

        if (re.msg == 'Requested verify link less than 30 mins ago'){
            elem.innerHTML = "You requested a verify link less than 30 mins ago, please wait."
            return;
            }
        else 
            throw Error("");
    }

    window.location.href = "verif-conf.html";
}
    catch (err){
        elem.innerHTML = "Something went wrong please try logging in again";
    }
}

document.addEventListener('DOMContentLoaded', async () => 
    {
        const id = getQueryParam('id');
        if (!id){
            elem.innerText = "No id was found in url.";
            return;
            }
        
        btn = document.createElement('button');
        btn.innerText = "Click here";
        btn.addEventListener('click', () => { 
            btn.disabled = true;
            btn.innerText = "Processing..";
            fetchReq(id);
        });
        elem.appendChild(btn);

    }
)


