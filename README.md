# Element Copy 元素复制

Chrome / Edge Manifest V3 浏览器扩展

## ✨ 功能

拾取页面任意DOM元素，一键复制，支持两种模式：

- **富文本模式（默认）**：复制HTML，文字+图片一并保存，粘贴到 Notion / 飞书文档 / Word 可保留图文结构（图片为原链接，断网图片失效）
- **纯文本模式**：仅提取元素内文字

> 与配套插件 `Element Copy Text` 区分：
> 
> - Element Copy Text：只复制纯文本
> - Element Copy：支持富文本/纯文本切换

## 📌 使用方式

1. **左键点击插件图标**：开启拾取模式
2. 鼠标悬浮页面元素，蓝色框高亮预览
3. 点击目标元素，自动复制并退出拾取
4. `Esc` 按键：随时退出拾取模式
5. **右键点击插件图标**：菜单切换复制模式（设置自动保存）

## 📦 本地安装

1. 下载源码
2. 浏览器地址栏打开 `chrome://extensions/`（Edge：`edge://extensions/`）
3. 开启【开发者模式】
4. 点击【加载已解压的扩展程序】，选中项目文件夹

## 📁 文件说明

element-copy/

├─ manifest.json # 扩展配置

├─ background.js # 后台服务、图标右键菜单

├─ content.js # 页面拾取、高亮、剪贴板逻辑

├─ styles.css # 高亮框、顶部提示样式

└─ README.md
