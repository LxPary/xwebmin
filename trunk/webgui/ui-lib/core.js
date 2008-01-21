//******************************************************
// 包含文件 用法： $import('../include/mian.js');
//                 $import('../style/style.css');
//******************************************************

//{{{ <framework sys>
function $init() {
    SchedQueue.init();
    ToolTip.init();
    //dockInit();
}

function $O(id) {
    a = document.getElementById(id) 
    if (!a) {
        return null
    }

    a.d = function () {  // for debug
        var str = ''
        for (var i=0; i<arguments.length; i++) {
            str += arguments[i]+"\t"
        }
        str += "\n"
        this.innerHTML = this.innerHTML+str
    }
    a.ds = function () { this.style.display = '' }
    a.dn = function () { this.style.display = 'none' }
    a.sds = function (){ this.style.display = (this.style.display=='none')?'':'none' } // style display
    a.sdn = function (ids, cb){ 
        for (var i=0; i<ids.length; i++) {
            if (a.id != ids[i]) { 
                document.getElementById(ids[i]).style.display = 'none'
                document.getElementById(ids[i]+'-nav').className = ''
            }
        }
        document.getElementById(a.id).style.display = ''
        document.getElementById(a.id+'-nav').className = 'selected'

        if (cb) (eval(cb+'(a.id)'))
    }
    a.cb = function (cb){ return eval(cb+'(this)') } // callback 
    return a
}

/* $import: close: remove object*/
function $import(path, oElement) {
    if (path.match('.js')) {
        var o = document.createElement('script');
        o.setAttribute('type', 'text/javascript');
        o.setAttribute('src', path);
    } else {
        var o = document.createElement('link');
        o.setAttribute('type', 'text/css');
        o.setAttribute('rel', 'stylesheet');
        o.setAttribute('href', path);
    }
    o.close = function() { document.body.remove(this) }

    if (oElement != undefined) {
        document.body.replaceChild(o, oElement);
    } else {
        document.body.appendChild(o);
    }
}
//}}}

//{{{<String prototype>
String.prototype.uUrl2appId = function() { return this.split('/').slice(1).join('.') };
String.prototype.uAppId2url = function() { return '/'+this.split('.').join('/') }
String.prototype.uGoldenratio = function(factor, add) {
    src = this
    if (!factor) factor = 0.618
    if (!add) add = 0
    var o = new RegExp("([0-9]+)(.+)").test(src)
    return parseInt((parseInt(RegExp.$1)+add)*factor)+RegExp.$2
};
//}}}

//{{{<Array prototype>
Array.prototype.insertAt = function(index, value) {
    var part1 = this.slice(0, index);
    var part2 = this.slice(index);
    part1.push(value);
    return(part1.concat(part2));
};
Array.prototype.removeAt = function(index) {
    var part1 = this.slice(0, index);
    var part2 = this.slice(index+1);

    return (this.length==1 && index==0)?part1:part1.concat( part2 );
};
Array.prototype.indexOf = function(val) {
    for (var i=0; i<this.length; i++) {
        if (this[i] == val) {
            return i;
        }
    }
    return -1;
};
Array.prototype.remove = function (val) {
    if (this.inArray(val)){
        //alert(this.indexOf(val));
        return this.removeAt(this.indexOf(val));
    }
};
Array.prototype.inArray = function (value) {
    var i;
    for (i=0; i < this.length; i++) {
        if (this[i] == value) {
            return true;
        }
    }
    return false;
};
//}}}

//{{{<Object的prototype接口>
Object.prototype.keys = function() {
    var ret = Array()
    for (var a in this) {
        if (typeof(this[a]) != 'function') ret.push(a)
    }
    return ret
};
Object.prototype.toArray = function(id) {
    function _2array(id, o) {
        var root = Array()
        root.id = id
        var a = o.keys()
        var k,aks,n,j
        for (var i=0; i<a.length; i++) {
            k = a[i]
            if (k == 'attributes') {
                aks = o[k].keys()
                for (j=0; j<aks.length; j++) {
                    n = aks[j]
                    eval('root.'+n+'=o[k][n]')
                }
            } else if (k == 'value') {
                root.value = o[k]
            } else {
                if (!root.type && k.match(/[^-]+-[0-9]+/)) eval('root.type="list"') /* automitic set type*/
                root.push(_2array(id+'.'+k, o[k]))
            }
        }
        return root
    }
    return _2array(id, this)
};
//}}}

//{{{<Clock>
var Clock = {
  init: function() {
  }
};
//}}}
//{{{<ToolTip 显示自定义的title帮助窗口，不对外提供接口>
var ToolTip = {
  init  : function() {
    toolTip = document.createElement("DIV");
    toolTip.id = "toolTip";
    tip_top = document.createElement("DIV");
    tip_top.id = "tip_top";
    tip_middle = document.createElement("DIV");
    tip_middle.id = "tip_middle";
    toolTip.appendChild(tip_top);
    toolTip.appendChild(tip_middle);

    title_content = "";
    cStyle = toolTip.style;
    cStyle.position = "absolute";
    cStyle.display = 'none'
    document.body.appendChild(toolTip);

    document.onmouseover = ToolTip.show;
    document.onmouseout = ToolTip.hide;
  },
  show  : function(evt) {
    function _tooltipFind( oLink ) {
        if( oLink.offsetParent ) {
            for( var posX = 0, posY = 0; oLink.offsetParent; oLink = oLink.offsetParent ) {
                posX += oLink.offsetLeft;
                posY += oLink.offsetTop;
            }
            return [ posX, posY ];
        } else {
            return [ oLink.x, oLink.y ];
        }
    }

    evt = window.event?window.event:evt;
    srcElem = evt.srcElement?evt.srcElement:evt.target;
    var t = srcElem.tagName.toUpperCase()
    if((t=="SPAN" || t=="A") && srcElem.title!=""){
        window.title_content = srcElem.title;
        srcElem.title = "";
        tip_middle.innerHTML = window.title_content;
        pos = _tooltipFind(srcElem);
        x=pos[0];y=pos[1];
        cStyle.left = x+23+"px";
        cStyle.top = y+23+"px";
        cStyle.display = "block";
    }
  },
  hide  : function(evt) {
    evt = window.event?window.event:evt;
    srcElem = evt.srcElement?evt.srcElement:evt.target;
    srcElem.title= window.title_content;
    window.title_content = "";
    cStyle.display = "none";
  }
}
//}}}

//{{{<SchedQueue 调度队列，定时执行的任务,对外提供接口>
var SchedQueue = {
  init    : function() { setInterval('SchedQueue.run()', 5*1000) },
  run     : function() { 
    $O('debug').d('run',SchedQueue.keys().join(';'))
    eval(SchedQueue.keys().join(';')) 
  },
  add     : function(k,v) { SchedQueue[k] = v },
  remove  : function(item) { }
}
//}}}
