/**
 * External dependencies
 */
import path from 'path';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import {
	newPost,
	getEditedPostContent,
	setPostContent,
	getAllBlocks,
	selectBlockByClientId,
} from '../support/utils';
import {
	getFileBaseNames,
	readFixtureFile,
} from '../../support/utils';

const BLOCK_SWITCHER_SELECTOR = '.editor-block-toolbar .editor-block-switcher';

const getAvailableBlockTransforms = async () => {
	return await page.evaluate( () => {
		return Array.from(
			document.querySelectorAll(
				'.editor-block-types-list .editor-block-types-list__list-item button'
			)
		).map(
			( button ) => {
				return button.getAttribute( 'aria-label' );
			}
		);
	} );
};

const hasBlockSwitcher = async () => {
	return await page.evaluate( ( blockSwitcherSelector ) => {
		return !! document.querySelector( blockSwitcherSelector );
	}, BLOCK_SWITCHER_SELECTOR );
};

const getProcessedFileBase = async ( fixturesDir, fileBase ) => {
	if ( some(
		[ 'deprecated', 'subhead', 'text-columns' ],
		( partialFileName ) => fileBase.includes( partialFileName )
	) ) {
		return {
			expectedDeprecatedBlock: true,
		};
	}
	const parsedBlockObject = JSON.parse(
		readFixtureFile( fixturesDir, fileBase + '.parsed.json' )
	);
	if ( parsedBlockObject.blockName === null ) {
		return {
			expectedInvalidBlock: true,
		};
	}
	const content = readFixtureFile( fixturesDir, fileBase + '.html' );
	await setPostContent( content );
	const blocks = await getAllBlocks();
	const normalizedMarkup = await getEditedPostContent();
	await selectBlockByClientId( blocks[ 0 ].clientId );
	let availableTransforms;
	if ( await hasBlockSwitcher() ) {
		await page.click( BLOCK_SWITCHER_SELECTOR );
		availableTransforms = await getAvailableBlockTransforms(
			blocks[ 0 ].clientId
		);
	}

	return {
		normalizedMarkup,
		availableTransforms,
	};
};

describe( 'test transforms', () => {
	const fixturesDir = path.join(
		__dirname, '..', '..', 'integration', 'full-content', 'fixtures'
	);

	const fileBasenames = getFileBaseNames( fixturesDir );

	const blocksParsed = {};
	beforeAll( async () => {
		await newPost();
		for ( const fileBase of fileBasenames ) {
			blocksParsed[ fileBase ] = await getProcessedFileBase( fixturesDir, fileBase );
		}
		expect( console ).toHaveErroredWith(
			'Failed to load resource: the server responded with a status of 404 (Not Found)'
		);
	} );

	it( 'all transforms work', async () => {
		expect( JSON.stringify( blocksParsed ) ).toMatchSnapshot();
	} );
} );
