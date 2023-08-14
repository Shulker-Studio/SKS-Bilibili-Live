// LiteLoader-AIDS automatic generated
/// <reference path="e:\Dev/dts/llaids/src/index.d.ts"/> 
const { LiveWS } = require('bilibili-live-ws')
ll.registerPlugin(
    /* name */ "SKS-Bilibili-Live",
    /* introduction */ "适用于LiteLoaderBDS的Bilibili直播间弹幕转发插件",
    /* version */[0, 1, 0],
    /* otherInformation */ {}
);

let live = null
const CONFIG_PATH = './plugins/SKS/Bilibili-Live/config.json'
let conf = new JsonConfigFile(CONFIG_PATH)
conf.init('room_id','1145141919810')
conf.init('uid','1145141919810')

mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("blive", "Bilibili直播弹幕", PermType.Any);
    cmd.setEnum("SwitchAction", ["on", "off"]);
    cmd.setEnum("GuiAction", ["gui"]);
    cmd.mandatory("action", ParamType.Enum, "SwitchAction", 1);
    cmd.mandatory("action", ParamType.Enum, "GuiAction", 1);
    cmd.overload(["SwitchAction"]);
    cmd.overload(["GuiAction"]);
    cmd.setCallback((_cmd, _ori, out, res) => {
        if (typeof _ori.player === 'undefined') return out.success(`命令执行者非玩家，执行失败`)
        if (_ori.player.realName !== 'lwenk' && _ori.player.realName !== 'iQiaFUN') return out.success(`权限不足，执行失败`)
        switch (res.action) {
            case "on":
                if (live !== null) return out.success(`直播间已连接,无需再次连接`)
                live = new LiveWS(Number(conf.get('room_id')), { uid: Number(conf.get('uid')) })
                liveOpen(_ori.player)
                return out.success(`直播间连接中...`);
            case "off":
                if (live === null) return out.success(`直播间未连接,无需关闭`);
                live.close()
                live = null
                return out.success(`直播间关闭中...`);
            case "gui":
                return out.success(`todo...`);
        }
    });
    cmd.setup();
});


function liveOpen(pl) {
    if (live === null) return
    live.on('open', () =>{
        log('连接成功')
        pl.sendText('直播间连接成功')
    })
    // Connection is established
    live.on('live', () => {
        live.on('heartbeat', (data) => {
            //console.log(`[heartbeat]\n${data}`)
        })
        live.on("WATCHED_CHANGE", (data) => {
            pl.setTitle(`§a${data.data.num}§r个人看过`, 4, 1, 2, 1)
        })
        live.on("ONLINE_RANK_COUNT", (data) => {
            pl.setTitle(`高能榜:§a${data.data.count}§r`, 4, 1, 2, 1)
        })
        live.on("INTERACT_WORD", (data) => {
            pl.sendToast(`§c[直播间]`, `欢迎 §e${data.data.uname}§r 进入直播间`)
            pl.sendText(`欢迎 §e${data.data.uname}§r 进入直播间`)
        })
        live.on('DANMU_MSG', (data) => {
            mc.broadcast(`[§a弹幕§r]<${data.info[2][1]}>${data.info[1]}`)
        })
        live.on('COMBO_END', (data) => {
            pl.sendToast(`[§b礼物§r]`, `感谢 §e${data.data.uname}§r ${data.data.action}的 §d${data.data.gift_name}§r * §a${data.data.combo_num}`)
            pl.sendText(`感谢 §e${data.data.uname}§r ${data.data.action}的 §d${data.data.gift_name}§r * §a${data.data.combo_num}`)
        })
    })
    //live.close()
    live.on('close', () => {
        live = null
        pl.sendText('直播间已关闭')
    })
    live.on('error', (e) => {
        live = null
        pl.sendText('直播间连接异常')
    })
}