//Global variables

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

	constructor(context, canvas, grid_width, cells, sp_hash, max_cells, color, max_size){
		this.context = context;
		this.screen_width = canvas.width;
		this.canvas = canvas;
		this.grid_width = grid_width;
		this.cells = cells;
		this.sp_hash = sp_hash;
		this.max_cells = max_cells;
		this.centroid_x = 0;
		this.centroid_y = 0;
		this.color = color;
		this.max_size = max_size;
	}
	init(){
		 var direction3 = -Math.PI / 2;
		 this.cells.push(new Cell(state, 3, this.canvas.width / 2, this.canvas.height, direction3, this.max_size));

		/*
         var direction3 = 0;
		 this.cells.push(new Cell(state, 3, this.canvas.width / 2, this.canvas.height/2, direction3, this.max_size));

		 var direction4 = Math.PI;
		 this.cells.push(new Cell(state, 3, this.canvas.width /2 - 10, this.canvas.height/2, direction4, this.max_size));
		*/
		/*
		var direction0 = -Math.PI / 4.0;
		this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction0,this.max_size));
        this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction0,this.max_size)); //direction = radian bias

		var direction2 = -3 * Math.PI / 4.0;
		this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction2,this.max_size));
        this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction2,this.max_size));//direction = radian bias

         
         var direction5 = -Math.PI/2;
		 this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction5,this.max_size));
         this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction5,this.max_size)); //direction = radian bias

		 var direction1 = Math.PI; 
		 this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction1,this.max_size));
         this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction1,this.max_size)); //direction = radian bias

         var direction3 = 0;
		 this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction3,this.max_size));
         this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction3,this.max_size)); //direction = radian bias
		
		
         var direction4 = Math.PI/2;
		 this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction4,this.max_size));
         this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction4,this.max_size)); //direction = radian bias
		
		var direction6 = Math.PI / 4.0;
		this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction6,this.max_size));
        this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction6,this.max_size)); //direction = radian bias
        
		var direction7 = 3 * Math.PI / 4.0;
		this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction7,this.max_size));
        this.cells.push(new Cell(state, 5, Math.random()* this.canvas.width, Math.random()* this.canvas.height, direction7,this.max_size)); //direction = radian bias
		*/
	}
	get_hash(x, y){
		var num_grid_cells = parseFloat(this.screen_width) / parseFloat(this.grid_width) ;//should be a float
		var hash = parseInt(
			(Math.floor(x / this.grid_width)) + 
			(Math.floor(y / this.grid_width) * num_grid_cells)
		);
		return hash;
	}	
	update(){
		this.calc_centroid();
		this.update_spatial_hash();
		//this.debug_spatial_hash();
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
	constructor(state, size, x, y, direction, max_size){
		this.uid = gen_uid();
		this.size = size; //size is radius btw
		this.age = 0;
		this.cells = cells; //array of all the things in the world to update positions.
		this.state = state; //encapsulation over global state
		this.context = state.context;
		this.cells = state.cells;
		//growth direction
		this.direction = direction;
		//age state
		this.age = 0;
		//positional state
		this.x = x; //should refer to center
		this.y = y;
		this.lastvelx = 0;
		this.lastvely = 0;
		this.velx = 0;
		this.vely = 0;
		this.max_size = max_size;
		//messaging state
		this.messaging = false;


		//branching chance
		this.branching_chance = .9;
		this.branching_dev = Math.PI/4;
	}
	update_states(){
		//update size
		//randomly divide
		this.divide();
		this.grow();
		this.die();
		//messaging
		//this.message_neighbors();
		//this.handle_messages();
		//move
	}
	handle_messages(){
		if (this.messaging){
			this.message_count -= 1;
		}
		if (this.message_count <= 0){
			this.messaging = false;
		}
		else {
			//not messaging 
			var hash = this.state.get_hash(this.x, this.y);
			var nbrs = this.state.sp_hash.get(hash);
			for (var i = 0; i < nbrs.length; i++){
				var cell = nbrs[i];
				if (cell.messaging && Math.random > .99){
					this.messaging = true;
					this.message_count = 20;
				}
			}
		}
	}
	message_neighbors(){
		if (Math.random() > .99){
			this.messaging = true;
			this.message_count = 20;
		}
	}
	grow(){
		this.age += 1;
		if (this.size < this.max_size){
			this.size += this.max_size / 100;
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
		/*
		if (!this.check_if_directional_edge()){
			var index = this.cells.indexOf(this);
			if (index > -1) {
			  this.cells.splice(index, 1);
			}
			delete this;
		}*/
	}
	update_velocity(){
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
				//only move this one
				var damping = .1;
				this.velx += to_move * (nbr.x - this.x) /dist * damping;
				this.vely += to_move * (nbr.y - this.y)/ dist * damping;
			}
		}
	}
	update_position(){
		//limit accelerations
		/*
		if  (Math.abs(this.lastvely - this.vely) > .01){
			this.vely = this.vely * 0.1;
		}
		if  (Math.abs(this.lastvelx - this.velx) > .01){
			this.velx = this.velx * 0.1;
		} */
		this.x += this.velx;
		this.y += this.vely;
		this.lastvely = this.vely;
		this.lastvelx = this.velx;
		this.velx /= 1.4;
		this.vely /= 1.4;
	}
	render(){
	   	this.context.fillStyle = this.state.color;
		this.context.beginPath();
		this.context.globalAlpha = .4;
		this.context.arc(this.x + this.size,this.y + this.size, this.size/3, 0, 2*Math.PI);
		this.context.fill();
	   	this.context.closePath();
		//outer cell
		this.context.beginPath();
		this.context.globalAlpha = .4;
		this.context.arc(this.x + this.size,this.y + this.size, this.size, 0, 2*Math.PI);
		this.context.fill();
	   	this.context.closePath();
	   	//nucleus

	   	if (this.messaging){
	   		this.context.fillStyle = "yellow";
			this.context.beginPath();
			this.context.globalAlpha = .4;
			this.context.arc(this.x + this.size,this.y + this.size, this.size * 1.1 ,0,2*Math.PI);
			this.context.fill();
		   	this.context.closePath();
	   	}
	}
	check_if_directional_edge(direction){
		//figure out if on an edge
		//check in the four adjacent bounding boxes
		//just up down
		var pos_dir_cos1 = this.x + Math.round(Math.cos(direction)) * this.state.grid_width;
		var pos_dir_sin1 = this.y + Math.round(Math.sin(direction)) * this.state.grid_width;
		var hash1 = this.state.get_hash(pos_dir_cos1, pos_dir_sin1); //x and y
		//should be all the indices that need checking

		direction = direction + Math.PI/4;
		var pos_dir_cos2 = this.x + Math.round(Math.cos(direction)) * this.state.grid_width;
		var pos_dir_sin2 = this.y + Math.round(Math.sin(direction)) * this.state.grid_width;
		var hash2 = this.state.get_hash(pos_dir_cos2, pos_dir_sin2); //x and y
		//should be all the indices that need checking

		direction = direction - Math.PI/2; //shift back pi/2
		var pos_dir_cos3 = this.x + Math.round(Math.cos(direction)) * this.state.grid_width;
		var pos_dir_sin3 = this.y + Math.round(Math.sin(direction)) * this.state.grid_width;
		var hash3 = this.state.get_hash(pos_dir_cos3, pos_dir_sin3); //x and y
		//should be all the indices that need checking



		if (!this.state.sp_hash.has(hash1) && !this.state.sp_hash.has(hash2) && !this.state.sp_hash.has(hash3)){
			//if empty
			return true;
		}
		else{
			return false;
		}

	}
	too_dense(){
		var threshold = 2;
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
		//return cases
		if (this.size < this.max_size || this.too_dense() || Math.random() < .9){
			return;
		}
		var ep_num = 200;
		if (this.check_if_directional_edge(this.direction)){
			if (Math.random() > this.branching_chance){
				//branching logic
				var noise_x = rand_neg() * this.size/10.0;
				var noise_y = rand_neg() * this.size/10.0;	
				var rand_x = Math.round(Math.cos(this.direction)) * this.size/2 + noise_x;
				var rand_y = Math.round(Math.sin(this.direction)) * this.size/2 + noise_y;

				var new_left = this.direction - this.branching_dev;
				var new_right = this.direction + this.branching_dev;
				this.cells.push(new Cell(this.state, this.size/2.0, this.x + rand_x, this.y + rand_y, new_right, this.max_size * .9));
				this.cells.push(new Cell(this.state, this.size/2.0, this.x + rand_x, this.y + rand_y, new_left, this.max_size * .9));

				this.state.update_spatial_hash(); //must add to hash
				this.size /= 2.0;
				this.age = 10000;
				return;
			}
			else{
				//divide in the given direction, don't branch
				var noise_x = rand_neg() * this.size/10.0;
				var noise_y = rand_neg() * this.size/10.0;	
				var rand_x = Math.round(Math.cos(this.direction)) * this.size/2.0 + noise_x;
				var rand_y = Math.round(Math.sin(this.direction)) * this.size/2.0 + noise_y;
				this.cells.push(new Cell(this.state, this.size/2.0, this.x + rand_x, this.y + rand_y, this.direction, this.max_size));
				this.state.update_spatial_hash(); //must add to hash
				this.size/=2.0;
				return;
			}
		}
		
		else if ((Math.random() > this.branching_chance) && this.check_if_directional_edge(this.direction + Math.PI/2)){ //not direction edge, maybe create an epithelial cell
			var noise_x = rand_neg() * this.size/10.0;
			var noise_y = rand_neg() * this.size/10.0;	
			//perpendicular direction
			var rand_x = Math.round(Math.cos(this.direction + Math.PI/2)) * this.size/2 + noise_x;
			var rand_y = Math.round(Math.sin(this.direction + Math.PI/2)) * this.size/2 + noise_y;

			this.cells.push(new EpithelialCell(this.state, this.size/2.0,this.x + rand_x, this.y + rand_y, this.direction, this.max_size ));
			this.state.update_spatial_hash(); //must add to hash
			this.size/= 2.0;
			return;
		}
		else if ((Math.random() > this.branching_chance) && this.check_if_directional_edge(this.direction - Math.PI/2)){ //not direction edge, maybe create an epithelial cell
			var noise_x = rand_neg() * this.size/10.0;
			var noise_y = rand_neg() * this.size/10.0;	
			//perpendicular direction
			var rand_x = Math.round(Math.cos(this.direction - Math.PI/2)) * this.size/2 + noise_x;
			var rand_y = Math.round(Math.sin(this.direction - Math.PI/2)) * this.size/2 + noise_y;

			this.cells.push(new EpithelialCell(this.state, this.size/2.0,this.x + rand_x, this.y + rand_y, this.direction, this.max_size ));
			this.state.update_spatial_hash(); //must add to hash
			this.size/= 2.0;
			return;
		}
	}
}
class VeinCell extends Cell{

	constructor(state,size, x, y, direction, max_size){
		super(state,size, x, y, direction, max_size);
	}
	render(){
		//nucleus
	   	this.context.fillStyle = "#FF9771";
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
		
		//Ideally you want these to divide when they're near epithelial cells, but for now going to divide if cell count > 3000
		if (this.size < this.max_size || this.too_dense() || Math.random() < .999){
			return;
		}
		if (this.state.cells.length > 3000 && this.check_if_directional_edge(this.direction - Math.PI/2)){ //not direction edge, maybe create an epithelial cell
			var noise_x = rand_neg() * this.size/10.0;
			var noise_y = rand_neg() * this.size/10.0;	
			//perpendicular direction
			var rand_x = Math.round(Math.cos(this.direction - Math.PI/2)) * this.size/2 + noise_x;
			var rand_y = Math.round(Math.sin(this.direction - Math.PI/2)) * this.size/2 + noise_y;

			this.cells.push(new VeinCell(this.state, this.size/2.0,this.x + rand_x, this.y + rand_y, this.direction, this.max_size));
			this.state.update_spatial_hash(); //must add to hash
			this.size/= 2.0;
			return;
		}
		else if (this.state.cells.length > 3000 && this.check_if_directional_edge(this.direction + Math.PI/2)){ //not direction edge, maybe create an epithelial cell
			var noise_x = rand_neg() * this.size/10.0;
			var noise_y = rand_neg() * this.size/10.0;	
			//perpendicular direction
			var rand_x = Math.round(Math.cos(this.direction + Math.PI/2)) * this.size/2 + noise_x;
			var rand_y = Math.round(Math.sin(this.direction + Math.PI/2)) * this.size/2 + noise_y;

			this.cells.push(new VeinCell(this.state, this.size/2.0,this.x + rand_x, this.y + rand_y, this.direction, this.max_size));
			this.state.update_spatial_hash(); //must add to hash
			this.size/= 2.0;
			return;
		}
	}
}
class EpithelialCell extends Cell{

	constructor(state,size, x, y, direction, max_size){
		super(state,size, x, y, direction, max_size);
	}
	render(){
		//nucleus
	   	this.context.fillStyle = "#FF6471";
		this.context.beginPath();
		this.context.globalAlpha = .4;
		this.context.arc(this.x + this.size, this.y + this.size, this.size/3,0,2*Math.PI);
		this.context.fill();
	   	this.context.closePath();
		//outer cell
		this.context.beginPath();
		this.context.globalAlpha = .4;
		this.context.arc(this.x + this.size, this.y + this.size, this.size,0,2*Math.PI);
		this.context.fill();
	   	this.context.closePath();
	}
	grow(){
		this.age += 1;
		if (this.size < this.max_size){
			this.size += this.max_size / 100;
		}
	}
	divide(){
		if (this.size < this.max_size || this.too_dense() || Math.random() < .9){
			return;
		}
		if (this.check_if_directional_edge(this.direction - Math.PI/2)){ //not direction edge, maybe create an epithelial cell
			var noise_x = rand_neg() * this.size/10.0;
			var noise_y = rand_neg() * this.size/10.0;	
			//perpendicular direction
			var rand_x = Math.round(Math.cos(this.direction - Math.PI/2)) * this.size/2 + noise_x;
			var rand_y = Math.round(Math.sin(this.direction - Math.PI/2)) * this.size/2 + noise_y;

			this.cells.push(new VeinCell(this.state, this.size/2.0,this.x + rand_x, this.y + rand_y, this.direction, this.max_size));
			this.state.update_spatial_hash(); //must add to hash
			this.size/= 2.0;
			return;
		}
		else if (this.check_if_directional_edge(this.direction + Math.PI/2)){ //not direction edge, maybe create an epithelial cell
			var noise_x = rand_neg() * this.size/10.0;
			var noise_y = rand_neg() * this.size/10.0;	
			//perpendicular direction
			var rand_x = Math.round(Math.cos(this.direction + Math.PI/2)) * this.size/2 + noise_x;
			var rand_y = Math.round(Math.sin(this.direction + Math.PI/2)) * this.size/2 + noise_y;

			this.cells.push(new VeinCell(this.state, this.size/2.0,this.x + rand_x, this.y + rand_y, this.direction, this.max_size));
			this.state.update_spatial_hash(); //must add to hash
			this.size/= 2.0;
			return;
		}
	}
}
