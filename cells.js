//Global variables


///TODO:

//1. fix spatial hashing
//2. fix jumping bug?
//3. fix neighbor search
function render_cells(cells){
	for (var i = 0; i < cells.length; i++){
		cells[i].render();
	}
}

function update_cells(cells){
	for (var i = 0; i < cells.length; i++){
		cells[i].update_states();
	}

	for (var i = 0; i < cells.length; i++){
		cells[i].update_velocity();
	}
	for (var i = 0; i < cells.length; i++){
		cells[i].update_position();
	}
}


function gen_uid(){
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


function rand_neg(){
	if (Math.random() > .5){
		return 1.0;
	}
	else{
		return -1.0;
	}
}

class GlobalStateContainer{

	constructor(context, canvas, grid_width, cells, sp_hash, max_cells){
		this.context = context;
		this.screen_width = canvas.width;
		this.canvas = canvas;
		this.grid_width = grid_width;
		this.cells = cells;
		this.sp_hash = sp_hash;
		this.max_cells = max_cells;
		this.centroid_x = 0;
		this.centroid_y = 0;
	}
	get_hash(x, y){
		var num_grid_cells = this.screen_width / this.grid_width;
		var hash = parseInt(Math.floor(x / this.grid_width) + (Math.floor(y /this.grid_width) * num_grid_cells));
		return hash;
	}	
	update(){
		this.calc_centroid();
		this.update_spatial_hash();
	}
	update_spatial_hash(){
		this.sp_hash.clear(); //clear hash
		//make sure it's a map!!!!
		for (var i = 0; i < this.cells.length; i++){
			var cell = this.cells[i];
			var h = this.get_hash(cell.x, cell.y);
			if (this.sp_hash.has(h)){
				//if not empty
				this.sp_hash.get(h).push(cell);
			}
			else{
				this.sp_hash.set(h, []);
				this.sp_hash.get(h).push(cell);
			}
		}
	}
	debug_spatial_hash(){
		var num_grid_cells = this.screen_width / this.grid_width;
		//vertical strokes
		for (var i = 0; i < num_grid_cells; i++){
			this.context.beginPath();
			this.context.moveTo(i * this.grid_width, 0);
			this.context.lineTo(i * this.grid_width, this.canvas.height);
			this.context.stroke();
			this.context.closePath();
		}
		for (var j = 0; j < num_grid_cells; j++){
			this.context.beginPath();
			this.context.moveTo(0, j * this.grid_width);
			this.context.lineTo(this.canvas.width, j * this.grid_width);
			this.context.stroke();
			this.context.closePath();
		}
	}
	calc_centroid(){
		var x_sum = 0;
		var y_sum = 0;
		for (var i = 0; i < this.cells.length; i++){
			x_sum += this.cells[i].x;
			y_sum += this.cells[i].y;
		}
		this.centroid_x = x_sum / this.cells.length;
		this.centroid_y = y_sum / this.cells.length;
	}
}



class Cell{
	constructor(state, size, x, y){
		this.uid = gen_uid();
		this.size = size; //size is radius btw
		this.x = x; //should refer to center
		this.y = y;
		this.age = 0;
		this.cells = cells; //array of all the things in the world to update positions.
		this.state = state; //encapsulation over global state
		this.context = state.context;
		this.cells = state.cells;
		this.age = 0;
		this.velx = 0;
		this.vely = 0;
	}
	update_states(){
		//update size
		//randomly divide
		if (Math.random() > .99){
			//split in size
			this.divide();
		}
		this.grow();
		this.die();
		//move
	}
	grow(){
		this.age += 1;
		if (this.size < 6){
			this.size += .01;
		}
	}
	die(){
		if (this.age > 10000){
			var index = this.cells.indexOf(this);
			if (index > -1) {
			  this.cells.splice(index, 1);
			}
			delete this;
		}
	}
	update_position(){
		var hash = this.state.get_hash(this.x, this.y);
		var nbrs = this.state.sp_hash.get(hash);
		if (nbrs == undefined){
			return;
		}
		for (var i = 0; i < nbrs.length; i++){
			if (this.cells[i].uid == this.uid){
				continue;
			}
			var nbr = nbrs[i];
			//check if intersect, push cell out of way if intersecting.
			var dist = Math.sqrt( Math.pow((nbr.x-this.x), 2) + Math.pow((nbr.y-this.y),2));
			if (dist <= this.size + nbr.size){
				if (dist === 0.0){
					return;
				}
				var to_move = (dist - this.size - nbr.size);
				if (to_move > 100){
					console.log('wut');
				}
				//only move this one
				this.velx += to_move * (nbr.x - this.x) /dist;
				this.vely += to_move * (nbr.y - this.y)/ dist;
			}
		}
	}
	update_velocity(){
		//empty for now
		this.x += this.velx;
		this.y += this.vely;
		this.velx /= 2;
		this.vely /= 2;
	}
	render(){
	   	//nucleus
	   	this.context.fillStyle = "red";
		this.context.beginPath();
		this.context.globalAlpha = .4;
		this.context.arc(this.x + this.size,this.y + this.size, this.size/3,0,2*Math.PI);
		this.context.fill();
	   	this.context.closePath();
		//outer cell
		this.context.beginPath();
		this.context.globalAlpha = .4;
		this.context.arc(this.x + this.size,this.y + this.size, this.size,0,2*Math.PI);
		this.context.fill();
	   	this.context.closePath();
	}
	check_if_edge(){
		//figure out if on an edge
		//check in the four adjacent bounding boxes

		var pos_left = this.x - this.state.grid_width;
		var pos_right = this.x + this.state.grid_width;
		var pos_up = this.y + this.state.grid_width;
		var pos_down = this.y - this.state.grid_width;

		var hash_right= this.state.get_hash(pos_right, this.y);
		var hash_left = this.state.get_hash(pos_left, this.y);
		var hash_up = this.state.get_hash(this.x, pos_up);
		var hash_down = this.state.get_hash(this.x, pos_down);

		if (!this.state.sp_hash.has(hash_right) || 
			!this.state.sp_hash.has(hash_left) || 
			!this.state.sp_hash.has(hash_up) || 
			!this.state.sp_hash.has(hash_down) ){
			//if left hash empty, make some cells. 
			return true;
		}
		else{
			return false;
		}
	}
	too_dense(){
		var threshold = 5;
		var hash = this.state.get_hash(this.x, this.y);
		var nbrs = this.state.sp_hash.get(hash);

		if (nbrs.length > threshold){
			return true;
		}
		else{
			return false;
		}
	}
	divide(){
		
		var rand_x = rand_neg() * this.size/2.0;
		var rand_y = rand_neg() * this.size/2.0;	

		//return cases
		if (this.size < 5 || this.too_dense()){
			return;
		}
		if (this.cells.length < this.state.max_cells){
			this.cells.push(new Cell(this.state, this.size/2.0, this.x + rand_x, this.y + rand_y));
			this.state.update_spatial_hash(); //must add to hash
			this.size /= 2.0;
			return;
		}
		
		if (this.cells.length > 200 && this.check_if_edge()){
			this.cells.push(new EpithelialCell(this.state, this.size/2.0,this.x + rand_x, this.y + rand_y));
			this.state.update_spatial_hash(); //must add to hash
			this.size/= 2.0;
			return;
		}
	}
}

class EpithelialCell extends Cell{

	constructor(state,size, x, y){
		super(state,size, x, y);
	}
	render(){
		//nucleus
	   	this.context.fillStyle = "blue";
		this.context.beginPath();
		this.context.globalAlpha = .4;
		this.context.arc(this.x + this.size,this.y + this.size, this.size/3,0,2*Math.PI);
		this.context.fill();
	   	this.context.closePath();
		//outer cell
		this.context.beginPath();
		this.context.globalAlpha = .4;
		this.context.arc(this.x + this.size,this.y + this.size, this.size,0,2*Math.PI);
		this.context.fill();
	   	this.context.closePath();
	}
	divide(){
		var noise_x = rand_neg() * this.size/5.0;
		var noise_y = rand_neg() * this.size/5.0;	
		var mag = Math.sqrt(Math.pow(this.x - this.state.centroid_x,2) + Math.pow(this.y - this.state.centroid_y,2));
		var rand_x = ((this.x - this.state.centroid_x) / mag) * this.size/2.0 + noise_x;
		var rand_y = ((this.y - this.state.centroid_y) / mag) * this.size/2.0 + noise_y;
		
		if (this.check_if_edge() && this.cells.length < this.state.max_cells){
			this.cells.push(new EpithelialCell(this.state, this.size/2.0,this.x + rand_x, this.y + rand_y));
			this.state.update_spatial_hash(); //must add to hash
			this.size/= 2.0;
			return;
		}
	}
}
