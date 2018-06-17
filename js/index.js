"use strict";

var categorias = ['hats', 'space', 'funny', 'sunglasses', 'boxes', 'caturday', 'ties', 'dream', 'sinks', 'clothes'];
var urlCats = 'http://thecatapi.com/api/images/get?format=xml&results_per_page=20';
var urlFavs = 'http://localhost:3000/favoritos';
var urlLikes = 'http://localhost:3000/likes';
var urlVotos = 'http://localhost:3000/votos';
var xmlData;
var xmlDataFav;
var xmlDataLikes;
var urlChange = urlCats;
var id;

window.onload = function(){
    id = getCookie('idUsu');
    controlador();
};

async function controlador(){
    xmlData = await datos_XML(urlCats);
    xmlDataFav = await load_JSON(urlFavs);
    xmlDataLikes = await load_JSON(urlLikes);

    listaCategorias();
    imprimir(urlCats); 
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

//--------------------CARGA DEL JSON--------------------------
function load_JSON(url) {
    return new Promise(function(carga, nocarga) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("get", url, true);
        xhttp.responseType = "json";
        xhttp.onload = function() {
            var status = xhttp.status;
            if (status == 200) {
                carga(xhttp.response);
            } else {
                nocarga(status);
                alert("Algo fue mal.");
            }
        }
        xhttp.send();
    });
}
//---------------------------------------------------------------

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
        var content = document.getElementById('search-content');
        content.innerHTML = '';
        imprimir(urlChange); 
    });
}


async function imprimir(url){
    console.log('Funcion imprimir');
    var zonaFav = await load_JSON(urlFavs + '?idUsu=' + id);
    var zonaLikes = await load_JSON(urlLikes + '?idUsu=' + id);
    var zonaVotos = await load_JSON(urlVotos + '?idUsu=' + id);
    xmlData = await datos_XML(url);

    var content = document.getElementById('search-content');
    //    content.innerHTML = '';

    var imagenes = xmlData.getElementsByTagName('image');
    var tabla = document.createElement('table');
    tabla.classList.add('tabla');

    if(document.cookie){

        var botonZona = document.createElement('input');
        botonZona.setAttribute('style', 'margin-top: 2%; margin-left: 89%; margin-bottom: 2%;');
        botonZona.setAttribute('type' , 'button');
        botonZona.setAttribute('id' , 'botonZona');  
        botonZona.setAttribute('value' , ' Mi zona');
        content.appendChild(botonZona);
        
        botonZona.addEventListener('click', function(){
            window.location.href = 'html/LikesyMegustas.html';
        });
        
         var botonVotos = document.createElement('input');
        botonVotos.setAttribute('style', 'margin-top: 2%;  margin-bottom: 2%;');
        botonVotos.setAttribute('type' , 'button');
        botonVotos.setAttribute('id' , 'botonVotos');  
        botonVotos.setAttribute('value' , ' VOTOS');
        content.appendChild(botonVotos);
        
        botonVotos.addEventListener('click', function(){
            window.location.href = 'html/misVotos.html';
        });
        
        
         var botonLogout = document.getElementById('logout');
                botonLogout.setAttribute('style', 'display:block');
                botonLogout.innerHTML = getCookie('nombreUsu') + ' Cerrar sesion';
                botonLogout.addEventListener('click', function() {
                    logout('nombreUsu');
                    logout('idUsu');
                    botonLogout.setAttribute('style', 'display:none');
                    content.innerHTML = '';
                    imprimir(urlCats);
                });

    }

    for (var i = 0; i < imagenes.length; i++){

        var fila = document.createElement('tr');
        tabla.appendChild(fila);

        for(var j =0; j < 4; j++){

            var urlImagen = imagenes[i].getElementsByTagName('url')[0].textContent;

            var celda = document.createElement('td');

            var img = document.createElement('img');
            img.classList.add('fotos');

            var contentIcons = document.createElement('div');
            contentIcons.setAttribute('style', 'display:none');

            if(document.cookie){

                contentIcons.setAttribute('style', 'display:block');

                //-------------------CLICK FAVORITOS-------------
                var fav = document.createElement('img');
                if(zonaFav == ''){
                    fav.setAttribute('src', 'img/favorites.png');
                }
                for(var b = 0; b < zonaFav.length; b++) {
                    if(urlImagen == zonaFav[b].url) {
                        fav.setAttribute('src', 'img/favorites2.png');
                        fav.setAttribute('id-json', zonaFav[b].id);

                    } else {
                        fav.setAttribute('src', 'img/favorites.png');

                    }
                }

                fav.setAttribute('id', urlImagen);
                fav.classList.add('fav');
                eventoFavoritos(fav);

                contentIcons.appendChild(fav);

                //-------------------CLICK LIKES-------------
                var like = document.createElement('img');
                if(zonaLikes == ''){
                    like.setAttribute('src', 'img/likes.png');
                }

                for(var b = 0; b < zonaLikes.length; b++) {
                    if(urlImagen == zonaLikes[b].url) {
                        like.setAttribute('src', 'img/likes2.png');
                        like.setAttribute('id-json', zonaLikes[b].id);

                    } else {
                        like.setAttribute('src', 'img/likes.png');
                    }
                }

                like.setAttribute('id', urlImagen);
                like.classList.add('like');
                eventoLikes(like);  

                contentIcons.appendChild(like);

                //---------------------SELECT VOTACIÓN---------
                var votosImagen = await load_JSON(urlVotos + '?url=' + urlImagen);

                var votos = document.createElement('select');
                votos.setAttribute('id', urlImagen);
                votos.classList.add('select');

                var puntoValor = '<option value="0" selected>PUNTOS: </option>';
                var punt = 0;

                for(var z = 0; z < zonaVotos.length; z++) {

                    if(urlImagen == zonaVotos[z].url) {
                        punt = zonaVotos[z].puntos;
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
                contentVotos.classList.add('contentVotos');
                contentVotos.setAttribute('id', urlImagen);

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



                //--------------------------------------------------
            } //cierra el if

            img.setAttribute('src', urlImagen);
            img.setAttribute('alt', urlImagen);


            celda.appendChild(img);
            celda.appendChild(contentIcons);

            fila.appendChild(celda);
            if(j != 3){
                i++;  
            } 
        }
    }
    content.appendChild(tabla);
}
//------------------------ACTUALIZAR GALERIA FOTOS -----------
//async function updateGallery(url){
////    console.log('Funcion actualizar fotos');
////    xmlData = await datos_XML(url);
////    //controlador(url);
////    var content = document.getElementById('search-content');
////    var images = xmlData.getElementsByTagName("image");
////    var imagenes = content.getElementsByClassName("fotos");
////
////    //---------------ACTUALIZA LOS LIKES Y ME GUSTA------------------- 
////    if(document.cookie){
////        var zonaFav = await load_JSON(urlFavs + '?idUsu=' + id);
////        var zonaLikes = await load_JSON(urlLikes + '?idUsu=' + id);
////        var zonaVotos = await load_JSON(urlVotos + '?idUsu=' + id);
////
////        var like = content.getElementsByClassName('like');
////        var favoritos = content.getElementsByClassName('fav');
////
////        var contadorVotos = document.getElementsByClassName('contadorVotos');
////        var select = document.getElementsByClassName('select');
////
////        for(var p = 0; p < imagenes.length;p++){    
////            var src = images[p].getElementsByTagName("url")[0].textContent;
////            imagenes[p].setAttribute("src", src);
////            like[p].setAttribute('src', 'img/likes.png');
////            favoritos[p].setAttribute('src', 'img/favorites.png');
////
////
////            //para que actualice la src de los likes, favoritos (y select)  con las imagenes nuevas
////            for(var j = 0; j < zonaLikes.length; j++){
////                if(zonaLikes == ''){
////                    like[p].setAttribute('src', 'img/likes.png');
////                }
////                if(imagenes[p].getAttribute('src') == zonaLikes[j].url){
////                    like[p].setAttribute('src', 'img/likes2.png');
////                }
////            }
////
////            for(var k = 0; k < zonaFav.length; k++){
////                if(zonaFav == ''){
////                    favoritos[p].setAttribute('src', 'img/favorites.png');
////                }
////                if(imagenes[p].getAttribute('src') == zonaFav[k].url){
////                    favoritos[p].setAttribute('src', 'img/favorites2.png');
////                }
////            }
////            
////        if(document.cookie != ""){
////            like[p].setAttribute('id', src);
////            favoritos[p].setAttribute('id', src); 
////            //-------------------------------------------
////            select[p].setAttribute('id', src);
////            contadorVotos[p].setAttribute('id', src);
////        }
////   } 
////} else{
////
////        for(var p = 0; p < imagenes.length;p++){    
////            var src = images[p].getElementsByTagName("url")[0].textContent;
////            imagenes[p].setAttribute("src", src);
////        }
////    }
//    var content = document.getElementById('search-content');
//    content.innerHTML='';
//    imprimir(url);
//}

//----------------EVENTOS BOTONES LIKES Y FAVORITOS-------------

function eventoFavoritos(btn){
    btn.addEventListener('click', function(){
        var urlImg = this.getAttribute('id');
        var contFav = document.getElementsByClassName('contFav');

        if(this.getAttribute('src') == 'img/favorites2.png'){
            this.setAttribute('src', 'img/favorites.png');
            let id = this.getAttribute('id-json');
            borrarFavoritos(id);
        } else {
            this.setAttribute('src', 'img/favorites2.png');
            for(var i = 0; i < contFav.length; i++){
                if((contFav[i].getAttribute('id') == urlImg)){
                    var contadorF = contFav[i].innerHTML;
                    contadorF++;
                    contFav[i].innerHTML = contadorF;
                }
            }
            aniadirFav(urlImg, this);
        }
    });
}

function eventoLikes(btn){
    btn.addEventListener('click', function(){
        var urlImg = this.getAttribute('id');
        var contLike = document.getElementsByClassName('contLike');
        if(this.getAttribute('src') == 'img/likes2.png'){
            this.setAttribute('src', 'img/likes.png');
            let id = this.getAttribute('id-json');
            borrarLikes(id);
        } else {
            this.setAttribute('src', 'img/likes2.png');
            for(var i = 0; i < contLike.length; i++){
                if((contLike[i].getAttribute('id') == urlImg)){
                    var contadorL = contLike[i].innerHTML;
                    contadorL++;
                    contLike[i].innerHTML = contadorL;         
                }
            }
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

//-----------------BORRAR LOS EVENTOS FAVORITOS Y LIKES DEL JSON----------

function borrarFavoritos(id){
    var xhttp = new XMLHttpRequest();
    xhttp.open("delete", 'http://localhost:3000/favoritos' + '/' + id, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();
}

function borrarLikes(id){
    var xhttp = new XMLHttpRequest();
    xhttp.open("delete", 'http://localhost:3000/likes' + '/' + id, true);
    console.log('id ' + id)
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();
}

function logout(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}


