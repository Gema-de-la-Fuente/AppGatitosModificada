"use strict";

var categorias = ['hats', 'space', 'funny', 'sunglasses', 'boxes', 'caturday', 'ties', 'dream', 'sinks', 'clothes'];

var urlCats = 'http://thecatapi.com/api/images/get?format=xml&results_per_page=20';
var xmlData;
var urlChange = urlCats;
var id;
var urlFavs = 'http://localhost:3000/favoritos';
var urlLikes = 'http://localhost:3000/likes';
var urlVotos = 'http://localhost:3000/votos';
var xmlDataFav;
var xmlDataLikes;
var xmlDataVotos;
var id;

window.onload = function(){
    id = getCookie('idUsu');
    console.log('id' + id);
    controlador();
};

async function controlador(){
    xmlData = await datos_XML(urlCats);
    listaCategorias();
    xmlDataFav = await load_JSON(urlFavs);
    xmlDataLikes = await load_JSON(urlLikes);
    xmlDataVotos = await load_JSON(urlVotos);
    
    imprimir(); 
}

function datos_XML(url){
    console.log('Funcion datos_XML');
    return new Promise(resolve => {
        var  xhttp = new XMLHttpRequest();
        xhttp.addEventListener('readystatechange', function() {
            if(this.readyState == 4 && this.status == 200) {
                resolve(this.responseXML);
            }
        });
        xhttp.open("GET", url, true);
        xhttp.send();
    });
}


function listaCategorias() {
    console.log('Funcion crear categorias');
    var lista = '<option value="" selected>Ver todas las categorias</option>';
    for(var i = 0, c = categorias.length; i < c; i++) {
        lista += '<option value="' + categorias[i] + '">' + categorias[i] + '</option>';
    }
    var select = document.getElementById('select-categorias');
    select.innerHTML = lista;
    select.addEventListener('change', function() {
        var option = this.options[this.selectedIndex].value;
        if(option == "Todas las categorías") {
            urlChange = urlCats;
        } else{
            urlChange = urlCats + '&category=' + option + '&size=small';
        }
        console.log('cambio categoria en la url ' + urlChange);
        updateGallery(urlChange); 
    });
}

//---------------CREA LA COOKIE DEL USUARIO LOGEADO

//function getCookie(cname, days){}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

//--------------------CARGA DEL JSON--------------------------


function load_JSON(url) {
    return new Promise(function(carga, nocarga) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("get", url , true);
        xhttp.responseType = "json";
        xhttp.onload = function() {
            var status = xhttp.status;
            if (status == 200) {
                carga(xhttp.response);
            } else {
                nocarga(status);
                alert("Algo fue mal.");
            }
        };
        xhttp.send();
    });
}


async function imprimir(){
    console.log('Funcion imprimir');
    
    var zonaFav = await load_JSON(urlFavs + '?idUsu=' + id);
    var zonaLikes = await load_JSON(urlLikes + '?idUsu=' + id);
    var zonaVotos = await load_JSON(urlVotos + '?idUsu=' + id);
    
    var content = document.getElementById('favoritos');
    var tabla = document.createElement('table');
    tabla.setAttribute('id', 'tabla');
    tabla.classList.add('tabla');

    
    
    for (var i = 0; i < xmlDataFav.length; i++){
        
        if(xmlDataFav[i].idUsu == id){
            var fila = document.createElement('tr');
            tabla.appendChild(fila);

            for(var j = 0; j < 4; j++){
                //console.log('i '+ i);
               // console.log('xmlDataFav '+ xmlDataFav[i].url);
                
                var celda = document.createElement('td');
                var img = document.createElement('img');
                img.classList.add('fotos');
               
                celda.appendChild(img);
                
                //-------------------CLICK FAVORITOS-------------
                var contentIcons = document.createElement('div');
                var fav = document.createElement('img');
                
                if(zonaFav == ''){
                    fav.setAttribute('src', '../img/favorites.png');
                }
                for(var b = 0; b < zonaFav.length; b++) {
                    if(xmlDataFav[i].url == zonaFav[b].url) {
                        fav.setAttribute('src', '../img/favorites2.png');
                        fav.setAttribute('id-json', zonaFav[b].id);
                        break;
                    } else {
                        fav.setAttribute('src', '../img/favorites.png');

                    }
                }

                fav.setAttribute('id', xmlDataFav[i].url);
                fav.classList.add('fav');
                eventoFavoritos(fav);
                contentIcons.appendChild(fav);
               
//--------------------------------------------------------
 //---------------------SELECT VOTACIÓN---------
                
                
                var votosImagen = await load_JSON(urlVotos + '?url=' + xmlDataFav[i].url);
                var votos = document.createElement('select');
                votos.setAttribute('id', xmlDataFav[i].url);
                votos.classList.add('select');

                var puntoValor = '<option value="0" selected>PUNTOS: </option>';
                var punt = 0;

                for(var a = 0; a < zonaVotos.length; a++){
                    if(xmlDataFav[i].url == zonaVotos[a].url) {
                        
                        punt = zonaVotos[a].puntos;
                        break;
                    }
                }
                    

                for(var c = 1; c <= 10; c++){
                    var valor = '';
                    if(punt == c) {
                        votos.setAttribute('disabled', 'disabled');
                        valor = ' selected';
                    }
                    puntoValor += '<option value="' + c +'"' + valor + '>' + c + '</option>';
                }

                votos.innerHTML = puntoValor;
                
                //------------------CONTADOR DE VOTOS-----------------------
               
 
                var contentVotos = document.createElement('div');
                contentVotos.setAttribute('id', xmlDataFav[i].url);
                contentVotos.classList.add('contentVotos');
                

                var num = 0;

                for(var z = 0; z < votosImagen.length; z++) {
                    num += votosImagen[z].puntos;
                }
                

                if((votosImagen.length) == 1){
                    num = num;
                } else {
                    num = Math.round(num/(votosImagen.length+1));
                }


                contentVotos.innerHTML = 'Puntos : ' + num;

                votos.addEventListener('change', function() {
                    var votosSelect = parseInt(this.options[this.selectedIndex].value);
                    var votosPadre = this.parentNode.querySelector('.contentVotos');
                    var votosTotal = parseInt(votosPadre.innerHTML.replace('Puntos : ', ''));
                    var contador = Math.round((votosTotal + votosSelect)/(votosImagen.length+1));
                    votosPadre.innerHTML = 'Puntos : ' + contador;
                    this.setAttribute('disabled', 'disabled');

                    var xhttp = new XMLHttpRequest();
                    xhttp.addEventListener('readystatechange', function() {
                        if(this.readyState == 4 && this.status == 201) {
                        }
                    });
                    xhttp.open("post", urlVotos, true);
                    xhttp.setRequestHeader("Content-Type", "application/json");
                    xhttp.send(JSON.stringify({url: votosPadre.id, idUsu: id, puntos: votosSelect}));
                });

                contentIcons.appendChild(votos);
                contentIcons.appendChild(contentVotos);
                img.setAttribute('src', xmlDataFav[i].url);
                img.setAttribute('alt', xmlDataFav[i].url);

                
                celda.appendChild(contentIcons);
                fila.appendChild(celda);
                if(j != 3) {
                    i++;
                 
                }
                if(xmlDataFav[i] == undefined) {
                    break;
                }
                
            }
        }
    }
    content.appendChild(tabla);

    var content2 = document.getElementById('megusta');
    //    content.innerHTML = '';
    var tabla2 = document.createElement('table');
    tabla2.classList.add('tabla');

    var contentIcons2 = document.createElement('div');
    
    for (var e = 0; e < xmlDataLikes.length; e++){
        if(xmlDataLikes[e].idUsu == id){
            var fila2 = document.createElement('tr');
            tabla2.appendChild(fila2);

            for(var j = 0; j < 4; j++){
                var celda2 = document.createElement('td');
                var img2 = document.createElement('img');
                img2.classList.add('fotos');
                img2.setAttribute('src', xmlDataLikes[e].url);
                img2.setAttribute('alt', xmlDataLikes[e].url);
                celda2.appendChild(img2);
                
//-------------------CLICK LIKES----------------------------------
                
                var contentIcons2 = document.createElement('div');
                var like = document.createElement('img');
                if(zonaLikes == ''){
                    like.setAttribute('src', '../img/likes.png');
                }

                for(var b = 0; b < zonaLikes.length; b++) {
                    if(xmlDataLikes[e].url == zonaLikes[b].url) {
                        like.setAttribute('src', '../img/likes2.png');
                        like.setAttribute('id-json', zonaLikes[b].id);
                        break;
                    } else {
                        like.setAttribute('src', '../img/likes.png');
                    }
                }

                like.setAttribute('id', xmlDataLikes[e].url);
                like.classList.add('like');
                eventoLikes(like);  
                contentIcons2.appendChild(like);
                celda2.appendChild(contentIcons2);
//--------------------------------------------------------------------
                
                //---------------------SELECT VOTACIÓN---------
                
                
                var votosImagen2 = await load_JSON(urlVotos + '?url=' + xmlDataVotos[e].url);
                var votos2 = document.createElement('select');
                votos2.setAttribute('id', xmlDataLikes[e].url);
                votos2.classList.add('select');

                var puntoValor2 = '<option value="0" selected>PUNTOS: </option>';
                var punt2 = 0;

                for(var a = 0; a < zonaVotos.length; a++){
                    if(xmlDataLikes[e].url == zonaVotos[a].url) {
                        punt2 = zonaVotos[a].puntos;
                        break;
                    }
                }
                    

                for(var c = 1; c <= 10; c++){
                    var valor = '';
                    if(punt2 == c) {
                        votos2.setAttribute('disabled', 'disabled');
                        valor = ' selected';
                    }
                    puntoValor2 += '<option value="' + c +'"' + valor + '>' + c + '</option>';
                }

                votos2.innerHTML = puntoValor2;
                
                //------------------CONTADOR DE VOTOS-----------------------
               
 
                var contentVotos2 = document.createElement('div');
                contentVotos2.setAttribute('id', xmlDataLikes[e].url);
                contentVotos2.classList.add('contentVotos2');
                

                var num2 = 0;

                for(var z = 0; z < votosImagen2.length; z++) {
                    num2 += votosImagen2[z].puntos;
                }
                

                if((votosImagen2.length) == 1){
                    num2 = num2;
                } else {
                    num2 = Math.round(num/(votosImagen2.length+1));
                }


                contentVotos2.innerHTML = 'Puntos : ' + num2;

                votos2.addEventListener('change', function() {
                    var votosSelect = parseInt(this.options[this.selectedIndex].value);
                    var votosPadre = this.parentNode.querySelector('.contentVotos2');
                    var votosTotal = parseInt(votosPadre.innerHTML.replace('Puntos : ', ''));
                    var contador = Math.round((votosTotal + votosSelect)/(votosImagen2.length+1));
                    votosPadre.innerHTML = 'Puntos : ' + contador;
                    this.setAttribute('disabled', 'disabled');

                    var xhttp = new XMLHttpRequest();
                    xhttp.addEventListener('readystatechange', function() {
                        if(this.readyState == 4 && this.status == 201) {
                        }
                    });
                    xhttp.open("post", urlVotos, true);
                    xhttp.setRequestHeader("Content-Type", "application/json");
                    xhttp.send(JSON.stringify({url: votosPadre.id, idUsu: id, puntos: votosSelect}));
                });

                contentIcons2.appendChild(votos2);
                contentIcons2.appendChild(contentVotos2);
                img2.setAttribute('src', xmlDataLikes[e].url);
                img2.setAttribute('alt', xmlDataLikes[e].url);

                
                celda2.appendChild(contentIcons2);
                fila2.appendChild(celda2);
                if(j != 3) {
                    e++;
                 
                }
                if(xmlDataLikes[e] == undefined) {
                    break;
                }
                
            }
        }
    }
    content2.appendChild(tabla2); 
}

//----------------EVENTOS BOTONES LIKES Y FAVORITOS-------------

function eventoFavoritos(btn){
    btn.addEventListener('click', function(){
        var urlImg = this.getAttribute('id');

        if(this.getAttribute('src') == '../img/favorites2.png'){
            this.setAttribute('src', '../img/favorites.png');
            var id = this.getAttribute('id-json');
            borrarFavoritos(id);
        } else {
            this.setAttribute('src', '../img/favorites2.png');
                 aniadirFav(urlImg, btn);
            }
           
    });
}

function eventoLikes(btn){
    btn.addEventListener('click', function(){
        var urlImg = this.getAttribute('id');
        
        if(this.getAttribute('src') == '../img/likes2.png'){
            this.setAttribute('src', '../img/likes.png');
            let id = this.getAttribute('id-json');
            borrarLikes(id);
        } else {
            this.setAttribute('src', '../img/likes2.png');
            aniadirLikes(urlImg, this);
        }
    });
}
   
function aniadirFav(url, self){
    var xhttp = new XMLHttpRequest();
    xhttp.addEventListener('readystatechange', function() {
        if(this.readyState == 4 && this.status == 201) {
            var json_back = JSON.parse(this.response);
            self.setAttribute('id-json', json_back.id)
        }
    });
    xhttp.open("post", 'http://localhost:3000/favoritos', true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({url: url, idUsu: id}));
}

function aniadirLikes(url, self){
    var xhttp = new XMLHttpRequest();
    xhttp.addEventListener('readystatechange', function() {
        if(this.readyState == 4 && this.status == 201) {
            var json_back = JSON.parse(this.response);
            self.setAttribute('id-json', json_back.id);
        }
    });
    xhttp.open("post", 'http://localhost:3000/likes', true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({url: url, idUsu: id}));
}

function borrarFavoritos(id){
    var xhttp = new XMLHttpRequest();
    xhttp.open("delete", 'http://localhost:3000/favoritos' + '/' + id, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();
}

function borrarLikes(id){
    console.log('borraLike');
    var xhttp = new XMLHttpRequest();
    xhttp.open("delete", 'http://localhost:3000/likes' + '/' + id, true);
    console.log('id ' + id)
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();
}