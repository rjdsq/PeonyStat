export async function onRequest(context) {
    const { request, env, waitUntil } = context;
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const site = url.searchParams.get('site') || '1';

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    if (action === 'get_sys') {
        const pwd = await env.stat.get('sys_pwd');
        return new Response(JSON.stringify({ has_pwd: !!pwd }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (action === 'login' && request.method === 'POST') {
        let data = {};
        try { data = await request.json(); } catch(e) {}
        const pwd = await env.stat.get('sys_pwd');
        return new Response(JSON.stringify({ ok: data.pwd === pwd }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (action === 'save_sys' && request.method === 'POST') {
        let data = {};
        try { data = await request.json(); } catch(e) {}
        if (data.pwd) {
            await env.stat.put('sys_pwd', data.pwd);
        } else {
            await env.stat.delete('sys_pwd');
        }
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const k_config = "all_sites_config";
    let configStr = await env.stat.get(k_config);
    let allConfigs = configStr ? JSON.parse(configStr) : {};

    if (action === 'clear_all' && request.method === 'POST') {
        const listed = await env.stat.list();
        const tasks = listed.keys.map(k => env.stat.delete(k.name));
        await Promise.all(tasks);
        return new Response(JSON.stringify({ status: "ok" }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (action === 'get_configs') {
        return new Response(JSON.stringify(allConfigs), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (action === 'save_config' && request.method === 'POST') {
        let newConf = {};
        try { newConf = await request.json(); } catch(e) {}
        if (newConf.site) {
            allConfigs[newConf.site] = newConf;
            await env.stat.put(k_config, JSON.stringify(allConfigs));
        }
        return new Response(JSON.stringify({status: "ok"}), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (action === 'delete_site' && request.method === 'POST') {
        let data = {};
        try { data = await request.json(); } catch(e) {}
        if (data.site && allConfigs[data.site]) {
            delete allConfigs[data.site];
            const tasks = [env.stat.put(k_config, JSON.stringify(allConfigs))];
            if (data.erase) {
                const listed = await env.stat.list({ prefix: `s_${data.site}_` });
                listed.keys.forEach(k => tasks.push(env.stat.delete(k.name)));
            }
            await Promise.all(tasks);
        }
        return new Response(JSON.stringify({status: "ok"}), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (action === 'script') {
        const conf = allConfigs[site] || { 
            tpl: 1, scale: 1, offsetX: 0, layout: 'row', 
            useCustom: false, colors: { box: 'transparent', item: '#f9f7f2', lbl: '#a5acaa', val: '#788583' },
            order: ['pv', 'uv', 'dpv', 'duv'],
            pv: '总访问', uv: '总访客', dpv: '今日访问', duv: '今日访客', 
            shows: {pv:true, uv:true, dpv:true, duv:true} 
        };
        
        const templates = {
            1: { box: 'transparent', bg: '#f9f7f2', border: '#ece9e0', val: '#788583', lbl: '#a5acaa' },
            2: { box: 'transparent', bg: '#ffffff', border: '#f4f1eb', val: '#5c5c5c', lbl: '#a0b5a6' },
            3: { box: 'transparent', bg: '#eef0ed', border: '#eef0ed', val: '#8da493', lbl: '#788583' },
            4: { box: 'transparent', bg: '#f5f0ef', border: '#ece5e3', val: '#bca39f', lbl: '#a5acaa' },
            5: { box: 'transparent', bg: '#f2f5f6', border: '#e8edf0', val: '#7f93a1', lbl: '#a5acaa' },
            6: { box: 'transparent', bg: '#fafafa', border: '#333333', val: '#333333', lbl: '#666666' },
            7: { box: 'transparent', bg: '#333333', border: '#333333', val: '#f9f7f2', lbl: '#a5acaa' },
            8: { box: 'transparent', bg: '#f9f9f9', border: '#d0b8b4', val: '#d0b8b4', lbl: '#a5acaa' },
            9: { box: 'transparent', bg: '#ffffff', border: '#a0b5a6', val: '#a0b5a6', lbl: '#a5acaa' },
            10: { box: 'transparent', bg: 'transparent', border: 'transparent', val: '#788583', lbl: '#a5acaa' },
            11: { box: 'transparent', bg: '#121212', border: '#00ffcc', val: '#00ffcc', lbl: '#009999' },
            12: { box: 'transparent', bg: '#000000', border: '#39ff14', val: '#39ff14', lbl: '#228b22' },
            13: { box: 'transparent', bg: '#f4ece6', border: '#e2d3c8', val: '#5c4033', lbl: '#8b7355' },
            14: { box: 'transparent', bg: '#0a192f', border: '#172a45', val: '#64ffda', lbl: '#8892b0' },
            15: { box: 'transparent', bg: '#fff0e6', border: '#ffdcb3', val: '#ff7f50', lbl: '#ff9966' },
            16: { box: 'transparent', bg: '#1b2a22', border: '#253e30', val: '#a8d5ba', lbl: '#7eb08c' },
            17: { box: 'transparent', bg: '#fff0f5', border: '#ffb6c1', val: '#ff69b4', lbl: '#ffc0cb' },
            18: { box: 'transparent', bg: '#f8f8ff', border: '#e6e6fa', val: '#9370db', lbl: '#b0c4de' },
            19: { box: 'transparent', bg: '#fff5ee', border: '#ffdab9', val: '#ff4500', lbl: '#ffa07a' },
            20: { box: 'transparent', bg: '#ffffff', border: '#000000', val: '#000000', lbl: '#000000' }
        };
        
        let t;
        if (conf.useCustom && conf.colors) {
            t = { box: conf.colors.box, bg: conf.colors.item, border: 'transparent', val: conf.colors.val, lbl: conf.colors.lbl };
        } else {
            t = templates[conf.tpl || 1] || templates[1];
        }

        const scale = conf.scale || 1;
        const baseSize = 14 * scale; 
        
        const isGrid = conf.layout === 'grid';
        const itemFlex = isGrid ? '0 0 calc(50% - 4px)' : '0 0 auto';
        const flexWrap = isGrid ? 'wrap' : 'nowrap';
        const offsetX = conf.offsetX || 0;

        const shows = conf.shows || {pv:true, uv:true, dpv:true, duv:true};

        const trackerJs = `
        (async function() {
            const container = document.getElementById('cf-stat');
            if (!container) return;
            const apiUrl = '${url.origin}/stats?action=track&site=${site}';
            let resData = {};
            try {
                const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ url: window.location.href }) });
                resData = await response.json();
            } catch(e) { return; }

            const confShows = ${JSON.stringify(shows)};
            const confNames = {pv: '${conf.pv || '总访问'}', uv: '${conf.uv || '总访客'}', dpv: '${conf.dpv || '今日访问'}', duv: '${conf.duv || '今日访客'}'};
            const orderArr = ${JSON.stringify(conf.order || ['pv', 'uv', 'dpv', 'duv'])};
            
            let items = [];
            for (let i = 0; i < orderArr.length; i++) {
                const key = orderArr[i];
                if (confShows[key]) {
                    items.push(\`<div style="flex:${itemFlex}; min-width:50px; background:${t.bg}; padding:0.6em 0.8em; border-radius:0.6em; border:1px solid ${t.border}; box-sizing:border-box; text-align:center;"><div style="font-size:0.75em; color:${t.lbl}; margin-bottom:0.3em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${confNames[key]}</div><div style="font-size:1.15em; color:${t.val}; font-weight:600;">\${resData[key]}</div></div>\`);
                }
            }

            const paddingBox = '${t.box}' !== 'transparent' ? 'padding:0.6em; border-radius:0.8em;' : '';
            container.innerHTML = \`<div style="display:flex; justify-content:center; width:100%;"><div style="display:flex; flex-wrap:${flexWrap}; gap:8px; justify-content:center; background:${t.box}; \${paddingBox} transform:translateX(${offsetX}%); font-family:-apple-system,sans-serif; font-size:\${${baseSize}}px; line-height:1; width:max-content; max-width:100%; box-sizing:border-box;">\${items.join('')}</div></div>\`;
        })();`;
        return new Response(trackerJs, { headers: { "Content-Type": "application/javascript", ...corsHeaders } });
    }

    const dateStr = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }).split(' ')[0];
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';

    if (action === 'track' && request.method === 'POST') {
        const k_pv = `s_${site}_pv`;
        const k_uv = `s_${site}_uv`;
        const k_dpv = `s_${site}_dpv_${dateStr}`;
        const k_duv = `s_${site}_duv_${dateStr}`;
        const k_ipe = `s_${site}_ipe_${ip}`;
        const k_ipt = `s_${site}_ipt_${dateStr}_${ip}`;

        const [v_pv, v_uv, v_dpv, v_duv, v_ipe, v_ipt] = await Promise.all([
            env.stat.get(k_pv), env.stat.get(k_uv), env.stat.get(k_dpv), env.stat.get(k_duv), env.stat.get(k_ipe), env.stat.get(k_ipt)
        ]);

        let pv = parseInt(v_pv || "0") + 1;
        let dpv = parseInt(v_dpv || "0") + 1;
        let uv = parseInt(v_uv || "0");
        let duv = parseInt(v_duv || "0");
        const tasks = [env.stat.put(k_pv, pv.toString()), env.stat.put(k_dpv, dpv.toString(), { expirationTtl: 86400 * 30 })];

        if (!v_ipe) { uv++; tasks.push(env.stat.put(k_uv, uv.toString())); tasks.push(env.stat.put(k_ipe, "1")); }
        if (!v_ipt) { duv++; tasks.push(env.stat.put(k_duv, duv.toString(), { expirationTtl: 86400 * 2 })); tasks.push(env.stat.put(k_ipt, "1", { expirationTtl: 86400 * 2 })); }

        waitUntil(Promise.all(tasks));
        return new Response(JSON.stringify({ pv, uv, dpv, duv }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (action === 'get_all_stats') {
        let result = { total: {pv:0, uv:0, dpv:0, duv:0}, sites: {} };
        const siteIds = Object.keys(allConfigs);
        const promises = [];
        for (let s of siteIds) {
            promises.push(env.stat.get(`s_${s}_pv`));
            promises.push(env.stat.get(`s_${s}_uv`));
            promises.push(env.stat.get(`s_${s}_dpv_${dateStr}`));
            promises.push(env.stat.get(`s_${s}_duv_${dateStr}`));
        }
        const values = await Promise.all(promises);
        let idx = 0;
        for (let s of siteIds) {
            let pv = parseInt(values[idx++] || "0");
            let uv = parseInt(values[idx++] || "0");
            let dpv = parseInt(values[idx++] || "0");
            let duv = parseInt(values[idx++] || "0");
            result.sites[s] = {pv, uv, dpv, duv};
            result.total.pv += pv;
            result.total.uv += uv;
            result.total.dpv += dpv;
            result.total.duv += duv;
        }
        return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response("Invalid", { status: 400 });
}
