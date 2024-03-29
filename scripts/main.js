let messages = [];
let combatants = [];

Hooks.on("getSceneControlButtons", (controls) => {
    if (!game.user.isGM) return;
    const bar = controls.find(c => c.name === "token");
    bar.tools.push({
        name: "Combat Messages",
        icon: "fas fa-clipboard",
        title: "Combat Messages",
        onClick: async () => combatMessageDialog(),
        button: true
    });
});

Hooks.on("renderCombatTracker", function (combatTracker) {
    if (!game.user.isGM) return;
    if (combatTracker.combats.length > 0) {
        combatants = [];
        for (let combat of combatTracker.combats) {
            for (let combatant of combat.combatants) {
                combatants.push(combatant);
            }
        }
        //combatants = combatTracker.combat.combatants;
    } else {
        combatants = [];
        messages = [];
    }
});

Hooks.on('updateCombat', async function (combat, turns) {
    if (!game.user.isGM) return;
    if (messages.length == 0) return;
    if (turns.round) {
        for (let msg of messages) {
            if (msg.round == turns.round) {
                let chatData = {
                    user: game.user.id,
                    speaker: ChatMessage.getSpeaker({
                        actor: msg.actor
                    }),
                    content: `<img src="${msg.actor.img}" style='display: block; margin-left: auto; margin-right: auto;' /><h4 class="mediaeval" style="font-size:120%;">${msg.name}</h4>`
                };
                await ChatMessage.create(chatData);
            }
        }
    }
});

async function combatMessageDialog() {
    if (!game.user.isGM) return;
    $.get("modules/combat-messages/templates/dialog.hbs", function (data) {
        let dialog = new Dialog({
            title: "Combat Messages",
            content: data,
            buttons: {},
            render: (html) => {
                messages.forEach(function (message) {
                    $('.msg_sv').append(`<li class="mediaeval"><img class="itemImg" title="${message.actor.name}" src="${message.actor.img}"/> ,${message.name} , Round: ${message.round}  <a class="remove_msg" data-msg="${message.mid}"><i class="far fa-trash-alt"></i></a></li>`);
                });
                combatants.forEach(function (combatant) {
                    $('.comb_msg').append(`<option value="${combatant.actor.id}">${combatant.actor.name}</option>`);
                });
                html.find('.add_msg').click(function () {
                    if (html.find('.msg_name').val() != "" && html.find('.msg_round').val() != "" && html.find('.comb_msg').val() != null) {
                        messages.push({
                            mid: messages.length + 1,
                            name: html.find('.msg_name').val(),
                            round: html.find('.msg_round').val(),
                            actor: game.actors.get(html.find('.comb_msg').val())
                        });
                        dialog.render(true);
                    } else {
                        ui.notifications.warn("Algum campo não foi preenchido, um combatente pode ser selecionado quando um combate estiver ativo.");
                    }
                });
                html.find('.remove_msg').click(function (event){
                    let delete_msg = $(event.currentTarget).data('msg');
                    let msg = messages.find(h => h.mid == delete_msg);
                    messages.splice(messages.indexOf(msg),1);
                    dialog.render(true);
                });
            }
        });
        dialog.render(true);
    });
}