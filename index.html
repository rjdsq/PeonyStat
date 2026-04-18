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
        if (data.pwd) await env.stat.put('sys_pwd', data.pwd);
        else await env.stat.delete('sys_pwd');
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
            mode: 'card', tpl: 1, scale: 1, align: 'center', layout: 'row', position: 'bottom-right',
            useCustom: false, colors: { box: 'transparent', item: '#f9f7f2', lbl: '#a5acaa', val: '#788583' },
            order: ['pv', 'uv', 'dpv', 'duv'],
            names: { pv: '总访问', uv: '总访客', dpv: '今日访问', duv: '今日访客', online: '当前在线', geo: '地域探测' },
            shows: {pv:true, uv:true, dpv:true, duv:true, online:false, geo:false} 
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

        const trackerJs = `
        (async function() {
            let reqData = { url: window.location.href, ref: document.referrer, sw: window.screen.width };
            let resData = { pv:0, uv:0, dpv:0, duv:0, online:1, geo:'未知' };
            try {
                const response = await fetch('${url.origin}/stats?action=track&site=${site}', {
                    method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reqData)
                });
                resData = await response.json();
            } catch(e) {}

            const mode = '${conf.mode || 'card'}';
            if (mode === 'invisible') return;

            const c = document.getElementById('cf-stat');
            if (mode === 'badge') {
                if(!c) return;
                c.innerHTML = \`<div style="display:inline-flex; align-items:center; gap:8px; background:#ffffff; border:1px solid #eaeaea; padding:6px 12px; border-radius:20px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; color:#333; box-shadow:0 2px 8px rgba(0,0,0,0.04);"><span style="display:inline-block; width:6px; height:6px; background:#10b981; border-radius:50%; box-shadow:0 0 6px #10b981;"></span>在线 \${resData.online} <span style="color:#888; margin:0 4px;">|</span> 累计 \${resData.pv}</div>\`;
                return;
            }

            const shows = ${JSON.stringify(conf.shows || {pv:true, uv:true, dpv:true, duv:true})};
            const names = ${JSON.stringify(conf.names || {pv:'总访问', uv:'总访客', dpv:'今日访问', duv:'今日访客', online:'实时在线', geo:'地区'})};
            const order = ${JSON.stringify(conf.order || ['pv','uv','dpv','duv','online','geo'])};

            if (mode === 'island') {
                const posStyle = '${conf.position}' === 'bottom-left' ? 'bottom:20px; left:20px;' : 'bottom:20px; right:20px;';
                const wrap = document.createElement('div');
                wrap.innerHTML = \`<style>
                #cf-island { position:fixed; \${posStyle} z-index:2147483647; font-family:-apple-system,sans-serif; display:flex; flex-direction:column; align-items:flex-start; background:rgba(255,255,255,0.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid rgba(0,0,0,0.08); border-radius:24px; padding:10px 14px; box-shadow:0 10px 30px rgba(0,0,0,0.08); color:#333; overflow:hidden; transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275); cursor:pointer; min-width:80px; height:44px; box-sizing:border-box;}
                #cf-island:hover { height:auto; padding:16px; border-radius:20px; }
                .cf-i-hd { display:flex; align-items:center; gap:8px; white-space:nowrap; font-size:14px; font-weight:600; height:24px; width:100%; }
                .cf-i-dot { width:8px; height:8px; background:#10b981; border-radius:50%; box-shadow:0 0 8px #10b981; }
                .cf-i-bd { display:flex; flex-direction:column; gap:12px; margin-top:16px; opacity:0; transition:opacity 0.3s; width:100%; min-width:160px; }
                #cf-island:hover .cf-i-bd { opacity:1; }
                .cf-i-row { display:flex; justify-content:space-between; font-size:13px; border-bottom:1px dashed rgba(0,0,0,0.05); padding-bottom:6px; }
                @media (prefers-color-scheme: dark) { #cf-island { background:rgba(30,30,30,0.85); border-color:rgba(255,255,255,0.1); color:#eee; } .cf-i-row { border-color:rgba(255,255,255,0.08); } }
                </style>
                <div id="cf-island"><div class="cf-i-hd"><div class="cf-i-dot"></div>数据罗盘</div><div class="cf-i-bd" id="cf-i-content"></div></div>\`;
                
                let bHtml = '';
                for(let k of order) { if(shows[k]) bHtml += \`<div class="cf-i-row"><span style="color:#888;">\${names[k]}</span><span style="font-weight:600;">\${resData[k]}</span></div>\`; }
                document.body.appendChild(wrap);
                document.getElementById('cf-i-content').innerHTML = bHtml;
                return;
            }

            if (mode === 'card') {
                if(!c) return;
                const cust = ${conf.useCustom || false};
                const tc = ${JSON.stringify(conf.colors || {})};
                const tp = ${JSON.stringify(templates)};
                const t = cust ? { box: tc.box, bg: tc.item, border: 'transparent', val: tc.val, lbl: tc.lbl } : (tp[${conf.tpl || 1}] || tp[1]);
                
                const scale = ${conf.scale || 1};
                const baseSize = 14 * scale;
                const isGrid = '${conf.layout}' === 'grid';
                const flexWrap = isGrid ? 'wrap' : 'nowrap';
                const itemFlex = isGrid ? '0 0 calc(50% - 4px)' : '0 0 auto';
                const jc = '${conf.align}' === 'left' ? 'flex-start' : ('${conf.align}' === 'right' ? 'flex-end' : 'center');
                
                let items = [];
                for(let k of order) {
                    if(shows[k]) items.push(\`<div style="flex:\${itemFlex}; min-width:50px; background:\${t.bg}; padding:0.6em 0.8em; border-radius:0.6em; border:1px solid \${t.border}; box-sizing:border-box; text-align:center;"><div style="font-size:0.75em; color:\${t.lbl}; margin-bottom:0.3em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\${names[k]}</div><div style="font-size:1.15em; color:\${t.val}; font-weight:600;">\${resData[k]}</div></div>\`);
                }
                const paddingBox = t.box !== 'transparent' ? 'padding:0.6em; border-radius:0.8em;' : '';
                c.innerHTML = \`<div style="display:flex; justify-content:\${jc}; width:100%;"><div style="display:flex; flex-wrap:\${flexWrap}; gap:8px; justify-content:center; background:\${t.box}; \${paddingBox} font-family:-apple-system,sans-serif; font-size:\${baseSize}px; line-height:1; width:max-content; max-width:100%; box-sizing:border-box;">\${items.join('')}</div></div>\`;
            }
        })();`;
        return new Response(trackerJs, { headers: { "Content-Type": "application/javascript", ...corsHeaders } });
    }

    const dateStr = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }).split(' ')[0];
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';

    if (action === 'track' && request.method === 'POST') {
        let reqData = { url: '', ref: '', sw: 1024 };
        try { reqData = await request.json(); } catch(e) {}

        const ua = request.headers.get('user-agent') || '';
        let os = '未知';
        if (/windows/i.test(ua)) os = 'Windows';
        else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
        else if (/android/i.test(ua)) os = 'Android';
        else if (/iphone|ipad/i.test(ua)) os = 'iOS';
        else if (/linux/i.test(ua)) os = 'Linux';

        let browser = '未知';
        if (/micromessenger/i.test(ua)) browser = 'WeChat';
        else if (/edg/i.test(ua)) browser = 'Edge';
        else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
        else if (/safari/i.test(ua)) browser = 'Safari';
        else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';

        const dev = (reqData.sw < 768 || /mobile/i.test(ua)) ? 'Mobile' : 'Desktop';
        const geo = request.cf && request.cf.country ? request.cf.country : '未知';
        
        let path = '/';
        try { path = new URL(reqData.url).pathname; } catch(e) {}
        
        let refDomain = '直接访问';
        if (reqData.ref) {
            try { 
                const rUrl = new URL(reqData.ref);
                if (rUrl.hostname !== new URL(reqData.url || 'http://a.com').hostname) refDomain = rUrl.hostname;
            } catch(e) {}
        }

        const k_daily = `s_${site}_d_${dateStr}`;
        const k_total = `s_${site}_t`;
        const k_online = `s_${site}_p_${ip}`;

        let [dailyStr, totalStr] = await Promise.all([ env.stat.get(k_daily), env.stat.get(k_total) ]);

        let daily = dailyStr ? JSON.parse(dailyStr) : { pv:0, uv:0, ips:[], os:{}, br:{}, dev:{}, geo:{}, path:{}, ref:{} };
        let total = totalStr ? JSON.parse(totalStr) : { pv:0, uv:0, ips:[] };

        daily.pv++;
        total.pv++;
        daily.path[path] = (daily.path[path] || 0) + 1;
        daily.ref[refDomain] = (daily.ref[refDomain] || 0) + 1;

        if (!daily.ips.includes(ip)) {
            daily.uv++;
            daily.ips.push(ip);
            daily.os[os] = (daily.os[os] || 0) + 1;
            daily.br[browser] = (daily.br[browser] || 0) + 1;
            daily.dev[dev] = (daily.dev[dev] || 0) + 1;
            daily.geo[geo] = (daily.geo[geo] || 0) + 1;
        }
        if (!total.ips.includes(ip)) { total.uv++; total.ips.push(ip); }

        const tasks = [
            env.stat.put(k_daily, JSON.stringify(daily), { expirationTtl: 86400 * 30 }),
            env.stat.put(k_total, JSON.stringify(total)),
            env.stat.put(k_online, Date.now().toString(), { expirationTtl: 300 })
        ];

        waitUntil(Promise.all(tasks));

        const listed = await env.stat.list({ prefix: `s_${site}_p_` });
        const onlineCount = listed.keys.length || 1;

        return new Response(JSON.stringify({ pv: total.pv, uv: total.uv, dpv: daily.pv, duv: daily.uv, online: onlineCount, geo: geo }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (action === 'get_dashboard') {
        let result = { total: { pv:0, uv:0 }, sites: {} };
        const siteIds = Object.keys(allConfigs);

        for (let s of siteIds) {
            let totalStr = await env.stat.get(`s_${s}_t`);
            let dailyStr = await env.stat.get(`s_${s}_d_${dateStr}`);
            
            let t = totalStr ? JSON.parse(totalStr) : {pv:0, uv:0};
            let d = dailyStr ? JSON.parse(dailyStr) : {pv:0, uv:0, os:{}, br:{}, dev:{}, geo:{}, path:{}, ref:{}};
            
            let onlineList = await env.stat.list({ prefix: `s_${s}_p_` });
            
            result.sites[s] = {
                pv: t.pv, uv: t.uv, dpv: d.pv, duv: d.uv, online: onlineList.keys.length,
                os: d.os, br: d.br, dev: d.dev, geo: d.geo, path: d.path, ref: d.ref
            };
            result.total.pv += t.pv;
            result.total.uv += t.uv;
        }
        return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response("Invalid", { status: 400 });
}
