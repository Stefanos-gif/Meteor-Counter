<script lang="ts">
    import '../app.css';
</script>

<svelte:head>
    <title>Meteor Counter</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="page">
    <div aria-hidden class="backdrop">
        <div class="grad"></div>
        <div class="radial"></div>
    </div>

    <header class="site-header">
        <h1 class="title">Meteor Counter</h1>
    </header>

    <main class="content">
        <slot />
    </main>

    <footer class="site-footer">
        <p class="foot-text">Made by Stefanos <span class="tm">™</span></p>
    </footer>
</div>

<style>
    :root{
        --fg: #e9e7ee;
        --muted: #c6c2cc;
        --bg-top: #1b0f1f;
        --bg-mid: #2a152b;
        --bg-bot: #161017;
    }

    .page{
        position: relative;
        min-height: 100dvh;
        color: var(--fg);
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
    }

    .backdrop{
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: -1;
    }
    .grad{
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, var(--bg-top), var(--bg-mid), var(--bg-bot));
    }
    .radial{
        position: absolute;
        inset: 0;
        background: radial-gradient(1000px 600px at 50% -120px, rgba(255,255,255,0.08), transparent);
        mask-image: radial-gradient(80% 60% at 50% 0%, black, transparent);
        -webkit-mask-image: radial-gradient(80% 60% at 50% 0%, black, transparent);
    }

    .site-header{
        max-width: 1120px;
        margin: 0 auto;
        padding: 32px 20px 0;
    }
    @media (min-width: 768px){
        .site-header{ padding-top: 48px; }
    }

    .title{
        margin: 0 auto;
        text-align: center;
        font-weight: 800;
        letter-spacing: 0.2px;
        font-size: clamp(2rem, 2.5vw + 1.2rem, 3rem);
        user-select: none;
        cursor: default;
        transition: transform .3s ease, filter .3s ease;
    }
    .title:hover{
        transform: scale(1.05);
        filter: drop-shadow(0 0 18px rgba(255,255,255,0.25));
    }

    .content{
        max-width: 1120px;
        margin: 0 auto;
        padding: 24px 20px 56px;
    }
    @media (min-width: 768px){
        .content{ padding-bottom: 72px; }
    }

    .site-footer{
        max-width: 1120px;
        margin: 0 auto;
        padding: 16px 20px 28px;
        border-top: 1px solid rgba(255,255,255,0.14);
    }
    .foot-text{
        margin: 0;
        text-align: center;
        font-size: .9rem;
        color: var(--muted);
        letter-spacing: .2px;
    }
    .tm{
        font-size: .85em;
        vertical-align: super;
        opacity: .9;
    }
</style>
