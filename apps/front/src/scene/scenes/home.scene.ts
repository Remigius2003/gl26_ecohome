import { BaseWorldScene } from './baseWorld';
import * as MapParser from './home.ascii';
import { getAsciiMap, GRID_COLS, GRID_ROWS, CELL_SIZE } from './home.map';

export default class HomeScene extends BaseWorldScene {
	protected get mapData() {
		return {
			ASCII_MAP: getAsciiMap(),
			GRID_COLS,
			GRID_ROWS,
			CELL_SIZE,
			generateWalls: MapParser.generateWallsFromAscii,
			generateThings: MapParser.generateThingsFromAscii,
			findSpawn: MapParser.findPlayerSpawn,
		};
	}
}
