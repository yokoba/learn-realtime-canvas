'use strict';

// ドラッグ中の状態管理
let isDrag = false;

// キャンバスを移動した距離を入れておく
let translateX = 0;
let translateY = 0;

// キャンバスのサイズを決める時にウィンドウサイズぴったりにならないようにマージンをいれる
const marginHeight = 100;
const marginWidth = 40;

// キャンバスサイズを決める
const $canvas = $('#canvas');
let window_height = window.innerHeight - marginHeight;
let window_width = window.innerWidth - marginWidth;

// 描画するためのデータを管理したりキャンバスにデータを描画する
class Symbols {
    constructor() {
        this.symbols = Object();
        this._index = 0;
    }

    // jCanvasの仕様ですでに存在しているレイヤー名を指定して描画するとエラーにはならない
    // けれどもレイヤーとして描画されないのでdrawLayersで再描画すると後から描いたほうが消えてしまう
    // 面倒な仕様なので描画する前に重複をチェック
    // それからキー名にlayer nameを指定しておいて、今後の拡張しやすくする
    add(symbol) {
        if (symbol[symbol.name] !== undefined) {
            throw `duplicate layer name: ${symbol.name}`;
        }

        this.symbols[symbol.name] = { ...symbol, symbolIndex: this._index };
        this._index += 1;
    }

    // symbolsに入っている描画用のデータをすべて描画する
    // 描画する順番が大事なので、順番を管理できるようにする
    // 任意の順番で指定できるようにするとか、考えたほうが良いかも
    allDraw() {
        const sorted = Object.values(this.symbols).sort(
            (a, b) => a.symbolIndex - b.symbolIndex
        );

        sorted.forEach((symbol) => {
            $canvas.addLayer(symbol);
        });
    }
}

let symbols = new Symbols();

// キャンバスを移動する
const translate = (x, y) => {
    $canvas.translateCanvas({
        translateX: x,
        translateY: y,
    });
};

// キャンバスの基準となる左上に描画してちゃんと描画されているのかどうか確認するためのもの
const base = () => {
    $canvas.drawRect({
        layer: true,
        name: 'base',
        fillStyle: '#000',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fromCenter: false,
        opacity: 0.2,
    });
};

// 無地のキャンバスだと描画したデータがあってるかどうかわからないので確認するためのもの
const grid = () => {
    const colors = [
        '#FF0000', // 赤
        '#0000FF', // 青
        '#00FF00', // 緑
        '#FFFF00', // 黄色
        '#800080', // 紫
        '#FFA500', // オレンジ
        '#00FFFF', // シアン
        '#FF00FF', // マゼンタ
        '#A52A2A', // 茶色
        '#FFC0CB', // ピンク
    ];
    let opacity = 0.3;
    let color = 'black';
    for (let i = 0; i < window_height; i += 25) {
        if (i > 0 && i % 100 === 0) {
            color = colors[(i / 100).toFixed(0)];
            opacity = 1.0;
        } else {
            color = 'black';
            opacity = 0.3;
        }

        $canvas.drawLine({
            layer: true,
            name: 'gridHeight' + String(i),
            strokeStyle: color,
            strokeWidth: 1,
            x1: 0,
            y1: i,
            x2: window_width,
            y2: i,
            opacity: opacity,
        });
    }
    for (let i = 0; i < window_width; i += 25) {
        if (i > 0 && i % 100 === 0) {
            color = colors[(i / 100).toFixed(0)];
            opacity = 1.0;
        } else {
            color = 'black';
            opacity = 0.3;
        }
        $canvas.drawLine({
            layer: true,
            name: 'gridWidth' + String(i),
            strokeStyle: color,
            strokeWidth: 1,
            x1: i,
            y1: 0,
            x2: i,
            y2: window_height,
            opacity: opacity,
        });
    }
};

// キャンバス全体を再描画する
const reDraw = async () => {
    // キャンバス全体をクリア
    $canvas.clearCanvas();

    // 現在のキャンバスの状態を保存 (translate, scale, etc.)
    $canvas.saveCanvas();

    // グリッドを描画
    grid();

    // キャンバス全体を指定された距離だけ移動させる
    translate(translateX, translateY);

    // すべてのシンボルを描画
    symbols.allDraw();

    // 確認用の四角を描画
    base();

    // 全てのレイヤーを描画 (translateの影響を受ける)
    $canvas.drawLayers();

    // translateやscaleなどの設定を保存時点のデータに戻す
    $canvas.restoreCanvas();
};

// テスト用に2個目の四角を追加
symbols.add({
    type: 'rectangle',
    layer: true,
    name: 'rect1',
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    fillStyle: 'red',
    fromCenter: false,
    opacity: 0.5,
});

// 画面をドラッグしたときの描画を管理する
// 短時間で何度も描画すると重いので指定間隔以下だと実行されないようにする
let reDrawBounceFlag = null;
const reDrawBounceInterval = 100;

// 再描画実行
const reDrawBounce = () => {
    reDrawBounceFlag = null;
    reDraw();
    // デバッグ用: 再描画が実行されたタイミングを表示
    console.log(new Date());
};

// ドラッグイベントを追加
(() => {
    $canvas.on('mousedown', (e) => {
        isDrag = true;
    });
    $canvas.on('mouseup', (e) => {
        isDrag = false;
    });
    $canvas.on('mousemove', (je) => {
        if (isDrag) {
            const e = je.originalEvent;
            const x = e.movementX;
            const y = e.movementY;
            console.log(`x: ${x}, y: ${y}`);

            translateX += x;
            translateY += y;

            if (reDrawBounceFlag === null) {
                reDrawBounceFlag = setTimeout(
                    reDrawBounce,
                    reDrawBounceInterval
                );
            }
        }
        $('#info').text(`x: ${translateX}, y: ${translateY}`);
    });

    // 画面をリサイズしたときに再描画
    const resizeWindow = () => {
        window_height = window.innerHeight - marginHeight;
        window_width = window.innerWidth - marginWidth;
        $canvas.prop({ width: window_width, height: window_height });

        console.log(`width: ${window_width}, height: ${window_height}`);
        if (reDrawBounceFlag === null) {
            reDrawBounceFlag = setTimeout(reDrawBounce, reDrawBounceInterval);
        }
    };
    window.onresize = resizeWindow;
    resizeWindow();
})();

// 最初に一回描画する
reDraw();

// 3秒後に追加の四角形を描画して、移動時に一緒に動くかをテストする
let x = 100;
let y = 200;
const addRect = () => {
    const symbol = {
        type: 'rectangle',
        layer: true,
        name: 'rect2' + String(x),
        x: x,
        y: y,
        width: 100,
        height: 100,
        fillStyle: 'blue',
        fromCenter: false,
        opacity: 0.5,
    };

    symbols.add(symbol);
    x += 5;
};
setTimeout(addRect, 3000);
