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
		cells[i].update_positions();
	}
}
function gen_uid(){
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function Cell(context, x, y, cells){
	this.uid = gen_uid();
	this.size = 3; //size is radius btw
	this.x = x; //should refer to center
	this.y = y;
	this.age = 0;
	this.cells = cells; //array of all the things in the world to update positions.
	this.context = context;
}

function rand_neg(){
	if (Math.random() > .5){
		return 1;
	}
	else{
		return -1;
	}
}
Cell.prototype.update_states = function(){
	//update size

	//randomly divide
	if (Math.random() > .99){
		//split in size
		var rand_x = rand_neg() * this.size * 1.5; //add some padding
		var rand_y = rand_neg() * this.size * 1.5;
		if (this.cells.length < 3000){
			this.cells.push(new Cell(this.context, this.x + rand_x, this.y + rand_y, this.cells));

		}
	}
	//move
}
Cell.prototype.update_positions= function(){
	var cells = this.cells;
	for (var i = 0; i < cells.length; i++){
		if (cells[i].uid == this.uid){
			continue;
		}
		var nbr = cells[i];
		//check if intersect, push cell out of way if intersecting.
		var dist = Math.sqrt( Math.pow((this.x-nbr.x), 2) + Math.pow((this.y-nbr.y),2) );
		if (dist >= this.size + nbr.size){
			continue;
		}
		else{
			var angle = Math.atan(this.y - nbr.y, this.x - nbr.x);
			dist = dist - (this.size + nbr.size);
			nbr.x += (Math.cos(angle) * dist/2);
			nbr.y += (Math.sin(angle) * dist/2);
			this.x -= (Math.cos(angle) * dist/2);
			this.y -= (Math.sin(angle) * dist/2);
		}
	}
}
Cell.prototype.render = function(){
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
Cell.prototype.divide = function(){

}