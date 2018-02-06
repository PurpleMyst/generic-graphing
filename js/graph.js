/* jshint browser: true, esnext: true, undef: true, eqeqeq: true, debug: true */

(function() {
  "use strict";

  const CANVAS_WIDTH  = 300;
  const CANVAS_HEIGHT = 300;

  const ARROW_SIZE = 5;
  const TICK_SIZE = 3;

  const STEP = 0.01;

  const INPUT_DOMAIN_START  = -5;
  const INPUT_DOMAIN_END    = 5;
  const OUTPUT_DOMAIN_START = -5;
  const OUTPUT_DOMAIN_END   = 5;

  const mapRange = (input, input_start, input_end, output_start, output_end) =>
      output_start + ((output_end - output_start) / (input_end - input_start)) * (input - input_start);

  const stringifyPolynomial = (polynomial, depth) => {
      if (typeof polynomial === "string") return polynomial;

      let stringPolynomial = "";
      let index = 0;

      polynomial.forEach(part => {
        /* TODO: Can we call this something better than factor? */
        let [coefficient, factor] = part;

        if (coefficient === 0) {
          index += 1;
          return;
        } else if (index !== 0) {
          if (coefficient > 0) {
            stringPolynomial += " + ";
          } else {
            stringPolynomial += " - ";
          }
        }

        const stringFactor = stringifyPolynomial(factor, depth + 1);

        if (index !== 0) coefficient = Math.abs(coefficient);
        if (coefficient !== 1 || stringFactor.length === 0) stringPolynomial += coefficient;
        stringPolynomial += stringFactor;
        if (index < polynomial.length - 2) stringPolynomial += '^' + (polynomial.length - index - 1);

        index += 1;
      });

      if (stringPolynomial === "") {
        stringPolynomial = "0";
      }

      if (depth !== 0 && polynomial.filter(t => t[0] != 0).length > 1) {
        stringPolynomial = '(' + stringPolynomial + ')';
      }

      return stringPolynomial;
    }

  class Graph {
    constructor(constants, formula, displayer) {
      this.constants = constants;
      this.formula = formula;
      this.displayer = displayer;

      this._createCanvas();
      this._createInputContainer();
      this._createInputs();
    }

    _createCanvas() {
      this._canvas = document.createElement("canvas");
      this._canvas.width = CANVAS_WIDTH;
      this._canvas.height = CANVAS_HEIGHT;
      this._context = this._canvas.getContext("2d");
      document.body.append(this._canvas);
    }

    _createInputContainer() {
      this._$inputContainer = document.createElement("div");
      this._$inputContainer.id = "inputs";
      document.body.append(this._$inputContainer);
    }

    _createInput(name) {
        const $input = document.createElement("input");
        $input.name = name;
        $input.id = name;
        $input.type = "number";
        $input.value = 0;
        $input.addEventListener("input", () => this.draw());

        const $label = document.createElement("label");
        $label.htmlFor = name;
        $label.textContent = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() + ' ';

        this._$inputContainer.append($label);
        this._$inputContainer.append($input);
        this._$inputContainer.append(document.createElement("br"));
        this._inputs[name] = $input;
    }

    _createInputs() {
      this._inputs = {};
      this.constants.forEach(name => this._createInput(name));
    }

    _drawGrid() {
      this._context.beginPath();
      this._context.strokeStyle = "#1113";

      for (let mathY = OUTPUT_DOMAIN_START; mathY <= OUTPUT_DOMAIN_END; ++mathY) {
        const screenY = mapRange(-mathY,
                                 OUTPUT_DOMAIN_START, OUTPUT_DOMAIN_END,
                                 0, this._canvas.height - 1);
        const nextScreenY = mapRange(-(mathY + 1),
                                     OUTPUT_DOMAIN_START, OUTPUT_DOMAIN_END,
                                     0, this._canvas.height - 1);

        for (let mathX = INPUT_DOMAIN_START; mathX <= INPUT_DOMAIN_END; ++mathX) {
          const screenX = mapRange(mathX,
                                   INPUT_DOMAIN_START, INPUT_DOMAIN_END,
                                   0, this._canvas.width - 1);
          const nextScreenX = mapRange(mathX + 1,
                                       INPUT_DOMAIN_START, INPUT_DOMAIN_END,
                                       0, this._canvas.width - 1);

          /* left to right */
          this._context.moveTo(screenX, screenY);
          this._context.lineTo(nextScreenX, screenY);

          /* up to down */
          this._context.moveTo(screenX, screenY);
          this._context.lineTo(screenX, nextScreenY);
        }
      }

      this._context.stroke();
    }

    _drawAxes() {
      this._context.beginPath();
      this._context.font = "bold 9px serif";
      this._context.strokeStyle = "#000";
      this._context.fillStyle = "#000";

      /* draw x numbers */
      for (let mathX = INPUT_DOMAIN_START; mathX <= INPUT_DOMAIN_END; ++mathX) {
        if (mathX === 0) continue;
        const screenX = mapRange(mathX,
                                 INPUT_DOMAIN_START, INPUT_DOMAIN_END,
                                 0, this._canvas.width - 1);
        this._context.moveTo(screenX, this._canvas.height / 2 - TICK_SIZE);
        this._context.lineTo(screenX, this._canvas.height / 2 + TICK_SIZE);
        this._context.fillText(mathX, screenX + 2, this._canvas.height / 2 - 8 + 16);
      }

      /* draw y numbers */
      for (let mathY = OUTPUT_DOMAIN_START; mathY <= OUTPUT_DOMAIN_END; ++mathY) {
        if (mathY === 0) continue;
        const screenY = mapRange(-mathY,
                                 OUTPUT_DOMAIN_START, OUTPUT_DOMAIN_END,
                                 0, this._canvas.height - 1);

        this._context.moveTo(this._canvas.width / 2 - TICK_SIZE, screenY);
        this._context.lineTo(this._canvas.width / 2 + TICK_SIZE, screenY);
        this._context.fillText(mathY, this._canvas.width / 2 + 4, screenY + 2);
      }
      this._context.stroke();

      this._context.font = "bold 16px serif";
      this._context.fillStyle = "#000";

      this._context.fillText("y", this._canvas.width / 2 - 16, 16);
      this._context.fillText("x", this._canvas.width - 16, this._canvas.height / 2 - 5);

      this._context.stroke();
      this._context.beginPath();

      /* x axis */
      this._context.moveTo(0, this._canvas.height / 2);
      this._context.lineTo(this._canvas.width, this._canvas.height / 2);

      /* x arrow */
      this._context.lineTo(this._canvas.width - ARROW_SIZE, this._canvas.height / 2 - ARROW_SIZE);
      this._context.moveTo(this._canvas.width, this._canvas.height / 2);
      this._context.lineTo(this._canvas.width - ARROW_SIZE, this._canvas.height / 2 + ARROW_SIZE);

      /* y axis */
      this._context.moveTo(this._canvas.width / 2, 0);
      this._context.lineTo(this._canvas.width / 2, this._canvas.height);

      /* y arrow */
      this._context.moveTo(this._canvas.width / 2, 0);
      this._context.lineTo(this._canvas.width / 2 - ARROW_SIZE, ARROW_SIZE);
      this._context.moveTo(this._canvas.width / 2, 0);
      this._context.lineTo(this._canvas.width / 2 + ARROW_SIZE, ARROW_SIZE);

      this._context.stroke();
    }

    _drawPoints() {
      const imageData = this._context.getImageData(0, 0, this._canvas.width, this._canvas.height);
      const pixels = imageData.data;

      const actualConstants = this.constants.map(name => +this._inputs[name].value);

      for (let screenX = 0; screenX < this._canvas.width; screenX += STEP) {
        const mathX = mapRange(screenX,
                               0, this._canvas.width,
                               INPUT_DOMAIN_START, INPUT_DOMAIN_END);

        const mathY = this.formula(...actualConstants, mathX);

        const screenY = mapRange(-mathY,
                                 OUTPUT_DOMAIN_START, OUTPUT_DOMAIN_END,
                                 0, this._canvas.height);

        const i = (Math.floor(screenY) * this._canvas.width + Math.floor(screenX)) * 4;
        pixels[i + 0] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
      }
      this._context.putImageData(imageData, 0, 0);
    }

    _stringifyFormula() {
      const actualConstants = this.constants.map(name => +this._inputs[name].value);
      const displayed = this.displayer(...actualConstants);

      return "y = " + stringifyPolynomial(displayed, 0);
    }

    _drawFormula() {
      if(!this.displayer) return;
      const stringFormula = this._stringifyFormula();

      this._context.font = "bold 14px serif";
      this._context.fillStyle = "#00F";
      this._context.fillText(stringFormula, 5, 16);
    }

    draw() {
      this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this._drawGrid();
      this._drawAxes();
      this._drawPoints();
      this._drawFormula();
    }
  }

  window.Graph = Graph;
}());