import { BaseWorldScene } from "./baseWorld";
import { NPCController } from "../logic/movement";
import * as MapData from "./home2.map";
import * as MapParser from "./home2.ascii";

export default class Home2Scene extends BaseWorldScene {
    protected mapData = {
        ...MapData,
        generateWalls: MapParser.generateWallsFromAscii,
        generateThings: MapParser.generateThingsFromAscii,
        findSpawn: MapParser.findPlayerSpawn,
    };
}
