
var redirect_uri = "http://127.0.0.1:5500/index.html";

var client_id = ""; 
var client_secret = "";

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const ARTISTS = "https://api.spotify.com/v1/me/top/artists?offset=0&limit=10";
const TRACKS = "https://api.spotify.com/v1/me/top/tracks?offset=0&limit=10";

const list = document.getElementById('list');
const cover = document.getElementById('cover');
cover.classList.add('hide');

function authorize() {
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-read-playback-state user-top-read user-read-currently-playing";
    window.location.href = url; // Show Spotify's authorization screen
}

function onPageLoad() {
    if( window.location.search.length > 0) {
        handleRedirect();
    } 
}

function handleRedirect() {
    let code = getCode();
    fetchAccessToken(code);

    //remove param from URL
    window.history.pushState("", "", redirect_uri); 
}

function getCode() {
    let code = null;
    const queryString = window.location.search;
    if(queryString.length > 0){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code');
    }
    return code
}

function fetchAccessToken(code) {
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        getSongs();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function getSongs() {
    callApi("GET", TRACKS, null, handleSongResponse);
}

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("access_token"));
    xhr.send(body);
    xhr.onload = callback;
}

function handleSongResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        songList(data);
        
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function handleArtistResponse() {
    if(this.status == 200) {
        var data = JSON.parse(this.responseText);

        artistList(data);
    } else if(this.status == 401) {
        refreshAccessToken();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
} 

function songList(data) {
    removeItem();
    cover.classList.remove('hide');
    for(i = 0; i < data.items.length; i++) {
        const list_item = document.createElement('div');
        const list_text = document.createElement('div');
        const song = document.createElement('div');
        const artist_album = document.createElement('div');
        const img = document.createElement('img');
        const span = document.createElement('span');
        const popu = document.createElement('div');
        const ref = document.createElement('a');
        const link = document.createTextNode('Link to Spotify');
        ref.appendChild(link);
        ref.title = 'Link to Spotify';
        ref.href = data.items[i].external_urls.spotify;

        list_item.classList.add('list-item');
        list_text.classList.add('list_text');
        song.classList.add('song');
        artist_album.classList.add('artist_album');
        ref.classList.add('links');
        ref.setAttribute('target', 'blank');
        popu.classList.add('popu');
        img.classList.add('resize');

        var li = document.createElement('li');
        img.src = data.items[i].album.images[1].url;

        popu.innerHTML = 'Popularity rating' + data.items[i].popularity;
        span.innerHTML = data.items[i].name;
        artist_album.innerHTML = data.items[i].album.name + '*' + data.items[i].artists[0].name;

        song.appendChild(span);

        list_text.appendChild(song);
        list_text.appendChild(artist_album);
        list_text.appendChild(popu);
        list_text.appendChild(ref);
        list_item.appendChild(list_text);
        list_item.appendChild(img);
        li.appendChild(list_item);

        list.appendChild(li);
    }
}

function removeItem() {
    list.innerHTML = '';
}

function getArtists() {
    callApi("GET", ARTISTS, null, handleArtistResponse);
}

function artistList(data) {
    removeItem();
    API.classList.remove('hide');
    for(i = 0; i < data.items.length; i++) {
        const list_item = document.createElement('div');
        const list_text = document.createElement('div');
        const artist = document.createElement('div');
        const genres = document.createElement('div');
        const img = document.createElement('img');
        const span = document.createElement('span');
        const popu = document.createElement('div');
        const ref = document.createElement('a');
        const link = document.createTextNode('Link to Spotify');
        ref.appendChild(link);
        ref.title = 'Link to Spotify';
        ref.href = data.items[i].external_urls.spotify;

        list_item.classList.add('list-item');
        list_text.classList.add('list_text');
        artist.classList.add('song');
        genres.classList.add('artist_album');
        ref.classList.add('links');
        ref.setAttribute('target', 'blank');
        popu.classList.add('popu');
        img.classList.add('resize');

        var li = document.createElement('li');
        img.src = data.items[i].images[1].url;

        popu.innerHTML = 'Popularity rating' + data.items[i].popularity;
        span.innerHTML = data.items[i].name;

        for(j = 0; j < data.items[i].genres.length; j++) {
            if(j > 1) {
                break;
            } else if(j ==1) {
                genres.innerHTML = genres.innerHTML + "*" + data.items[i].genres[j];
            } else{
                genres.innerHTML = data.items[i].genres[j];
            }
        }

        artist.appendChild(span);

        list_text.appendChild(artist);
        list_text.appendChild(genres);
        list_text.appendChild(popu);
        list_text.appendChild(ref);
        list_item.appendChild(list_text);
        list_item.appendChild(img);
        li.appendChild(list_item);

        list.appendChild(li);
    }
}
