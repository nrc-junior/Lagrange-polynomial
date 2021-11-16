/*
* #Graph-Plotting é uma API sobre a licensa Apache 2.0 
* propriedade da compania Travis Cl.
* https://travis-ci.org/phenax/graph-plotting
* https://travis-ci.org/phenax/graph-plotting.svg?branch=master 
* Javascript library that lets you plot points and lines based on the Cartesian system with a very simple api, on an html5 canvas.
* o código foi modificado para o uso no trabalho.
*/

class Graph {

	// Mock canvas context object for testing
	static getMockContext() {

		const fnNames= [
			'moveTo', 'lineTo', 'clearRect', 'arc',
		];

		const ctx= { calledFn: [] };
		const fn= name => () => ctx.calledFn.push(name);

		fnNames.forEach( name => ctx[name] = fn(name) );

		return ctx;
	}

	constructor(config) {

		// colors
		this.AXIS_COLOR= 'rgba(81, 128, 233, .4)';
		this.GRID_COLOR= 'rgba(0,0,0,.1)';
		this.CENTER_COLOR= '#3b5998';
		this.DEFAULT_LINE_COLOR= '#888';

		this.AXIS_LIMIT_ERROR= 'The axis lower limit cannot be greater than the upper limit';

		this.bf_line = undefined;
		this._ctx= config.context;

		// Dimensions(True dimensions)
		this.width= config.dimens.width;
		this.height= config.dimens.height;

		this.labels= {
			x: config.labels.x || '',
			y: config.labels.y || '',
		};

		this._init();
	}

	// Initialize state and state getters
	_init() {

		this.axis= {};

		// Figures
		this._points= [];
		this._lines= [];

		// Shift and transform origin
		this.point= {
			shiftX: x => this.width/2  - (this.axis.x[1] + this.axis.x[0]) + x,
			shiftY: y => this.height/2 + (this.axis.y[1] + this.axis.y[0]) - y,
		};

		// Scale point to the real canvas coordinates
		this.proportionX= x => this.point.shiftX( x / this.scale.x );
		this.proportionY= y => this.point.shiftY( y / this.scale.y );

		this.render= this.render.bind(this);
	}

	// Axes upper limit to lower limit length(pseudo dimensions)
	get dimens() {
		return {
			x: this.axis.x[1] - this.axis.x[0],
			y: this.axis.y[1] - this.axis.y[0],
		};
	}

	// The scale of the graph
	get scale() {
		return {
			x: this.dimens.x/this.width,
			y: this.dimens.y/this.height,
		};
	}


	// Render the graph and plot all figures
	show() {
		requestAnimationFrame(this.render);
	}

	// Set the X axis limits
	setAxisX(limits) {
		if(limits[0] < limits[1])
			this.axis.x= limits;
		else throw new Error(this.AXIS_LIMIT_ERROR);
		return this;
	}

	// Set the Y axis limits
	setAxisY(limits) {
		if(limits[0] < limits[1])
			this.axis.y= limits;
		else throw new Error(this.AXIS_LIMIT_ERROR);
		return this;
	}

	// Add a point to the figures to render
	plot(x, y, color='#555') {
		this._points.push({
			x: x,
			y: y,
			color
		});

		return this;
	}

	// Add a line to the figures to render
	plotLine(prop) {

		if(typeof prop !== 'object')
			return;

		let equation;

		// Two point form
		if(typeof prop['2 points'] === 'object')
			equation= Line.toStandardForm(prop['2 points']);

		// Standard form
		else if(typeof prop.standard === 'object')
			equation= [prop.standard.m, prop.standard.c];

		else
			throw new Error('Invalid line equation');

		if(equation)
			this._lines.push(new Line(equation[0], equation[1]));

		return this;
	}

	// Draw a point on the graph
	drawPoint(x, y, color='#555', i) {

		this._ctx.beginPath();
		this._ctx.arc(
			this.proportionX(x), 
			this.proportionY(y), 
			3, 0, Math.PI*2
		);

		this._ctx.save();
		this._ctx.fillStyle= color;
		this._ctx.fill();
		this._ctx.restore();

		if(this.bf_line != undefined && i > 0  ){
			this._ctx.save();
			this._ctx.beginPath();
			this._ctx.moveTo(this.proportionX(this.bf_line.x), this.proportionY(this.bf_line.y));
			this._ctx.lineTo(this.proportionX(x), this.proportionY(y));
			this._ctx.lineWidth = 1;
			this._ctx.strokeStyle = '#ff0000';
			this._ctx.stroke();
			this._ctx.restore();
		}
	}


	// Draw a line segment on the graph
	drawSegment(p1, p2, color='#555', size=1) {

		this._ctx.lineWidth= size;

		this._ctx.beginPath();
		this._ctx.moveTo(
			this.proportionX(p1.x), 
			this.proportionY(p1.y)
		);
		this._ctx.lineTo(
			this.proportionX(p2.x), 
			this.proportionY(p2.y)
		);

		this._ctx.save();
		this._ctx.strokeStyle= color;
		this._ctx.stroke();
		this._ctx.restore();
	}

	// Draw a line(i.e. draw a segment i.e. a segment that extends to the boundaries of the graph)
	drawLine(line, color, size) {

		let points;

		if(Math.abs(line.slope) > 1) {

			points= [{
				x: this.axis.x[0],
				y: line.getY(this.axis.x[0]),
			}, {
				x: this.axis.x[1],
				y: line.getY(this.axis.x[1]),
			}];
		} else {

			points= [{
				x: line.getX(this.axis.y[0]),
				y: this.axis.y[0],
			}, {
				x: line.getX(this.axis.y[1]),
				y: this.axis.y[1],
			}];
		}

		this.drawSegment(points[0], points[1], color, size);
	}

	// Render the axes
	renderAxis() {

		// Draw the y axis
		this.drawSegment(
			{ x: this.axis.x[0], y: 0 },
			{ x: this.axis.x[1], y: 0 },
			this.AXIS_COLOR
		);

		// Draw the x axis
		this.drawSegment(
			{ x: 0, y: this.axis.y[0] },
			{ x: 0, y: this.axis.y[1] },
			this.AXIS_COLOR
		);

		// Origin
		//this.drawPoint(0, 0, this.CENTER_COLOR, 2);
	}

	// Render the grid
	renderGrid(size) {

		for(let i= 0; i<= this.dimens.x; i+= size) {

			const x= i + size*Math.ceil(this.axis.x[0]/size);

			this.drawSegment(
				{ x, y: this.axis.y[0] },
				{ x, y: this.axis.y[1] },
				this.GRID_COLOR, .3
			);
		}

		for(let i= 0; i<= this.dimens.y; i+= size) {

			const y= i + size*Math.ceil(this.axis.y[0]/size);

			this.drawSegment(
				{ x: this.axis.x[0], y },
				{ x: this.axis.x[1], y },
				this.GRID_COLOR, .3
			);
		}
	}

	// Render everything in the graph(all points, all segments, grid, axes, origin)
	render() {

		this._ctx.clearRect(0, 0, this.width, this.height);


		// Draw all points
		var i = 0 ;
		this._points.forEach(p => {
			this.drawPoint(p.x, p.y, p.color, i++)
			this.bf_line = p;
		});

		// Draw all lines
		this._lines.forEach( line => this.drawLine(line, this.DEFAULT_LINE_COLOR) );

		// Render a grid
		this.renderGrid(10);
		// Render the axes
		this.renderAxis();

		requestAnimationFrame(this.render);
	}
}


function GraphPlot(vectors){
	var $canvas = document.getElementById('myCanvas');
	var context = $canvas.getContext('2d');

	var graph = new Graph({
		context: context,
		labels: {
			x: 'foo',
			y: 'bar'
		},
		dimens: {
			width: $canvas.width,
			height: $canvas.height
		}
	});
	
	var cWid = 0;
	var cHei = 0;

	vectors.forEach(v => {
		cWid = Math.abs(v.x) > cWid ? Math.abs(v.x) : cWid;
		cHei = Math.abs(v.y) > cHei ? Math.abs(v.y) : cHei;
	});

	cHei = Math.min(200,cHei);
	cWid = Math.min(200,cWid);

	console.log(`${cWid} ${cHei}`)
	
	graph.setAxisX([-cWid-3, cWid+3]).setAxisY([-cHei-3, cHei+3]);
	vectors.forEach(v => { graph.plot(v.x, v.y, v.cor)});
	graph.show();
}