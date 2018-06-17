"use strict";

var categorias = ['hats', 'space', 'funny', 'sunglasses', 'boxes', 'caturday', 'ties', 'dream', 'sinks', 'clothes'];

var urlCats = 'http://thecatapi.com/api/images/get?format=xml&results_per_page=20';
var xmlData;
var urlChange = urlCats;
var id;
var urlFav = 'http://localhost:3000/favoritos';
var urlLikes = 'http://localhost:3000/likes';
var urlVotos = 'http://localhost:3000/votos';
var xmlDataFav;
var xmlDataLikes;
var xmlDataVotos;
var votosA = [];

window.onload = function(){
    id = getCookie('idUsu');
    controlador();
};

async function controlador() {
    xmlData = await datos_XML(urlCats);
    listaCategorias();
    xmlDataFav = await load_JSON(urlFav);
    xmlDataLikes = await load_JSON(urlLikes);
    xmlDataVotos = await load_JSON(urlVotos);
    console.log('xmlDataVotos ' + xmlDataVotos);
    imprimir(); 
    
}

function datos_XML(url){
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
    
    var zonaVotos = await load_JSON(urlVotos + '?idUsu=' + id);
    var zonaFav = await load_JSON(urlFav + '?idUsu=' + id);
    var zonaLikes = await load_JSON(urlLikes + '?idUsu=' + id);

    
    var content = document.getElementById('votos');
    var tabla = document.createElement('table');
    tabla.setAttribute('id', 'tabla');
    tabla.classList.add('tabla');
    filtrarFotos();
    
    for (var i = 0; i < votosA.length; i++){
        
      //  console.log ('varios ' + xmlDataVotos[i].url);
        
        
        var fila = document.createElement('tr');
        tabla.appendChild(fila);
        for(var j = 0; j < 4; j++){
            
            var celda = document.createElement('td');
            var img = document.createElement('img');
            img.classList.add('fotos');
           //console.log('valor de i ' + i);
           //console.log ('varios2 ' + votosA[i].url);
            var contentIcons = document.createElement('div');
            
             //-------------------FAV----------------------

                var fav = document.createElement('img');
                if(zonaFav == ''){
                    fav.setAttribute('src', '../img/favorites.png');
                }
                for(var z = 0; z < zonaFav.length; z++) {
                    if(votosA[i].url == zonaFav[z].url) {
                        fav.setAttribute('src', '../img/favorites2.png');
                        fav.setAttribute('id-json', zonaFav[z].id);
                        break;
                    } else {
                        fav.setAttribute('src', '../img/favorites.png');
                    }
                }
                fav.setAttribute('id', votosA[i].url);
                fav.classList.add('fav');
                eventoFavoritos(fav);
                contentIcons.appendChild(fav);
            
            //-------------------LIKE----------------------

                var like = document.createElement('img');
                if(zonaLikes == ''){
                    like.setAttribute('src', '../img/likes.png');
                }


                for(var z = 0; z < zonaLikes.length; z++) {
                    if(votosA[i].url == zonaLikes[z].url) {
                        like.setAttribute('src', '../img/likes2.png');
                        like.setAttribute('id-json', zonaLikes[z].id);
                        break;
                    } else {
                        like.setAttribute('src', '../img/likes.png');
                    }
                }
                like.setAttribute('id', votosA[i].url);
                like.classList.add('like');
                eventoLikes(like);
                contentIcons.appendChild(like);
           
            
            
             //---------------------SELECT VOTACIÓN---------
                
                
                var votosImagen = await load_JSON(urlVotos + '?url=' + votosA[i].url);
                var votos = document.createElement('select');
                votos.setAttribute('id', votosA[i].url);
                votos.classList.add('select');

                var puntoValor = '<option value="0" selected>PUNTOS: </option>';
                var punt = 0;

                for(var a = 0; a < zonaVotos.length; a++){
                    if(votosA[i].url == zonaVotos[a].url) {
                        
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
                contentVotos.setAttribute('id', votosA[i].url);
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
                img.setAttribute('src', votosA[i].url);
                img.setAttribute('alt', votosA[i].url);

                celda.appendChild(img);
                celda.appendChild(contentIcons);
//---------------------------------------------------------------
            
            fila.appendChild(celda);
           if(j != 3) {
               i++;
           }
             if(votosA[i] == undefined) {
            break;
            } 
             }
        }
       // i--;
    content.appendChild(tabla);
}
   
    



function filtrarFotos(){
	var url = xmlDataVotos.url;
    console.log('xmlDataVotos F '+ xmlDataVotos.length);
	var cont = 0;
	var array = [];

	votosA = xmlDataVotos.filter(function(url, cont) {
        
  		if(!array.includes(url.url)){ 
			array.push(url.url);
			return xmlDataVotos[cont];
		}
        cont++;
	});
    console.log('votosA ' + votosA.length);
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

