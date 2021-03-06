import { Point } from "../../types";
import Color from "../color";

export class Printer {
  constructor(public ctx: CanvasRenderingContext2D) {}

  public printLine(from: Point, to: Point, color: Color) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = color.rgb;
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
    this.ctx.closePath();
  }
}
