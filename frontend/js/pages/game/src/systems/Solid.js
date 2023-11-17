const solids = [];

function addSolid( obj ) {
	solids.push( obj );
}

function removeSolid( obj ) {
	solids.pop( obj );
}

function getSolids() {
	return solids;
}

export { addSolid, getSolids, removeSolid };