function openpic(picurl, title, winwidth, winheight, nid) {
	newWindow = window.open("",nid,"toolbar=0,location=0,menubar=0,width="+winwidth+",height="+winheight+",resizable=0,status=0");
	newWindow.document.write('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"><html><head><title>'+title+'</title><script type="text/javascript" src="disablerightclk.js"></script></head><body background="images/screenshots/'+picurl+'"></body></html>');
	newWindow.focus(); }

function hidestatus() {
	window.status='';
	return true; }
	if (document.layers) document.captureEvents(Event.MOUSEOVER | Event.MOUSEOUT);
	document.onmouseover=hidestatus;
	document.onmouseout=hidestatus;

function bookmarksite(url,title) {
	if (document.all)window.external.AddFavorite(url,title);
	else alert('Press CTRL + D to add a bookmark to:\n'+url+''); } 

function toggle(idname) {
	document.getElementById(idname).style.visibility = (document.getElementById(idname).style.visibility == 'hidden') ? 'visible' : 'hidden'; }

function getcssstyle(el, cssproperty, csspropertyNS){
	if (el.currentStyle) return el.currentStyle[cssproperty];
	else if (window.getComputedStyle) {var elstyle=window.getComputedStyle(el, ""); return elstyle.getPropertyValue(csspropertyNS)}; }

function refresh() {
    window.location.reload(false);
	void(0); }

function dockover() {
	if(document.getElementById('dock').style.bottom==-startSize-17+'px') document.getElementById('dock').style.bottom='1px';void(0); }
function dockout() {
	if(document.getElementById('dock').style.bottom=='1px') document.getElementById('dock').style.bottom=-startSize-17+'px';void(0); }

function detectRes() {
	var res;
	var sh = screen.height;
	var sw = screen.width;
	if ((sw <= 800) && (sh <= 600)) res = 1;
	else if ((sw <= 1024) && (sh <= 768)) res = 2;
	else if ((sw <= 1280) && (sh < 1024)) res = 3;
	else res = 4;
	return res; }


function changeBG(wallpaper, color) {
	var res = detectRes();
	document.body.style.backgroundImage='url('+wallpaper+res+'.jpg)';
	document.body.style.backgroundColor=''+color+'';
	void(0); }