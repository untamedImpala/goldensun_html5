import { Item } from '../base/Item.js';

export let items_list = {};

export function initialize_items(game, items_db, load_promise_resolve) {
    let load_promises = [];
    for (let i = 0; i < items_db.length; ++i) {
        const item_data = items_db[i];
        items_list[item_data.key_name] = new Item(
            item_data.key_name,
            item_data.name,
            item_data.type,
            item_data.description,
            item_data.use_type,
            item_data.curses_when_equipped,
            item_data.cant_be_removed,
            item_data.rare_item,
            item_data.imporant_item,
            item_data.carry_up_to_30,
            item_data.effects,
            item_data.attribute,
            item_data.unleash_ability,
            item_data.unleash_rate,
            item_data.use_ability,
            item_data.equipable_chars,
            item_data.price,
            item_data.granted_ability,
            item_data.icon_path
        );

        let load_assets_promise_resolve;
        let load_assets_promise = new Promise(resolve => {
            load_assets_promise_resolve = resolve;
        });
        load_promises.push(load_assets_promise);
        items_list[item_data.key_name].load_assets(game, load_assets_promise_resolve);
    }
    game.load.start();
    Promise.all(load_promises).then(load_promise_resolve);
}
