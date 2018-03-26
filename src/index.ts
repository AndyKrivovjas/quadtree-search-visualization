import { Quadtree, Boundary } from "./core/quadtree";
import { Point } from "./core/point";

let quadTree: Quadtree;
let searchArea: Boundary;
let found: Point[] = [];

let sketch = function(p: p5) {
    p.setup = function() {
        p.createCanvas(800, 800);

        quadTree = Quadtree.create({
            x: p.width / 2,
            y: p.height / 2,
            w: p.width,
            h: p.height
        }, 4);

        quadTree.setRenderer(p);

        for(let i = 0; i < 3000; i++) {
            // let x = p.random(p.width);
            // let y = p.random(p.height);
            let x = p.randomGaussian(p.width / 2, p.width / 4);
            let y = p.randomGaussian(p.height / 2, p.height / 4);

            let point = new Point(x, y);
            quadTree.insert(point);
        }

        searchArea = new Boundary(p.width / 2, p.height / 2, 100, 100);

        console.log(quadTree);
    }

    p.draw = function() {
        p.background(51);

        quadTree.show();

        p.strokeWeight(2);
        p.stroke(50, 200, 50);
        p.rect(searchArea.x, searchArea.y, searchArea.w, searchArea.h);

        found.forEach(pt => {
            p.strokeWeight(4);
            p.point(pt.x, pt.y);
        });

        // console.log(p.frameRate());
    }

    p.mouseClicked = function() {
        let point = new Point(p.mouseX, p.mouseY);
        quadTree.insert(point);
    }

    p.mouseMoved = function() {
        searchArea.x = p.mouseX;
        searchArea.y = p.mouseY;
        searchArea.calculateBorders();

        found = quadTree.query(searchArea);
    }
}

let app  = new p5(sketch);