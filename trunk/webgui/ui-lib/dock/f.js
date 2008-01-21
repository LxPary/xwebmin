// LinkDock - V 1.5
// By Brian Gosselin of http://scriptasylum.com
// Release Info:
// ENTER LINK ATTRIBUTES IN THE ARRAY BELOW; EACH LINE CONTAINS ALL THE
// PARAMETERS FOR ONE LINK. USE THE FOLLOWING FORMAT:
//   [ 'LINK_URL' , 'IMAGE_URL' , 'URL_TARGET', 'TEXT_UNDER_LINK' ]
// IF YOU DO NOT WANT TEXT DISPLAYED UNDER A LINK, SIMPLY USE AN EMPTY STRING AS THE PARAMETER FOR 'TEXT_UNDER_LINK'.

var trashicon;
if (getCookie('getcookies')) trashicon = "trash.png";
else trashicon = "trashempty.png";

var linkList=[
[ "javascript:page_sitemap()" , '/ui-lib/dock/finder.png' , '', 'Finder' , '52'],
[ "javascript:page_stickies()" , '/ui-lib/dock/stickies.png' , '', 'Stickies'  , '52'],
[ "javascript:bookmarksite('http://osx.portraitofakite.com' , 'FlyakiteOSX - Modify . Simplify . Aquafy')" , '/ui-lib/dock/favorites.png' , '', 'Bookmark Site'  , '98'],
[ "javascript:page_systempref()" , '/ui-lib/dock/systempref.png' , '', 'System Preferences'  , '133'],
[ "javascript:setCookie('deletecookies', 'yes');refresh()" , '/ui-lib/dock/'+trashicon , '', 'Delete Site Cookies'  , '129']
]

// CHANGE THE OTHER VALUES BELOW TO SUIT YOUR APPLICATION
if (getCookie("getcookies")) {
	var startSize=getCookie("dock_startsize");
	if(startSize=="null") {startSize=48;}
	var endSize=getCookie("dock_endsize");
	var effectW=getCookie("dock_spreadsize");
	if(effectW=="null")effectW=3.5;
	var curSize=getCookie("dock_cursize"); 
	if (curSize=="null")curSize=48;}
else {
	var startSize=48;
	var endSize=parent.startSize+((128-parent.startSize)/6)*2;
	var effectW=3.5;
	var curSize=48; }

//<!-- RAJ
var curSize=48;
// RAJ -->
var defText=''
var textGap=5;

// BELOW IS THE STYLE-SHEET RULE FOR HOW THE TEXT IS TO BE DISPLAYED. USE VALID CSS RULES.

var textStyle="FONT-FAMILY:Verdana, Arial, Helvetica, sans-serif; FONT-SIZE:12px; COLOR:white; FONT-WEIGHT:bold";

//********** DO NOT EDIT BEYOND THIS POINT **********\\

var w3c=(document.getElementById)?true:false;
var ie4=(document.all && !w3c)?true:false;
var ie5=(document.all && w3c)?true:false;
var ns4=(document.layers)?true:false;
var mx=0;
var overEl=false;
var enterEl=false;
var id=0;
var elList=new Array();
var elText;
var pgLoaded=false;
if(defText=='')defText='&nbsp;';


function getEl(s){
	if(ns4)return findLayer(s,document);
	else return (ie4)?document.all[s]:document.getElementById(s);
}

function getW(e){
	return parseInt(e.style.width);
	}
	
	function setImgS(i,x){
	elList[i].style.width=x;
	elList[i].style.height=x;
	document.images['linkDockI'+i].width=x;
	document.images['linkDockI'+i].height=x;
	}
	
	function getL(el){
	var x=0;
	var sx=(document.all)?document.body.scrollLeft:0;
	while(el.offsetParent!=null){
	x+=el.offsetLeft;
	el=el.offsetParent;
	}
	return x+el.offsetLeft-sx;
}

	function rAll(){
	// decrease size of zoomed images gradually
	for(i=0;i<elList.length;i++) {
	//<!-- RAJ
	curSize=getW(elList[i]);
	if (curSize>startSize) {
	id=setTimeout('rAll()',10);
	curSize--;
	// RAJ -->
	setImgS(i,curSize);
}}}

function dockMagnify(){
	var tEl,n1,n2;
	//<!-- RAJ
	if(overEl) {if(curSize<endSize) curSize+=5; } else curSize=48;
	// RAJ -->
	if(overEl){
	for(i=0;i<linkList.length;i++){
	tEl=elList[i];
	if((getL(tEl)>=mx-((Math.max(2,Math.min(5,effectW))+.5)*endSize/2))&&(getL(tEl)<=mx+((Math.max(2,Math.min(5,effectW))+.5)*endSize/2))){
	n1=getL(tEl)+getW(tEl)/2+10;
	n2=mx-((Math.max(2,Math.min(5,effectW))+.5)*endSize/2);
	//<!-- RAJ
	n1=(curSize*Math.sin(Math.abs(n1-n2)/(((Math.max(2,Math.min(5,effectW))+.5)*endSize/2)/1.5)));
	// RAJ -->
	setImgS(i,Math.max(n1,startSize));
	}else setImgS(i,startSize);
	}}
}

function mOver(){
	overEl=true;
	clearTimeout(id);
}

function mOut(){
	overEl=false;
	id=setTimeout('rAll()',100);
}

// FUNCTION TO FIND NESTED LAYERS IN NS4 BY MIKE HALL
function findLayer(name,doc){
	var i,layer;
	for(i=0;i<doc.layers.length;i++){
	layer=doc.layers[i];
	if(layer.name==name)return layer;
	if(layer.document.layers.length>0)if((layer=findLayer(name,layer.document))!=null)return layer;
	}
	return null;
}

function writeText(text){
	if(pgLoaded){
	var iconNumber=(text<0)?0:text;
	var textWidth=(text<0)?0:linkList[text][4];
	var gifWidth=parseInt(((document.body.clientWidth-startSize*5-endSize)/2)+(iconNumber*startSize)+((endSize-textWidth)/2));
	if(text<0) gifWidth=1;
	text=(text<0)?defText:linkList[text][3];
	if(text=='')text='&nbsp;';
	if(ns4){
	elText.document.open();
	elText.document.write('<span style="'+textStyle+'">'+text+'</span>');
	elText.document.close();
	}
	else elText.innerHTML='<img src="/ui-lib/dock/blank.gif" width="'+gifWidth+'" height="26">'+text;
}}

ns6 = (!document.all && document.getElementById); 
opac = 0;
function fadein() 
{ 
	if((opac < 100) && ns6) {opac+=5; document.getElementById('dockText').style.MozOpacity = opac / 100; timeout=setTimeout("fadein('dockText')", 10);} 
}
function fadeout()
{ 
	if((opac > 0) && ns6) { clearTimeout(timeout); document.getElementById('dockText').style.MozOpacity = 0; opac = 0;}
} 

function writeHTML(){
	var t='';
	if(w3c||ie4){
	t+='<div align="left" width="100%" id="dockText" style="'+textStyle+'; padding-bottom:'+textGap+'px; -moz-opacity:0;" >'+defText+'</div>';
	}
	t+='<div style="z-index:1;">';
	for(i=0;i<linkList.length;i++){
	t+='<span id="linkDockD'+i+'" style="width:'+startSize+'px; height:'+startSize+'px;">';
	t+='<a href="'+linkList[i][0]+'" onmouseover="writeText('+i+');fadein()" onmouseout="fadeout();writeText(-1)"><img name="linkDockI'+i+'" src="'+linkList[i][1]+'" width="'+startSize+'" height="'+startSize+'" border=0></a>';
	t+='</span>';
	}
	t+='</div>';
	
	document.write(t);
}

writeHTML();

function dockInit() {
    /*// DOCK STUFF
    if(w3c||ie4){
        for(j=0;j<linkList.length;j++){
            elList[j]=getEl('linkDockD'+j);
            elList[j].n=j;
            elList[j].onmouseover=mOver;
            elList[j].onmouseout=mOut; }
        setInterval('dockMagnify()',20); }
    elText=getEl('dockText');
    if(ns4)writeText(-1);
    pgLoaded=true;
*/
}
