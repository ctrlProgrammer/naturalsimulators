import { ElementType, ElementsControllerConfig } from "../controller";
import Color from "../../basis/color";
import { MathHelpers, RandomHelpers } from "../../basis/helpers";
import { Printer } from "../../basis/printer";
import { Map } from "../../map";
import { Point, Size } from "../../types";
import { HaveChildrenFunction, Organism } from "./organism";
import { Apple } from "../food/apples";

export enum EatState {
  SEARCHING_FOOD = "SEARCHING_FOOD",
  FIND_FOOD = "FIND_FOOD",
  EATING = "EATING",
}

export enum MovementState {
  TO_NEXT_POS = "TO_NEXT_POS",
  IN_NEXT_POS = "IN_NEXT_POS",
}

export type Decrement = {
  life: number;
  energy: number;
};

export class People extends Organism {
  type: ElementType.PEOPLE;
  life: number;
  energy: number;
  size: Size;

  private _movementState: MovementState = MovementState.IN_NEXT_POS;
  private _eatState: EatState = EatState.SEARCHING_FOOD;

  private _nextPos: Point = { x: 0, y: 0 };
  private _vel: Point = { x: 1, y: 1 };
  private _decrement: Decrement = { life: 1, energy: 1 };

  private _confortArea: number = 100;
  private _visualCamp: number = 50;
  private _extrovertProbability: number = 0.1;

  private _nextFood: Apple = null;

  constructor(
    printer: Printer,
    map: Map,
    config: ElementsControllerConfig,
    haveChildren: HaveChildrenFunction,
    pos?: Point,
    maxLife?: number,
    maxEnergy?: number
  ) {
    super(printer, map, config, haveChildren, pos, maxLife, maxEnergy);

    this._setMaxLife();
    this._setMaxEnergy();
    this._setNormalSize();
    this._calcNextPos();
  }

  ///////////////////////////////
  /* #region  Getters */
  ///////////////////////////////

  private get _centeredPos(): Point {
    return {
      x: this.pos.x + this.size.width / 2,
      y: this.pos.y + this.size.height / 2,
    };
  }

  private get _centeredNextPos(): Point {
    return {
      x: this._nextPos.x + this.size.width / 2,
      y: this._nextPos.y + this.size.height / 2,
    };
  }

  ///////////////////////////////
  /* #endregion */
  ///////////////////////////////

  ///////////////////////////////
  /* #region  Movement */
  ///////////////////////////////

  move() {
    this.validateStats();

    if (this.pos.x === this._nextPos.x && this.pos.y === this._nextPos.y) {
      if (this._eatState === EatState.FIND_FOOD) {
        this._nextFood.destroy();
        this._nextFood = null;
        this._eatState = EatState.SEARCHING_FOOD;
      }

      this._movementState = MovementState.IN_NEXT_POS;
      this._calcNextPos();
    } else this.walk();
  }

  walk() {
    this.pos.x =
      this.pos.x !== this._nextPos.x
        ? this.pos.x < this._nextPos.x
          ? this.pos.x + this._vel.x
          : this.pos.x - this._vel.y
        : this.pos.x;
    this.pos.y =
      this.pos.y !== this._nextPos.y
        ? this.pos.y < this._nextPos.y
          ? this.pos.y + this._vel.y
          : this.pos.y - this._vel.y
        : this.pos.y;
  }

  ///////////////////////////////
  /* #endregion */
  ///////////////////////////////

  ///////////////////////////////
  /* #region  Calculate */
  ///////////////////////////////

  private _calcNextPos() {
    if (Math.random() < this._extrovertProbability) this._nextPos = this.map.randomPos();
    else this._nextPos = this.map.randomCirclePos(this.pos, this._confortArea);
    this._movementState = MovementState.TO_NEXT_POS;
  }

  ///////////////////////////////
  /* #endregion */
  ///////////////////////////////

  ///////////////////////////////
  /* #region Print */
  ///////////////////////////////

  private _printNextPos() {
    this.printer.printRect(
      { x: this._nextPos.x, y: this._nextPos.y },
      {
        x: this._nextPos.x + this.size.width,
        y: this._nextPos.y + this.size.height,
      },
      Color.BLUE
    );
  }

  private _printLineToNextPos() {
    this.printer.printLine(this._centeredPos, this._centeredNextPos, Color.BLUE);
  }

  private _printOrganism() {
    this.printer.printRect(
      { x: this.pos.x, y: this.pos.y },
      { x: this.pos.x + this.size.width, y: this.pos.y + this.size.height },
      Color.WHITE
    );
  }

  private _printConfortArea() {
    this.printer.printCircle(this._centeredPos, this._confortArea, null, Color.TRANSPARENT_BLUE);
  }

  private _printVisualCamp() {
    this.printer.printCircle(this._centeredPos, this._visualCamp, null, Color.TRANSPARENT_GREEN);
  }

  ///////////////////////////////
  /* #endregion */
  ///////////////////////////////

  ///////////////////////////////
  /* #region Collisions */
  ///////////////////////////////

  public withApples(apples: Apple[]) {
    if (this._eatState === EatState.SEARCHING_FOOD) {
      for (let i = 0; i < apples.length; i++) {
        if (
          !apples[i].taken &&
          MathHelpers.isThePointInCircle(apples[i].pos, {
            center: this.pos,
            radius: this._visualCamp,
          })
        ) {
          this._eatState = EatState.FIND_FOOD;
          this._nextPos = apples[i].pos;
          this._nextFood = apples[i];
        }
      }
    }
  }

  public withOtherPeople() {}

  ///////////////////////////////
  /* #endregion */
  ///////////////////////////////

  ///////////////////////////////
  /* #region  Organisms basis */
  ///////////////////////////////

  die() {}

  print() {
    this._printOrganism();
    this._printNextPos();
    this._printLineToNextPos();
    this._printConfortArea();
    this._printVisualCamp();

    this.move();
  }

  born() {}

  ///////////////////////////////
  /* #endregion */
  ///////////////////////////////
}