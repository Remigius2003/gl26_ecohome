import { BaseWorldScene } from "./baseWorld";
import * as MapData from "./home.map";
import * as MapParser from "./home.ascii";

export default class HomeScene extends BaseWorldScene {
    protected mapData = {
        ...MapData,
        generateWalls: MapParser.generateWallsFromAscii,
        generateThings: MapParser.generateThingsFromAscii,
        findSpawn: MapParser.findPlayerSpawn,
    };
}
