本章节用于介绍xwebmin的设计

# 目标 #
实现一个便于扩展的webmin
## 架构内的通讯 ##
配置文件采用xml文件来实现，浏览器与后台的消息通讯出了html文本外，大量使用了POST=>json消息这样一种ajax传递

## 模块介绍 ##
### desktop-index.php ###
xwebmin的桌面，参考webos的设计，实现了一个高效美观的桌面
### backend-index.php ###
任何调用都通过此资源请求
### ui-lib/ ###
提供基本的ui库，用于将调用获得的数据转化为桌面所呈现的各个部件，以及提供对行为的支持
#### core.js ####
基础的js lib，用于xwebmin便捷的js函数包装，出了封装了系统函数$O,$import,$init，其余的全部以对象的形式来进行，各个资源的导入未来将会放在此处....
#### desktop ####
桌面组件库，包括提供桌面部件以及form部件的f.js以及对应的样式表f.css的定义
#### window ####
窗口组件库，包括提供窗口部件的f.js
### sys-lib/ ###