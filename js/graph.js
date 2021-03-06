/* jshint browser: true, esnext: true, undef: true, eqeqeq: true, debug: true */

(function() {
  "use strict";

  const ARROW_SIZE = 5;
  const TICK_SIZE  = 3;

  const STEP = 0.1;

  const mapRange = (input, input_start, input_end, output_start, output_end) =>
      output_start + ((output_end - output_start) / (input_end - input_start)) * (input - input_start);

  class Graph {
    constructor(constants, formula, stringifyer,
                inputDomainStart, inputDomainEnd,
                outputDomainStart, outputDomainEnd,
                width, height, options) {

      this.constants = constants;   // [name, defaultValue] pairs
      this.constantNames = constants.map(nameValuePair => nameValuePair[0]);
      this.formula = formula;
      this.stringifyer = stringifyer;
      this._inputDomainStart = inputDomainStart;
      this._inputDomainEnd = inputDomainEnd;
      this._outputDomainStart = outputDomainStart;
      this._outputDomainEnd = outputDomainEnd;
      this._options = options || {};

      this._createCanvas(width, height);
      this._createInputContainer();
      this._createInputs();
    }

    xScreenToMath(screenX) {
      return mapRange(screenX, 0, this._canvas.width - 1, this._inputDomainStart, this._inputDomainEnd);
    }
    xMathToScreen(mathX) {
      return mapRange(mathX, this._inputDomainStart, this._inputDomainEnd, 0, this._canvas.width - 1);
    }
    yScreenToMath(screenY) {
      return mapRange(this._canvas.height - screenY, 0, this._canvas.height - 1, this._outputDomainStart, this._outputDomainEnd);
    }
    yMathToScreen(mathY) {
      return this._canvas.height - mapRange(mathY, this._outputDomainStart, this._outputDomainEnd, 0, this._canvas.height - 1);
    }

    _createCanvas(width, height) {
      this._canvas = document.createElement("canvas");
      this._canvas.width = width;
      this._canvas.height = height;
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

      for (let mathY = this._outputDomainStart; mathY <= this._outputDomainEnd; ++mathY) {
        const screenY = this.yMathToScreen(mathY);
        const nextScreenY = this.yMathToScreen(mathY + 1);

        for (let mathX = this._inputDomainStart; mathX <= this._inputDomainEnd; ++mathX) {
          const screenX = this.xMathToScreen(mathX);
          const nextScreenX = this.xMathToScreen(mathX + 1);

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
      for (let mathX = this._inputDomainStart; mathX < this._inputDomainEnd; ++mathX) {
        if (mathX === 0) continue;
        const screenX = this.xMathToScreen(mathX);
        this._context.moveTo(screenX, this.yMathToScreen(0) - TICK_SIZE);
        this._context.lineTo(screenX, this.yMathToScreen(0) + TICK_SIZE);
        this._context.fillText(mathX, screenX + 2, this.yMathToScreen(0) - 8 + 16);
      }

      /* draw y numbers */
      for (let mathY = this._outputDomainStart; mathY < this._outputDomainEnd; ++mathY) {
        if (mathY === 0) continue;

        const screenY = this.yMathToScreen(mathY);
        this._context.moveTo(this.xMathToScreen(0) - TICK_SIZE, screenY);
        this._context.lineTo(this.xMathToScreen(0) + TICK_SIZE, screenY);
        this._context.fillText(mathY, this.xMathToScreen(0) + TICK_SIZE + 1, screenY + 2);
      }
      this._context.stroke();

      this._context.font = "bold 16px serif";
      this._context.fillStyle = "#000";

      this._context.fillText("y", this.xMathToScreen(0) - 16, 16);
      this._context.fillText("x", this._canvas.width - 16, this.yMathToScreen(0) - 5);

      this._context.stroke();
      this._context.beginPath();

      /* x axis */
      this._context.moveTo(0, this.yMathToScreen(0));
      this._context.lineTo(this._canvas.width, this.yMathToScreen(0));

      /* x arrow */
      this._context.lineTo(this._canvas.width - ARROW_SIZE, this.yMathToScreen(0) - ARROW_SIZE);
      this._context.moveTo(this._canvas.width, this.yMathToScreen(0));
      this._context.lineTo(this._canvas.width - ARROW_SIZE, this.yMathToScreen(0) + ARROW_SIZE);

      /* y axis */
      this._context.moveTo(this.xMathToScreen(0), 0);
      this._context.lineTo(this.xMathToScreen(0), this._canvas.height);

      /* y arrow */
      this._context.moveTo(this.xMathToScreen(0), 0);
      this._context.lineTo(this.xMathToScreen(0) - ARROW_SIZE, ARROW_SIZE);
      this._context.moveTo(this.xMathToScreen(0), 0);
      this._context.lineTo(this.xMathToScreen(0) + ARROW_SIZE, ARROW_SIZE);

      this._context.stroke();
    }

    _drawPoints() {
      const imageData = this._context.getImageData(0, 0, this._canvas.width, this._canvas.height);
      const pixels = imageData.data;

      const actualConstants = this.constantNames.map(name => +this._inputs[name].value);

      for (let screenX = 0; screenX < this._canvas.width; screenX += STEP) {
        const mathX = this.xScreenToMath(screenX);
        const mathY = this.formula(...actualConstants, mathX);
        const screenY = this.yMathToScreen(mathY);

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
      /* a lot of these values are *really* arbitrary.
       * we should make more of them constants. */
      if(!this.stringifyer) return;
      this._context.font = "bold 14px serif";
      this._context.fillStyle = "#00F";

      // the canvas widget doesn't like newlines
      const formulaLines = this._stringifyFormula().split("\n");
      if (this._options["formulaPosition"] === "top right") {
        for (var i = 0; i < formulaLines.length; i++) {
          const lineLength = formulaLines[i].length * 6;
          this._context.fillText(formulaLines[i], this._canvas.width - lineLength - 5, 18*(i + 1));
        }
      } else {
        /* top left is the default */
        for (var i = 0; i < formulaLines.length; i++) {
          this._context.fillText(formulaLines[i], 5, 18*(i + 1));
        }
      }
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
    "x": "\u02E3",
    "y": "\u02B8"
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
      return Array.from(string).map(char_ => SUPERSCRIPTS[char_] || char_).join("");
    },

    subscript(string) {
      return Array.from(string).map(char_ => SUBSCRIPTS[char_] || char_).join("");
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
