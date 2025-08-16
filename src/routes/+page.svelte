<script lang="ts">
    import { observationFormSchema } from '$lib/validation/observation';
    import type { PageData } from './$types';

    type Observation = {
        id: string | number;
        name: string;
        meteors: number;
        minutes: number;
        rate: number;
    };

    const { data } = $props<{ data: PageData }>();

    let observations = $state<Observation[]>([...(data.observations as Observation[])]);
    let name: string = $state('');
    let meteors: string = $state('');
    let minutes: string = $state('');
    let errorMsg: string = $state('');
    let submitting: boolean = $state(false);
    let query: string = $state('');

    const expectedRate = 60;

    const averageRate = $derived(
        observations.length
            ? observations.reduce<number>((sum, o) => sum + o.rate, 0) / observations.length
            : 0
    );

    const liveRate = $derived(
        Number.isFinite(parseFloat(meteors)) &&
        Number.isFinite(parseFloat(minutes)) &&
        parseFloat(minutes) > 0
            ? (parseFloat(meteors) / parseFloat(minutes)) * 60
            : 0
    );

    const round1 = (x: number) => Math.round(x * 10) / 10;
    const fmtMin = (x: number) => Math.round(x * 100) / 100;

    const filtered = $derived(
        query.trim()
            ? observations.filter(o => o.name.toLowerCase().includes(query.trim().toLowerCase()))
            : observations
    );

    async function handleSubmit() {
        errorMsg = '';
        submitting = true;

        const parsed = observationFormSchema.safeParse({ name, meteors, minutes });
        if (!parsed.success) {
            errorMsg = parsed.error.issues[0]?.message ?? 'Invalid input';
            submitting = false;
            return;
        }

        const { name: nameTrim, meteors: meteorsNum, minutes: minutesNum } = parsed.data;

        const res = await fetch('/api/observations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nameTrim, meteors: meteorsNum, minutes: minutesNum })
        });

        if (res.ok) {
            const row = (await res.json()) as Observation;
            observations = [...observations, row].sort((a, b) => b.rate - a.rate);
            name = '';
            meteors = '';
            minutes = '';
            errorMsg = '';
        } else {
            const payload = await res.json().catch(() => ({}));
            errorMsg = (payload as any)?.error ?? 'Submit failed';
        }

        submitting = false;
    }
</script>

<section class="wrap">
    <div class="col-left">
        <div class="pane">
            <h2 class="pane-title">How to Use This Tracker</h2>
            <ol class="howto">
                <li>Enter your name, meteors seen, and minutes observed.</li>
                <li>Compare your rate to the expected 60 meteors/hr.</li>
                <li>Results are sorted by rate. Green is above average, red is below.</li>
            </ol>
        </div>

        <div class="pane pane-list">
            <div class="pane-head">
                <h2 class="pane-title">Leaderboard</h2>
                <div class="search">
                    <svg class="icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" stroke-width="2" />
                        <path d="m21 21-4.3-4.3" stroke-width="2" />
                    </svg>
                    <input class="txt search-input" placeholder="Search names..." bind:value={query} aria-label="Search names" />
                </div>
            </div>

            <ol class="board">
                {#each filtered as o, i (o.id)}
                    {#if i === 2}
                        <li class="board-li is-avg">
                            <div class="cell-left">
                                <span class="chip">Ø</span>
                                <div class="cell-text">
                                    <div class="who">Average Rate</div>
                                    <div class="sub">Based on {observations.length} observations</div>
                                </div>
                            </div>
                            <div class="cell-right">
                                <span class="num">{round1(averageRate).toFixed(1)}</span>
                                <span class="unit">meteors/hr</span>
                            </div>
                        </li>
                    {/if}

                    {#if i === 3}
                        <li class="board-li is-exp">
                            <div class="cell-left">
                                <span class="chip">★</span>
                                <div class="cell-text">
                                    <div class="who">Expected Rate</div>
                                    <div class="sub">Standard expectation</div>
                                </div>
                            </div>
                            <div class="cell-right">
                                <span class="num">{round1(expectedRate).toFixed(1)}</span>
                                <span class="unit">meteors/hr</span>
                            </div>
                        </li>
                    {/if}

                    <li class="board-li" class:is-good={o.rate >= expectedRate} class:is-bad={o.rate < expectedRate}>
                        <div class="cell-left">
                            <span class="chip">#{i + 1}</span>
                            <div class="cell-text">
                                <div class="who">{o.name}</div>
                                <div class="sub">{o.meteors} meteors in {fmtMin(o.minutes)} min</div>
                            </div>
                        </div>
                        <div class="cell-right">
                            <span class="num">{round1(o.rate).toFixed(1)}</span>
                            <span class="unit">meteors/hr</span>
                        </div>
                    </li>
                {/each}

                {#if filtered.length < 3}
                    <li class="board-li is-avg">
                        <div class="cell-left">
                            <span class="chip">Ø</span>
                            <div class="cell-text">
                                <div class="who">Average Rate</div>
                                <div class="sub">Based on {observations.length} observations</div>
                            </div>
                        </div>
                        <div class="cell-right"><span class="num">{round1(averageRate).toFixed(1)}</span><span class="unit">meteors/hr</span></div>
                    </li>
                    <li class="board-li is-exp">
                        <div class="cell-left">
                            <span class="chip">★</span>
                            <div class="cell-text">
                                <div class="who">Expected Rate</div>
                                <div class="sub">Standard expectation</div>
                            </div>
                        </div>
                        <div class="cell-right"><span class="num">{round1(expectedRate).toFixed(1)}</span><span class="unit">meteors/hr</span></div>
                    </li>
                {/if}
            </ol>
        </div>
    </div>

    <aside class="col-right pane">
        <h2 class="pane-title">Submit Your Observation</h2>

        <form class="form" onsubmit={handleSubmit}>
            <label class="form-row">
                <span class="lab">Your Name</span>
                <input id="name" class="txt" type="text" bind:value={name} maxlength="40" placeholder="e.g. Stefanos" required />
            </label>

            <div class="form-grid">
                <label class="form-row">
                    <span class="lab">Meteors Counted</span>
                    <input id="meteors" class="txt txt-right" type="number" bind:value={meteors} min="0" max="500" step="1" inputmode="numeric" placeholder="0–500" required />
                </label>

                <label class="form-row">
                    <span class="lab">Time Spent (minutes)</span>
                    <input id="minutes" class="txt txt-right" type="number" bind:value={minutes} min="0" max="240" step="0.1" inputmode="decimal" placeholder="> 0 and ≤ 240" required />
                </label>
            </div>

            <button id="submit" class="btn-main full" type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'CALCULATE & SUBMIT'}
            </button>

            <div class="mini">
                <div>Your rate: <span class="mini-strong">{round1(liveRate).toFixed(1)}</span> meteors/hr</div>
            </div>

            {#if errorMsg}
                <p class="err" aria-live="polite">{errorMsg}</p>
            {/if}
        </form>

        {#if data.error}
            <p class="err mt">Failed to load observations.</p>
        {/if}
    </aside>
</section>

<style>
    :root{
        --panel: rgba(255,255,255,0.06);
        --panel-2: rgba(255,255,255,0.10);
        --line: rgba(255,255,255,0.14);
        --muted: rgba(255,255,255,0.70);
        --ink: #fafaf9;
        --chip: rgba(255,255,255,0.10);
        --good: #22c55e;
        --bad: #ef4444;
        --avg: #eab308;
        --exp: #60a5fa;
        --gap: 1.25rem;
    }

    .wrap{
        max-width: 1120px;
        margin: 0 auto;
        padding: 0 20px 48px;
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--gap);
    }
    @media (min-width: 1024px){
        .wrap{ grid-template-columns: 1.75fr 1fr; align-items: start; }
    }

    .col-left{ display: flex; flex-direction: column; gap: var(--gap); }
    .col-right{ }

    .pane{
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 16px;
        color: var(--ink);
        backdrop-filter: blur(8px);
        box-shadow: 0 10px 24px rgba(0,0,0,0.25);
    }
    .pane-list{ padding: 0; }
    .pane-head{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid var(--line);
        gap: 12px;
    }
    .pane-title{
        font-weight: 800;
        margin: 0;
        letter-spacing: .2px;
    }

    .howto{
        list-style: decimal;
        padding-left: 20px;
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 0.92rem;
    }
    .howto li{ margin: 6px 0; }

    .search{
        position: relative;
        width: 260px;
        max-width: 100%;
    }
    .icon-search{
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        opacity: .7;
        pointer-events: none;
    }
    .search-input{ padding-left: 34px; }

    .txt{
        width: 100%;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.04);
        color: var(--ink);
        outline: none;
    }
    .txt::placeholder{ color: rgba(255,255,255,.45); }
    .txt:focus{ border-color: rgba(99,102,241,.55); box-shadow: 0 0 0 4px rgba(99,102,241,.15); }
    .txt-right{ text-align: right; }

    .form{ display: grid; gap: 14px; }
    .form-row{ display: flex; flex-direction: column; gap: 6px; }
    .lab{ font-size: .88rem; color: var(--muted); }
    .form-grid{ display: grid; grid-template-columns: 1fr; gap: 14px; }
    @media (min-width: 560px){ .form-grid{ grid-template-columns: 1fr 1fr; } }

    .btn-main{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 14px;
        border-radius: 12px;
        font-weight: 700;
        border: 1px solid var(--line);
        background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04));
        transition: transform .15s ease, background .2s ease;
        color: var(--ink);
    }
    .btn-main:hover{ background: var(--panel-2); transform: translateY(-1px); }
    .btn-main[disabled]{ opacity: .6; cursor: not-allowed; }
    .full{ width: 100%; }

    .mini{
        border: 1px dashed var(--line);
        border-radius: 12px;
        padding: 8px 12px;
        color: var(--muted);
        text-align: center;
    }
    .mini-strong{ font-weight: 700; color: var(--ink); }

    .err{ color: var(--bad); }
    .mt{ margin-top: 8px; }

    .board{
        max-height: 560px;
        overflow-y: auto;
        padding: 12px 12px 14px;
        margin: 0;
        list-style: none;
        display: grid;
        gap: 10px;
    }
    .board::-webkit-scrollbar{ width: 10px; }
    .board::-webkit-scrollbar-thumb{ background: rgba(255,255,255,.12); border-radius: 10px; }
    .board::-webkit-scrollbar-track{ background: transparent; }

    .board-li{
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,.04);
        border-radius: 14px;
        padding: 12px 14px;
        position: relative;
        transition: background .15s ease;
    }
    .board-li:hover{ background: rgba(255,255,255,.08); }
    .board-li::before{
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 4px;
        border-radius: 14px 0 0 14px;
        background: rgba(255,255,255,.10);
    }

    .cell-left{ display: flex; align-items: center; gap: 12px; min-width: 0; }
    .cell-text{ min-width: 0; }
    .cell-right{ display: flex; align-items: baseline; gap: 6px; }
    .chip{
        display: grid;
        place-items: center;
        min-width: 44px;
        height: 32px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: var(--chip);
        font-weight: 800;
    }
    .who{ font-weight: 700; }
    .sub{ color: var(--muted); font-size: .9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .num{ font-weight: 900; }
    .unit{ color: var(--muted); font-size: .85rem; }

    .is-good .num{ color: var(--good); }
    .is-good::before{ background: color-mix(in oklab, var(--good) 55%, transparent); }
    .is-bad .num{ color: var(--bad); }
    .is-bad::before{ background: color-mix(in oklab, var(--bad) 55%, transparent); }

    .is-avg{ background: rgba(234,179,8,.10); border-color: rgba(234,179,8,.45); }
    .is-avg::before{ background: color-mix(in oklab, var(--avg) 55%, transparent); }
    .is-exp{ background: rgba(96,165,250,.10); border-color: rgba(96,165,250,.45); }
    .is-exp::before{ background: color-mix(in oklab, var(--exp) 55%, transparent); }
</style>
