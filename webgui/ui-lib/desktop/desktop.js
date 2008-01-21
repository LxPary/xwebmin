/* window manager*/
var Desktop = {
  app     : function(appId, formId) { 
    var appAs = appId.match(/^stat/)?{'win':'top=40px,width=300px,height=400px,resize=1,scrolling=1', 'holder':'rh-col'}
        : {'win':'top=40px,width=400px,height=460px,resize=1,scrolling=1', 'holder':'c-col'}

    function nav(url) {
        if (url.split(".").length>1) return ''

        var a = "<div class='window-nav'>"
            +"<div class='window-nav-left'>&nbsp;</div>"
            +"<div class='window-nav-center'>&nbsp;<input type='text' id='"+url+"-nav-path' value='"+url.uAppId2url()+"'/></div>"
            +"<div class='window-nav-right'><img src='/ui-lib/window/images/pathgo.png' "
            +"onClick=\"$O('"+url+"').gotos($O('"+url+"-nav-path').value)\"/></div></div>"
        return a
    }
    function appContent(appId, confItems, formId) {
        var ret = ''
        var o,i,c = ''
        var navs = {}
        for (i=0; i<confItems.length; i++) {
            o = confItems[i]
            if (confItems.length>1) {
                navs[o.id] = o.title
                c = 'form-boxes'
            } else {
                c = 'form-single-box'
            }
            if (formId) {
                ret += '<div id="'+o.id+'" style="display:'+((formId!=o.id)?'none':'block')+'" class="'+c+'">'+Form.formEntity(appId, o, formId)+'</div>'
            } else {
                ret += '<div id="'+o.id+'" style="display:'+(i?'none':'block')+'" class="'+c+'">'+Form.formEntity(appId, o)+'</div>'
            }
            if (o.async) { // refresh where interval
                SchedQueue.add('Desktop.reload("'+o.id+'")', o.async)
            }
        }

        if (!formId) {
            $O(appId.split('.')[0]).formId = confItems[0].id.split('.').slice(0,3).join('.')
            if ($O(appId+'-submit')) $O(appId+'-submit').onclick = function (){ Form.formsubmit($O(confItems[0].id+'-form')) }
            if ($O(appId+'-apply')) $O(appId+'-apply').onclick = function (){ Form.formsubmit($O(confItems[0].id+'-form'), true) }
        } else {
            $O(appId.split('.')[0]).formId = formId.split('.').slice(0,3).join('.')
            if ($O(appId+'-submit')) $O(appId+'-submit').onclick = function (){ Form.formsubmit($O(formId+'-form')) }
            if ($O(appId+'-apply')) $O(appId+'-apply').onclick = function (){ Form.formsubmit($O(formId+'-form'), true) }
        }
        $O('debug').d('formId-content', $O(appId.split('.')[0]).formId)
        return '<div class="window-main">'+(navs.keys().length?Form.formNavs(navs, (formId?formId:confItems[0].id)):'')+ret+'</div>'
    }

    function vAppWin(appId, formId, cbfunc) {
        //$O(appId+'-statusarea')
        $O('debug').d('vAppWin:', appId, formId, cbfunc)
        var oWindow = $O(appId)
        JsHttpRequest.query('/backend-index.php',
            { 'rpc':'get-conf', 'appId': appId },
            function(resjs, restxt) { 
                if (oWindow) oWindow.show(nav(appId)+appContent(appId,resjs.toArray(appId)[0],formId)); 
                if (cbfunc) cbfunc()
            },
            true
        );
    }

    if (appId.match(/\.del/)) {
        vAppWin(appId, null, function() {$O(appId.split('.')[0]).reload()})
    } else {
        var appO = dhtmlwindow.open(appId, 'inline', '', appId, appAs['win'],'recal',appAs['holder'], vAppWin) 
    }
  },

  reload    : function(appId) {
    if (!$O(appId)) return

    JsHttpRequest.query('/backend-index.php',
        { 'rpc':'get-conf', 'appId': appId },
        function(resjs, restxt) { if (!$O(appId)) $O(appId).innerHTML = _form(null, resjs.toArray(appId)[0][1]) },
        true
    );
  },
  menuSwitch    : function(id) {
    var a = id.split('.')
    var t = a.slice(0,3).join('.')
    $O(a[0]).formId = t
    if ($O(a[0]+'-submit')) $O(a[0]+'-submit').onclick = function (){ Form.formsubmit($O(t+'-form')) }
    if ($O(a[0]+'-apply')) {
        if (t.match(/-stat$/)) {
            $O(a[0]+'-apply').style.display = 'none'
        } else {
            $O(a[0]+'-apply').style.display = ''
            $O(a[0]+'-apply').onclick = function (){ Form.formsubmit($O(t+'-form'), true) }
        }
    }
  }
};

/*
    Form items
*/
var Form = {
  formedit      : function(ids) { Desktop.app(ids+'.edit') },
  formdelete    : function(ids) { if (window.confirm('确定要删除么？')) Desktop.app(ids+'.del') },
  formnew       : function(ids, param) { Desktop.app(ids.replace(/-[0-9]+/g,'')+'.new'+param) },
  formsubmit    : function(formO, applyflag) {
    var sid = formO.id.replace(/-form/, '')
    var xo = $O(sid)
    var conf = {'rpc':'set-conf', 'appId':sid, 'data': {}}
    var elem
    var i,j,v,ks,tk,to
    for (i=0; i<formO.elements.length; i++) {
        elem = formO.elements[i]
        if (elem.id) {
            
            if (elem.type == 'checkbox') {
                v = elem.checked?elem.value:'n'
            } else if (elem.className.search(/sys/) != -1){
                $O('debug').d('sys compoment found:'+elem.id)
                continue
            } else {
                v = elem.value
            }
            ks = elem.id.split('.').slice(1)
            for (j=1; j<=ks.length; j++) {
                to = 'conf[\'data\'][\''+ks.slice(0,j).join('\'][\'')+'\']'
                if (!eval(to)) {
                    if (j==ks.length)
                        eval(to+'=v')
                    else
                        eval(to+'={}')
                }
            }
        }
    }
    JsHttpRequest.query('/backend-index.php',
        conf,
        function(resjs, restxt) {
            var action = resjs['action']
            var ret = resjs['ret']
            var message = resjs['message']
            $O('debug').d('post:'+sid, action, ret, message)
            switch (action) {
                case 'new':
                case 'delete':
                case 'update':
                default:
                    if (!applyflag) {
                        $O(sid.split('.').slice(0,-2).join('.')).hide()
                    } else {
                    }
            }

        },
        false
    );
  },

  formNavs    : function(obs, sk) {
    var str = '<div class="form-navs">'
    var a,b,i
    b = obs.keys()
    for (i=0; i<b.length; i++) {
        k = b[i]
        a = obs[k]
        str += '<div id="'+k+'-nav"'+((sk==k)?' class="selected"':'')+'><a href="javascript:$O(\''+k+'\').sdn(Array(\''+b.join('\',\'')+'\'),\'Desktop.menuSwitch\')">'+a+'</a></div>'
    }
    str += '</div>'
    return str
  },

  formEntity : function(appId, confItem, seq) {
    var a = '<form id="'+confItem.id+'-form" action="/backend-index.php" method="POST" enctype="multipart/form-data">'
    for (var i=0; i<confItem.length; i++) {
        a += Form.formElement(confItem[i])
    }
    a+='</form>'
    return a
  },
  formElement   : function(t) {
    function _o(id, o) { if (!o.type) alert(o.id);return eval('Form._x'+o.type+'(o)')+
        (o.notnull=='y'?'<span class="notnull">*</span>':'')+
        (o.tip?'<span id="'+o.id+'-tip" class="form-tip">'+o.tip+'</span>':'')
    }

    var a = '<div class="form-item">'
    if (t.singlecell=='y' || t.type=='list' || t.type=='logo' || t.type=='fieldset' || t.type=='navs' || t.type=='plain' || t.type=='table') {
        a += _o(t.id, t)
    } else {
        a +='<div class="form-item-title">'
            +'<label for="'+t.id+'"><span'+(t.description?' class="form-comment" title="'+t.description+'"':'')+'>'+t.title
            +'</span></label></div>'
            +'<div class="form-item-content">'+_o(t.id, t)+'</div>'
    }
    return a+'</div>'
  },
  _xlogo    : function(o) { return "<div class='form-logo'><img src='"+o.value+"'><br /><input type='button' onclick='window.open(\""+o.link+"\")'value='"+o.title+"'></div>" 
  },

  _xtable   : function(o) {
    var t = o.filters.split(';')
    var i,j,ot
    var str = '<table class="form-table">'
    str += '<tr><th colspan="'+t.length+'">'+o.title+'('+o.value.length+')</th></tr>'
    str += '<tr>'
    for (i=0; i<t.length; i++) { str += '<th>'+t[i]+'</th>' }
    str += '</tr>'

    for (i=0; i<o.value.length; i++) { 
        ot = o.value[i]
        str += '<tr'+((i%2)?" class='odd'":'')+'>'
        for (j=0; j<ot.length; j++) { str += '<td><span title="'+ot[j]+'">'+ot[j].slice(0,10)+'...</span></td>' }
        str += '</tr>'
    }

    str += '</table>'
    return str
  },

  _xplain   : function(o) {
    return "<pre class='form-pre'>"+o.value+"</pre>"
  },
  _xtextarea: function(o) { return "<textarea onfocus='this.className=\"form-input-focus\"' onblur='this.className=\"form-input\"' id='"+o.id+"' class='form-input'>"+(o.value?o.value:'')+"</textarea>" 
  },
  _xtext     : function(o) { 
    return "<input onfocus='this.className=\"form-input-focus\"' onblur='this.className=\"form-input\"' type='text' id='"+o.id+"' class='form-input' value='"+(o.value?o.value:'')+"'/>" 
  },
  _xpassword: function(o) { return "<input onfocus='this.className=\"form-input-focus\"' onblur='this.className=\"form-input\"' type='password' id='"+o.id+"' class='form-input' value='"+o.value+"'/>" 
  },
  _xselect  : function(o) {
    var a = "<select onfocus='this.className=\"form-input-focus\"' onblur='this.className=\"form-input\"' id='"+o.id+"' class='form-select'>"
    var items = o.opts.split(',')
    var item
    for (var i=0; i<items.length; i++) {
        item = items[i].split(':')
        a += "<option value='"+item[0]+"'"+(item[0]==o.value?' selected':'')+">"+item[1]+"</option>"
    }
    a += "</select>"
    return a
  },
  _xradio   : function(o) {
    var a = ''
    var items = o.opts.split(',')
    var item
    for (var i=0; i<items.length; i++) {
        item = items[i].split(':')
        a += item[1]+"<input type='radio' value='"+item[0]+"'"+(item[0]==o.value?' checked':'')+" name='"+o.id+"'/>"
    }
    return a
  },
  _xcheckbox    : function(o) {
    var a
    var item
    if (o.singlecell) {
        item = o.opts.split(':')
        a = "<input type='checkbox' value='"+item[0]+"'"+(item[0]==o.value?' checked':'')+" id='"+o.id+"'/><label for='"+o.id+"'>"+item[1]+'"<span'+(o.description?(' class="form-comment" title="'+o.description+'"'):'')+'>'+o.title+'</span>"</label>'
    } else {
        var items = o.opts.split(',')
        for (var i=0; i<items.length; i++) {
            item = items[i].split(':')
            a += item[1]+"<input type='checkbox' value='"+item[0]+"'"+(item[0]==o.value?' checked':'')+" name='"+o.id+"'/>"
        }
    }
    return a
  },

  _xfieldset    : function(o) {
    a = '<fieldset class="form-fieldset"><legend>'+o.title+'</legend>'
    for (var i=0; i<o.length; i++) {
        a+=Form.formElement(o[i])
    }
    a += '</fieldset>'
    return a
  },
  _xlist        : function(o) {
    function _items(o, k, to) {
        var a = '<table id="'+o.id+'" class="form-table">'
        var j,m,p,i
        var ito

        a += '<tr><th></th>'
        for (i=0; i<o[0].length; i++) {
            a += '<th>'+o[0][i].title+'</th>'
        }
        a += '</tr>'
        for (i=k; i<o.length; i++) {
            m = o[i]
            a += '<tr><td><input type="checkbox" onclick="$O(\''+o.id+'-cursor\').value=\''+m.id+'\';$O(\''+o.id+'-delbutton\').disabled=false;$O(\''+o.id+'-attbutton\').disabled=false"></td>'
            for(j=0;j<m.length;j++) {
                a += '<td>'+m[j].value+'</td>'
            }
            a += '</tr>'

        }
        a += '</table>'

        p = o.id.match(/-[0-9]+/)
        p = p?p.join(''):''
        return '<div id="'+o.id+'-list" class="form-list" style="display:'+(k==1?'block':'none')+'">'+a
            +'<div class="form-newbutton"><input type="hidden" id="'+o.id+'-cursor" value=""><input type="button" onclick="javascript:Form.formnew(\''+to.id+'\',\''+p+'\')" class="sys-button" value="新建...">'
            +(o.length>1?' <input type="button" id="'+o.id+'-delbutton" onclick="javascript:Form.formdelete($O(\''+o.id+'-cursor\').value)" value="删除" class="sys-button" disabled>':'')
            +(o.length>1?' <input type="button" id="'+o.id+'-attbutton" onclick="javascript:Form.formedit($O(\''+o.id+'-cursor\').value)" value="属性" class="sys-button" disabled></div>':'')
            +'</div>'
    }
    return '<fieldset class="form-fieldset">'
        +'<legend><a href="javascript:$O(\''+o.id+'-list'+'\').sds()">'+o[0].title+' ('+(o.length-1)+')</a></legend>'
        +_items(o, 1, o[0])+'</fieldset>'
  },
  _xnavs        : function(o) { /*fucking ie6 not support div displaying well,so using table*/
    var str = ''
    var i,k
    var ids = Array()
    for (i=0; i<o.length; i++) { ids.push(o[i].id) }

    str += '<table class="form-table">'
    str += '<tbody><tr><td class="form-navs">'
    for (i=0; i<o.length; i++) {
        k = o[i]
        str += '<div id="'+k.id+'-nav"'+((i==0)?' class="selected"':'')+'><a href="javascript:$O(\''+k.id+'\').sdn(Array(\''+ids.join('\',\'')+'\'))">'+k.title+'</a></div>'
    }
    str += '</td></tr></tbody>'
    for (i=0; i<o.length; i++) {
        k = o[i]
        str += '<tbody id="'+k.id+'" style="display:'+((i==0)?'':'none')+'"><tr><td>'
        for (var j=0; j<k.length; j++) { str += Form.formElement(k[j]) }
        str += '</td></tr></tbody>'
    }
    str += '</table>'
    return str
  }
};



