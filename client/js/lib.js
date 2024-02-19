import {
	Mesh,
	Group,
	WireframeGeometry,
	LineSegments,
	Color,
} from 'three'




const extract_wiremesh = ( model, color, width ) => {

	const extraction = new Group()
	let valid
	model.traverse( obj => {
		if( obj.geometry ){
			const wireframe = new WireframeGeometry( obj.geometry )
			const line = new LineSegments( wireframe )
			// line.material.depthTest = false
			line.material.opacity = .5
			line.material.transparent = true			
			line.material.color = new Color( color || 'rgb(255, 240, 20)' )
			line.linewidth = width || 3
			extraction.add( line )
			valid = true
		}
	})
	return valid ? extraction : false

}


export {
	extract_wiremesh,
}