// (async function main () { // the Scope changes and onsubmit function not run from IIFE
const API_ROOT_URL = 'https://fantasy.premierleague.com/api/';
const GENERIC_ENDPOINT = 'bootstrap-static/'; // events, teams, elements, elemt_types = gameweeks, teams, players, player position categories (DEF, MID, etc...)
const EVENT_ENDPOINT = 'event/' // '{event_id}/live/' # Gameweek Live Data requires event id
const FIXTURES_ENDPOINT = 'fixtures/';
const DREAM_TEAM_ENDPOINT = 'dream-team/' // reqires gameweek id --> 8/
const MANAGER_ENDPOINT = 'entry/';
const MANAGER_TEAM_ENDPOINT = 'my-team/';
const NUM_OF_TO_TRANSFERS = 10;
const FPL_API_URL = "https://script.google.com/macros/s/AKfycbwG_NE_vBK39r-IdMYErHKr6VlKa4e4avGqOVhGctjEwojXN2kecxJ7Arwjdg1teqaHeA/exec?"

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

// const CREDENTIALS_FORM = document.getElementById('credentials-form');
const NAV_LOGIN_LINK = document.getElementById('nav-login-link');
const NAV_LOAD_LINK = document.getElementById('nav-load-link');

const PROD = true;

let urlEndpoint;
let rememberMe = false;

var testElement = document.getElementsByClassName("navbar-brand")[0];
testElement.style.color = 'red';


// checking if email and key are in storage and if so, fade the Access details link in navbar
function styleNavLogin() {
    let lsKey = localStorage.getItem("fplKey");
    let lsEmail = localStorage.getItem("fplEmail");
    let ssKey = sessionStorage.getItem("fplKey");
    let ssEmail = sessionStorage.getItem("fplEmail");
    // if credentials present:
    //   - remove disabled from Load League nav item
    //   - style Access details nav item to fade (opacity)
    // in not:
    //   - add disabled to Load League nav item
    //   - style Access details nav item to 'active' (full opacity)

    if (!(
        (lsEmail === null || lsEmail == "" || lsKey === null || lsKey == "" ) &&
        (ssEmail === null || ssEmail == "" || ssKey === null || ssKey == "" )
    )
    ) {
        NAV_LOGIN_LINK.style.opacity = "0.2";
        NAV_LOAD_LINK.classList.remove('disabled');
    } else {
        NAV_LOGIN_LINK.style.opacity = "1";
        NAV_LOAD_LINK.classList.add('disabled');
    }
}
styleNavLogin();


/*
* Fetching my own G-Sheet API with the following parameters
* - 
*/
function fetchAPI(endPoint) {
  let endpointParts = String(endPoint).split('/');
  var returnData;
  if (PROD) {
    let emailAddress = 'miklos.sarosi@gmail.com'
    let kulcs = emailAddress.split('@')[0].split('.')[1].split("").reverse().join("");
    let fullApiUrl = `${FPL_API_URL}email=${emailAddress}&key=${kulcs}&endPoint=${endPoint}`

    return fetch(fullApiUrl)
      .then((response) => 
        (response.json())
      )
      .then((responseJson) => {
        return responseJson.data
      });
  } else {
    // get the json that represents the object returned by the API in production
    // function getTeam(entry, event) uses this URL https://fantasy.premierleague.com/api/entry/6375429/event/23/picks/
    // returns the picks.json
    if (endpointParts[0] == 'entry') {
      if (endpointParts.length > 3) {
        return fetch('./assets/json/picks.json')
          .then((response) => response.json())
          .then((data) => data);
      } else {
        return fetch('./assets/json/manager.json')
          .then((response) => response.json())
          .then((data) => data);
      }
    } else if (endpointParts[0] == 'event') {
      return fetch('./assets/json/live.json')
          .then((response) => response.json());
    } else if (endpointParts[0] == 'bootstrap-static') {
      return fetch('./assets/json/bootstrap-static.json')
          .then((response) => response.json());
    }
    // function getCurrentGameWeek() uses https://fantasy.premierleague.com/api/entry/4168120/
    // returns the manager.json

    // function latestStandings() uses `https://fantasy.premierleague.com/api/event/${gameWeek}/live/` where gameWeek is from getCurrentGameWeek()
    // returns live.json

    // function fetchTransferData() uses : https://fantasy.premierleague.com/api/bootstrap-static/
    // then ['elements'] object (players) contains all data including transfers 
    // the fullUrl returns the entire object (bootstrap-static.json), from which the function uses ['elements']
  }

  // return returnData // TODO: check if data or response is to be returned JSON.parse ???
}

  // fetchAPI(`${API_ROOT_URL}${GENERIC_ENDPOINT}`)

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

function createTable(tableData) {
  let table = document.createElement('table');
  table.classList.add("table");
  table.classList.add("table-striped");
  table.classList.add("table-hover")
  let tableBody = document.createElement('tbody');

  let headerRow = document.createElement('tr');
  headerRow.innerHTML = `
      <th scope="col">Team</th>
      <th scope="col">GameWeek Points</th>
      <th scope="col">Total Points</th>
  `
  tableBody.appendChild(headerRow);

  tableData.forEach(function(rowData) {
    var row = document.createElement('tr');

    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });
  table.appendChild(tableBody);
  // remove loader here before adding the table
  document.getElementsByClassName('loader')[0].remove();
  document.getElementById('league-standing').appendChild(table);
}


async function displayStandings() {
  const input = await latestStandings();
  // Name	Team	GameWeek Points	Total Points	Kapus	points	Player 2	points
  // {LiverManU=[{multiplier=1.0, assists=0.0, goals_scored=0.0, is_captain=false, bps=0.0, total_points=0.0, element=398.0, is_vice_captain=false, position=1.0}, {element=357.0, bps=9.0
  let displayData = [];
  for (let manager of Object.keys(input)) {
    let row = [];
    row.push(manager)
    // gwPoints
    let prWeekNum = await getCurrentGameWeek()
    // debugger;
    let prWeekData = await fetchAPI(`entry/${MANAGERS[manager]}/event/${prWeekNum-1}/picks/`)
    let totalBeforeGw = prWeekData['entry_history']['total_points']

    let displayPlayers = [];
    let gwPoints = 0;
    for (let player of input[manager]) {
      displayPlayers.push(player.element);
      displayPlayers.push(player.total_points);
      if (player.position < 12) {
        gwPoints += player.total_points * player.multiplier;
      }
    }
    row.push(gwPoints);
    row.push(totalBeforeGw + gwPoints);
    row.push(...displayPlayers);
    displayData.push(row);
    displayData.sort(function(m1,m2) {return m2[2] - m1[2];})
  }

  let selectedData = displayData.map(innerArray => innerArray.slice(0,3))
  createTable(selectedData);
}

/**
 * MINDEN CSAPAT AZ AKTUALIS GAMEWEEK-re ES a LEGFRISSEBB PONTSZAMOK 
 * 
 * Returns an object where the key's are the managers' names and teh values are an array of the 15 players, each player has the following object:
 * 
 *   multiplier, assists, goals_scored, is_captain, bps, total_points, element, is_vice_captain, position 
 */
async function latestStandings() {
  try {
    const gameWeek = await getCurrentGameWeek();
    const upToDateURL = `event/${gameWeek}/live/`
    try {
      const currentPlayerArray = await fetchAPI(upToDateURL);
      let currentPlayerData = {};
        for (let player of currentPlayerArray.elements) {
          currentPlayerData[player.id] = {
            'goals_scored': player.stats.goals_scored,
            'bps': player.stats.bps,
            'total_points': player.stats.total_points,
            'assists': player.stats.assists,
            'clean_sheet': player.stats.clean_sheet,
          }
        }
        let leauge = {}
        for (let manager of Object.keys(MANAGERS)) {
          let team = await getTeam(MANAGERS[manager], gameWeek);

          for (let pl of team) {
            pl['total_points'] = currentPlayerData[pl.element].total_points;
            pl['bps'] = currentPlayerData[pl.element].bps;
            pl['goals_scored'] = currentPlayerData[pl.element].goals_scored;
            pl['assists'] = currentPlayerData[pl.element].assists;
          }
          leauge[manager] = team;
          
        }
        return leauge
    } catch(error) {
      console.error(error)
    }
  } catch(error) {
    console.error(error)
  }
}

async function getCurrentGameWeek() {
  let managerId = MANAGERS["vanBasten's children"]; 
  urlEndpoint = `${MANAGER_ENDPOINT}${managerId}/`;
  const currentGWdata = await fetchAPI(urlEndpoint);
  return currentGWdata.current_event  
}

async function getTeam(entry, event) {
  urlEndpoint = `entry/${entry}/event/${event}/picks/`;
  try {
    const getTeamData = await fetchAPI(urlEndpoint);
    return getTeamData['picks'];
  } catch(error) {
    console.error(error)
  }  
}

function areCredentialsPresent() {
  // check if email address and password is in storage(s)
  let lsKey = localStorage.getItem("fplKey");
  let lsEmail = localStorage.getItem("fplEmail");
  let ssKey = sessionStorage.getItem("fplKey");
  let ssEmail = sessionStorage.getItem("fplEmail");
  return !(
      (lsEmail === null || lsEmail == "" || lsKey === null || lsKey == "" ) &&
      (ssEmail === null || ssEmail == "" || ssKey === null || ssKey == "" )
    )  
}

function addLoaderElement() {
  let loader = document.createElement('div');
  loader.classList.add("loader");
  document.getElementById('league-standing').appendChild(loader);
}


function tryReloadingStandings() {
  // check if email address and password is in storage(s)
  let credentialsPresent = areCredentialsPresent();
  console.log(credentialsPresent);
  if (credentialsPresent) {
    // add loader to indicate loading time
    addLoaderElement();
    
    // call the functions to ping the API
    displayStandings();
  }
  // BTW when writing to one Storage, always clear the other, if that's not done yet
  // test what error message comes back when wrong credentials are provided and handle it 
  // display empty table and/or loading snippet to indicate loading time
  // then call displayStandings()
  // displayStandings();
  // add a reload (refresh) button, to call checkEmailPresence() and displayStandings()
}

// tryReloadingStandings();
// let foobar = areCredentialsPresent();
// console.log(foobar);

// })();