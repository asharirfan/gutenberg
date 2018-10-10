/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';
import { uniq } from 'lodash';

export function getFileBaseNames( fixturesDir ) {
	return uniq(
		fs.readdirSync( fixturesDir )
			.filter( ( f ) => /(\.html|\.json)$/.test( f ) )
			.map( ( f ) => f.replace( /\..+$/, '' ) )
	);
}

export function readFixtureFile( fixturesDir, filename ) {
	try {
		return fs.readFileSync(
			path.join( fixturesDir, filename ),
			'utf8'
		);
	} catch ( err ) {
		return null;
	}
}

export function writeFixtureFile( fixturesDir, filename, content ) {
	fs.writeFileSync(
		path.join( fixturesDir, filename ),
		content
	);
}
