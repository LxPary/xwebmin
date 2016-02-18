初期目标为建立一个通用的WEBMIN，以对各种设备或者个人提供通用的用户交互管理模块，提升传统UNIX管理易用性
中期目标为建立一个通用的WEBMIN，能够对于各种application提供便捷的管理接口

将会支持以下浏览器:ie6/7,firefox1.5/2.0/3.0,opera 9
webkit内核的Android上的浏览器以及s60浏览器

# 特点 #
1) 界面基于webos的一些设计思想，仿传统的GUI应用交互，首要考虑用户的交互

2) 再实现上抽象出HTTP-RPC的行为，支持HTTP的远程的操作

3) 新的管理模块的集成通过编写xml配置文件来实现，亦可自己定制不同应用的关联性

# 工作 #
a) 对于webmin框架的设计，改进

b) 基于webmin的设计，使用用各种语言实现webmin的工作流程: xml => shell => json => html/javascript

c) 对于系统常用的应用(网络,资源...)的xwebmin模块的实现

d) 研究并实现在nxbsd中使用该框架完成init之后的引导

```
xwebmin的由来，x一般有超级的意思，再加上本项目就是想重新设计并实现一个类似webmin的工具，因此取名为xwebmin...
```