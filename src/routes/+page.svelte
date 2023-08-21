<script lang="ts">
    import {onMount} from 'svelte';
    import {page} from '$app/stores';
    import {goto} from '$app/navigation';
    import {fade, scale} from 'svelte/transition';
    import {browser} from "$app/environment";

    let FILL_SCREEN_WIDTH = true;

    let ADAPTIVE_COLS = Math.min(Math.max(Math.ceil(Math.floor((browser ? window.innerWidth : 0) * 0.33) / 100)), 4);

    const chunk = (arr: any) => {
        let numCols = FILL_SCREEN_WIDTH ? ADAPTIVE_COLS : 4
        const columns = Math.floor(arr.length / numCols)

        return new Array(numCols)
            .fill('')
            .map((_, i) => arr.slice(i * columns, (i + 1) * columns))
    }

    type Gif = {
        bitly_gif_url: string;
        analytics: {
            onload: {
                url: string;
            };
            onclick: {
                url: string;
            };
        };
        images: {
            original: {
                url: string;
                webp: string;
                height: string;
                width: string;
            };
            fixed_height_downsampled: {
                url: string;
                webp: string;
                height: string;
                width: string;
            };
            fixed_width_downsampled: {
                url: string;
                webp: string;
                height: string;
                width: string;
            };
            fixed_width: {
                url: string;
                webp: string;
                height: string;
                width: string;
            };
        };
    };

    let username = $page.data.username;


    let _list: any = [];
    $: totalLength = _list.reduce((acc: any, cur: any) => acc + cur.length, 0);
    let randomId: string;


    let fetching = false;
    const fetchGifs = async (skip: number | string) => {
        const url = `https://api.giphy.com/v1/gifs/search?api_key=7TLUK3oMz1BJgN7mALHkvME3n33c9nlQ&q=%40${username}&limit=20&offset=${skip}&rating=g&lang=en&bundle=messaging_non_clips`;

        if (fetching) return [];
        fetching = true;
        try {
            const response = await fetch(url);
            const json = await response.json();
            console.log(json);
            const tmpGifs = json.data;

            return tmpGifs;
        } catch (e) {
            console.log(e);
        } finally {
            fetching = false;
        }
    };

    const getRandomIdFromGiphy = async () => {
        // read randomID from storage or generate new one

        randomId = localStorage.getItem('randomId') || '';

        if (!randomId) {
            const url = `https://api.giphy.com/v1/randomid?api_key=7TLUK3oMz1BJgN7mALHkvME3n33c9nlQ`;

            const res = await fetch(url);

            const json = await res.json();

            if (res.ok) {
                randomId = json.data.random_id;
                localStorage.setItem('randomId', randomId);
            }
        }
    };

    onMount(() => {
        // fetchGifs();
        getRandomIdFromGiphy();

        paginate();
    });

    $: availablePages =
        // generate array of $page.data.pages length
        Array.from({length: $page.data.pages}, (_, i) => i + 1);

    $: console.log('availablePages', availablePages);

    let lastScroll = 0;

    const paginate = async () => {
        const totlaListLength = _list.reduce((acc: any, cur: any) => acc + cur.length, 0);
        console.log("totlaListLength", totlaListLength)
        const promise = await fetchGifs(totlaListLength)
        const images = chunk([...promise])
        if (_list.length < 1) {
            _list = [...images]
        }

        for (let i = 0; i < _list.length; i++) {
            _list[i] = [..._list[i], ...images[i]]
        }

        console.log("_list", _list)
    }

    $: paginate();

</script>

<svelte:window on:scroll={(e) => {
	if(browser){
		let documentHeight = document.body.scrollHeight;
        let currentScroll = window.scrollY + window.innerHeight;


        let modifier = 0;
        if(currentScroll + modifier > documentHeight && currentScroll > lastScroll) {
            paginate();
        }
		lastScroll = currentScroll;
	}
}}/>

<h1>Giphy Embed demo</h1>
<div class="grid-wrapper container grid">
    <div class="grid">
        {#each _list as col}
            <div class="box col">
                {#each col as gif}
                    <a
                            href={gif.bitly_gif_url}
                            target="_blank"
                            on:click={async () => {
					await fetch(gif.analytics.onclick.url + '&random_id=' + randomId + '&ts=' + Date.now());
				}}
                    >
                        <img
                                in:scale={{duration: 1000}}
                                out:scale={{duration: 1000}}
                                src={gif.images.fixed_width.webp}
                                style="width: 100%"
                                alt="meme"
                                loading="lazy"
                                on:load={async () => {
						await fetch(gif.analytics.onload.url + '&random_id=' + randomId + '&ts=' + Date.now());
					}}
                        />
                    </a>
                {/each}
            </div>
        {/each}
    </div>
    <div class="loader"/>
</div>


{#if _list.length === 0}
    <div class="alert-info">No gifs found make sure the username is valid</div>
{/if}

<!--
<style>
	:root {
		--dark: #373349;
		--gap: 15px;
		--width: 240px;
		--height: var(--width);
	}

	:global(html, body) {
		background-color: var(--dark);
	}

	:global(body) {
		margin: var(--gap);
	}

	.container > a {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 2em;
		overflow: hidden;
	}

	.container > a::after {
		content: '';
		background: linear-gradient(transparent, black);
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		transform: translateY(100%);
		transition-duration: 0.75s;
	}

	.container > a:hover::after {
		transform: translateY(50%);
	}

	.container > a > * {
		width: 100%;
		height: 100%;
		object-fit: fill;
		transition-duration: 1s;
	}

	.container > a:hover > img {
		transform: scale(1.05);
	}

	.container {
		display: grid;
		grid-gap: var(--gap);
		grid-template-columns: repeat(auto-fit, minmax(var(--width), 1fr));
		grid-auto-rows: var(--height);
		grid-auto-flow: dense;
	}

	.horizontal {
		grid-column: span 2;
	}

	.vertical {
		grid-row: span 2;
	}

	.big {
		grid-column: span 2;
		grid-row: span 2;
	}
</style>
-->
<!--
<style>
    .pagination-btn {
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        margin-bottom: 10px;
    }

    .active {
        background-color: #ccc;
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
    }

    form {
        margin: auto;
        max-width: 1200px;
        text-align: center;
        display: flex;
        gap: 10px;
    }

    input {
        flex: 1;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        margin-bottom: 10px;
    }

    button {
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        margin-bottom: 10px;
    }

    button:hover {
        cursor: pointer;
        background-color: #ccc;
    }

    .alert-info {
        text-align: center;
        width: 100%;
        padding: 10px;
        background-color: #f1f1f1;
        border-radius: 5px;
        margin-bottom: 10px;
    }

    h1 {
        font-size: 2em;
        font-weight: 600;
        margin-bottom: 10px;
        text-align: center;
    }

    *:before,
    *:after,
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .container {
        max-width: 1200px;
        margin: 20px auto;
        columns: 4;
        column-gap: 20px;
    }

    .container .box {
        width: 100%;
        margin-bottom: 10px;
        break-inside: avoid;
    }

    .container .box img {
        max-width: 100%;
        border-radius: 10px;
    }

    @media (max-width: 1200px) {
        .container {
            width: calc(100% - 40px);
            columns: 3;
        }
    }

    @media (max-width: 768px) {
        .container {
            columns: 2;
        }
    }

    @media (max-width: 480px) {
        .container {
            columns: 1;
        }
    }
</style>
-->
<style>
    .loader {
        position: relative;
        height: 0.5rem;
    }
    img::before,
    video::before {
        display: block;
        content: '';
        padding-top: calc(100% * 2 / 3);
    }

    img {
        min-height: 0;
        max-width: 100%;
        transition: all 0.2s ease-in-out;
    }
    img:active {
        transform: scale(0.95);
    }
    .col {
        flex: 1 1;
        min-width: 0;
    }
    .grid {
        display: flex;
        position: relative;
        align-items: flex-start;
        gap: 0.2rem;
    }
</style>
