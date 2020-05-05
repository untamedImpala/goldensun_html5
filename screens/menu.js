import { Window } from '../base/Window.js';
import { main_char_list, party } from '../chars/main_chars.js';
import * as numbers from '../magic_numbers.js';
import { get_text_width } from '../utils.js';
import { HorizontalMenu } from '../base/HorizontalMenu.js';

const WIDTH_PER_CHAR = 50;
const STATUS_WIN_HEIGHT = 35;
const STATUS_NUMBER_MAX_WIDTH = 26;
const STATUS_BAR_WIDTH = 40;
const STATUS_BAR_HEIGHT = 3;
const STATUS_BAR_COLOR_GOOD = 0x0000f8;
const STATUS_BAR_COLOR_BAD = 0xf80000;

export class MenuScreen {
    constructor(game) {
        this.game = game;
        this.status_win_width = Object.keys(main_char_list).length * WIDTH_PER_CHAR;
        this.status_win_x = numbers.GAME_WIDTH - this.status_win_width - numbers.INSIDE_BORDER_WIDTH - numbers.OUTSIDE_BORDER_WIDTH;
        this.status_window = new Window(this.game, this.status_win_x, 0, this.status_win_width, STATUS_WIN_HEIGHT, false);
        this.status_header_width = get_text_width(this.game, "HP ");
        this.info_sprites = {};
        this.horizontal_menu = new HorizontalMenu(this.game, ["psynergy", "djinni", "item", "status"], ["Psynergy", "Djinn", "Item", "Status"]);
        this.set_chars_info();
    }

    set_chars_info() {
        let sorted_chars_list = _.sortBy(Object.values(main_char_list), char => {
            return char.index;
        });
        for (let i = 0; i < sorted_chars_list.length; ++i) {
            let info_sprites_obj = {};
            const char = sorted_chars_list[i];
            const base_x_pos =  i * WIDTH_PER_CHAR + numbers.WINDOW_PADDING_H + numbers.INSIDE_BORDER_WIDTH + numbers.OUTSIDE_BORDER_WIDTH;
            info_sprites_obj.name = this.status_window.set_text_in_position(char.name, base_x_pos, numbers.WINDOW_PADDING_TOP);
            let y_pos = numbers.WINDOW_PADDING_TOP + numbers.FONT_SIZE;

            let y_pos_bar = y_pos + numbers.FONT_SIZE - STATUS_BAR_HEIGHT;
            info_sprites_obj.hp_bar_graphics = this.game.add.graphics(0, 0);
            info_sprites_obj.hp_bar_graphics.beginFill(STATUS_BAR_COLOR_GOOD, 1);
            info_sprites_obj.hp_bar_graphics.drawRect(base_x_pos, y_pos_bar, STATUS_BAR_WIDTH, STATUS_BAR_HEIGHT);
            info_sprites_obj.hp_bar_graphics.endFill();
            this.status_window.group.add(info_sprites_obj.hp_bar_graphics);

            info_sprites_obj.hp_bar_damage_graphics = this.game.add.graphics(0, 0);
            info_sprites_obj.hp_bar_damage_graphics.default_y = y_pos_bar;
            this.status_window.group.add(info_sprites_obj.hp_bar_damage_graphics);

            info_sprites_obj.hp_header = this.status_window.set_text_in_position("HP", base_x_pos, y_pos);
            let x_number_pos = parseInt(base_x_pos + this.status_header_width + (4 - char.current_hp.toString().length) * STATUS_NUMBER_MAX_WIDTH/8);
            info_sprites_obj.hp = this.status_window.set_text_in_position(char.current_hp.toString(), x_number_pos, y_pos);

            y_pos = numbers.WINDOW_PADDING_TOP + 2 * numbers.FONT_SIZE;
            y_pos_bar = y_pos + numbers.FONT_SIZE - STATUS_BAR_HEIGHT;
            info_sprites_obj.pp_bar_graphics = this.game.add.graphics(0, 0);
            info_sprites_obj.pp_bar_graphics.beginFill(STATUS_BAR_COLOR_GOOD, 1);
            info_sprites_obj.pp_bar_graphics.drawRect(base_x_pos, y_pos_bar, STATUS_BAR_WIDTH, STATUS_BAR_HEIGHT);
            info_sprites_obj.pp_bar_graphics.endFill();
            this.status_window.group.add(info_sprites_obj.pp_bar_graphics);

            info_sprites_obj.pp_bar_damage_graphics = this.game.add.graphics(0, 0);
            info_sprites_obj.pp_bar_damage_graphics.default_y = y_pos_bar;
            this.status_window.group.add(info_sprites_obj.pp_bar_damage_graphics);

            info_sprites_obj.pp_header = this.status_window.set_text_in_position("PP", base_x_pos, y_pos);
            x_number_pos = parseInt(base_x_pos + this.status_header_width + (4 - char.current_pp.toString().length) * STATUS_NUMBER_MAX_WIDTH/8);
            info_sprites_obj.pp = this.status_window.set_text_in_position(char.current_pp.toString(), x_number_pos, y_pos);

            info_sprites_obj.visible = true;
            this.info_sprites[char.key_name] = info_sprites_obj;
        }
    }

    toggle_char_info(info_sprite) {
        info_sprite.name.text.visible = !info_sprite.name.text.visible;
        info_sprite.name.shadow.visible = !info_sprite.name.shadow.visible;
        info_sprite.hp.text.visible = !info_sprite.hp.text.visible;
        info_sprite.hp.shadow.visible = !info_sprite.hp.shadow.visible;
        info_sprite.pp.text.visible = !info_sprite.pp.text.visible;
        info_sprite.pp.shadow.visible = !info_sprite.pp.shadow.visible;
        info_sprite.hp_header.text.visible = !info_sprite.hp_header.text.visible;
        info_sprite.hp_header.shadow.visible = !info_sprite.hp_header.shadow.visible;
        info_sprite.pp_header.text.visible = !info_sprite.pp_header.text.visible;
        info_sprite.pp_header.shadow.visible = !info_sprite.pp_header.shadow.visible;
        info_sprite.hp_bar_graphics.visible = !info_sprite.hp_bar_graphics.visible;
        info_sprite.pp_bar_graphics.visible = !info_sprite.pp_bar_graphics.visible;
        info_sprite.hp_bar_damage_graphics.visible = !info_sprite.hp_bar_damage_graphics.visible;
        info_sprite.pp_bar_damage_graphics.visible = !info_sprite.pp_bar_damage_graphics.visible;
    }

    update_chars_info() {
        this.status_win_width = party.length * WIDTH_PER_CHAR;
        this.status_win_x = numbers.GAME_WIDTH - this.status_win_width - numbers.INSIDE_BORDER_WIDTH - numbers.OUTSIDE_BORDER_WIDTH;
        this.status_window.update_size({width: this.status_win_width});
        this.status_window.update_position({x: this.status_win_x});
        let current_chars = [];
        for (let i = 0; i < party.length; ++i) {
            let char = party[i];
            current_chars.push(char.key_name);
            let info_sprite = this.info_sprites[char.key_name];
            if (!info_sprite.visible) {
                this.toggle_char_info(info_sprite);
                info_sprite.visible = true;
            }
            this.status_window.update_text(char.name, info_sprite.name);
            const base_x_pos =  i * WIDTH_PER_CHAR + numbers.WINDOW_PADDING_H + numbers.INSIDE_BORDER_WIDTH + numbers.OUTSIDE_BORDER_WIDTH;
            let x_number_pos = parseInt(base_x_pos + this.status_header_width + (4 - char.current_hp.toString().length) * STATUS_NUMBER_MAX_WIDTH/8);
            this.status_window.update_text(char.current_hp, info_sprite.hp, x_number_pos);
            x_number_pos = parseInt(base_x_pos + this.status_header_width + (4 - char.current_pp.toString().length) * STATUS_NUMBER_MAX_WIDTH/8);
            this.status_window.update_text(char.current_pp, info_sprite.pp, x_number_pos);

            const hp_damage_bar_width = parseInt(STATUS_BAR_WIDTH * (1 - char.current_hp/char.max_hp));
            const hp_damage_bar_x = base_x_pos + STATUS_BAR_WIDTH - hp_damage_bar_width;
            info_sprite.hp_bar_damage_graphics.clear();
            info_sprite.hp_bar_damage_graphics.beginFill(STATUS_BAR_COLOR_BAD, 1);
            info_sprite.hp_bar_damage_graphics.drawRect(hp_damage_bar_x, info_sprite.hp_bar_damage_graphics.default_y, hp_damage_bar_width, STATUS_BAR_HEIGHT);
            info_sprite.hp_bar_damage_graphics.endFill();

            const pp_damage_bar_width = parseInt(STATUS_BAR_WIDTH * (1 - char.current_pp/char.max_pp));
            const pp_damage_bar_x = base_x_pos + STATUS_BAR_WIDTH - pp_damage_bar_width;
            info_sprite.pp_bar_damage_graphics.clear();
            info_sprite.pp_bar_damage_graphics.beginFill(STATUS_BAR_COLOR_BAD, 1);
            info_sprite.pp_bar_damage_graphics.drawRect(pp_damage_bar_x, info_sprite.pp_bar_damage_graphics.default_y, pp_damage_bar_width, STATUS_BAR_HEIGHT);
            info_sprite.pp_bar_damage_graphics.endFill();
        }
        for (let key_name in this.info_sprites) {
            if (current_chars.includes(key_name)) continue;
            let info_sprite = this.info_sprites[key_name];
            if (!info_sprite.visible) continue;
            this.toggle_char_info(info_sprite);
            info_sprite.visible = false;
        }
    }

    open_menu() {
        this.horizontal_menu.open();
        this.status_window.update();
        this.update_chars_info();
        this.status_window.show();
    }

    close_menu() {
        this.horizontal_menu.close();
        this.status_window.close();
    }
}

let menu_screen;

export function initialize_menu() {
    menu_screen = new MenuScreen(game);
    return menu_screen;
}
