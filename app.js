//インターネットアクセルする「http」というオブジェクトを読み込む。**変数＝require(ID(モジュール))
const http = require('http');
const fs = require('fs');

//ejsオブジェクトの読み込み
const ejs = require('ejs');

//スタイルシートの読み込み処理を追加する
const url = require('url');

//querystringモジュールのロード
const qs = require('querystring');

//テンプレートファイルの読み込み **readFileSync=同期処理**
const index_page = fs.readFileSync('./index.ejs', 'utf8');
const login_page = fs.readFileSync('./login.ejs', 'utf8');
const style_css = fs.readFileSync('./style.css', 'utf8');

const max_num = 10; //最大保管数
const filename = 'mydata.txt'; //データファイル名
var message_data; //☆データ
readFromFile(filename);

//サーバーオブジェクトを作る **変数＝http.createServer(関数);**
var server = http.createServer(getFromClient);

//サーバーオブジェクトを待ち受け状態にする
server.listen(3000);
console.log('Server start!');

//ここまでメインプログラム

//createServerの処理
function getFromClient(request, response) {

    var url_parts = url.parse(request.url, true);
    switch (url_parts.pathname) {

        case '/':
            response_index(request, response);
            break;
        case '/login':
            response_login(request, response);
            break;
        case '/style.css':
            response.writeHead(200, { 'Content-Type': 'text/css' });
            response.write(style_css);
            response.end();
            break;
        default:
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end('no page...');
            break;

    }
}

//loginのアクセス処理
function response_login(request, response) {
    var content = ejs.render(login_page, {});
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(content);
    response.end();
}

//indexのアクセス処理
function response_index(request, response) {
    //POSTアクセス時の処理
    if (request.method == 'POST') {
        var body = '';

        //データ受信のイベント処理
        request.on('data', function (data) {
            body += data;
        });

        //データ受信終了のイベント処理
        request.on('end', function () {
            data = qs.parse(body);
            addToData(data.id, data.msg, filename, request);
            write_index(request, response);
        });
    } else {
        write_index(request, response);
    }

}

//indexのページ作成

function write_index(request, response) {
    var msg = "※何かメッセージを書いてください。";
    var content = ejs.render(index_page, {
        title: 'Index',
        content: msg,
        data: message_data,
        filename: 'data_item',
    });
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(content);
    response.end();
}

//テキストファイルのロード
function readFromFile(fname) {
    fs.readFile(fname, 'utf8', (err, data) => {
        message_data = data.split('\n');
    })
}

//データの更新
function addToData(id, msg, fname, request) {
    var obj = { 'id': id, 'msg': msg };
    var obj_str = JSON.stringify(obj);
    console.log('add data:' + obj_str);
    message_data.unshift(obj_str);
    if (message_data.length > max_num) {
        message_data.pop();
        saveToFile(fname);
    }

    //データの保存
    function saveToFile(fname) {
        var data_str = message_data.join('\n');
        fs.writeFile(fname, data_str, (err) => {
            if (err) { throw err; }
        });
    }
}