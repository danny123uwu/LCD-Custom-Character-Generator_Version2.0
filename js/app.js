// ===== Configuración =====
const NUM_CHARS = 8;        // 8 caracteres (4 arriba, 4 abajo)
const COLS = 4;            // columnas en la interfaz (4)
const ROWS = 2;            // filas (2)
const PIXEL_ROWS = 8;      // altura del carácter en píxeles
const PIXEL_COLS = 5;      // ancho del carácter

// Estado: datos de cada carácter (8x8x5 booleano)
let charData = Array(NUM_CHARS).fill().map(() => 
    Array(PIXEL_ROWS).fill().map(() => Array(PIXEL_COLS).fill(false))
);
let activeCharIndex = 0;   // carácter seleccionado para editar

// ===== DOM references =====
const gridContainer = document.getElementById('lcd-grid');
const previewContainer = document.getElementById('lcd-preview');
const codeOutput = document.getElementById('arduino-code');

// ===== Renderizado de la cuadrícula de edición =====
function renderGrid() {
    gridContainer.innerHTML = '';
    for (let i = 0; i < NUM_CHARS; i++) {
        const charDiv = document.createElement('div');
        charDiv.className = 'character-editor' + (i === activeCharIndex ? ' active' : '');
        charDiv.dataset.index = i;

        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = `Carácter ${i}`;
        charDiv.appendChild(label);

        const grid = document.createElement('div');
        grid.className = 'pixel-grid';
        for (let row = 0; row < PIXEL_ROWS; row++) {
            for (let col = 0; col < PIXEL_COLS; col++) {
                const px = document.createElement('div');
                px.className = 'pixel' + (charData[i][row][col] ? ' on' : '');
                px.dataset.charIndex = i;
                px.dataset.row = row;
                px.dataset.col = col;
                px.addEventListener('click', onPixelClick);
                grid.appendChild(px);
            }
        }
        charDiv.appendChild(grid);

        // Al hacer clic en el editor, seleccionarlo
        charDiv.addEventListener('click', function(e) {
            // si el clic fue en un píxel, no cambiamos selección (ya se maneja)
            if (e.target.classList.contains('pixel')) return;
            const idx = parseInt(this.dataset.index);
            selectCharacter(idx);
        });

        gridContainer.appendChild(charDiv);
    }
}

// ===== Manejo de clic en píxel =====
function onPixelClick(e) {
    const px = e.currentTarget;
    const charIdx = parseInt(px.dataset.charIndex);
    const row = parseInt(px.dataset.row);
    const col = parseInt(px.dataset.col);
    // Alternar estado
    charData[charIdx][row][col] = !charData[charIdx][row][col];
    // Actualizar visual
    px.classList.toggle('on');
    // Actualizar preview y código
    updatePreview();
    updateCode();
}

// ===== Seleccionar un carácter (resaltar) =====
function selectCharacter(index) {
    activeCharIndex = index;
    // Quitar active de todos
    document.querySelectorAll('.character-editor').forEach(el => el.classList.remove('active'));
    // Poner active al seleccionado
    const editors = document.querySelectorAll('.character-editor');
    if (editors[index]) editors[index].classList.add('active');
    // No necesitamos re-renderizar, solo resaltar
}

// ===== Actualizar vista previa =====
function updatePreview() {
    previewContainer.innerHTML = '';
    // Mostrar solo los primeros 8 caracteres en una fila (puedes expandir a 16)
    const maxShow = Math.min(NUM_CHARS, 8);
    for (let i = 0; i < maxShow; i++) {
        const charDiv = document.createElement('div');
        charDiv.className = 'preview-char';
        for (let row = 0; row < PIXEL_ROWS; row++) {
            for (let col = 0; col < PIXEL_COLS; col++) {
                const px = document.createElement('div');
                px.className = 'preview-pixel' + (charData[i][row][col] ? ' on' : '');
                charDiv.appendChild(px);
            }
        }
        previewContainer.appendChild(charDiv);
    }
}

// ===== Generar código Arduino =====
function updateCode() {
    // Generar para cada carácter
    let code = '#include <LiquidCrystal.h>\n\n';
    code += 'LiquidCrystal lcd(12, 11, 5, 4, 3, 2);\n\n';

    for (let i = 0; i < NUM_CHARS; i++) {
        code += `byte customChar${i}[8] = {\n`;
        for (let row = 0; row < PIXEL_ROWS; row++) {
            let bin = '';
            for (let col = 0; col < PIXEL_COLS; col++) {
                bin += charData[i][row][col] ? '1' : '0';
            }
            // Convertir binario a número (base 2) y luego a hexadecimal o decimal
            const val = parseInt(bin, 2);
            code += `  B${bin}${row < PIXEL_ROWS-1 ? ',' : ''}\n`;
        }
        code += '};\n\n';
    }

    code += 'void setup() {\n';
    code += '  lcd.begin(16, 2);\n';
    for (let i = 0; i < NUM_CHARS; i++) {
        code += `  lcd.createChar(${i}, customChar${i});\n`;
    }
    code += '  lcd.home();\n';
    // Mostrar los primeros 8 caracteres en la primera fila
    for (let i = 0; i < NUM_CHARS && i < 16; i++) {
        code += `  lcd.write(${i});\n`;
    }
    code += '}\n\n';
    code += 'void loop() {}\n';

    codeOutput.textContent = code;
}

// ===== Acciones de botones =====
function clearAll() {
    for (let i = 0; i < NUM_CHARS; i++) {
        for (let r = 0; r < PIXEL_ROWS; r++) {
            for (let c = 0; c < PIXEL_COLS; c++) {
                charData[i][r][c] = false;
            }
        }
    }
    // Re-renderizar toda la cuadrícula (o actualizar píxeles)
    renderGrid();
    updatePreview();
    updateCode();
}

function invertAll() {
    for (let i = 0; i < NUM_CHARS; i++) {
        for (let r = 0; r < PIXEL_ROWS; r++) {
            for (let c = 0; c < PIXEL_COLS; c++) {
                charData[i][r][c] = !charData[i][r][c];
            }
        }
    }
    renderGrid();
    updatePreview();
    updateCode();
}

function resetAll() {
    // Reiniciar a un patrón predeterminado (opcional)
    clearAll();
}

// ===== Inicialización =====
document.addEventListener('DOMContentLoaded', function() {
    renderGrid();
    updatePreview();
    updateCode();

    // Botones
    document.getElementById('clearAll').addEventListener('click', clearAll);
    document.getElementById('invertAll').addEventListener('click', invertAll);
    document.getElementById('resetAll').addEventListener('click', resetAll);

    // Copiar código
    document.getElementById('copyCode').addEventListener('click', function() {
        const code = document.getElementById('arduino-code');
        navigator.clipboard.writeText(code.textContent).then(() => {
            alert('Código copiado al portapapeles');
        }).catch(() => {
            // Fallback
            const range = document.createRange();
            range.selectNode(code);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            alert('Código copiado');
        });
    });
});