export async function onRequest(context) {
    const { request, env, waitUntil } = context;
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (action === 'script') {
        const trackerJs = `
        (async function() {
            const container = document.getElementById('cf-stat');
            if (!container) return;

            const siteId = container.getAttribute('data-site') || 'default';
            const tpl = container.getAttribute('data-tpl') || 'text';
            const shows = (container.getAttribute('data-show') || 'pv,uv,today').split(',');
            
            const txtPv = container.getAttribute('data-txt-pv') || '总访问量';
            const txtUv = container.getAttribute('data-txt-uv') || '总访客';
            const txtDpv = container.getAttribute('data-txt-dpv') || '今日访问';
            const txtDuv = container.getAttribute('data-txt-duv') || '今日访客';

            const payload = {
                url: window.location.href,
                ref: document.referrer,
                ua: navigator.userAgent,
                sw: window.screen.width
            };

            const apiUrl = '${url.origin}/stats?action=track&site=' + siteId;
            let resData = {};
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                });
                resData = await response.json();
            } catch(e) { return; }

            let html = '';
            if (tpl === 'text') {
                html = '<div style="font-size:13px; color:#788583;">';
                if(shows.includes('pv')) html += \`<span>\${txtPv}: \${resData.pv}</span> | \`;
                if(shows.includes('uv')) html += \`<span>\${txtUv}: \${resData.uv}</span> | \`;
                if(shows.includes('dpv')) html += \`<span>\${txtDpv}: \${resData.dpv}</span> | \`;
                if(shows.includes('duv')) html += \`<span>\${txtDuv}: \${resData.duv}</span>\`;
                html = html.replace(/ \\| $/, '') + '</div>';
            } else if (tpl === 'card') {
                html = '<div style="display:flex; gap:15px; font-family:sans-serif;">';
                if(shows.includes('pv')) html += \`<div style="background:#f9f7f2; padding:10px 15px; border-radius:8px;"><div style="font-size:11px; color:#a5acaa;">\${txtPv}</div><div style="font-size:16px; color:#788583; font-weight:bold;">\${resData.pv}</div></div>\`;
                if(shows.includes('uv')) html += \`<div style="background:#f9f7f2; padding:10px 15px; border-radius:8px;"><div style="font-size:11px; color:#a5acaa;">\${txtUv}</div><div style="font-size:16px; color:#788583; font-weight:bold;">\${resData.uv}</div></div>\`;
                if(shows.includes('dpv')) html += \`<div style="background:#f9f7f2; padding:10px 15px; border-radius:8px;"><div style="font-size:11px; color:#a5acaa;">\${txtDpv}</div><div style="font-size:16px; color:#788583; font-weight:bold;">\${resData.dpv}</div></div>\`;
                if(shows.includes('duv')) html += \`<div style="background:#f9f7f2; padding:10px 15px; border-radius:8px;"><div style="font-size:11px; color:#a5acaa;">\${txtDuv}</div><div style="font-size:16px; color:#788583; font-weight:bold;">\${resData.duv}</div></div>\`;
                html += '</div>';
            }
            container.innerHTML = html;
        })();`;
        return new Response(trackerJs, { headers: { "Content-Type": "application/javascript", ...corsHeaders } });
    }

    const siteId = url.searchParams.get('site') || 'default';
    const dateStr = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }).split(' ')[0];
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';

    const k_pv = `site_${siteId}_pv`;
    const k_uv = `site_${siteId}_uv`;
    const k_dpv = `site_${siteId}_dpv_${dateStr}`;
    const k_duv = `site_${siteId}_duv_${dateStr}`;
    const k_ipe = `site_${siteId}_ipe_${ip}`;
    const k_ipt = `site_${siteId}_ipt_${dateStr}_${ip}`;
    
    if (action === 'track' && request.method === 'POST') {
        let payload = {};
        try { payload = await request.json(); } catch(e) {}
        
        const country = request.cf?.country || 'UN';
        const k_geo = `site_${siteId}_geo_${country}`;

        const [v_pv, v_uv, v_dpv, v_duv, v_ipe, v_ipt, v_geo] = await Promise.all([
            env.RE_STAT.get(k_pv), env.RE_STAT.get(k_uv),
            env.RE_STAT.get(k_dpv), env.RE_STAT.get(k_duv),
            env.RE_STAT.get(k_ipe), env.RE_STAT.get(k_ipt),
            env.RE_STAT.get(k_geo)
        ]);

        let pv = parseInt(v_pv || "0") + 1;
        let dpv = parseInt(v_dpv || "0") + 1;
        let geoCount = parseInt(v_geo || "0") + 1;
        let uv = parseInt(v_uv || "0");
        let duv = parseInt(v_duv || "0");

        const tasks = [
            env.RE_STAT.put(k_pv, pv.toString()),
            env.RE_STAT.put(k_dpv, dpv.toString(), { expirationTtl: 86400 * 30 }),
            env.RE_STAT.put(k_geo, geoCount.toString())
        ];

        if (!v_ipe) {
            uv++;
            tasks.push(env.RE_STAT.put(k_uv, uv.toString()));
            tasks.push(env.RE_STAT.put(k_ipe, "1"));
        }
        if (!v_ipt) {
            duv++;
            tasks.push(env.RE_STAT.put(k_duv, duv.toString(), { expirationTtl: 86400 * 2 }));
            tasks.push(env.RE_STAT.put(k_ipt, "1", { expirationTtl: 86400 * 2 }));
        }

        waitUntil(Promise.all(tasks));

        return new Response(JSON.stringify({ pv, uv, dpv, duv }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (request.method === 'GET') {
        const [v_pv, v_uv, v_dpv, v_duv] = await Promise.all([
            env.RE_STAT.get(k_pv), env.RE_STAT.get(k_uv),
            env.RE_STAT.get(k_dpv), env.RE_STAT.get(k_duv)
        ]);
        return new Response(JSON.stringify({
            pv: v_pv || 0, uv: v_uv || 0, dpv: v_dpv || 0, duv: v_duv || 0
        }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response("Invalid Request", { status: 400 });
}
