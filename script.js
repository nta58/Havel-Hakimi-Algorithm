// Function to get sequence from input
function getSequence() {
    const sizeInput = document.getElementById("size-input").value;
    const sequenceInput = document.getElementById("sequence-input").value;
    
    // Validate size
    const size = parseInt(sizeInput);
    if (isNaN(size) || size <= 0) {
        return { error: "Please enter a valid positive number for vertices" };
    }
    
    // Parse and validate sequence
    const sequence = sequenceInput.trim().split(/\s+/).map(Number);
    if (sequence.length !== size) {
        return { error: `Please enter exactly ${size} numbers` };
    }
    
    // Validate each number is within range
    if (sequence.some(n => n >= size)) {
        return { error: `Each degree must be less than ${size}` };
    }
    
    if (sequence.some(isNaN)) {
        return { error: "Please enter valid numbers" };
    }
    
    return { sequence };
}

// Function to print each state
function printEachState(degrees) {
    return degrees.join(" ");
}

// Implementation of Havel-Hakimi algorithm
function havelHakimi(degrees) {
    let output = [];
    let currentDegrees = [...degrees];
    
    // Print initial state
    output.push({
        sequence: printEachState(currentDegrees),
        explanation: "Initial sequence"
    });
    
    while (currentDegrees.length > 0) {
        // Sort in descending order
        currentDegrees.sort((a, b) => b - a);
        
        // If first degree is 0, we're done
        if (currentDegrees[0] === 0) {
            output.push({
                sequence: printEachState(currentDegrees),
                explanation: "All degrees are zero - sequence is graphical",
                isSuccess: true
            });
            return { output, isGraphical: true };
        }
        
        // Get highest degree
        const highestDegree = currentDegrees[0];
        
        // Check if we have enough vertices
        if (highestDegree > currentDegrees.length) {
            output.push({
                sequence: printEachState(currentDegrees),
                explanation: "Not enough vertices available",
                isError: true
            });
            return { output, isGraphical: false };
        }
        
        // Remove highest degree
        currentDegrees.shift();
        
        // Decrement the degrees
        for (let i = 0; i < highestDegree; i++) {
            currentDegrees[i]--;
            if (currentDegrees[i] < 0) {
                output.push({
                    sequence: printEachState(currentDegrees),
                    explanation: "Negative number encountered",
                    isError: true
                });
                return { output, isGraphical: false };
            }
        }
        
        output.push({
            sequence: printEachState(currentDegrees),
            explanation: `Removed ${highestDegree}, decremented next ${highestDegree} numbers`
        });
    }
    
    return { output, isGraphical: true };
}

function runAlgorithm() {
    const outputDiv = document.getElementById("steps-output");
    const { error, sequence } = getSequence();
    
    if (error) {
        outputDiv.innerHTML = `Error: ${error}`;
        outputDiv.style.color = "red";
        return;
    }
    
    const { output, isGraphical } = havelHakimi(sequence);
    
    // Display results
    let result = "";
    output.forEach(step => {
        result += `${step.sequence}\n`;
    });
    
    result += "\n" + (isGraphical ? 
        "Successfully construct graph using the Havel-Hakimi Algorithm" : 
        "Cannot construct such a graph");
    
    outputDiv.innerHTML = result;
    outputDiv.style.color = isGraphical ? "green" : "red";
}

// Add event listeners when document loads
document.addEventListener('DOMContentLoaded', function() {
    // Update max degree text when size changes
    const sizeInput = document.getElementById("size-input");
    const maxDegreeSpan = document.getElementById("max-degree");
    
    sizeInput.addEventListener('input', function() {
        const size = parseInt(sizeInput.value);
        if (!isNaN(size) && size > 0) {
            maxDegreeSpan.textContent = (size - 1).toString();
        } else {
            maxDegreeSpan.textContent = "N/A";
        }
    });
});

let currentExercise = 1;
const exercises = {
    1: {
        sequence: [2, 2, 2, 2],
        title: "Exercise 1: [2, 2, 2, 2]",
        vertices: 4,
        isGraphical: true,
        solution: [
            {x: 100, y: 100}, {x: 300, y: 100},
            {x: 300, y: 300}, {x: 100, y: 300}
        ],
        solutionEdges: [[0,1], [1,2], [2,3], [3,0]]
    },
    2: {
        sequence: [3, 3, 3, 3, 2],
        title: "Exercise 2: [3, 3, 3, 3, 2]",
        vertices: 5,
        isGraphical: true,
        solution: [
            {x: 200, y: 100}, {x: 300, y: 200},
            {x: 250, y: 300}, {x: 150, y: 300},
            {x: 100, y: 200}
        ],
        solutionEdges: [[0,1], [0,2], [0,4], [1,2], [1,3], [2,3], [3,4]]
    },
    3: {
        sequence: [4, 4, 4, 1],
        title: "Exercise 3: [4, 4, 4, 1] (Not Graphical)",
        vertices: 4,
        isGraphical: false,
        explanation: "This sequence is not graphical because:\n1. The highest degree (4) is greater than the number of available vertices (3) after removing it\n2. Each vertex can only connect to 3 others in a 4-vertex graph"
    }
};

let canvas = document.getElementById('graphCanvas');
let ctx = canvas.getContext('2d');
let vertices = [];
let edges = [];
let dragging = false;
let startVertex = null;
let mouseX = 0;
let mouseY = 0;

function selectExercise(num) {
    currentExercise = num;
    document.getElementById('exercise-title').textContent = exercises[num].title;
    clearCanvas();
}

class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.degree = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#007bff';
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.degree.toString(), this.x, this.y);
    }
}

class Edge {
    constructor(v1, v2) {
        this.v1 = v1;
        this.v2 = v2;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.v1.x, this.v1.y);
        ctx.lineTo(this.v2.x, this.v2.y);
        ctx.stroke();
    }
}

// Mouse event handlers remain the same but with maxVertices check updated
function startDraw(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    startVertex = vertices.find(v => 
        Math.hypot(v.x - mouseX, v.y - mouseY) < 15
    );

    if (!startVertex && vertices.length < exercises[currentExercise].vertices) {
        vertices.push(new Vertex(mouseX, mouseY));
        redraw();
    } else if (startVertex) {
        dragging = true;
    }
}

function draw(e) {
    if (!dragging || !startVertex) return;

    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    redraw();
    ctx.beginPath();
    ctx.moveTo(startVertex.x, startVertex.y);
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
}

function endDraw(e) {
    if (!dragging || !startVertex) return;

    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    const endVertex = vertices.find(v => 
        v !== startVertex && 
        Math.hypot(v.x - mouseX, v.y - mouseY) < 15
    );

    if (endVertex) {
        const edgeExists = edges.some(edge => 
            (edge.v1 === startVertex && edge.v2 === endVertex) ||
            (edge.v1 === endVertex && edge.v2 === startVertex)
        );

        if (!edgeExists) {
            edges.push(new Edge(startVertex, endVertex));
            startVertex.degree++;
            endVertex.degree++;
        }
    }

    dragging = false;
    startVertex = null;
    redraw();
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    edges.forEach(edge => edge.draw());
    vertices.forEach(vertex => vertex.draw());
}

function clearCanvas() {
    vertices = [];
    edges = [];
    redraw();
    document.getElementById('message').innerHTML = '';
}

function checkGraph() {
    const message = document.getElementById('message');
    const exercise = exercises[currentExercise];
    
    if (vertices.length !== exercise.vertices) {
        message.innerHTML = `You need exactly ${exercise.vertices} vertices!`;
        message.className = 'error';
        return;
    }

    // Sort degrees to compare with target sequence
    const currentDegrees = vertices.map(v => v.degree).sort((a, b) => b - a);
    const targetDegrees = [...exercise.sequence].sort((a, b) => b - a);
    
    const correctDegrees = currentDegrees.every((deg, i) => deg === targetDegrees[i]);
    
    if (!correctDegrees) {
        message.innerHTML = `Incorrect degrees. Current: [${currentDegrees}], Target: [${targetDegrees}]`;
        message.className = 'error';
        return;
    }

    message.innerHTML = 'Correct! You have created a valid graph!';
    message.className = 'success';
}

function showSolution() {
    clearCanvas();
    const exercise = exercises[currentExercise];
    const message = document.getElementById('message');
    
    if (!exercise.isGraphical) {
        message.innerHTML = "This sequence is not graphical! The highest degree (4) is greater than the number of available vertices (3) after removing it\n2. Each vertex can only connect to 3 others in a 4-vertex graph";
        message.className = 'error';
        return;
    }
    
    // For graphical sequences, show the solution
    exercise.solution.forEach(pos => {
        vertices.push(new Vertex(pos.x, pos.y));
    });
    
    exercise.solutionEdges.forEach(([i, j]) => {
        const edge = new Edge(vertices[i], vertices[j]);
        edges.push(edge);
        vertices[i].degree++;
        vertices[j].degree++;
    });
    
    redraw();
}
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);

// Initialize
selectExercise(1);
