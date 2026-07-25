var ArduinoTemplate = "";
var ArduinoI2CTemplate = "";
var numCharacters = 8;
var selectedChar = 0;
var isDrawing = false;
var drawMode = true;

// --- Conversión binario a hex ---
function binaryToHex(s) {
    var i, k, part, accum, ret = '';
    for (i = s.length - 1; i >= 3; i -= 4) {
        part = s.substr(i + 1 - 4, 4);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== '0' && part[k] !== '1') return { valid: false };
            accum = accum * 2 + parseInt(part[k], 10);
        }
        ret = (accum >= 10 ? String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) : String(accum)) + ret;
    }
    if (i >= 0) {
        accum = 0;
        for (k = 0; k <= i; k += 1) {
            if (s[k] !== '0' && s[k] !== '1') return { valid: false };
            accum = accum * 2 + parseInt(s[k], 10);
        }
        ret = String(accum) + ret;
    }
    return { valid: true, result: ret };
}

// --- Helper: obtener un box-char por índice (evita clases numéricas inválidas en CSS) ---
function getCharBox(index) {
    return document.querySelector('.box-char[data-index="' + index + '"]');
}

// --- Obtener datos de todos los caracteres ---
function getCurrentData() {
    var Data = [];
    var myChars = document.getElementsByClassName("box-char");
    for (var c = 0; c < myChars.length; c++) {
        var col = myChars[c].getElementsByClassName("col");
        Data[c] = [];
        for (var x = 0; x < col.length; x++) {
            var pix = col[x].getElementsByClassName("dot-px");
            var BinStr = "";
            for (var y = 0; y < pix.length; y++) {
                BinStr += pix[y].classList.contains("high") ? "1" : "0";
            }
            Data[c][x] = BinStr;
        }
    }
    return Data;
}

// --- Generar código Arduino ---
function reloadCode() {
    ArduinoTemplate = "#include <LiquidCrystal.h>\n\n";
    ArduinoTemplate += "LiquidCrystal lcd(12, 11, 5, 4, 3, 2); // RS, E, D4, D5, D6, D7\n\n";

    ArduinoI2CTemplate = "#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\n";
    ArduinoI2CTemplate += "// Set the LCD address to 0x27 for PCF8574 or 0x3F for PCF8574A\n";
    ArduinoI2CTemplate += "LiquidCrystal_I2C lcd(0x3F, 16, 2);\n\n";

    for (var i = 0; i < numCharacters; i++) {
        var charDef = "byte customChar" + i + "[] = {\n";
        for (var row = 0; row < 8; row++) {
            charDef += "  {DataX" + i + row + "}" + (row < 7 ? ",\n" : "\n");
        }
        charDef += "};\n";
        ArduinoTemplate += charDef;
        ArduinoI2CTemplate += charDef;
    }

    var setup = "void setup() {\n  lcd.begin(16, 2);\n  lcd.createChar(0, customChar0);\n  lcd.home();\n  lcd.write(0);\n}\n\nvoid loop() { }";
    ArduinoTemplate += setup;
    ArduinoI2CTemplate += setup;
}

// --- Actualizar código y vista previa ---
function reloadData() {
    var type = $("[name='datatype']:checked").val() || "bin";
    var interfacing = $("[name='interfacing']:checked").val() || "parallel";

    var Data = getCurrentData();
    var html = (interfacing === "parallel") ? ArduinoTemplate : ArduinoI2CTemplate;

    for (var x = 0; x < 8; x++) {
        for (var i = 0; i < 8; i++) {
            var binStr = (Data[x] && Data[x][i]) || "00000";
            var val = (type === "hex") ? "0x" + binaryToHex(binStr).result : "B" + binStr;
            html = html.replace(new RegExp("\\{DataX" + x + i + "\\}", "g"), val);
        }
    }

    $("#code-box").html(html);
    Prism.highlightAll();
    renderPreview();
    updateSelection();
}

// --- Vista previa en LCD (2 filas de 4) ---
function renderPreview() {
    var preview = document.getElementById('lcd-preview');
    if (!preview) return;
    preview.innerHTML = '';

    var Data = getCurrentData();
    var cols = 4;
    var total = Math.min(numCharacters, 8);

    for (var row = 0; row < 2; row++) {
        var rowDiv = document.createElement('div');
        rowDiv.className = 'lcd-row';

        for (var col = 0; col < cols; col++) {
            var idx = row * cols + col;
            var charDiv = document.createElement('div');
            charDiv.className = 'lcd-char';
            charDiv.dataset.index = idx;

            var isActive = idx < total && Data[idx];
            if (!isActive) charDiv.classList.add('lcd-char-static');

            // r = fila del carácter (0-7), coincide con "x"/.col del editor
            // b = bit dentro de la fila (0-4), coincide con "y"/.dot-px del editor
            for (var r = 0; r < 8; r++) {
                var pxRow = document.createElement('div');
                pxRow.className = 'lcd-row-px';
                for (var b = 0; b < 5; b++) {
                    var px = document.createElement('div');
                    var bit = isActive && Data[idx][r] && Data[idx][r].charAt(b) === '1';
                    px.className = 'lcd-px ' + (bit ? 'on' : 'off');
                    pxRow.appendChild(px);
                }
                charDiv.appendChild(pxRow);
            }

            if (isActive) {
                if (idx === selectedChar) charDiv.classList.add('selected');
                charDiv.addEventListener('click', function () {
                    selectCharacter(parseInt(this.dataset.index, 10));
                });
            }
            rowDiv.appendChild(charDiv);
        }
        preview.appendChild(rowDiv);
    }
}

// --- Seleccionar carácter (resaltar en editor y vista previa) ---
function selectCharacter(index) {
    if (index < 0 || index >= numCharacters) return;
    selectedChar = index;
    document.querySelectorAll('.box-char').forEach(function (b) {
        b.classList.remove('box-char-selected');
    });
    var box = getCharBox(index);
    if (box) box.classList.add('box-char-selected');
    renderPreview();
}

function updateSelection() {
    selectCharacter(selectedChar);
}

// --- Construir los 8 box-char ---
function buildCharGrid() {
    var row = document.getElementById('charRow');
    row.innerHTML = '';
    for (var i = 0; i < 8; i++) {
        var box = document.createElement('div');
        box.className = 'box-char green';
        box.dataset.index = i;
        for (var x = 0; x < 8; x++) {
            var col = document.createElement('div');
            col.className = 'col';
            for (var y = 0; y < 5; y++) {
                var dot = document.createElement('div');
                dot.className = 'dot-px';
                dot.dataset.x = x;
                dot.dataset.y = y;
                col.appendChild(dot);
            }
            box.appendChild(col);
        }
        row.appendChild(box);
    }
}

// --- Espejar el carácter seleccionado ---
function getSelectedCols() {
    var box = getCharBox(selectedChar);
    return box ? box.getElementsByClassName("col") : null;
}

function mirrorVertical(direction) {
    var cols = getSelectedCols();
    if (!cols) return;
    var range = direction === "down" ? [0, 1, 2, 3] : [4, 5, 6, 7];
    range.forEach(function (srcIdx) {
        var dstIdx = 7 - srcIdx;
        var srcPix = cols[srcIdx].getElementsByClassName("dot-px");
        var dstPix = cols[dstIdx].getElementsByClassName("dot-px");
        for (var y = 0; y < srcPix.length; y++) {
            dstPix[y].classList.toggle("high", srcPix[y].classList.contains("high"));
        }
    });
    reloadData();
}

function mirrorHorizontal() {
    var cols = getSelectedCols();
    if (!cols) return;
    for (var x = 0; x < cols.length; x++) {
        var pix = cols[x].getElementsByClassName("dot-px");
        for (var y = 0; y < 2; y++) {
            var mirrorY = pix.length - 1 - y;
            pix[mirrorY].classList.toggle("high", pix[y].classList.contains("high"));
        }
    }
    reloadData();
}

// --- Modo oscuro / claro ---
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lcd-theme', theme);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro';
}

// --- Inicialización ---
$(document).ready(function () {
    var savedTheme = localStorage.getItem('lcd-theme') || 'light';
    applyTheme(savedTheme);
    $("#themeToggle").click(function () {
        var current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    buildCharGrid();

    // --- Dibujo de píxeles (click + arrastre) ---
    function togglePixel(el) {
        var $el = $(el);
        var already = $el.hasClass('high');
        if (drawMode && !already) { $el.addClass('high'); reloadData(); }
        else if (!drawMode && already) { $el.removeClass('high'); reloadData(); }
    }

    $(document).on('mousedown', '.dot-px', function (e) {
        e.preventDefault();
        drawMode = !$(this).hasClass('high');
        isDrawing = true;
        togglePixel(this);
    });
    $(document).on('mouseenter', '.dot-px', function () {
        if (isDrawing) togglePixel(this);
    });
    $(document).on('mouseup', function () { isDrawing = false; });

    // --- Botones ---
    $("#clear, #reset").click(function () {
        $(".dot-px").removeClass("high");
        reloadData();
    });
    $("#invert").click(function () {
        $(".dot-px").toggleClass("high");
        reloadData();
    });
    $("#mirrorDown").click(function () { mirrorVertical("down"); });
    $("#mirrorUp").click(function () { mirrorVertical("up"); });
    $("#mirrorBoth").click(function () { mirrorHorizontal(); });

    // --- Cambio de color ---
    $("[name='color']").change(function () {
        $(".box-char").removeClass("green blue").addClass(this.value);
    });

    // --- Cambio de estructura (mostrar/ocultar caracteres) ---
    $("#structure").change(function () {
        var val = parseInt(this.value, 10);
        numCharacters = val;
        document.querySelectorAll('.box-char').forEach(function (b) {
            var idx = parseInt(b.dataset.index, 10);
            b.classList.toggle('box-char-invis', idx >= val);
        });
        if (selectedChar >= val) selectCharacter(0);
        reloadCode();
        reloadData();
    });

    // --- Cambio de tipo de dato / interfaz ---
    $("[name='datatype'], [name='interfacing']").change(reloadData);

    // --- Seleccionar carácter al hacer clic en su área (editor) ---
    $(document).on('click', '.box-char', function (e) {
        if ($(e.target).hasClass('dot-px')) return;
        var idx = parseInt(this.dataset.index, 10);
        if (idx < numCharacters) selectCharacter(idx);
    });

    // --- Inicializar ---
    reloadCode();
    reloadData();
    selectCharacter(0);
});