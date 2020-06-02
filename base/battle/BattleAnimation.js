const tween_types = {
    INITIAL: "initial"
};

export class BattleAnimation {
    //tween type can be 'Initial' for first position
    //tween type can be 'NoTween' for immediately change
    //sprite_index: "target" is the target, "caster" is the caster, "background" is the background sprite, 0...n is the sprites_key_names index
    //values can be "target", "caster" or an actual value
    constructor(
        game,
        key_name,
        sprites_keys, //{key_name: string, per_target: bool}
        x_sequence, //{start_delay: value, sprite_index: index, to: value, is_absolute: bool, tween: type, duration: value}
        y_sequence, //{start_delay: value, sprite_index: index, to: value, is_absolute: bool, tween: type, duration: value}
        x_scale_sequence, //{start_delay: value, sprite_index: index, to: value, is_absolute: bool, tween: type, duration: value}
        y_scale_sequence, //{start_delay: value, sprite_index: index, to: value, is_absolute: bool, tween: type, duration: value}
        x_anchor_sequence, //{start_delay: value, sprite_index: index, to: value, is_absolute: bool, tween: type, duration: value}
        y_anchor_sequence, //{start_delay: value, sprite_index: index, to: value, is_absolute: bool, tween: type, duration: value}
        alpha_sequence, //{start_delay: value, sprite_index: index, to: value, is_absolute: bool, tween: type, duration: value}
        rotation_sequence, //{start_delay: value, sprite_index: index, to: value, is_absolute: bool, tween: type, duration: value, direction: value}
        stage_angle_sequence, //{start_delay: value, to: value, is_absolute: bool, tween: type, duration: value, direction: value}
        hue_angle_sequence, //{start_delay: value, sprite_index: index, to: value, is_absolute: bool, tween: type, duration: value, direction: value}
        tint_sequence, //{start_delay: value, sprite_index: index, to: value, is_absolute: bool, tween: type, duration: value}
        camera_shake_sequence, //{start_delay: value, intensity: value, duration: value: direction: direction_option}
        play_sequence, //{start_delay: value, sprite_index: index, reverse: bool, frame_rate: value, repeat: bool}
        set_frame_sequence, //{start_delay: value, frame_key_name: string}
        blend_mode_sequence, //{start_delay: value, mode: type, sprite_index: index}
        is_party_animation
    ) {
        this.game = game;
        this.key_name = key_name;
        this.sprites_keys = sprites_keys;
        this.x_sequence = x_sequence;
        this.y_sequence = y_sequence;
        this.x_scale_sequence = x_scale_sequence;
        this.y_scale_sequence = y_scale_sequence;
        this.x_anchor_sequence = x_anchor_sequence;
        this.y_anchor_sequence = y_anchor_sequence;
        this.alpha_sequence = alpha_sequence;
        this.rotation_sequence = rotation_sequence;
        this.stage_angle_sequence = stage_angle_sequence;
        this.hue_angle_sequence = hue_angle_sequence;
        this.tint_sequence = tint_sequence;
        this.camera_shake_sequence = camera_shake_sequence;
        this.play_sequence = play_sequence;
        this.set_frame_sequence = set_frame_sequence;
        this.blend_mode_sequence = blend_mode_sequence;
        this.is_party_animation = is_party_animation;
    }

    initialize(caster_sprite, group_caster, group_enemy, super_group, stage_camera) {
        this.sprites = [];
        this.x0 = this.game.camera.x;
        this.y0 = this.game.camera.y;
        this.caster_sprite = caster_sprite;
        this.group_caster = group_caster;
        this.group_enemy = group_enemy;
        this.super_group = super_group;
        this.stage_camera = stage_camera;
        for (let i = 0; i < this.sprites_keys.length; ++i) {
            const sprite_info = this.sprites_keys[i];
            if (!sprite_info.per_target) {
                const psy_sprite = this.game.add.sprite(this.x0, this.y0, sprite_info.key_name);
                super_group.addChildAt(psy_sprite, super_group.getChildIndex(group_caster));
                this.sprites.push(psy_sprite);
                this.sprites[i].animations.add('cast', Phaser.Animation.generateFrameNames('', 1, this.sprites[i].animations.frameTotal, '', 3));
            }
        }
    }

    play() {
        this.play_number_property_sequence(this.x_sequence, 'x');
        this.play_number_property_sequence(this.y_sequence, 'y');
        this.play_number_property_sequence(this.alpha_sequence, 'alpha');
        this.play_number_property_sequence(this.rotation_sequence, 'rotation');
        this.play_number_property_sequence(this.x_scale_sequence, 'x', 'scale');
        this.play_number_property_sequence(this.y_scale_sequence, 'y', 'scale');
        this.play_number_property_sequence(this.x_anchor_sequence, 'x', 'anchor');
        this.play_number_property_sequence(this.y_anchor_sequence, 'y', 'anchor');
        this.play_sprite_sequence();
        this.play_blend_modes();
        this.play_stage_angle_sequence();
    }

    play_number_property_sequence(sequence, target_property, inner_property) {
        let chained_tweens = [];
        for (let i = 0; i < sequence.length; ++i) {
            const seq = sequence[i];
            let this_sprite;
            if (inner_property) {
                this_sprite = this.sprites[seq.sprite_index][inner_property];
            } else {
                this_sprite = this.sprites[seq.sprite_index];
            }
            let initial_value = 0;
            if (!['scale', 'anchor'].includes(inner_property)) {
                switch (target_property) {
                    case 'x': initial_value = this.x0; break;
                    case 'y': initial_value = this.y0; break;
                }
            }
            const to_value = seq.is_absolute ? initial_value + seq.to : this_sprite[target_property] + seq.to;
            if (seq.tween === tween_types.INITIAL) {
                this_sprite[target_property] = to_value;
            } else {
                const tween = game.add.tween(this_sprite).to(
                    { [target_property]: to_value },
                    seq.duration,
                    seq.tween.split('.').reduce((p, prop) => p[prop], Phaser.Easing),
                    chained_tweens.length === 0,
                    seq.start_delay
                );
                if (chained_tweens.length) {
                    chained_tweens[chained_tweens.length - 1].chain(tween);
                }
                chained_tweens.push(tween);
            }
        }
    }

    play_x_scale_sequence() {
        for (let i = 0; i < this.x_scale_sequence.length; ++i) {
            const x_cale_seq = this.x_scale_sequence[i];
            if (x_cale_seq.tween === tween_types.INITIAL) {
                if (x_cale_seq.is_absolute) {
                    this.sprites[x_cale_seq.sprite_index].scale.x = this.x0 + x_cale_seq.to;
                } else {
                    this.sprites[x_cale_seq.sprite_index].scale.x += x_cale_seq.to;
                }
            }
        }
    }

    play_sprite_sequence() {
        for (let i = 0; i < this.play_sequence.length; ++i) {
            const play_seq = this.play_sequence[i];
            game.time.events.add(play_seq.start_delay, () => {
                if (play_seq.reverse) {
                    this.sprites[play_seq.sprite_index].animations.currentAnim.reverse();
                }
                this.sprites[play_seq.sprite_index].animations.play('cast', play_seq.frame_rate, play_seq.repeat);
            });
        }
    }

    play_blend_modes() {
        for (let i = 0; i < this.blend_mode_sequence.length; ++i) {
            const blend_mode_seq = this.blend_mode_sequence[i];
            game.time.events.add(blend_mode_seq.start_delay, () => {
                switch (blend_mode_seq.mode) {
                    case "screen":
                        this.sprites[blend_mode_seq.sprite_index].blendMode = PIXI.blendModes.SCREEN;
                        break;
                }
            });
        }
    }

    play_stage_angle_sequence() {
        let chained_tweens = [];
        for (let i = 0; i < this.stage_angle_sequence.length; ++i) {
            const stage_angle_seq = this.stage_angle_sequence[i];
            if (stage_angle_seq.tween === tween_types.INITIAL) {
                if (stage_angle_seq.is_absolute) {
                    this.stage_camera.rad = stage_angle_seq.to;
                } else {
                    this.stage_camera.rad += stage_angle_seq.to;
                }
            } else {
                const tween = game.add.tween(this.stage_camera).to(
                    { rad: stage_angle_seq.to },
                    stage_angle_seq.duration,
                    stage_angle_seq.tween.split('.').reduce((p, prop) => p[prop], Phaser.Easing),
                    chained_tweens.length === 0,
                    stage_angle_seq.start_delay
                );
                tween.onStart.addOnce(() => {
                    this.stage_camera.spining = true;
                });
                tween.onComplete.addOnce(() => {
                    this.stage_camera.spining = false;
                });
                if (chained_tweens.length) {
                    chained_tweens[chained_tweens.length - 1].chain(tween);
                }
                chained_tweens.push(tween);
            }
        }
    }
}