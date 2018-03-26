import { Point } from "./point";

export interface QuadtreeChildren {
    nw: Quadtree,
    ne: Quadtree,
    sw: Quadtree,
    se: Quadtree,
    isSet: boolean
}

export interface BoundaryParams {
    x: number;
    y: number;
    h: number;
    w: number;
}

export class Boundary {
    leftBorder: number;
    rightBorder: number;
    topBorder: number;
    bottomBorder: number;

    constructor(public x: number, public y: number, public h: number, public w: number) {
        this.calculateBorders();
    }

    calculateBorders() {
        this.leftBorder = this.x - this.w / 2;
        this.rightBorder = this.x + this.w / 2;
        this.topBorder = this.y - this.h / 2;
        this.bottomBorder = this.y + this.h / 2;
    }

    contains(point: Point) {
        return (point.x >= this.leftBorder && point.x <= this.rightBorder
        && point.y >= this.topBorder && point.y <= this.bottomBorder);
    }

    copy() {
        return new Boundary(this.x, this.y, this.h, this.w);
    }

    add(x: number, y: number) {
        this.x += x;
        this.y += y;

        return this;
    }

    divide() {
        this.w /= 2;
        this.h /= 2;

        return this;
    }

    createChild(x: number, y: number) {
        let c = this.copy();
        c.divide();

        let halfWidth = c.w / 2;
        let halfHeight = c.h / 2;

        x = Math.sign(x) * halfWidth;
        y = Math.sign(y) * halfHeight;

        c.add(x, y)
        c.calculateBorders();

        return c;
    }

    intersects(b: Boundary) {
        return (this.leftBorder <= b.rightBorder &&
            b.leftBorder <= this.rightBorder &&
            this.topBorder <= b.bottomBorder &&
            b.topBorder <= this.bottomBorder)
    }
}

export class Quadtree {
    points: Point[] = [];
    children: QuadtreeChildren = {
        nw: null,
        ne: null,
        sw: null,
        se: null,
        isSet: false
    };

    renderer: p5;

    constructor(public boundary: Boundary, public capacity: number) {}
    
    setRenderer(renderer) {
        this.renderer = renderer;

        return this;
    }

    show() {
        let r = this.renderer;
        r.rectMode(r.CENTER);
        r.strokeWeight(2);
        r.stroke(255, 255, 255);
        r.noFill();
        r.rect(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h);

        this.points.forEach(p => {
            r.strokeWeight(4);
            r.stroke(200, 54, 100);
            r.point(p.x, p.y);
        });

        this.itarate(child => {
            child.show();
        });
    }

    public static create(params: BoundaryParams, capacity: number): Quadtree {
        let boundary = new Boundary(params.x, params.y, params.h, params.w);
        let instance = new Quadtree(boundary, capacity);

        return instance;
    }

    subdivide() {
        this.children.nw = new Quadtree(this.boundary.createChild(-1, -1), this.capacity)
            .setRenderer(this.renderer);
        this.children.ne = new Quadtree(this.boundary.createChild(1, -1), this.capacity)
            .setRenderer(this.renderer);
        this.children.sw = new Quadtree(this.boundary.createChild(-1, 1), this.capacity)
            .setRenderer(this.renderer);
        this.children.se = new Quadtree(this.boundary.createChild(1, 1), this.capacity)
            .setRenderer(this.renderer);
        this.children.isSet = true;
    }

    insert(point: Point) {

        if(!this.boundary.contains(point)) {
            return false;
        }

        if(this.points.length < this.capacity) {
            this.points.push(point);
        } else {
            if(!this.children.isSet) {
                this.subdivide();
            }

            this.itarate(child => {
                if (child.insert(point)) return true;
            });
        }

        return true;
    }

    query(boundary: Boundary): Point[] {
        let points = [];

        if(!this.boundary.intersects(boundary)) {
            return points;
        }

        this.points.forEach(p => {
            if(boundary.contains(p)) {
                points.push(p);
            }
        });

        this.itarate(child => {
            points = points.concat(child.query(boundary));
        });


        return points;
    }

    itarate(callback = (o) => {}) {
        if (this.children.isSet) {
            for (let child in this.children) {
                if (this.children[child] instanceof Quadtree) {
                    callback(this.children[child]);
                }
            }
        }
    }


}