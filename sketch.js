const fontSize = 17;
const lifetime = 100; // lifetime of a path before it fades out
let morse;
let input;
let morseText;
let cnv;
let osc;
let last;
let history = [];
let divEl;

function setup() {
    cnv = createCanvas(800, 800);
    morse = Morse();
    last = 0;

    divEl = createDiv();
    divEl.style("display", "flex");
    divEl.style("flex-direction", "column");
    divEl.style("gap", "10px");
    divEl.style("align-items", "center");
    divEl.style("justify-content", "center");

    input = createInput();
    input.input(() => {
        let current = morse.morsify(input.value().trim().at(-1) || "");
        history.push({
            times: lifetime/5, // starts at 1/5th so it looks as if it decays faster
            fun: (alph) => 
                morse.drawNodes(
                    morse.root, 
                    width/2, height/2+50, 
                    current, 
                    alph
                )
        });
    });
  
    morseText = createP();
    morseText.style("border","2px solid");
    morseText.style("width", "500px");
    morseText.style("min-height", "100px");

    let title = createElement("h1", "The Morse Tree");
    title.style("width", "500px");
    title.style("text-align", "center");
    title.style("font-family", "Courier New");

    let credit = createElement("i", "made by RD");
    credit.style("font-family", "Courier New");

    divEl.child(input);
    divEl.child(morseText);
    divEl.child(title);
    divEl.child(credit);
    divEl.position(width/2 + 100, height/2 - 200);

    textSize(fontSize);
    textFont("Courier New");
    strokeWeight(1.5);
    fill(0);
    stroke(0,0,0,0);
}

function draw() {
    background(198,151,221);
    morseText.html(morse.morsify(input.value()));
    morse.drawBaseNodes(morse.root, width/2, height/2+50);

    // logic for the fade out thingy
    history = history.filter(e => e.times <= lifetime);
    history.forEach(e => {
        e.fun(255 - (e.times / lifetime) * 255);
        e.times += 1;
    });
  
    // draw the final one anyways
    morse.drawNodes(
        morse.root, 
        width/2, height/2+50, 
        morse.morsify(input.value().trim().at(-1) || ""), 
        255
    ); 
}

// the morse tree and its methods
function Morse() {
    // the tree structure
    const Node = (letter, dot = null, dash = null) => ({ letter, dot, dash });
    const root = Node("",          // start
        Node("E",                  // dot branch
            Node("I",
                Node("S",
                    Node("H"),
                    Node("V")),
                Node("U",
                    Node("F"))),
            Node("A",
                Node("R",
                    Node("L")),
                Node("W",
                    Node("P"),
                    Node("J")))),
        Node("T",                   // dash branch
            Node("N",
                Node("D",
                    Node("B"),
                    Node("X")),
                Node("K",
                    Node("C"),
                    Node("Y"))),
            Node("M",
                Node("G",
                    Node("Z"),
                    Node("Q")),
                Node("O"))));

    // helper functions
    const isStart = node => node === root;
    const isLetter = node => node.dot !== null || node.dash !== null;
    const isEnd = node => node.dot === null && node.dash === null;
    const isEmpty = node => node === null;

    // conversion
    const getMorse = letter => {
        if (letter === " ") return "/";

        const find = (dot, dash, acc) => {
            let dotBranch = go(dot, acc+".");
            let dashBranch = go(dash, acc+"-");
            return dashBranch === null ? dotBranch : dashBranch;
        };

        const go = (node, acc) => {
            if (isEmpty(node))  return null;
            if (isStart(node))  return find(node.dot, node.dash, acc);
            if (isLetter(node)) return node.letter === letter ? acc : find(node.dot, node.dash, acc);
            if (isEnd(node))    return node.letter === letter ? acc : null;

            return null;
        };

        return go(root, "");
    };

    // drawing the tree
    const drawBaseNodes =
    (node, x, y, xDis = 170, xDisChange = 85, acc = "") => {
        let change = 32;
        let yDis = 40;
        let nodeSize = 12.5;
    
        if (node.dot !== null) {
            stroke(0);
            line(x, y, x-xDis, y+yDis);
            stroke(0,0,0,0);
          
            text(node.dot.letter, x-xDis-20, y+yDis+5);
            textSize(26);
            text(".", x-(xDis/2)-20, y+(yDis/2));
            textSize(fontSize);
          
            drawBaseNodes(
                node.dot, 
                x-xDis, y+yDis, 
                xDis - xDisChange, 
                xDisChange - change,
                acc + "."
            );
        }
        
        if (node.dash !== null) {
            stroke(0);
            line(x, y, x+xDis, y+yDis);
            stroke(0,0,0,0);
          
            text(node.dash.letter, x+xDis+10, y+yDis+5);
            textSize(26);
            text("-", x+(xDis/2)+5, y+(yDis/2)+5);
            textSize(fontSize);
          
            drawBaseNodes(
                node.dash, 
                x+xDis, y+yDis, 
                xDis - xDisChange, 
                xDisChange - change,
                acc + "-"
            );
        }
    
        ellipse(x, y, nodeSize);
    };

    // path drawing
    const drawNodes = 
    (node, x, y, path, alph, xDis = 170, xDisChange = 85, acc = "") => {
        let change = 32;
        let yDis = 40;
        let nodeSize = 12.5;
        let c = color("yellow");
        c.setAlpha(alph);
    
        if (node.dot !== null) {
            if (path.startsWith(acc+".")) {
                stroke(c);
                line(x, y, x-xDis, y+yDis);
                stroke(0,0,0,0);
            }
          
            drawNodes(
                node.dot, 
                x-xDis, y+yDis,
                path, alph,
                xDis - xDisChange, 
                xDisChange - change,
                acc + "."
            );
        }
        
        if (node.dash !== null) {
            if (path.startsWith(acc+"-")) {
                stroke(c);
                line(x, y, x+xDis, y+yDis);
                stroke(0,0,0,0);
            }
          
            drawNodes(
                node.dash, 
                x+xDis, y+yDis, 
                path, alph,
                xDis - xDisChange, 
                xDisChange - change,
                acc + "-"
            );
        }
    
        if (path.startsWith(acc)) {
            fill(c);
            ellipse(x, y, nodeSize);
            fill(0);
        }
    };

    return {
        root,
        getMorse,
        morsify: str => [...str].map(c => c.toUpperCase()).map(getMorse).join(" "),
        drawNodes,
        drawBaseNodes
    };
}