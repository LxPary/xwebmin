<?php 
/*
    桌面
*/
define('CONFIDRPATH',  '/etc/xml-conf/');

function renderAppsMenu() {
    function getApps() {
        $group = array();
        foreach (glob(CONFIDRPATH."*.xml") as $item) {
            $a = basename($item);
            if (preg_match('/(\w+)-(\w+)/', $a, $match)) {
                if (!isset($group[$match[1]])) {
                    $group[$match[1]] = array();
                }
                if (!in_array($match[2], $group[$match[1]])) {
                    array_push($group[$match[1]], $match[2]);
                }
            }
        }
        return $group;
    }
    $group = getApps();
?>
<ul>
    <?php foreach ($group as $gname=>$item) {?>
    <li><a href="#" onclick="$O('<?=$gname?>').sds()"><span><?=$gname?></span></a>
    <ul id='<?=$gname?>'><?php foreach ($item as $app) {?><li><a href="javascript:Desktop.app('<?=$gname?>-<?=$app?>')"><span><?=$app?></a></span></li><?php }?></ul>
    </li>
    <?php }?>
</ul>
<?php
}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>System</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="Robots" content="NOINDEX" />
<link rel="stylesheet" type="text/css" href="/ui-lib/layout.css" />
<link rel="stylesheet" type="text/css" href="/ui-lib/window/f.css" />
<link rel="stylesheet" type="text/css" href="/ui-lib/themes/csense/style.css" />
<script type="text/javascript" src="/ui-lib/core.js"></script>
<script type="text/javascript" src="/ui-lib/cookies.js"></script>
<script type="text/javascript" src="/ui-lib/dock/misc.js"></script>

<!--link rel="stylesheet" type="text/css" href="/ui-lib/shadow/shadow.css" /-->

<!--link rel="stylesheet" type="text/css" href="/ui-lib/round-corner/nifty.css" /-->
<!--script type="text/javascript" src="/ui-lib/round-corner/nifty.js"></script-->

<link rel="stylesheet" type="text/css" href="/ui-lib/desktop/desktop.css" />
<script type="text/javascript" src="/ui-lib/desktop/desktop.js"></script>

<script type="text/javascript" src="/ui-lib/window/f.js"></script>

<script type="text/javascript" src="/ui-lib/jsHttpRequest.js"></script>

<script language='javascript'>
 window.onload = function() { $init(); };
</script>
</head>

<body>
    <div id="c-col">
        <pre id='debug'>
        </pre>
    </div>
    <!-- end of center column -->

    <!--div id="lh-col">
    </div-->
    <!-- end of left column -->

    <div id="rh-col">
        <div id='sys-search' style='display:none'>
            <div class='left'>
                <img src='/ui-lib/themes/csense/images/full-search-left.gif'><input type='text'>
            </div><div class='right'><img src='/ui-lib/themes/csense/images/full-search-right.gif'></div>
        </div>
    </div>
    <!-- end of right column -->

    <div id="hdr">
        <div id="top-start"><img src='/ui-lib/themes/csense/images/start.gif' onmouseover='this.src="/ui-lib/themes/csense/images/start-over.gif"' onmouseout='this.src="/ui-lib/themes/csense/images/start.gif"' /></div>
        <div id="top-search"><img src='/ui-lib/themes/csense/images/search.gif' onmouseover='this.src="/ui-lib/themes/csense/images/search-over.gif"' onmouseout='this.src="/ui-lib/themes/csense/images/search.gif"' onclick='$O("sys-search").sds()' /></div>
                
        <div id="top-menu">
            <div id='start-bar' class='sys-menu'>
            <?=renderAppsMenu()?>
            </div>
            <div id='menu-pane'>
            </div>
        </div>
    </div>
    <div id="dock" align="center" style="position:absolute; bottom:0px; width:100%; padding-top: 5px; z-index: 0;">
        <span><img src='/ui-lib/dock/finder.png' onclick='javascript:Desktop.app("app-nmap")'></span>
        <span><img src='/ui-lib/dock/stickies.png' href='#'></span>
        <span><img src='/ui-lib/dock/favorites.png' href='#'></span>
        <span><img src='/ui-lib/dock/systempref.png' href='#'></span>
    </div>

</body>
</html>
