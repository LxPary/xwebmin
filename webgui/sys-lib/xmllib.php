<?php 
/*
    xml lib
    @author:    riverfor@gmail.com
*/
define('ERR_OK',    0);
define('ERR_READ',  -1);
define('ERR_WRITE', -2);
define('ERR_PARSE', -3);
define('ERR_PARAM', -4);

define('SYSLOG',    'wwebmin');
define('CONFPATH',  '/etc/xml-conf/%s.xml');

function uSyslog($log, $level, $msg) {
    if (!in_array($level, array(LOG_EMERG,LOG_ALERT,LOG_CRIT,LOG_ERR,LOG_WARNING,LOG_NOTICE,LOG_INFO,LOG_DEBUG)))
        $level= LOG_ERR;

    define_syslog_variables();
    openlog($log, LOG_PID | LOG_PERROR, LOG_LOCAL0);
    syslog($level, $msg);
    closelog();
}

function uExec($cmd) {
    uSyslog("uExec", LOG_NOTICE, "exec($cmd)");
    if ($cmd) {
        exec($cmd, $output, $ret);
        uSyslog("uExec", LOG_CRIT, "exec($cmd)-".serialize($output));
        return array($ret, $output);
    } else {
        return array(ERR_PARAM, null);
    }
}

class OSConfXML {
    //{{{ <log and err handler>
    private function _err($erra) { array_push($this->err, $erra); }
    private function _log($level, $msg, $errFlag=false) { 
        uSyslog(SYSLOG, $level, $msg); 
        if ($errFlag) $this->_err($msg);
    }
    //}}}

    //{{{ <__construct and dispatcher>
    public function __construct($rpc, $uri, $data=null) {
        $this->err = array();
        $this->rpc = $rpc;
        $this->data = $data;

        $oApp = explode('.', $uri);
        krsort($oApp);
        $confile = sprintf(CONFPATH, array_pop($oApp));
        ksort($oApp);
        $oApp = array_values($oApp);
        $this->app = $oApp;

        $this->_log(LOG_NOTICE, "OSConfXML::__construct($uri)");

        $this->confile = $confile;
        if (!file_exists($confile)) {
            $this->_log(LOG_ERR, sprintf("OSConfXML::__construct(confile:%)配置文件不存在", $confile), true); 
        }
        if (!is_readable($confile)) { 
            $this->_log(LOG_ERR, sprintf("OSConfXML::__construct(confile:%)配置文件不可读", $confile), true); 
        }
        if (!is_writable($confile)) { 
            $this->_log(LOG_ERR, sprintf("OSConfXML::__construct(confile:%)配置文件不可更新", $confile), true);
        }
        if (filesize($confile)>1024*1024) { 
            $this->_log(LOG_ERR, sprintf("OSConfXML::__construct(confile:%)配置文件大于限制1M", $confile), true); 
        }

    }

    public function dispatcher() {
        $rpc = $this->rpc;
        $data = $this->data;
        $this->_log(LOG_NOTICE, "OSConfXML::dispatcher($rpc, ".serialize($data).")");

        if ($rpc == 'get-conf') {
            $action = array_pop($this->app);
            $conf = $this->_array(true);
            switch ($action) {
                case 'del':
                    return array('conf'=>$this->del($conf[1]));
                case 'edit':
                case 'new':
                    return array('conf'=>$this->edit($conf[1], $action));
                default:
                    return $conf[1];
            }
        } else if ($rpc == 'set-conf') {
            if (count($this->app)>2) {
                $action = $this->app[count($this->app)-1];
                if ($action == 'edit') {
                    $ret = $this->_update($data);
                } else {
                    $ret = $this->_new($data);
                }
            } else {
                $ret = $this->update($data);
                $action = 'update';
            }
            return array('ret'=>$ret[0], 'message'=>$ret[1], 'action'=>$action);
        }
    }
    //}}}

    //{{{ <actions>
    /*
        将配置转化为simple array
    */
    private function _parse($cmd, $params) {
        $this->_log(LOG_CRIT, "_parse($cmd,".serialize($params).")");
        foreach ($params as $k=>$v) {
            $v = $v['value'];
            $this->_log(LOG_CRIT, "set \$$k=\"$v\";");
            eval("\$$k=\"$v\";");
        }
        eval("\$cmd=\"$cmd\";");
        $this->_log(LOG_CRIT, "_parse(got: $cmd)");

        return $cmd;
    }

    private function _parseg($params) {
        $cmd = $params['attributes']['onupdate'];
        unset($params['attributes']);
        unset($params['value']);
        foreach ($params as $k=>$v) {
            if ($v['attributes']['type']=='fieldset') {
                unset($v['attributes']);
                unset($v['value']);
                eval("\$kt=$k;");
                eval("\$$k=array();");
                foreach ($v as $k1=>$v1) {
                    unset($v1['attributes']);
                    $v = $v1['value'];
                    $et = sprintf("%s[%s]", $kt, $k1);
                    $this->_log(LOG_CRIT, "set \$$et=\"$v\";");
                    eval("\$$et=\"$v\";");
                }
            } else if ($v['attributes']['type']=='navs') {
                unset($v['attributes']);
                unset($v['value']);
                eval("\$kt=$k;");
                eval("\$$k=array();");
                foreach ($v as $k1=>$v1) {
                    unset($v1['attributes']);
                    unset($v1['value']);
                    $et = sprintf("%s['%s']", $kt, $k1);
                    $this->_log(LOG_CRIT, "set \$$et=array();");
                    eval("\$$et=array();");
                    foreach ($v1 as $k2=>$v2) {
                        unset($v1['attributes']);
                        unset($v1['value']);
                        $v2 = $v2['value'];
                        $et1 = sprintf("%s['%s']['%s']", $kt,$k1,$k2);
                        $this->_log(LOG_CRIT, "set \$$et1=\"$v2\";");
                        eval("\$$et1=\"$v2\";");
                    }
                }
            } else {
                $v = $v['value'];
                $this->_log(LOG_CRIT, "set \$$k=\"$v\";");
                eval("\$$k=\"$v\";");
            }
        }
        eval("\$cmd=\"$cmd\";");
        $this->_log(LOG_CRIT, "_parseg($cmd)");
        return $cmd;
    }

    private function _execOnUpdate($struct, $appK) {
        $a = $this->_smarray($struct, $appK);
        $ret = uExec($this->_parseg($a));
        $this->_log(LOG_CRIT, "_execOnUpdate(".serialize($ret).")");
        return $ret;
    }

    private function _execOnNew($struct, $appN) {
        $app = $this->app;
        $l = count($app);
        $appK = array_slice($app,0,$l-4);
        $a = $this->_smarray($struct, $appK);
        $b = $this->_smarray($struct, $appN);
        $newcmd = $a['attributes']['onnew'];
        if ($newcmd) {
            $cmd = $this->_parse($newcmd, $b);
            $ret = uExec($cmd);
            $this->_log(LOG_INFO, "_exec:$ret-".serialize($ret));
            return $ret;
        }
    }

    private function _smarray($struct, $ids) {
        $this->_log(LOG_CRIT, "smartarray(".serialize($struct).",".serialize($ids).")");
        $k = implode("']['",$ids);
        eval("\$node=\$struct['$k'];");
        return $node;
    }
    public function _array($parseFlag) {
        if ($this->err) return array(ERR_READ, $this->err);

        $this->_log(LOG_CRIT, '_array:'.$this->confile);
        $data = file_get_contents($this->confile);
        $xml_parser = xml_parser_create();
        xml_parse_into_struct($xml_parser, $data, $vals, $index);
        xml_parser_free($xml_parser);

        $struct = array();
        /*parse process*/
        $tagStack = array(); // stack to save this
        function _attribute($val, $parseFlag) {
            if ($parseFlag && preg_match('/\$SHELL\((.*)\)/', $val, $a)) {
                if ($a[1]) {
                    list($ret,$output) = uExec($a[1]);
                    if ($ret==0) {
                        $val = implode("\n", $output);
                    } else {
                        $val = sprintf("exec %s ret: %s", $a[1], $ret);
                    }
                }
            }
            return $val;
        }
        function ktolower($a, $parseFlag) { $d =array(); foreach ($a as $b=>$c) { $d[strtolower($b)] = _attribute($c, $parseFlag); } return $d; }
        function setNode(&$struct, $k, $elem, $tagStack, $parseFlag) {
            $k = implode("']['",$tagStack);
            $node = array();
            if ($elem['attributes']) 
                $node['attributes']=ktolower($elem['attributes'], $parseFlag);
            if ($elem['value']) {
                if (isset($node['attributes']['filters'])) {
                    //$rets = array(explode(";", $node['attributes']['_filters'])));
                    $rets = array();
                    $re = $elem['value'];
                    foreach (split("\n", $node['attributes']['value']) as $item) {
                        if (preg_match($re,$item,$ret))
                            array_push($rets, array_slice($ret,1));
                    }
                    $node['value'] = $rets; 
                } else {
                    $node['value']=$elem['value'];
                }
            }

            eval("\$existVal = \$struct['$k'];");
            if ($existVal) {
                if ($existVal['attributes'] || isset($existVal['value'])) {
                    $existVal = array($existVal, $node);
                } else {
                    array_push($existVal, $node);
                }
            } else {
                $existVal = $node;
            }
            return $existVal;
        }

        function _openp(&$struct, &$tagStack, $elem, $parseFlag) {
            $tag = strtolower($elem['tag']);
            $tagStack[] = $tag;
            $k = implode("']['",$tagStack);

            $node = setNode($struct, $k, $elem, $tagStack, $parseFlag);
            eval("\$struct['$k']=\$node;");
        }

        function _completep(&$struct, $tagStack, $elem, $parseFlag) {
            $tag = strtolower($elem['tag']);
            $tagStack[] = $tag;
            $k = implode("']['",$tagStack);

            $node = setNode($struct, $k, $elem, $tagStack, $parseFlag);
            eval("\$struct['$k']=\$node;");
        }
        function _closep(&$tagStack) { array_pop($tagStack); }
        function _cdatap($elem) { }
        foreach ($vals as $elem) {
            switch ($elem['type']) {
                case 'open':
                    _openp($struct, $tagStack, $elem, $parseFlag);
                    break;
                case 'close':
                    _closep($tagStack);
                    break;
                case 'complete':
                    _completep($struct, $tagStack, $elem, $parseFlag);
                    break;
                case 'cdata':
                    _cdatap($elem);
                    break;
                default:
            }
        }
        return array(ERR_OK, $struct);
    }

    public function update($nconf) {
        $this->_log(LOG_NOTICE, "OSConfXML::update(".serialize($nconf).")");

        $out = $this->_array();
        if ($out[0] != ERR_OK) {
            $this->_log(LOG_ERR, sprintf("OSConfXML::update 无法解析配置文件%s", $this->confile), true);
            return array(ERR_PARSE, $this->_err);
        }

        $conf = $out[1];

        function mergeNode(&$onode, $nnode) { 
            foreach ($nnode as $k=>$v) 
                if (!is_array($nnode[$k])) 
                    $onode[$k]['value'] = $v; 
                else 
                    mergeNode($onode[$k], $v);
        }
        mergeNode($conf, $nconf);
        
        $a = array_keys($nconf);
        $b = array_keys($nconf[$a[0]]);
        $this->_execOnUpdate($conf, array($a[0], $b[0]));
        return $this->_save($conf);
    }

    private function _save($struct) {
        $file = $this->confile;
        $fp = fopen($file, "w");
        function joinattr($a) { $d =array(); foreach ($a as $b=>$c) { $d[] = "$b='$c'"; } return implode(" ", $d); }
        $tagStack = array();
        $content = "<?xml version='1.0' encoding='utf-8'?>";
        function dumpNode(&$content, &$tagStack, $node) {
            if (is_array($node)) {
                $ifAtt = isset($node['attributes']);
                $ifVal = isset($node['value']);
                if ($ifAtt) {
                    $content .= " ".joinattr($node['attributes']);
                    unset($node['attributes']);
                }

                if ($ifVal) {
                    $va = trim($node['value']);
                    $va = $va?sprintf('<![CDATA[%s]]>', $va):"";
                    unset($node['value']);
                    $content .= ">$va";
                    if ($va) {
                        $et = array_pop($tagStack);
                        $content .= "</$et>\n";
                    }
                } else if (count($node)>0) {
                    $ks = array_keys($node);
                    if ($tagStack && !is_int($ks[0])) $content .= ">";
                } else {
                    array_pop($tagStack);
                    if ($ifAtt) 
                        $content .= "/>\n";
                    else 
                        if ($tagStack) $content .= ">";
                }

                if (count($node)) {
                    $ks = array_keys($node);
                    $vs = array_values($node);
                    $ifListK = is_int($ks[0]); // 是否为list类型的node

                    for ($i=0; $i<count($ks); $i++) {
                        $n = $ks[$i];
                        if (is_int($n)) { $n = $tagStack[count($tagStack)-1]; }

                        array_push($tagStack, $n);
                        $v = $vs[$i];
                        if (is_array($v)) {
                            $vk = array_keys($v);
                            if (!is_int($vk[0]))
                                $content .= sprintf("\n%s<%s", str_repeat("\t", count($tagStack)-1), $n);
                        } else {
                            $content .= sprintf("\n%s<%s", str_repeat("\t", count($tagStack)-1), $n);
                        }

                        dumpNode($content, $tagStack, $v);
                    }
        
                    $et = array_pop($tagStack);
                    if ($et && !$ifListK)
                        $content .= str_repeat("\t", count($tagStack))."</$et>\n";
                }
            }
        }

        dumpNode($content, $tagStack, $struct);
        $content = preg_replace("/\n{1,}/", "\n", $content);

        fwrite($fp, $content);
        fclose($fp);
        return array(ERR_OK, '保存成功');
    }

    public function del($struct) {
        $app = $this->app;
        $k = implode("']['", $app);
        eval("unset(\$struct['$k']);");
        array_pop($app);
        $k = implode("']['", $app);
        eval("if (count(\$struct['$k'])<2) unset(\$struct['$k']);");

        $ret = $this->_save($struct);
    }

    public function edit($struct, $action) {
        $app = $this->app;
        function getMetaByIds($struct, $ids) {
            function cbMetaArray($v) { return preg_replace('/-[0-9]+/', '', $v); }
            $k = implode("']['",array_map('cbMetaArray', $ids));
            eval("\$node=\$struct['$k'];");
            return $node;
        }
        function mergeMeta(&$node, $m) {
            $node['attributes'] = $m['attributes'];
            foreach ($node as $k=>$v) if ($k!='value') $node[$k]['attributes'] = $m[$k]['attributes'];
        }

        $data = array($action=>$this->_smarray($struct, $app));
        $meta = getMetaByIds($struct, $app);
        if ($meta) {
            foreach ($data as $k=>$a) mergeMeta($data[$k], $meta);
        }
        return $data;
    }

    private function _new($sdata) {
        $appK = $this->app;
        $xfile = $this->confile;

        function newNode($node) {
            $ret = array();
            foreach ($node as $k=>$v) $ret[$k]['value'] = $v;
            return $ret;
        }

        $k = implode("']['", $appK);
        eval("\$node=newNode(\$sdata['$k']);");

        $struct = $this->_array();
        if ($this->err) return array(ERR_READ, $this->err);

        $data = $struct[1];

        $ops = array_search('new', $appK);
        $appKs = array_slice($appK, 0, $ops-1);
        $a = array_pop(array_keys($this->_smarray($struct[1], $appKs)));
        if (preg_match('/([^-]+)-([0-9]+)/', $a, $b)) {
            array_push($appKs, $b[1]."-".($b[2]+1));
        } else {
            array_push($appKs, "$a-0");
        }

        $k = implode("']['", $appKs);
        eval("\$data['$k']=\$node;");

        $ret = $this->_save($data);

        $this->_execOnNew($data, $appKs);
        return $ret;
    }

    private function _update($data) {
        $appK = $this->app;
        $xfile = $this->confile;
        $k = implode("']['", $appK);
        eval("\$node=\$data['$k'];");

        $struct = $this->_array();
        if ($this->err) return array(ERR_READ, $this->err);

        $data = $struct[1];
        $ops = array_search('edit', $appK);
        $appKs = array_slice($appK, 0, $ops);
        $sk = implode("']['", $appKs);
        eval("\$nodex=\$data['$sk'];");
        $ks = array_keys($node);
        foreach ($nodex as $k=>$v) {
            if (in_array($k, $ks)) $nodex[$k]['value'] = $node[$k];
        }
        eval("\$data['$sk']=\$nodex;");

        return $this->_save($data);
    }
    //}}}
}
?>
