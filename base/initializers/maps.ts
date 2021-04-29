import {GoldenSun} from "../GoldenSun";
import {Map} from "../Map";
import {GameInfo} from "./initialize_info";

export function initialize_maps(game: Phaser.Game, data: GoldenSun, maps_db: any, load_promise_resolve: () => void) {
    const maps: GameInfo["maps_list"] = {};
    for (let i = 0; i < maps_db.length; ++i) {
        const map_data = maps_db[i];
        maps[map_data.key_name] = new Map(
            game,
            data,
            map_data.name,
            map_data.key_name,
            map_data.tileset_key_name,
            map_data.collision_key_names,
            map_data.tileset_files.image,
            map_data.tileset_files.json,
            map_data.collision_files,
            map_data.lazy_load,
            map_data.collision_embedded,
            map_data.bgm?.key,
            map_data.bgm?.path,
            map_data.expected_party_level,
            map_data.background_key
        );
    }
    for (let map in maps) {
        if (maps[map].lazy_load) continue;
        maps[map].load_map_assets(false);
    }
    game.load.start();
    data.set_whats_loading("maps");
    game.load.onLoadComplete.addOnce(load_promise_resolve);
    return maps;
}
