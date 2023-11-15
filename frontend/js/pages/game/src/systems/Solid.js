const solids = [];

function addSolid( obj ) {
	solids.push( obj );
}

function getSolids() {
	return solids;
}

export { addSolid, getSolids };