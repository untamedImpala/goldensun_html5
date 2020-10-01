import { HorizontalMenu } from '../base/menus/HorizontalMenu.js';
import { ShopkeepDialog } from '../base/windows/shop/ShopkeepDialog.js';
import { BuyArtifactsMenu } from '../base/windows/shop/BuyArtifactsMenu.js';
import { SellRepairMenu } from '../base/windows/shop/SellRepairMenu.js';
import { capitalize } from '../utils.js';
import { InventoryWindow } from '../base/windows/shop/InventoryWindow.js';
import { BuySelectMenu } from '../base/windows/shop/BuySelectMenu.js';
import { EquipCompare } from '../base/windows/shop/EquipCompare.js';
import { YesNoMenu } from '../base/windows/YesNoMenu.js';
import { ShopItemQuantityWindow } from '../base/windows/shop/ShopItemQuantityWindow.js';
import { Window } from '../base/Window.js';
import { ShopCharDisplay } from '../base/windows/shop/ShopCharDisplay.js';

const ITEM_PRICE_WIN_X = 0;
const ITEM_PRICE_WIN_Y = 64;
const ITEM_PRICE_WIN_WIDTH = 116;
const ITEM_PRICE_WIN_HEIGHT = 28;
const ITEM_PRICE_NAME_X = 8;
const ITEM_PRICE_NAME_Y = 8;
const ITEM_PRICE_LABEL_X = 8;
const ITEM_PRICE_LABEL_Y = 16;
const ITEM_PRICE_VAL_END_X = 77;
const ITEM_PRICE_VAL_Y = 16;
const ITEM_PRICE_COINS_X = 80;
const ITEM_PRICE_COINS_Y = 16;

const ITEM_PRICE_WIN_X2 = 120;
const ITEM_PRICE_WIN_Y2 = 64;

const YOUR_COINS_WIN_X = 144;
const YOUR_COINS_WIN_Y = 56;
const YOUR_COINS_WIN_WIDTH = 92;
const YOUR_COINS_WIN_HEIGHT = 28;
const YOUR_COINS_LABEL_X = 8;
const YOUR_COINS_LABEL_Y = 8;
const YOUR_COINS_VAL_END_X = 85;
const YOUR_COINS_VAL_Y = 16;

const YOUR_COINS_WIN_X2 = 0;
const YOUR_COINS_WIN_Y2 = 72;

const ITEM_DESC_WIN_X = 0;
const ITEM_DESC_WIN_Y = 136;
const ITEM_DESC_WIN_WIDTH = 236;
const ITEM_DESC_WIN_HEIGHT = 20;
const ITEM_DESC_TEXT_X = 8;
const ITEM_DESC_TEXT_Y = 8;

const ITEM_DESC_WIN_X2 = 0;
const ITEM_DESC_WIN_Y2 = 0;

const CHARS_MENU_X = 0;
const CHARS_MENU_Y = 112;

const CURSOR_WIGGLE_X1 = -4;
const CURSOR_WIGGLE_Y1 = +4;

const CURSOR_WIGGLE_X2 = -8;
const CURSOR_WIGGLE_Y2 = 0;

const CURSOR_POINT_X = -4;
const CURSOR_POINT_Y = 4;

const CURSOR_TWEEN_TIME = Phaser.Timer.QUARTER >> 1;

export class ShopMenuScreen{
    constructor(game, data){
        this.game = game;
        this.data = data;
        this.shop_key = null;
        let esc_propagation_priority = 0;
        let enter_propagation_priority = 0;

        this.items_db = this.data.info.items_list;
        this.shops_db = _.mapKeys(this.data.dbs.shops_db, shop => shop.key_name);
        this.shopkeep_dialog_db = this.data.dbs.shopkeep_dialog_db;

        this.normal_item_list = [];
        this.artifact_list = [];

        this.buttons_keys = ["buy", "sell", "artifacts", "repair"];
        this.horizontal_menu = new HorizontalMenu(
            this.game,
            this.data,
            this.buttons_keys,
            this.buttons_keys.map(b => capitalize(b)),
            this.button_press.bind(this),
            enter_propagation_priority,
            this.close_menu.bind(this),
            esc_propagation_priority
        );
        ++esc_propagation_priority;
        ++enter_propagation_priority;

        this.cursor_group = this.game.add.group();
        this.cursor_group.alpha = 1;
        this.cursor_group.x = 0;
        this.cursor_group.y = 0;
        this.cursor = this.cursor_group.create(0, 0, "cursor");
        this.cursor_wiggle_tween = null;
        this.cursor_point_tween = null;
        this.cursor.default_pos = {x: 0, y: 0};

        this.npc_dialog = new ShopkeepDialog(this.game, this.data, this);

        this.inventory_win = new InventoryWindow(this.game, this.data);
        this.buy_select = new BuySelectMenu(this.game, this.data);
        this.eq_compare = new EquipCompare(this.game, this.data);
        this.yesno_action = new YesNoMenu(this.game, this.data, this.esc_propagation_priority, this.enter_propagation_priority);
        this.quantity_win = new ShopItemQuantityWindow(this.game, this.data, this);
        this.char_display = new ShopCharDisplay(this.game, this.data);

        this.item_price_win = new Window(this.game, ITEM_PRICE_WIN_X, ITEM_PRICE_WIN_Y, ITEM_PRICE_WIN_WIDTH, ITEM_PRICE_WIN_HEIGHT);
        this.your_coins_win = new Window(this.game, YOUR_COINS_WIN_X, YOUR_COINS_WIN_Y, YOUR_COINS_WIN_WIDTH, YOUR_COINS_WIN_HEIGHT);
        this.item_desc_win = new Window(this.game, ITEM_DESC_WIN_X, ITEM_DESC_WIN_Y, ITEM_DESC_WIN_WIDTH, ITEM_DESC_WIN_HEIGHT);
        /*
        this.buy_menu = new BuyArtifactsMenu(this.game, this.data, esc_propagation_priority, enter_propagation_priority);
        this.sell_menu = new SellRepairMenu(this.game, this.data, esc_propagation_priority, enter_propagation_priority);
        this.artifacts_menu = new BuyArtifactsMenu(this.game, this.data, esc_propagation_priority, enter_propagation_priority);
        this.repair_menu = new SellRepairMenu(this.game, this.data, esc_propagation_priority, enter_propagation_priority);*/
    }

    clear_cursor_tweens(){
        if(this.cursor_wiggle_tween) this.game.tweens.remove(this.cursor_wiggle_tween);
        if(this.cursor_point_tween) this.game.tweens.remove(this.cursor_point_tween);

        this.cursor_wiggle_tween = null;
        this.cursor_point_tween = null;

        this.cursor.x = this.cursor.default_pos.x;
        this.cursor.y = this.cursor.default_pos.y;
    }

    init_cursor_tween(type){
        let tween = null;
        this.clear_cursor_tweens();
        switch(type){
            case "wiggle":
                tween = this.game.add.tween(this.cursor)
                .to({ x: this.cursor.x + CURSOR_WIGGLE_X1, y: this.cursor.y + CURSOR_WIGGLE_Y1 }, CURSOR_TWEEN_TIME, Phaser.Easing.Linear.None)
                .to({ x: this.cursor.x + CURSOR_WIGGLE_X2, y: this.cursor.y + CURSOR_WIGGLE_Y2 }, CURSOR_TWEEN_TIME, Phaser.Easing.Linear.None)
                .to({ x: this.cursor.x + CURSOR_WIGGLE_X1, y: this.cursor.y + CURSOR_WIGGLE_Y1 }, CURSOR_TWEEN_TIME, Phaser.Easing.Linear.None)
                .to({ x: this.cursor.x, y: this.cursor.y}, CURSOR_TWEEN_TIME, Phaser.Easing.Linear.None).loop();
                break;
            case "point":
                tween = this.game.add.tween(this.cursor)
                .to({ x: this.cursor.x + CURSOR_POINT_X, y: this.cursor.y + CURSOR_POINT_Y }, CURSOR_TWEEN_TIME, Phaser.Easing.Linear.None)
                .to({ x: this.cursor.x, y: this.cursor.y}, CURSOR_TWEEN_TIME, Phaser.Easing.Linear.None).loop();
        }
        if(tween) tween.start();
    }

    move_cursor_to(new_x, new_y, delay, tween_type=undefined){
        this.cursor.default_pos = {x: new_x, y: new_y};
        this.game.world.bringToTop(this.cursor.parent);

        let t = this.game.add.tween(this.cursor).to(
            {x: new_x + this.game.camera.x, y: new_y + this.game.camera.y},
            delay,
            Phaser.Easing.Linear.None,
            true
        )
        if(tween_type !== undefined){
            t.onComplete.addOnce(this.init_cursor_tween.bind(this,tween_type),this);
        }
    }

    set_item_lists(){
        this.normal_item_list = [];
        this.artifact_list = [];

        let item_list = this.shops_db[this.shop_key].item_list;
        for(let i=0; i<item_list.length; i++){
            let item = this.items_db[item_list[i].key_name];

            if(item.rare_item === true) this.artifact_list.push(item);
            else this.normal_item_list.push(item);
        }

        this.normal_item_list = _.mapKeys(this.normal_item_list, item => item.key_name);
        this.artifact_list = _.mapKeys(this.artifact_list, item => item.key_name);
    }

    button_press(index) {
        /*
        switch (this.buttons_keys[index]) {
            case "buy":
                this.button_press_action(this.buy_menu);
                break;
            case "sell":
                this.button_press_action(this.sell_menu);
                break;
            case "artifacts":
                this.button_press_action(this.artifacts_menu);
                break;
            case "repair":
                this.button_press_action(this.repair_menu);
                break;
        }*/
    }

    button_press_action(menu) {
        /*
        this.horizontal_menu.deactivate();
        menu.open_menu(close_this_menu => {
            this.horizontal_menu.activate();
            if (close_this_menu) {
                this.close_menu();
            }
        });*/
    }

    update_position() {
        this.npc_dialog.update_position();
        this.horizontal_menu.update_position();
    }

    is_active() {
        return this.horizontal_menu.menu_active;
    }

    open_menu(shop_key) {
        this.shop_key = shop_key;
        this.data.in_dialog = true;
        this.npc_dialog.open(shop_key);

        if(this.data.hero.in_action()){
            this.data.hero.stop_char();
            this.data.hero.update_shadow();
        }

        this.set_item_lists();
        this.data.menu_open = true;
        this.horizontal_menu.open();
        
    }

    end_dialog() {
        this.shop_key = null;
        this.npc_dialog.close();
        this.data.in_dialog = false;
        this.data.menu_open = false;
    }

    close_menu() {
        if (!this.is_active()) return;
        this.horizontal_menu.close();

        this.npc_dialog.current_message = this.npc_dialog.get_message("goodbye");
        this.npc_dialog.update_dialog(this.npc_dialog.current_message.text); 

        this.normal_item_list = [];
        this.artifact_list = [];

        data.enter_input.add(() => {
            if (data.shop_screen.is_active()) {
                data.shop_screen.end_dialog();
            }
        }, this);
    }
}