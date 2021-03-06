const path = require('path');
const fs = require("fs");
const root = '../../src';
const relatively = 'api';

module.exports = function (modulePath, name) {

    if (!modulePath) {
        console.log('没有输入路径');
        return;
    }

    if (!name) {
        console.log('没有输入模块名称');
        return;
    }

    //判断是站点跟，还是相对display/modules路径
    if (modulePath.indexOf('/') === 0) {
        modulePath = path.resolve(__dirname, root, modulePath.slice(1), name);
    } else {
        modulePath = path.resolve(__dirname, root, relatively, modulePath, name);
    }

    console.log('模块目录：' + modulePath);

    let tem;

    //创建目录
    try {
        fs.mkdirSync(modulePath);
        console.log('目录创建成功');
    } catch (error) {
        console.log('目录创建失败');
    }

    writeTemplate(modulePath, 'IData.ts', process);
    writeTemplate(modulePath, 'index.ts', process);
    writeTemplate(modulePath, 'IOptions.ts', process);

    function process(tem){
        return tem.replace(/\{\{name\}\}/g, name.substr(0,1).toUpperCase()+name.substr(1));
    }
}

function writeTemplate(modulePath, tname, process) {
    try {
        tem = fs.readFileSync(path.resolve(__dirname, `${tname}.template`));
        fs.writeFileSync(path.resolve(modulePath, tname), process(tem.toString()));
        console.log(`${tname}-----ok`);
    } catch (error) {
        console.log(`[${tname}]生成失败`, error);
    }
}

