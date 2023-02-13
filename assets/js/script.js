const API_ROOT_URL = 'https://fantasy.premierleague.com/api/';
const GENERIC_ENDPOINT = 'bootstrap-static/'; // events, teams, elements, elemt_types = gameweeks, teams, players, player position categories (DEF, MID, etc...)
const EVENT_ENDPOINT = 'event/' // '{event_id}/live/' # Gameweek Live Data requires event id
const FIXTURES_ENDPOINT = 'fixtures/';
const DREAM_TEAM_ENDPOINT = 'dream-team/' // reqires gameweek id --> 8/
const MANAGER_ENDPOINT = 'entry/';
const MANAGER_TEAM_ENDPOINT = 'my-team/';
const NUM_OF_TO_TRANSFERS = 10;

const TRANSFERS_SHEET = "TransfersLog";
const PLAYERS_SHEET = "allPlayers";
const LEAGUE_SHEET = "Leauge";

const MANAGERS = {
    "vanBasten's children": '4168120',
    'LiverManU': '9149653',
    'Marci': '6375429',
    'New-Potion United': '9477513',
    'Kőbányáért': '9536601',
    'Fußball legends': '4177208'
  }

const CREDENTIALS_FORM = document.getElementById('credentials-form');
const NAV_LOGIN_LINK = document.getElementById('nav-login-link');

let fullUrl;
let rememberMe = false;

var testElement = document.getElementsByClassName("navbar-brand")[0];
testElement.style.color = 'red';


// checking if email and key are in storage and if so, fade the Access details link in navbar
function styleNavLogin() {
    let lsKey = localStorage.getItem("fplKey");
    let lsEmail = localStorage.getItem("fplEmail");
    let ssKey = sessionStorage.getItem("fplKey");
    let ssEmail = sessionStorage.getItem("fplEmail");
    if (!(
        (lsEmail === null || lsEmail == "" || lsKey === null || lsKey == "" ) &&
        (ssEmail === null || ssEmail == "" || ssKey === null || ssKey == "" )
    )
    ) {
        NAV_LOGIN_LINK.style.opacity = "0.4";
    } else {
        NAV_LOGIN_LINK.style.opacity = "1";
    }
}
styleNavLogin();

/*
* Fetching my own G-Sheet API with the following parameters
* - 
*/
function fetchAPI(fullUrl) {
    console.log("Function call fetch")
    let response;
    let count = 0;
    let maxTries = 30;
    let options = {
        method: 'GET',
        mode: 'no-cors'
    }
    while(true) {
      try{
        fetch(fullUrl, options)
            .then((response) => (response))
            .then((data) => console.log(data));

        break;
      }
      catch(e){
        console.log('Foo');
        console.log(e);
        console.log(fullUrl);
        if (++count == maxTries) throw e;
      }
    }
    return response
  }

  fetchAPI(`${API_ROOT_URL}${GENERIC_ENDPOINT}`)

  function credentialsSubmit(e) {
    e.preventDefault();
    // get the details from the form
    let emailElement = document.getElementById("inputEmail");
    let apiKeyElement = document.getElementById("inputApiKey");
    let emailStr = emailElement.value;
    let apiKeyStr = apiKeyElement.value;
    // validation is done on form for email address, no other validition at this stage
    
    // if 'remember me' checkbox ticked, use localStorage: data is not deleted when the browser is closed, and are available for future sessions
    // if 'remember me' checkbox unticked, use sessionStorage: data is deleted when the browser window is closed
    rememberMe = document.getElementById("checkRemember").checked;
    if (rememberMe) {
        // write credentials into local storage
        localStorage.setItem("fplEmail", emailStr);
        localStorage.setItem("fplKey", apiKeyStr);
        sessionStorage.removeItem("fplEmail");
        sessionStorage.removeItem("fplKey");
    } else {
        // write credentials into Session storage and remove them from local storage
        sessionStorage.setItem("fplEmail", emailStr);
        sessionStorage.setItem("fplKey", apiKeyStr);
        localStorage.removeItem("fplEmail");
        localStorage.removeItem("fplKey");
    }
    // close modal
    $("#loginModal").modal('hide');
    styleNavLogin();
    return false;
  }

  