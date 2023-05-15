import { select, settings, classNames, message } from '../settings.js';


class Finder {
  constructor() {
    this.init();
    this.step = settings.step.drawing;

    this.choosedCells = new Set();
    this.startPoint = false;
    this.endPoint = false;
  }

  render() {
    this.dom = {};

    this.dom.wrapper = document.querySelector(select.containerOf.finder);
    this.dom.alert = document.querySelector(select.containerOf.alert);
    this.dom.button = document.querySelector(select.containerOf.button);
    this.dom.title = document.querySelector(select.containerOf.finderTitle);

    this.renderGrid();
  }

  renderGrid() {
    let html = '';

    for (let row = 1; row < settings.countRows; row++) {
      html += `<div class="row">`;

      for (let col = 1; col < settings.countCols; col++) {
        html +=
          `<div
            class="${classNames.gridCell}"
            data-cell="${row}${col}">
            ${row}${col}
          </div>`;
      }

      html += `</div>`;
    }

    this.dom.wrapper.innerHTML = html;
  }

  resetGrid() {
    this.dom.wrapper.querySelectorAll(select.containerOf.gridSell).forEach((cell) => {
      cell.classList.remove(classNames.gridChoosed);
      cell.classList.remove(classNames.start);
      cell.classList.remove(classNames.end);
    });

    this.choosedCells.clear();
    this.startPoint = false;
    this.endPoint = false;

    this.dom.title.innerHTML = message.drawTitle;
    this.dom.button.innerHTML = message.drawBtnTitle;
  }

  showError(message) {
    this.dom.alert.innerHTML = message;
    this.dom.alert.classList.remove(classNames.hidden);

    window.setTimeout(() => {
      this.dom.alert.innerHTML = '';
      this.dom.alert.classList.add(classNames.hidden);
    }, 2000);
  }

  initChoose() {
    this.dom.wrapper.addEventListener('click', (event) => {
      if (event.target.classList.contains('cell')) {
        const cellNum = parseInt(event.target.getAttribute('data-cell'));

        if (this.step == settings.step.drawing) {
          if (this.choosedCells.size == 0) {
            this.choosedCells.add(cellNum);
            event.target.classList.add(classNames.gridChoosed);
            return true;
          }

          if (this.choosedCells.has(cellNum)) {
            this.choosedCells.delete(cellNum);
            event.target.classList.remove(classNames.gridChoosed);

          } else if (
            this.choosedCells.has(cellNum + 1) ||
            this.choosedCells.has(cellNum - 1) ||
            this.choosedCells.has(cellNum + 10) ||
            this.choosedCells.has(cellNum - 10)
          ) {

            this.choosedCells.add(cellNum);
            event.target.classList.add(classNames.gridChoosed);

          } else {
            this.showError(message.break);
          }
        }

        if (this.step == settings.step.poinst) {
          if (!this.startPoint) {
            if (this.endPoint == cellNum) {
              this.showError(message.endPoint);
              return false;
            }

            if (this.choosedCells.has(cellNum)) {
              this.startPoint = cellNum;
              event.target.classList.add(classNames.start);
              return true;

            } else {
              this.showError(message.outRange);
            }

          } else if (this.startPoint && !this.endPoint) {

            if (this.startPoint == cellNum) {
              this.showError(message.startPoint);
              return false;
            }

            if (this.choosedCells.has(cellNum)) {
              this.endPoint = cellNum;
              event.target.classList.add(classNames.end);
              return true;
            } else {
              this.showError(message.outRange);
            }

          } else if (this.startPoint && cellNum == this.startPoint) {
            this.startPoint = false;
            event.target.classList.remove(classNames.start);
            return true;

          } else if (this.endPoint && cellNum == this.endPoint) {
            this.endPoint = false;
            event.target.classList.remove(classNames.end);
            return true;

          } else if (this.startPoint && this.endPoint) {
            this.showError(message.points);
          }
        }


      }
    });
  }

  initButton() {
    this.dom.button.addEventListener('click', () => {
      if (this.step == settings.step.drawing && this.choosedCells.size !== 0) {
        this.step = settings.step.poinst;

        this.dom.title.innerHTML = message.pointsTitle;
        this.dom.button.innerHTML = message.pointsBtnTitle;

        return;
      }

      if (this.step == settings.step.poinst && this.startPoint && this.endPoint) {
        this.step = settings.step.calc;

        this.dom.title.innerHTML = message.calcTitle;
        this.dom.button.innerHTML = message.calcBtnTitle;

        this.showShortestRoad();

        return;
      }

      if(this.step == settings.step.calc) {
        this.step = settings.step.drawing;
        this.resetGrid();

        return;
      }

    });
  }

  calcRoad() {
    const road = new Set();
    const allRoads = new Set();
    const roads = new Set();

    let prevPoint = null;
    let direction = false;
    let endRoad = false;

    if(this.startPoint > this.endPoint) {
      let tempStart = this.startPoint;
      this.startPoint = this.endPoint;
      this.endPoint = tempStart;
    }

    road.add(this.startPoint);

    const checkCross = (point, match, dir) => {
      if (match) {
        const roadArr = Array.from(road);
        if (roadArr.length > 1) {
          roadArr.splice(-1);
          allRoads.add(new Set([...roadArr, point]));
        } else {
          allRoads.add(new Set([...roadArr]));
        }

      } else {
        direction = dir;
        road.add(point);
      }
    };

    const checkDirection = (point) => {
      let match = false;

      const checks = {
        right: (point) => {
          if (this.choosedCells.has(point + 1) && point + 1 !== prevPoint) {
            checkCross(point + 1, match, 'right');
            match = true;
          }
        },

        left: (point) => {
          if (this.choosedCells.has(point - 1) && point - 1 !== prevPoint) {
            checkCross(point - 1, match, 'left');
            match = true;
          }
        },

        bottom: (point) => {
          if (this.choosedCells.has(point + 10) && point + 10 !== prevPoint) {
            checkCross(point + 10, match, 'bottom');
            match = true;
          }
        },

        top: (point) => {
          if (this.choosedCells.has(point - 10) && point - 10 !== prevPoint) {
            checkCross(point - 10, match, 'top');
            match = true;
          }
        }
      };

      if (!direction) {
        for (let check in checks) {
          checks[check](point);
        }
      } else {
        checks[direction](point);

        delete checks[direction];

        for (let check in checks) {
          checks[check](point);
        }
      }
      prevPoint = point;
    };

    const checkNextStep = (point) => {
      if (point == this.endPoint) {
        road.add(point);
        endRoad = true;
      }

      if (endRoad) {
        return false;
      }

      checkDirection(point);
    };

    const continueRoad = (road) => {
      const roadArr = Array.from(road);

      while (roadArr[roadArr.length - 1] !== this.endPoint) {
        const point = roadArr[roadArr.length - 1];
        let prevPoint = roadArr[roadArr.length - 2];
        let match = false;

        if (this.choosedCells.has(point + 1) && point + 1 !== prevPoint) {
          if(roadArr.indexOf(point + 1) !== -1) {
            break;
          }

          roadArr.push(point + 1);
          match = true;

        } else if (this.choosedCells.has(point - 1) && point - 1 !== prevPoint) {
          if(roadArr.indexOf(point - 1) !== -1) {
            break;
          }

          if (!match) {
            roadArr.push(point - 1);
            match = true;
          } else {
            allRoads.add(Array.from(roadArr));
          }

          match = true;

        } else if (this.choosedCells.has(point - 10) && point - 10 !== prevPoint) {
          if(roadArr.indexOf(point - 10) !== -1) {
            break;
          }

          if (!match) {
            roadArr.push(point - 10);
            match = true;
          } else {
            allRoads.add(Array.from(roadArr));
          }

        } else if (this.choosedCells.has(point + 10) && point + 10 !== prevPoint) {
          if(roadArr.indexOf(point + 10) !== -1) {
            break;
          }

          if (!match) {
            roadArr.push(point + 10);
            match = true;
          } else {
            allRoads.add(Array.from(roadArr));
          }

        }
      }

      roads.add(new Set(roadArr));
    };

    const getShortestRoad = () => {
      roads.forEach((road) => {
        const roadArr = Array.from(road);

        if(roadArr[roadArr.length - 1] !== this.endPoint) {
          roads.delete(road);
        }
      });

      const roadsArr = Array.from(roads);
      const sums = [];

      roadsArr.forEach((road) => {

        sums.push(road.size);
      });

      return roadsArr[sums.indexOf(Math.min(...sums))];
    };

    this.choosedCells.forEach((point) => {
      checkNextStep(point);
    });

    if (allRoads.size !== 0) {
      roads.add(road);
      allRoads.forEach(continueRoad);

      return getShortestRoad();
    }

    return road;
  }

  showShortestRoad() {
    const road = this.calcRoad();

    road.forEach((cell) => {
      this.dom.wrapper.
        querySelector(`div[data-cell="${cell}"]`).
        classList.add(classNames.start);
    });
  }

  init() {
    this.render();
    this.initChoose();
    this.initButton();
  }

}

export default Finder;