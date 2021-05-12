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
    if (combatTracker.combat) {
        combatants = combatTracker.combat.combatants;
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
                    user: game.user._id,
                    content: `<img src="${msg.actor.img}" style='display: block; margin-left: auto; margin-right: auto;' /><h4 class="mediaeval" style="font-size:120%;">${msg.name}</h4>`
                };
                await ChatMessage.create(chatData);
            }
        }
    }
});

async function combatMessageDialog() {
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
                    $('.comb_msg').append(`<option class="mediaeval" value="${combatant.actor._id}">${combatant.actor.name}</option>`);
                });
                html.find('.add_msg').click(function () {
                    messages.push({
                        mid: messages.length + 1,
                        name: html.find('.msg_name').val(),
                        round: html.find('.msg_round').val(),
                        actor: game.actors.get(html.find('.comb_msg').val())
                    });
                    console.log(messages);
                    dialog.render(true);
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