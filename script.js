( (win , boardMatrix , coords , players ) => {
	const { "document" : doc , } = win ;

	boardMatrix = boardMatrix.split( ',' ).map( line => line.split( "" ).map( cell => parseInt( cell ) ) ) ;

	let [ playerCurrent , ] = players ;

	const setNextPlayer = ( ) => {
		const idx = players.indexOf( playerCurrent ) ;

		return [ playerCurrent , ] = idx < players.length - 1 ? [ players[ idx + 1 ] , ] : players ;
	} ;

	doc.addEventListener( "DOMContentLoaded" , evt => {
		const board = doc.querySelector( ".board" ) ;
		const cell = board.querySelector( ".cell.template" ) ;

		boardMatrix.forEach( ( boardLine , y ) => boardLine.forEach( ( boardCell , x ) => {
			const cellCurrent = cell.cloneNode( true ) ;

			cellCurrent.classList.remove( "template" ) ;
			board.appendChild( cellCurrent ) ;

			cellCurrent.dataset.color = ( x % 2 - y % 2 ) ? 0 : 1 ;
			cellCurrent.dataset.x = x ;
			cellCurrent.dataset.y = y ;
			cellCurrent.dataset.player = boardCell ;

			if ( ! x ) {
				cellCurrent.classList.add( "both" ) ;
			}
		} ) ) ;

		const getStepsAll = ( ) => board.querySelectorAll( ".checked" ) ;

		const getSteps = stepsCurrent => {
			if ( stepsCurrent.length < 2 ) {
				return ;
			}

			stepsCurrent = [ ... stepsCurrent , ].sort( ( cellA , cellB ) => cellA.dataset.step - cellB.dataset.step ) ;

			let cellPrev ;
			const steps = [ ] ;

			stepsCurrent.forEach( cellCurrent => {
				if ( ! cellPrev ) {
					cellPrev = cellCurrent ;

					return ;
				}

				steps.push( [ cellPrev , cellCurrent , ] ) ;

				cellPrev = cellCurrent ;
			} ) ;

			return steps ;
		} ;

		const getStepsCellDiff = ( cellA , cellB , field ) => Math.abs( cellA.dataset[ field ] - cellB.dataset[ field ] ) ;
		const getStepCheck = ( cellA , cellB , count ) => coords.every( field => getStepsCellDiff( cellA , cellB , field ) == count ) ;
		const getStepsFiltered = stepsAll => {
			if ( ! stepsAll.length ) {
				return [ ] ;
			}

			const steps = getSteps( stepsAll ) ;
			const foundSingle = steps.some( ( [ cellA , cellB , ] ) => getStepCheck( cellA , cellB , 1 ) ) ;

			if ( steps.some( ( [ cellA , cellB , ] ) => getStepCheck( cellA , cellB , 1 ) ) ) {
				if ( steps.length > 1 ) {
					return [ ] ;
				}

				const [ [ cellA , cellB , ] , ] = steps ;

				if (
					[ [ cellA , cellB , ] , [ cellB , cellA , ] , ]
						.map( ( row , i ) => [ players[ i ] , ... row.map( cellCurrent => parseInt( cellCurrent.dataset.y ) ) , ] )
						.filter( ( [ player , ] ) => player == playerCurrent )
						.some( ( [ , a , b , ] ) => a > b )
				) {
					return [ ] ;
				}

				return steps ;
			}
			if ( ! steps.every( ( [ cellA , cellB , ] ) => getStepCheck( cellA , cellB , 2 ) ) ) {
				return [ ] ;
			}

			const [ [ cellFirst , ] , ] = steps ;

			try {
				steps.forEach( ( [ cellA , cellB , ] ) => {
					const [ cellAX , cellBX , cellAY , cellBY , ] = coords
						.map( field => [ cellA , cellB , ].map( cellCurrent => parseInt( cellCurrent.dataset[ field ] ) ) )
						.flat( )
						.map( value => parseInt( value ) ) ;

					const [ cellX , cellY, ] = [ [ cellAX , cellBX , ] , [ cellAY , cellBY , ] , ]
						.map( ( [ a , b, ] ) => a + ( b > a ? 1 : -1 ) ) ;

					const cellCurrent = board.querySelector( `[data-x="${cellX}"][data-y="${cellY}"]` ) ;

					if ( cellCurrent.dataset.player == 0 ) {
						throw null ;
					}
					if ( cellFirst.dataset.player == cellCurrent.dataset.player ) {
						throw null ;
					}

					cellCurrent.dataset.player = 0 ;
				} ) ;
			} catch ( exception ) {
				return [ ] ;
			}

			return steps ;
		} ;

		const cellsExchange = ( cellA , cellB ) => [ cellA.dataset.player , cellB.dataset.player , ] = [ cellB.dataset.player , cellA.dataset.player , ] ;

		const cellsStepClear = cellsCurrent => {
			cellsCurrent.forEach( cellCurrent => {
				cellCurrent.classList.remove( "checked" ) ;

				delete cellCurrent.dataset.step ;
			} ) ;
		} ;

		const routeSteps = ( ) => {
			const stepsAll = getStepsAll( ) ;
			const steps = getStepsFiltered( stepsAll ) ;

			steps.forEach( ( [ cellA , cellB , ] ) => cellsExchange( cellA , cellB ) ) ;
			cellsStepClear( stepsAll ) ;

			if ( ! steps.length ) {
				return false ;
			}
			
			return true ;
		} ;

		const getStepsNearest = cellCurrent => {
			const getCoords = cellCurrent => {
				const searchMatrix = [ [ 1 , 1 , ] , [ -1  , 1 , ] ,  [ -1 , -1 , ] , [ 1 , -1 , ] ] ;
				const [ cellCurrentX , cellCurrentY , ] = coords.map( field => parseInt( cellCurrent.dataset[ field ] ) ) ;

				return searchMatrix.map( ( [ dx , dy , ] ) => [ cellCurrentX + dx , cellCurrentY + dy , ] ) ;
			} ;

			const cellsCurrent = getCoords( cellCurrent )
				.map( ( [ x , y , ] ) => board.querySelector( `[data-x="${x}"][data-y="${y}"]:not([data-player="${playerCurrent}"]):not([data-player="0"])` ) )
				.filter( cellCurrent => cellCurrent ) ;

			return [
				... new Set( [
					... cellsCurrent.map( cellCurrent => getCoords( cellCurrent ) )
						.flat( )
						.filter( ( [ x , y , ] ) => x != cellCurrent.dataset.x )
						.map( ( [ x , y , ] ) => board.querySelector(`[data-x="${x}"][data-y="${y}"][data-player="0"]`) )
						.filter( cellCurrent => cellCurrent ) ,
				] ) ,
			] ;
		} ;

		const findSteps = ( ) => {
			const stepsAll = getStepsAll( ) ;
			const steps = getStepsFiltered( stepsAll ) ;
			const cellCurrent = stepsAll[ stepsAll.length ] ;
			const cellCurrentX = cellCurrent.dataset.x ;
			const cellCurrentY = cellCurrent.dataset.y ;
		} ;

		const boardError = ( ) => {
			board.classList.add( "error" ) ;

			setTimeout( ( ) => board.classList.remove( "error" )  , 100 ) ;
		} ;

		board.addEventListener( "contextmenu" , evt => {
			evt.preventDefault( ) ;

			if ( ! routeSteps( ) ) {
				boardError( ) ;
			}

			setNextPlayer( ) ;
		} ) ;
		board.querySelectorAll( ".cell[data-color='0']:not(.template)" )
			.forEach( cellCurrent => {
				cellCurrent.addEventListener( "mouseover" , ( { "target" : cellCurrent , } ) => {
					if ( cellCurrent.dataset.player == 0 ) {
						return true ;
					}

					const cellsNearest = getStepsNearest( cellCurrent ) ;

					cellsNearest.forEach( cellCurrent => cellCurrent.classList.add( "advised" ) ) ;
				} ) ;
				cellCurrent.addEventListener( "mouseout" , ( { "target" : cellCurrent , } ) => {
					board.querySelectorAll( ".advised" ).forEach( cellCurrent => cellCurrent.classList.remove( "advised" ) ) ;
				});

				cellCurrent.addEventListener( "click" , ( { "target" : cellCurrent , } ) => {
					const cellsCurrent = board.querySelectorAll( ".checked" ) ;

					try {
						if ( cellCurrent.classList.contains( "checked" ) ) {
							if ( ( cellsCurrent.length > 1 ) && ( cellCurrent.dataset.step == 0 ) ) {
								boardError( ) ;

								throw 1 ;
							}

							cellCurrent.classList.remove( "checked" ) ;
							boardError( ) ;

							throw 2 ;
						}

						if (
							cellsCurrent.length && players.some( player => cellCurrent.dataset.player == player )
							|| ! cellsCurrent.length && ( cellCurrent.dataset.player != playerCurrent )
						) {
							throw 3 ;
						}
					} catch ( exception ) {
						boardError( ) ;

						throw exception ;
					}

					cellCurrent.dataset.step = cellsCurrent.length ;
					cellCurrent.classList.add( "checked" ) ;
				} ) ;
			} ) ;
	} );
} )(
	window
	, "01010101,10101010,01010101,00002000,00000000,20202020,02020202,20202020"
	, [ "x" , "y" , ]
	, [ 1 , 2 , ]
) ;