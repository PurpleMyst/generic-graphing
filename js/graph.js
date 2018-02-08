/* jshint browser: true, esnext: true, undef: true, eqeqeq: true, debug: true */

(function() {
  "use strict";

  const CANVAS_WIDTH  = 300;
  const CANVAS_HEIGHT = 300;

  const ARROW_SIZE = 5;
  const TICK_SIZE = 3;

  const STEP = 0.1;

  const INPUT_DOMAIN_START  = -5;
  const INPUT_DOMAIN_END    = 5;
  const OUTPUT_DOMAIN_START = -5;
  const OUTPUT_DOMAIN_END   = 5;

  const mapRange = (input, input_start, input_end, output_start, output_end) =>
      output_start + ((output_end - output_start) / (input_end - input_start)) * (input - input_start);

  class Graph {
    constructor(constants, formula, stringifyer) {
      this.constants = constants;   // [name, defaultValue] pairs
      this.constantNames = constants.map(nameValuePair => nameValuePair[0]);
      this.formula = formula;
      this.stringifyer = stringifyer;

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

    _createInput(name, defaultValue) {
        const $input = document.createElement("input");
        $input.name = name;
        $input.id = name;
        $input.type = "number";
        $input.value = defaultValue;
        $input.addEventListener("input", () => window.requestAnimationFrame(() => this.draw()));

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
      this.constants.forEach(nameValuePair => this._createInput(...nameValuePair));
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

      const actualConstants = this.constantNames.map(name => +this._inputs[name].value);

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
      const actualConstants = this.constantNames.map(name => +this._inputs[name].value);
      return this.stringifyer(...actualConstants);
    }

    _drawFormula() {
      if(!this.stringifyer) return;
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

  const SUPERSCRIPTS = {
    "0": "\u2070",
    "1": "\u00b9",  // this and the next 3 don't follow the pattern in unicode
    "2": "\u00b2",
    "3": "\u00b3",
    "4": "\u2074",
    "5": "\u2075",
    "6": "\u2076",
    "7": "\u2077",
    "8": "\u2078",
    "9": "\u2079",
    "x": "\u02E3"
  };
  const SUBSCRIPTS = {
    "0": "\u2080",
    "1": "\u2081",
    "2": "\u2082",
    "3": "\u2083",
    "4": "\u2084",
    "5": "\u2085",
    "6": "\u2086",
    "7": "\u2087",
    "8": "\u2088",
    "9": "\u2089"
  };

  window.GraphUtils = {
    superscript(string) {
      return Array.from(string).map(char_ => SUPERSCRIPTS[char_] || char_);
    },

    subscript(string) {
      return Array.from(string).map(char_ => SUBSCRIPTS[char_] || char);
    },

    numberTimesText(number, text) {
      if (number === 0) return "0";
      if (number === 1) return text;
      if (number === -1) return "-" + text;
      return number.toString() + text;
    },

    addNicely(stringedNumbers) {
      stringedNumbers = stringedNumbers.filter(s => s !== "0");
      if (stringedNumbers.length === 0) return "0";

      for (var i = 1; i < stringedNumbers.length; i++) {
        if (stringedNumbers[i][0] === "+") {
          stringedNumbers[i] = " + " + stringedNumbers[i].slice(1);
        } else if (stringedNumbers[i][0] === "-") {
          stringedNumbers[i] = " - " + stringedNumbers[i].slice(1);
        } else {
          stringedNumbers[i] = " + " + stringedNumbers[i];
        }
      }
      return stringedNumbers.join("");
    },

    parenthesize(stringed) {
      if ((stringed.indexOf("+") === -1) && (stringed.indexOf("-") === -1)) return stringed;
      return "(" + stringed + ")";
    }
  };

}());
