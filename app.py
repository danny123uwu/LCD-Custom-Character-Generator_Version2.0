from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json  # espera un arreglo de caracteres (8x8x5 booleanos)
    # Generar código Arduino en Python
    code = "#include <LiquidCrystal.h>\n\nLiquidCrystal lcd(12,11,5,4,3,2);\n\n"
    for i, char in enumerate(data):
        code += f"byte customChar{i}[8] = {{\n"
        for row in char:
            bin_str = ''.join('1' if cell else '0' for cell in row)
            code += f"  B{bin_str},\n"
        code += "};\n\n"
    # ... resto del código
    return jsonify({'code': code})

if __name__ == '__main__':
    app.run(debug=True)