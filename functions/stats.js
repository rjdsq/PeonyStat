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
        await env.stat.put(k_config, JSON.stringify({}));
        await env.stat.delete('sys_pwd');
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
            await env.stat.put(k_config, JSON.stringify(allConfigs));
        }
        return new Response(JSON.stringify({status: "ok"}), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (action === 'script') {
        const conf = allConfigs[site] || { tpl: 1, size: 1, align: 'center', pv: '总访问', uv: '总访客', dpv: '今日访问', duv: '今日访客', shows: {pv:true, uv:true, dpv:true, duv:true} };
        
        const templates = {
            1: { bg: '#f9f7f2', border: '#ece9e0', val: '#788583', lbl: '#a5acaa' },
            3: { bg: '#eef0ed', border: '#eef0ed', val: '#8da493', lbl: '#788583' },
            4: { bg: '#f5f0ef', border: '#ece5e3', val: '#bca39f', lbl: '#a5acaa' },
            5: { bg: '#f2f5f6', border: '#e8edf0', val: '#7f93a1', lbl: '#a5acaa' },
            6: { bg: '#fafafa', border: '#333333', val: '#333333', lbl: '#666666' },
            10: { bg: 'transparent', border: '#ece9e0', val: '#788583', lbl: '#a5acaa' },
            11: { bg: '#1a1a1a', border: '#33ff00', val: '#33ff00', lbl: '#00cc00' },
            12: { bg: '#000000', border: '#4af626', val: '#4af626', lbl: '#28a745' },
            13: { bg: '#f3ece7', border: '#dccdc3', val: '#5c4033', lbl: '#8b7355' },
            14: { bg: '#0b1d3a', border: '#1e3f66', val: '#82b1ff', lbl: '#4a7abc' },
            15: { bg: '#fff0e6', border: '#ffdcb3', val: '#ff7f50', lbl: '#ff9966' },
            16: { bg: '#1e3323', border: '#2d4c34', val: '#a8d5ba', lbl: '#7eb08c' },
            17: { bg: '#fff0f5', border: '#ffb6c1', val: '#ff69b4', lbl: '#ffc0cb' },
            18: { bg: '#f8f8ff', border: '#e6e6fa', val: '#9370db', lbl: '#b0c4de' },
            19: { bg: '#fff5ee', border: '#ffdab9', val: '#ff4500', lbl: '#ffa07a' },
            20: { bg: '#ffffff', border: '#000000', val: '#000000', lbl: '#000000' }
        };
        const t = templates[conf.tpl || 1] || templates[1];

        const sizes = {
            1: { p: '8px 12px', v: '14px', l: '10px' },
            2: { p: '12px 16px', v: '18px', l: '11px' },
            3: { p: '16px 20px', v: '22px', l: '12px' }
        };
        const s = sizes[conf.size || 1] || sizes[1];

        const aligns = { left: 'flex-start', center: 'center', right: 'flex-end' };
        const jc = aligns[conf.align || 'center'] || 'center';

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

            let items = [];
            if(${conf.shows.pv}) items.push(\`<div style="flex:1; min-width:60px; background:${t.bg}; padding:${s.p}; border-radius:10px; border:1px solid ${t.border};"><div style="font-size:${s.l}; color:${t.lbl}; margin-bottom:4px;">${conf.pv}</div><div style="font-size:${s.v}; color:${t.val}; font-weight:600;">\${resData.pv}</div></div>\`);
            if(${conf.shows.uv}) items.push(\`<div style="flex:1; min-width:60px; background:${t.bg}; padding:${s.p}; border-radius:10px; border:1px solid ${t.border};"><div style="font-size:${s.l}; color:${t.lbl}; margin-bottom:4px;">${conf.uv}</div><div style="font-size:${s.v}; color:${t.val}; font-weight:600;">\${resData.uv}</div></div>\`);
            if(${conf.shows.dpv}) items.push(\`<div style="flex:1; min-width:60px; background:${t.bg}; padding:${s.p}; border-radius:10px; border:1px solid ${t.border};"><div style="font-size:${s.l}; color:${t.lbl}; margin-bottom:4px;">${conf.dpv}</div><div style="font-size:${s.v}; color:${t.val}; font-weight:600;">\${resData.dpv}</div></div>\`);
            if(${conf.shows.duv}) items.push(\`<div style="flex:1; min-width:60px; background:${t.bg}; padding:${s.p}; border-radius:10px; border:1px solid ${t.border};"><div style="font-size:${s.l}; color:${t.lbl}; margin-bottom:4px;">${conf.duv}</div><div style="font-size:${s.v}; color:${t.val}; font-weight:600;">\${resData.duv}</div></div>\`);

            container.innerHTML = \`<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:${jc}; text-align:center; font-family:-apple-system,sans-serif;">\${items.join('')}</div>\`;
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
