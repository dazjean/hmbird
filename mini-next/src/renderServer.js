/*
 * @Author: zhang dajia
 * @Date: 2018-12-22 17:10:16
 * @Last Modified by: zhang dajia
 * @Last Modified time: 2020-11-30 12:13:33
 * 服务端渲染解析工具类
 */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import getStream from 'get-stream';
import { loadGetInitialProps } from './get-static-props';
import { render, checkDistJsmodules } from './render-server-static';
import Logger from './log';
/**
 * Router类型页面渲染解析
 * @param {*} pagename
 * @param {*} App
 */
const renderServerDynamic = async pagename => {
    const context = {};
    let Html = '';
    let Htmlstream = '';
    let jspath = await checkDistJsmodules(pagename);
    let App = require(jspath);
    let props = await loadGetInitialProps(App);

    try {
        Htmlstream = ReactDOMServer.renderToNodeStream(
            <StaticRouter context={context}>
                <App {...props} />
            </StaticRouter>
        );
    } catch (error) {
        Logger.warn(`[mini-next] ${pagename}服务端渲染异常，降级使用客户端渲染！`);
    }
    // 加载 index.html 的内容
    let data = await render(pagename);
    try {
        Html = await getStream(Htmlstream);
    } catch (error) {
        Logger.warn(`[mini-next] ${pagename}流转化字符串异常!-${error.stack}`);
    }
    // 把渲染后的 React HTML 插入到 div 中
    let document = data.replace(/<div id="app"><\/div>/, `<div id="app">${Html}</div>`);
    // 把响应传回给客户端
    return document;
};

module.exports = {
    render,
    renderServerDynamic
};
